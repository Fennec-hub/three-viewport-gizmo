import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@site/components/Code";
import { assertReadmeQuickstart, Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = {
  title: "Quickstart",
  description: "Install the gizmo, attach it to OrbitControls and draw it after your scene.",
};

export default function Quickstart() {
  assertReadmeQuickstart();
  return (
    <>
      <h1>Quickstart</h1>
      <p>Add a view cube or orientation sphere to a three.js scene in three steps.</p>

      <h2>Prerequisites</h2>
      <p>
        A three.js scene with a camera and a <code>WebGLRenderer</code> or <code>WebGPURenderer</code>.
        The package is ESM only and needs <code>three</code> 0.167 or later as a peer dependency (0.171 or later with
        <code>WebGPURenderer</code>).
      </p>

      <h2>Install</h2>
      <Code>{`npm install ${PACKAGE} three`}</Code>

      <h2>Use it with OrbitControls</h2>
      <p>
        Put the canvas in the page, create the gizmo with your camera and renderer, attach your{" "}
        <a href="https://threejs.org/docs/#examples/en/controls/OrbitControls">OrbitControls</a>,
        and render the gizmo after the scene every frame. The gizmo measures its own box when it
        renders, so a resize needs nothing from it.
      </p>
      <Sample file="quickstart.ts" />

      <h2>Expected output</h2>
      <figure>
        <Stage label="Sphere gizmo with OrbitControls" config={{ controller: "orbit", gizmo: {} }} />
        <figcaption>Drag the scene or the gizmo; click an axis to turn the view to it.</figcaption>
      </figure>
      <p>
        The default frame is three.js&apos;s Y-up: up <code>Y+</code>, right <code>X+</code>, Front{" "}
        <code>Z+</code>. The gizmo reads the up from <code>camera.up</code> when it is created; for
        Z-up and other frames see <Link href="/docs/up-axis/">Up axis</Link>.
      </p>

      <h2>What&apos;s next</h2>
      <ul>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>: cursors, colours and the element&apos;s
          state attributes.
        </li>
        <li>
          <Link href="/docs/migrating/">Migrating from 2.x</Link>, if you are upgrading.
        </li>
        <li>
          Every option at once in the <Link href="/playground/">Playground</Link>, and the{" "}
          <Link href="/docs/api/">API reference</Link>.
        </li>
      </ul>
    </>
  );
}
