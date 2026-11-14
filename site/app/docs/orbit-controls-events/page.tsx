import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { OrbitControlsEventsExample } from "@site/components/examples";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "OrbitControls events" };

export default function OrbitControlsEventsGuide() {
  return (
    <>
      <h1>OrbitControls events</h1>
      <p>
        <code>attachControls</code> is three event listeners. Wire them yourself when you need
        finer control: share the target, pause the controls between the gizmo&apos;s{" "}
        <code>start</code> and <code>end</code>, and update the gizmo on every controls change.
      </p>
      <Code>{`
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
const controls = new OrbitControls(camera, renderer.domElement);

// The gizmo and the controls must share one target.
gizmo.target = controls.target.set(0, 1, 0);
controls.update();

gizmo.addEventListener("start", () => (controls.enabled = false));
gizmo.addEventListener("end", () => (controls.enabled = true));
controls.addEventListener("change", () => gizmo.update(false));

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
`}</Code>
      <figure>
        <OrbitControlsEventsExample />
      </figure>
    </>
  );
}
