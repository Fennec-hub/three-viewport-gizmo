import * as THREE from "three";
import CameraControls from "camera-controls";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { cameraControls } from "@taulabs/three-viewport-gizmo/camera-controls";
import { camera, renderer, scene } from "./host"; // @hide

CameraControls.install({ THREE });

const controls = new CameraControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(cameraControls(controls));

const timer = new THREE.Timer();
renderer.setAnimationLoop((time) => {
  timer.update(time);
  // The gizmo disables the controls while it turns the camera: skip their update meanwhile.
  if (controls.enabled) controls.update(timer.getDelta());
  renderer.render(scene, camera);
  gizmo.render();
});
