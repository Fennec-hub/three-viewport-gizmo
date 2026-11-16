import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "Standalone",
  description: "Use the gizmo as the only camera controller: drag it to orbit and click it to turn the view.",
};

export default function StandaloneGuide() {
  return (
    <>
      <h1>Standalone</h1>
      <p>
        Without a camera controller the gizmo is the controller: dragging it orbits the camera
        around <code>gizmo.target</code>, and clicking a target turns the view to it.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>, without the OrbitControls.
      </p>

      <h2>Steps</h2>
      <h3>1. Set the orbit target</h3>
      <p>
        After moving the camera yourself, call <code>gizmo.update()</code> so the gizmo follows.
      </p>
      <Sample file="standalone.ts" />
      <figure>
        <Stage label="Standalone sphere gizmo without a camera controller" config={{ controller: "none", gizmo: {} }} />
        <figcaption>The scene itself does not respond to the pointer; only the gizmo does.</figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          With no controls attached, roll is on by default: <code>turn({"{ roll }"})</code> and{" "}
          <kbd>Shift</kbd> with <kbd>←</kbd> or <kbd>→</kbd> roll the view.
        </li>
        <li>
          Turn the view from your own buttons with <code>lookFrom(&quot;front&quot;)</code>,{" "}
          <code>lookFrom(&quot;home&quot;)</code> or <code>turn({"{ toward: \"left\" }"})</code>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/#methods">API reference: methods</Link>
        </li>
        <li>
          <Link href="/docs/keyboard/">Keyboard and accessibility</Link>
        </li>
      </ul>
    </>
  );
}
