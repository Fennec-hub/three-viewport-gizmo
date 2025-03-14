import { OrbitControls } from "three/examples/jsm/Addons.js";
import { initScene } from "./initScene";
import { AxesHelper, Object3D, PerspectiveCamera, Scene } from "three";
import { ViewportGizmo } from "@lib/ViewportGizmo";

export const zUp = () => {
  Object3D.DEFAULT_UP.set(0, 0, 1);

  let gizmo: ViewportGizmo;

  const initCallBack = (
    camera: PerspectiveCamera,
    viewportGizmo: ViewportGizmo,
    scene: Scene
  ) => {
    const controls = new OrbitControls(camera, document.body);
    gizmo = viewportGizmo;
    gizmo.attachControls(controls);

    scene.add(new AxesHelper());
  };

  const modelLoadedCallBack = (model: Object3D) => {
    gizmo.target.copy(model.position);
    gizmo.update();
  };

  const resizeCallBack = () => {
    gizmo.update();
  };

  const animateControlsCallBack = () => {
    //gizmo.update();
  };

  initScene(
    initCallBack,
    animateControlsCallBack,
    resizeCallBack,
    modelLoadedCallBack,
    true
  );
};
