import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
import { initScene } from "./initScene";
import { Object3D, PerspectiveCamera } from "three";
import type { ViewportGizmo } from "three-viewport-gizmo";

export const orbitOrTrackballControls = (
  ControlsClass: typeof OrbitControls | typeof TrackballControls
) => {
  let controls: OrbitControls | TrackballControls;

  const initCallBack = (
    camera: PerspectiveCamera,
    viewportGizmo: ViewportGizmo
  ) => {
    controls = new ControlsClass(camera, document.body);
    viewportGizmo.target = controls.target;

    // listeners
    viewportGizmo.addEventListener("start", () => (controls.enabled = false));
    viewportGizmo.addEventListener("end", () => (controls.enabled = true));
    (controls as any).addEventListener("change", () => {
      viewportGizmo.update();
    });
  };

  const modelLoadedCallBack = (model: Object3D) => {
    controls.target.copy(model.position);
    controls.update();
  };

  const resizeCallBack = () => {
    if (controls instanceof OrbitControls) controls.update();
    else controls.handleResize();
  };

  const animateControlsCallBack = () => {
    if (controls.enabled) controls.update();
  };

  initScene(
    initCallBack,
    animateControlsCallBack,
    resizeCallBack,
    modelLoadedCallBack
  );
};
