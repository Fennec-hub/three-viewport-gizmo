import { OrbitControls } from "three/examples/jsm/Addons.js";
import { initScene } from "./initScene";
import { Object3D, PerspectiveCamera } from "three";
import { ViewportGizmo } from "@lib/ViewportGizmo";

export const orbitOrTrackballControls = () => {
  let gizmo: ViewportGizmo;

  const initCallBack = (
    camera: PerspectiveCamera,
    viewportGizmo: ViewportGizmo
  ) => {
    const controls = new OrbitControls(camera, document.body);
    gizmo = viewportGizmo;
    gizmo.attachControls(controls);
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
    modelLoadedCallBack
  );
};
