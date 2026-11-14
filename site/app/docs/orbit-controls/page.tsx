import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "OrbitControls" };

export default function OrbitControlsGuide() {
  return (
    <>
      <h1>OrbitControls</h1>
      <p>
        <code>attachControls</code> links the gizmo to your OrbitControls: they share the orbit
        target, the controls pause while the gizmo animates or is dragged, and the gizmo follows
        every controls change.
      </p>
      <Code>{`
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

const controls = new OrbitControls(camera, renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});

window.addEventListener("resize", () => {
  // ... resize the camera and renderer
  gizmo.update();
});
`}</Code>
      <figure>
        <Stage label="Cube gizmo attached to OrbitControls" config={{ controller: "orbit", gizmo: { type: "cube" } }} />
      </figure>
      <p>
        <code>detachControls()</code> removes the link; attaching new controls detaches the old
        ones.
      </p>
    </>
  );
}
