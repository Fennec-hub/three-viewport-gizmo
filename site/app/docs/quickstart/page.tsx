import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Quickstart" };

export default function Quickstart() {
  return (
    <>
      <h1>Quickstart</h1>
      <h2>Install</h2>
      <p>
        The package needs <code>three</code> 0.162 or later as a peer dependency.
      </p>
      <Code>{`npm install ${PACKAGE} three`}</Code>

      <h2>Use it with OrbitControls</h2>
      <p>
        Create the gizmo with your camera and renderer, attach your{" "}
        <a href="https://threejs.org/docs/#examples/en/controls/OrbitControls">OrbitControls</a>,
        render it after the scene every frame, and update it when the canvas resizes.
      </p>
      <Code>{`
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

// ... create the scene, camera and renderer

const controls = new OrbitControls(camera, renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer);
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
        <Stage label="Sphere gizmo with OrbitControls" config={{ controller: "orbit", gizmo: {} }} />
        <figcaption>Drag the scene or the gizmo; click an axis to turn the view to it.</figcaption>
      </figure>

      <h2>Coordinate system</h2>
      <p>
        The default is three.js&apos;s Y-up frame: up <code>Y+</code>, right <code>X+</code>,
        forward <code>Z-</code>. For Z-up and X-up scenes see <Link href="/docs/up-axis/">Up axis</Link>.
      </p>

      <h2>Next</h2>
      <p>
        <Link href="/docs/webgpu/">WebGPU</Link>, the other integrations in the sidebar, every
        option at once in the <Link href="/playground/">Playground</Link>, and the{" "}
        <Link href="/docs/api/">API reference</Link>.
      </p>
    </>
  );
}
