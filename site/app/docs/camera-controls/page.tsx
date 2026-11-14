import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "camera-controls" };

export default function CameraControlsGuide() {
  return (
    <>
      <h1>camera-controls</h1>
      <p>
        <a href="https://github.com/yomotsu/camera-controls">camera-controls</a> keeps its own
        state, so the gizmo is wired through events: pause the controls while the gizmo works, hand
        the camera position back to the controls on each gizmo change, and read the controls&apos;
        target back into the gizmo on each controls update. Tested with camera-controls 3.1.
      </p>
      <Code>{`
import * as THREE from "three";
import CameraControls from "camera-controls";
import { ViewportGizmo } from "${PACKAGE}";

CameraControls.install({ THREE });

const gizmo = new ViewportGizmo(camera, renderer);
const controls = new CameraControls(camera, renderer.domElement);

gizmo.addEventListener("start", () => (controls.enabled = false));
gizmo.addEventListener("end", () => (controls.enabled = true));
gizmo.addEventListener("change", () => {
  controls.setPosition(...camera.position.toArray());
});

controls.addEventListener("update", () => {
  controls.getTarget(gizmo.target);
  gizmo.update();
});

controls.setTarget(...gizmo.target.set(0, 1, 0).toArray());

const timer = new THREE.Timer();
renderer.setAnimationLoop((time) => {
  timer.update(time);
  if (controls.enabled && !gizmo.animating) controls.update(timer.getDelta());
  renderer.render(scene, camera);
  gizmo.render();
});
`}</Code>
      <figure>
        <Stage
          label="Sphere gizmo wired to camera-controls"
          config={{ controller: "camera-controls", gizmo: {} }}
        />
      </figure>
    </>
  );
}
