import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo, type GizmoPose } from "@taulabs/three-viewport-gizmo";
import { camera, renderer, scene } from "./host"; // @hide

const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube", controlled: true });
gizmo.attachControls(controls);

/** Your own camera write: here, what the gizmo would have done itself. */
function applyPose({ direction, up }: GizmoPose) {
  const distance = camera.position.distanceTo(gizmo.target);
  camera.position.copy(direction).multiplyScalar(distance).add(gizmo.target);
  camera.up.copy(up);
  camera.lookAt(gizmo.target);
  gizmo.update();
}

// Every flight frame and drag step reports the pose; nothing moves until you apply it.
gizmo.addEventListener("change", ({ pose }) => applyPose(pose));

// The gizmo does not update the controls in this mode: hand them the camera when the turn ends.
gizmo.addEventListener("end", () => controls.update());

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
