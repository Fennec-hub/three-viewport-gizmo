import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer, scene } from "./host"; // @hide

// Unattached controls never hear about a new camera.up, so keep the view upright.
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube", roll: false });
const controls = new OrbitControls(camera, renderer.domElement);

controls.target.set(0, 1, 0);
controls.update();
gizmo.target.copy(controls.target);

// Pause the controls while the gizmo turns the view.
gizmo.addEventListener("start", () => (controls.enabled = false));
gizmo.addEventListener("end", () => (controls.enabled = true));

// Follow every controls change. update() steps no controls, so it is safe here.
controls.addEventListener("change", () => {
  gizmo.target.copy(controls.target);
  gizmo.update();
});

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
