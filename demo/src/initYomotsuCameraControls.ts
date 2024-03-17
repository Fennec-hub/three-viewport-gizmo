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
  Camera,
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

export const initYomotsuCameraControls = () => {
  let controls: CameraControls;

  const initCallBack = (camera: Camera, viewportGizmo: ViewportGizmo) => {
    controls = new CameraControls(camera as PerspectiveCamera, document.body);

    viewportGizmo.addEventListener("start", () => (controls.enabled = false));
    viewportGizmo.addEventListener("end", () => (controls.enabled = true));
    controls.addEventListener("update", () => {
      controls.getTarget(viewportGizmo.target);
      viewportGizmo.update();
    });
  };

  const modelLoadedCallBack = (model: Object3D) => {
    controls.setTarget(...model.position.toArray());
  };

  const animateCallBack = (clock: Clock) => {
    controls.update(clock.getDelta());
  };

  initScene(initCallBack, animateCallBack, undefined, modelLoadedCallBack);
};
