import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Standalone" };

export default function StandaloneGuide() {
  return (
    <>
      <h1>Standalone</h1>
      <p>
        Without a camera controller the gizmo is the controller: dragging it orbits the camera
        around <code>gizmo.target</code>, and clicking an axis turns the view to it.
      </p>
      <Code>{`
import { ViewportGizmo } from "${PACKAGE}";

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.target.set(0, 1, 0);
camera.lookAt(gizmo.target);

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
        <Stage label="Standalone sphere gizmo without a camera controller" config={{ controller: "none", gizmo: {} }} />
        <figcaption>The scene itself does not respond to the pointer; only the gizmo does.</figcaption>
      </figure>
    </>
  );
}
