import { GizmoOptionsFallback } from "@lib/types";
import { ViewportGizmo } from "@lib/ViewportGizmo";
import {
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  TorusKnotGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

export function multiViewport() {
  const container = document.querySelector<HTMLElement>("#app")!;
  document.querySelector<HTMLElement>("#cc")!.remove();

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x333333, 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animation);

  const canvas = renderer.domElement;
  container.appendChild(canvas);

  const viewports = createMultiViewportElements(container, renderer);
  resize();

  function animation() {
    renderer.setClearColor(0xffffff);
    renderer.setScissorTest(false);
    renderer.clear();

    renderer.setClearColor(0xe0e0e0);
    renderer.setScissorTest(true);

    viewports.forEach(({ element, scene, camera, mesh, gizmo }) => {
      mesh.rotation.y = Date.now() * 0.001;

      const rect = element.getBoundingClientRect();

      const width = rect.right - rect.left;
      const height = rect.bottom - rect.top;
      const left = rect.left;
      const bottom = renderer.domElement.clientHeight - rect.bottom;

      renderer.setViewport(left, bottom, width, height);
      renderer.setScissor(left, bottom, width, height);

      renderer.render(scene, camera);
      gizmo.render();
    });
  }

  window.onresize = resize;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    viewports.forEach(({ element, camera, controls, gizmo }) => {
      const { clientWidth, clientHeight } = element;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();

      // Update controls
      gizmo.update();
      controls.update();
    });
  }
}

const geometries = [
  new BoxGeometry(),
  new SphereGeometry(0.5, 12, 8),
  new DodecahedronGeometry(0.5),
  new ConeGeometry(0.5),
  new TorusGeometry(0.5, 0.25),
  new CylinderGeometry(0.5, 0.5, 1, 12),
  new TorusKnotGeometry(0.4, 0.125),
  new OctahedronGeometry(0.5),
  new CapsuleGeometry(0.25, 1),
];

const placements: GizmoOptionsFallback["placement"][] = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

function createMultiViewportElements(
  root: HTMLElement,
  renderer: WebGLRenderer
): {
  element: HTMLElement;
  scene: Scene;
  camera: PerspectiveCamera;
  gizmo: ViewportGizmo;
  controls: OrbitControls;
  mesh: Mesh;
}[] {
  const grid = document.createElement("div");
  grid.id = "multi_viewport";

  root.appendChild(grid);

  return Array(9)
    .fill(0)
    .map((_, index) => {
      const element = document.createElement("div");
      element.className = "viewport";
      grid.appendChild(element);

      const scene = new Scene();

      const camera = new PerspectiveCamera(50, 1, 1, 10);
      camera.position.z = 2;
      scene.userData.camera = camera;

      const gizmo = new ViewportGizmo(camera, renderer, {
        container: element,
        placement: placements[index],
      });
      const controls = new OrbitControls(camera, element);
      controls.minDistance = 2;
      controls.maxDistance = 5;
      controls.enablePan = false;
      controls.enableZoom = false;

      // listeners
      gizmo.addEventListener("start", () => (controls.enabled = false));
      gizmo.addEventListener("end", () => (controls.enabled = true));
      controls.addEventListener("change", () => {
        gizmo.update();
      });

      const mesh = new Mesh(
        geometries[index],
        new MeshStandardMaterial({
          color: new Color().setHSL(Math.random(), 1, 0.75, SRGBColorSpace),
          roughness: 0.5,
          metalness: 0,
          flatShading: true,
        })
      );

      scene.add(mesh);
      scene.add(new HemisphereLight(0xaaaaaa, 0x444444, 3));
      const light = new DirectionalLight(0xffffff, 1.5);
      light.position.set(1, 1, 1);
      scene.add(light);

      return {
        element,
        scene,
        camera,
        gizmo,
        controls,
        mesh,
      };
    });
}
