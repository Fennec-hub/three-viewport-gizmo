/**
 * Framework-free scene, renderer, controller and gizmo lifecycle behind every live
 * viewport on the site. Loaded only in the browser (the React `Stage` imports it
 * dynamically), so `three/webgpu` never runs during the static export.
 */
import {
  AxesHelper,
  Box3,
  CanvasTexture,
  Color,
  ConeGeometry,
  DirectionalLight,
  GridHelper,
  Group,
  HemisphereLight,
  Material,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Scene,
  Sphere,
  SphereGeometry,
  Spherical,
  Sprite,
  SpriteMaterial,
  Texture,
  Timer,
  TorusKnotGeometry,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  type BufferGeometry,
} from "three";
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { FontLoader, type Font } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import CameraControls from "camera-controls";
import { ViewportGizmo, type GizmoOptions } from "@lib/ViewportGizmo";
import { fromYUp, type UpAxis, type Vec3 } from "./frames";

export type RendererKind = "webgl" | "webgpu";
export type ControllerKind = "orbit" | "camera-controls" | "none";
export type Projection = "perspective" | "orthographic";
/** What actually draws: WebGPU falls back to a WebGL 2 backend when no adapter exists. */
export type Backend = "webgl" | "webgpu" | "webgpu-fallback";

export type StageConfig = {
  renderer?: RendererKind;
  up?: UpAxis;
  projection?: Projection;
  controller?: ControllerKind;
  /** Gizmo options; `null` creates no gizmo (the example draws its own). */
  gizmo?: Omit<GizmoOptions, "container" | "up"> | null;
};

export type Pose = { azimuth: number; polar: number; roll: number };

export type StageHandle = {
  backend: Backend;
  container: HTMLElement;
  renderer: WebGLRenderer | WebGPURenderer;
  scene: Scene;
  camera: PerspectiveCamera | OrthographicCamera;
  gizmo: ViewportGizmo | null;
  controls: OrbitControls | CameraControls | null;
  up: Vector3;
  /** The orbit target the camera looks at. */
  target: Vector3;
  /** Maps a direction written in Y-up terms into this stage's up frame. */
  toWorld(v: Vec3): Vector3;
  readPose(): Pose;
  /** Calls `fn` on every gizmo or controller view change; returns an unsubscribe. */
  onViewChange(fn: () => void): () => void;
  dispose(): void;
};

/** Optional per-example hooks, returned by a `setup` function. */
export type StageExtension = {
  /** Replaces the default scene render; the gizmo still renders after it. */
  frame?: () => void;
  resize?: (width: number, height: number) => void;
  dispose?: () => void;
};

export type StageSetup = (stage: StageHandle) => StageExtension | void;

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ORTHO_HALF_HEIGHT = 5;

let fontPromise: Promise<Font> | undefined;
let cameraControlsInstalled = false;

export async function createStage(
  container: HTMLElement,
  config: StageConfig,
  setup: StageSetup | undefined,
  signal: AbortSignal
): Promise<StageHandle | null> {
  const {
    renderer: kind = "webgl",
    up: upAxis = "y",
    projection = "perspective",
    controller = "orbit",
    gizmo: gizmoOptions = {},
  } = config;

  let renderer: WebGLRenderer | WebGPURenderer;
  let backend: Backend = "webgl";
  if (kind === "webgpu") {
    const gpu = new WebGPURenderer({ antialias: true });
    // Must resolve before anything renders or clears.
    await gpu.init();
    backend = (gpu.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend
      ? "webgpu"
      : "webgpu-fallback";
    renderer = gpu;
  } else {
    renderer = new WebGLRenderer({ antialias: true });
  }
  if (signal.aborted) {
    disposeRenderer(renderer);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const toWorld = (v: Vec3) => new Vector3(...fromYUp(v, upAxis));
  const up = toWorld([0, 1, 0]);
  const target = toWorld([0, 1, 0]);

  // Scene: world axes stay in world space; everything else is authored Y-up and
  // rotated into the chosen frame, so the same model reads the same way in all three.
  const scene = new Scene();
  const content = new Group();
  content.quaternion.setFromRotationMatrix(
    new Matrix4().makeBasis(toWorld([1, 0, 0]), up, toWorld([0, 0, 1]))
  );
  scene.add(content, worldAxes());

  content.add(new GridHelper(12, 12, 0x8a8f98, 0x6f747c));
  content.add(new HemisphereLight(0xffffff, 0x666666, 2));
  const sun = new DirectionalLight(0xffffff, 2);
  sun.position.set(3, 6, 4);
  content.add(sun);
  content.add(
    mesh(new ConeGeometry(0.6, 1.6, 32), 0xe8a33d, [-3.5, 0.8, -1]),
    mesh(new SphereGeometry(0.6, 32, 16), 0x3d8be8, [3.5, 0.6, -1]),
    mesh(new TorusKnotGeometry(0.45, 0.15, 96, 12), 0xb05ee0, [0, 2.6, -2])
  );

  let disposed = false;
  loadFont()
    .then((font) => {
      if (disposed) return;
      const text = new TextGeometry("Three.js", { font, size: 0.9, depth: 0.2, curveSegments: 6 });
      text.center();
      content.add(mesh(text, 0xd94f4f, [0, 0.6, 0]));
    })
    .catch(() => {
      // The model is decoration; the stage stays usable without it.
    });

  const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const applyTheme = () => {
    const background = getComputedStyle(container).getPropertyValue("--stage-bg").trim();
    scene.background = new Color(background || "#20232a");
  };
  applyTheme();
  colorScheme.addEventListener("change", applyTheme);

  // Camera: up must be set before any controller reads it.
  const camera =
    projection === "orthographic"
      ? new OrthographicCamera(-1, 1, ORTHO_HALF_HEIGHT, -ORTHO_HALF_HEIGHT, 0.1, 200)
      : new PerspectiveCamera(50, 1, 0.1, 200);
  camera.up.copy(up);
  camera.position.copy(toWorld([6, 5, 9]));
  camera.lookAt(target);

  const gizmo =
    gizmoOptions === null
      ? null
      : new ViewportGizmo(camera, renderer, { ...gizmoOptions, up: upAxis, container });
  if (gizmo) gizmo.target.copy(target);

  let controls: OrbitControls | CameraControls | null = null;
  const timer = new Timer();
  let updateControls = () => {};
  const viewListeners = new Set<() => void>();
  const notify = () => viewListeners.forEach((fn) => fn());

  if (controller === "orbit") {
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.copy(target);
    orbit.update();
    orbit.addEventListener("change", notify);
    gizmo?.attachControls(orbit);
    controls = orbit;
  } else if (controller === "camera-controls") {
    if (!cameraControlsInstalled) {
      CameraControls.install({
        THREE: { Vector2, Vector3, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere, Raycaster },
      });
      cameraControlsInstalled = true;
    }
    const cc = new CameraControls(camera, renderer.domElement);
    cc.setLookAt(...camera.position.toArray(), ...target.toArray(), false);
    cc.addEventListener("update", () => {
      if (gizmo) {
        cc.getTarget(gizmo.target);
        gizmo.update();
      }
      notify();
    });
    if (gizmo) {
      gizmo.addEventListener("start", () => (cc.enabled = false));
      gizmo.addEventListener("end", () => (cc.enabled = true));
      gizmo.addEventListener("change", () => cc.setPosition(...camera.position.toArray()));
    }
    updateControls = () => {
      if (cc.enabled && !gizmo?.animating) cc.update(timer.getDelta());
    };
    controls = cc;
  }
  gizmo?.addEventListener("change", notify);

  const handle: StageHandle = {
    backend,
    container,
    renderer,
    scene,
    camera,
    gizmo,
    controls,
    up,
    target,
    toWorld,
    readPose() {
      const focus = gizmo?.target ?? (controls instanceof OrbitControls ? controls.target : target);
      return pose(camera, focus, up, toWorld([1, 0, 0]), toWorld([0, 0, 1]));
    },
    onViewChange(fn) {
      viewListeners.add(fn);
      return () => viewListeners.delete(fn);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      colorScheme.removeEventListener("change", applyTheme);
      viewListeners.clear();
      extension?.dispose?.();
      controls?.dispose();
      gizmo?.dispose();
      disposeObject(scene);
      disposeRenderer(renderer);
    },
  };

  const extension = setup?.(handle) || undefined;

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const aspect = width / height;
    if (camera instanceof PerspectiveCamera) {
      camera.aspect = aspect;
    } else {
      camera.left = -ORTHO_HALF_HEIGHT * aspect;
      camera.right = ORTHO_HALF_HEIGHT * aspect;
    }
    camera.updateProjectionMatrix();
    extension?.resize?.(width, height);
    gizmo?.update();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  renderer.setAnimationLoop((time) => {
    timer.update(time);
    updateControls();
    if (extension?.frame) extension.frame();
    else renderer.render(scene, camera);
    gizmo?.render();
  });

  return handle;
}

function pose(
  camera: PerspectiveCamera | OrthographicCamera,
  focus: Vector3,
  up: Vector3,
  right: Vector3,
  front: Vector3
): Pose {
  const offset = camera.position.clone().sub(focus);
  const distance = offset.length() || 1;
  const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const clamp = (v: number) => Math.min(1, Math.max(-1, v));
  return {
    azimuth: deg(Math.atan2(offset.dot(right), offset.dot(front))),
    polar: deg(Math.acos(clamp(offset.dot(up) / distance))),
    // Angle between the camera's right vector and the plane perpendicular to up.
    roll: deg(Math.asin(clamp(cameraRight.dot(up)))),
  };
}

function loadFont() {
  fontPromise ??= new FontLoader().loadAsync(`${BASE}/fonts/Roboto_Regular.json`);
  return fontPromise;
}

function mesh(geometry: BufferGeometry, color: number, [x, y, z]: Vec3) {
  const result = new Mesh(
    geometry,
    new MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.1 })
  );
  result.position.set(x, y, z);
  return result;
}

/** World X, Y and Z (red, green, blue) with labelled tips. */
function worldAxes() {
  const group = new Group();
  group.add(new AxesHelper(4));
  const tips: [string, string, Vec3][] = [
    ["X", "#ff4d4d", [4.4, 0, 0]],
    ["Y", "#4dcc4d", [0, 4.4, 0]],
    ["Z", "#4d8cff", [0, 0, 4.4]],
  ];
  for (const [text, color, [x, y, z]] of tips) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.font = "bold 48px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 32, 34);
    const sprite = new Sprite(new SpriteMaterial({ map: new CanvasTexture(canvas), depthTest: false }));
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(0.6);
    group.add(sprite);
  }
  return group;
}

function disposeObject(root: Object3D) {
  root.traverse((object) => {
    const { geometry, material } = object as Partial<Mesh>;
    // Sprites share one module-level geometry inside three.js; leave it alone.
    if (!(object instanceof Sprite)) geometry?.dispose();
    for (const m of [material ?? []].flat() as Material[]) {
      for (const value of Object.values(m)) if (value instanceof Texture) value.dispose();
      m.dispose();
    }
  });
  if (root instanceof Scene && root.background instanceof Texture) root.background.dispose();
}

function disposeRenderer(renderer: WebGLRenderer | WebGPURenderer) {
  // No forceContextLoss(): Chrome blocks WebGL for a page that loses contexts repeatedly.
  renderer.dispose();
  renderer.domElement.remove();
}
