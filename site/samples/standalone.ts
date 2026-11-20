import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer, scene } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.target.set(0, 1, 0);
camera.lookAt(gizmo.target);
gizmo.update(); // the camera moved without the gizmo

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
