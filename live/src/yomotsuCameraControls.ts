import { ViewportGizmo } from "@lib/ViewportGizmo";
import CameraControls from "camera-controls";

import {
  Vector2,
  Vector3,
  Vector4,
  Quaternion,
  Matrix4,
  Spherical,
  Box3,
  Sphere,
  Raycaster,
  PerspectiveCamera,
  Object3D,
  Clock,
} from "three";
import { initScene } from "./initScene";

CameraControls.install({
  THREE: {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
  },
});

export const yomotsuCameraControls = () => {
  let controls: CameraControls;
  let gizmo: ViewportGizmo;

  const initCallBack = (
    camera: PerspectiveCamera,
    viewportGizmo: ViewportGizmo
  ) => {
    controls = new CameraControls(camera as PerspectiveCamera, document.body);
    gizmo = viewportGizmo;

    gizmo.addEventListener("start", () => (controls.enabled = false));
    gizmo.addEventListener("end", () => (controls.enabled = true));
    gizmo.addEventListener("change", () => {
      controls.setPosition(...camera.position.toArray());
    });

    controls.addEventListener("update", () => {
      controls.getTarget(gizmo.target);
      gizmo.update();
    });
  };

  const modelLoadedCallBack = (model: Object3D) => {
    controls.setTarget(...model.position.toArray());
  };

  const clock = new Clock();
  const animateCallBack = () => {
    if (controls.enabled && !gizmo.animating) controls.update(clock.getDelta());
  };

  initScene(initCallBack, animateCallBack, undefined, modelLoadedCallBack);
};
