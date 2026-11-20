import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer, scene, viewport } from "./host"; // @hide

// The gizmo goes into the canvas's parent, so add the canvas first.
viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
