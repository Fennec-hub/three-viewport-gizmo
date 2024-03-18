import {
  Color,
  ColorRepresentation,
  GridHelper,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { ViewportGizmo } from "@lib/ViewportGizmo";
import { initGUI } from "./gui";
import { GizmoOptions } from "@lib/types";

let viewportGizmo: ViewportGizmo;

let camera: PerspectiveCamera;
let scene: Scene;
let renderer: WebGLRenderer;
let gridHelper: GridHelper;

export function configuration() {
  const container = document.querySelector<HTMLElement>("#app")!;
  const [width, height] = [window.innerWidth, window.innerHeight];

  scene = new Scene();
  scene.background = new Color(0x333333);

  camera = new PerspectiveCamera(70, width / height, 0.1, 100);
  camera.position.set(5, 5, 5);
  camera.lookAt(scene.position);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.setAnimationLoop(animation);
  container.appendChild(renderer.domElement);

  // GridHelper
  gridHelper = new GridHelper(10, 10, 0x111111, 0x111111);
  scene.add(gridHelper);

  // Viewport Gizmo
  viewportGizmo = new ViewportGizmo(camera, renderer, {
    size: Math.min(width, height) * 0.8,
    placement: "center-center",
  });

  initGUI();

  function animation() {
    renderer.render(scene, camera);
    viewportGizmo.render();
  }

  window.onresize = () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    viewportGizmo.update();
  };
}

export function updateViewportGizmo(
  options: GizmoOptions,
  params: { background: ColorRepresentation; grid: boolean }
) {
  const target = viewportGizmo.target;
  viewportGizmo.dispose();
  viewportGizmo = new ViewportGizmo(camera, renderer, options);
  viewportGizmo.target = target;

  gridHelper.visible = params.grid;
  (scene.background as Color).set(params.background);
}
