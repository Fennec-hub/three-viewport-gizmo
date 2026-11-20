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
  MathUtils,
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
import { ViewportGizmo, type GizmoOptions, type GizmoPose } from "@lib/index";
import { cameraControls } from "@lib/controls/cameraControls";
import { fromYUp, type Axis, type UpAxis, type Vec3 } from "./frames";

export type RendererKind = "webgl" | "webgpu";
export type ControllerKind = "orbit" | "camera-controls" | "none";
export type Projection = "perspective" | "orthographic";
/** What actually draws: WebGPU falls back to a WebGL 2 backend when no adapter exists. */
export type Backend = "webgl" | "webgpu" | "webgpu-fallback";

export type StageConfig = {
  renderer?: RendererKind;
  /** Default `+y`. */
  up?: UpAxis;
  /** The axis the gizmo's Front faces. Default: the library's default for `up`. */
  front?: Axis;
  projection?: Projection;
  /** Passes `reversedDepthBuffer: true` to the renderer. Default false. */
  reversedDepth?: boolean;
  controller?: ControllerKind;
  /** Gizmo options; `null` creates no gizmo (the example draws its own). */
  gizmo?: Omit<GizmoOptions, "container" | "up" | "frontDirection"> | null;
};

/** What the camera shows, read through the public API only. */
export type ViewReading = {
  /** Unit vector from the orbit target to the camera. */
  direction: Vec3;
  /** `camera.up`. */
  up: Vec3;
  /** The label of the target the view rests on (`gizmo.atTarget`), or null between targets. */
  atTarget: string | null;
  /** Where the running flight is going (`gizmo.heading`): a target label, `"a direction"`, or null when none runs. */
  heading: string | null;
  /** `gizmo.canRoll`. */
  canRoll: boolean;
  /** Degrees between the camera's right vector and the plane perpendicular to the stage's up axis. */
  roll: number;
};

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
  readView(): ViewReading;
  /**
   * Sets the perspective camera's vertical field of view in degrees the way a CAD viewer does: the camera dollies
   * along its view direction so the target plane keeps its height on screen, then the controls and the gizmo sync.
   * From the first call on, the clip planes follow the camera's distance so a far camera at a narrow angle still
   * draws the scene. Does nothing for an orthographic camera.
   */
  setFieldOfView(degrees: number): void;
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
/** Generously bounds everything the stage draws (grid, axes, models), for clip planes around the target. */
const SCENE_RADIUS = 20;

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
    up: upAxis = "+y",
    front,
    projection = "perspective",
    reversedDepth = false,
    controller = "orbit",
    gizmo: gizmoOptions = {},
  } = config;

  let renderer: WebGLRenderer | WebGPURenderer;
  let backend: Backend = "webgl";
  if (kind === "webgpu") {
    const gpu = new WebGPURenderer({ antialias: true, reversedDepthBuffer: reversedDepth });
    // Must resolve before anything renders or clears.
    await gpu.init();
    backend = (gpu.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend
      ? "webgpu"
      : "webgpu-fallback";
    renderer = gpu;
  } else {
    renderer = new WebGLRenderer({ antialias: true, reversedDepthBuffer: reversedDepth });
  }
  if (signal.aborted) {
    disposeRenderer(renderer);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const toWorld = (v: Vec3) => new Vector3(...fromYUp(v, upAxis, front));
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
      : new ViewportGizmo(camera, renderer, {
          ...gizmoOptions,
          up: camera.up,
          frontDirection: toWorld([0, 0, 1]),
          container,
        });
  if (gizmo) gizmo.target.copy(target);

  let controls: OrbitControls | CameraControls | null = null;
  const timer = new Timer();
  let updateControls = () => {};
  /** Hands the controls the camera the page wrote: in controlled mode the gizmo writes nothing, so it syncs nothing. */
  let syncControls = () => {};
  const viewListeners = new Set<() => void>();
  const notify = () => viewListeners.forEach((fn) => fn());

  if (controller === "orbit") {
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.copy(target);
    orbit.update();
    orbit.addEventListener("change", notify);
    gizmo?.attachControls(orbit);
    syncControls = () => orbit.update();
    controls = orbit;
  } else if (controller === "camera-controls") {
    if (!cameraControlsInstalled) {
      CameraControls.install({
        THREE: { Vector2, Vector3, Vector4, Quaternion, Matrix4, Spherical, Box3, Sphere, Raycaster },
      });
      cameraControlsInstalled = true;
    }
    const cc = new CameraControls(camera, renderer.domElement);
    void cc.setLookAt(...camera.position.toArray(), ...target.toArray(), false);
    cc.addEventListener("update", notify);
    // The adapter keeps camera-controls and the gizmo in step; the gizmo disables `cc` while it turns.
    const adapter = cameraControls(cc);
    gizmo?.attachControls(adapter);
    syncControls = () => void adapter.update();
    updateControls = () => {
      const delta = timer.getDelta();
      if (cc.enabled) cc.update(delta);
    };
    controls = cc;
  }
  if (gizmo) {
    gizmo.addEventListener("change", ({ pose }) => {
      // Controlled mode: the gizmo reports the pose and the host writes the camera.
      if (gizmo.options.controlled) applyPose(camera, gizmo.target, pose);
      notify();
    });
    // camera-controls keeps its own orbit state: without this, the next drag on the canvas starts from the old view.
    gizmo.addEventListener("end", () => gizmo.options.controlled && syncControls());
    gizmo.addEventListener("attargetchange", notify);
    gizmo.addEventListener("end", notify);
  }

  /** The point the camera orbits: the controller's target, else the gizmo's. */
  const focusPoint = new Vector3();
  const focus = () => {
    if (controls instanceof OrbitControls) return focusPoint.copy(controls.target);
    if (controls instanceof CameraControls) return controls.getTarget(focusPoint, false);
    return focusPoint.copy(gizmo?.target ?? target);
  };
  let fitClipPlanes = false;
  /** Near and far around the target, so depth precision holds however far a narrow angle puts the camera. */
  const clipPlanes = () => {
    if (!fitClipPlanes || !(camera instanceof PerspectiveCamera)) return;
    const distance = camera.position.distanceTo(focus());
    const near = Math.max(0.1, distance - SCENE_RADIUS);
    const far = distance + SCENE_RADIUS;
    if (camera.near === near && camera.far === far) return;
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
  };

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
    readView() {
      const focus = gizmo?.target ?? (controls instanceof OrbitControls ? controls.target : target);
      const heading = gizmo?.heading;
      return {
        ...readView(camera, focus, up),
        atTarget: gizmo?.atTarget?.target.label ?? null,
        heading: heading ? (heading.target?.label ?? "a direction") : null,
        canRoll: gizmo?.canRoll ?? false,
      };
    },
    setFieldOfView(degrees) {
      if (!(camera instanceof PerspectiveCamera) || camera.fov === degrees) return;
      // Keep the target plane's vertical span: distance × tan(fov / 2) stays constant.
      const center = focus().clone();
      const scale = Math.tan(MathUtils.degToRad(camera.fov) / 2) / Math.tan(MathUtils.degToRad(degrees) / 2);
      camera.position.sub(center).multiplyScalar(scale).add(center);
      camera.fov = degrees;
      fitClipPlanes = true;
      clipPlanes();
      camera.updateProjectionMatrix();
      // What a host does after moving the camera: sync its controls, then the gizmo (`update()` steps no controls).
      syncControls();
      gizmo?.update();
      notify();
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
    clipPlanes();
    if (extension?.frame) extension.frame();
    else renderer.render(scene, camera);
    gizmo?.render();
  });

  return handle;
}

/** Writes a reported pose at the camera's current distance from `focus`: what a controlled-mode host does. */
function applyPose(camera: PerspectiveCamera | OrthographicCamera, focus: Vector3, pose: GizmoPose) {
  const distance = camera.position.distanceTo(focus);
  camera.position.copy(pose.direction).multiplyScalar(distance).add(focus);
  camera.up.copy(pose.up);
  camera.lookAt(focus);
}

function readView(
  camera: PerspectiveCamera | OrthographicCamera,
  focus: Vector3,
  up: Vector3
): Pick<ViewReading, "direction" | "up" | "roll"> {
  const direction = camera.position.clone().sub(focus).normalize();
  const cameraRight = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
  const roll = (Math.asin(Math.min(1, Math.max(-1, cameraRight.dot(up)))) * 180) / Math.PI;
  return { direction: direction.toArray(), up: camera.up.toArray(), roll };
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
