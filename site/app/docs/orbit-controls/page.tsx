import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "OrbitControls",
  description: "Attach three.js OrbitControls to the gizmo so the two share the orbit target and take turns.",
};

export default function OrbitControlsGuide() {
  return (
    <>
      <h1>OrbitControls</h1>
      <p>
        <code>attachControls</code> links the gizmo to your OrbitControls: the gizmo copies their
        target on attach and on every change, disables them while it turns the view and restores
        their previous <code>enabled</code> after, and tells them when it changes{" "}
        <code>camera.up</code>.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Attach the controls</h3>
      <Sample file="orbit-controls.ts" />
      <figure>
        <Stage label="Cube gizmo attached to OrbitControls" config={{ controller: "orbit", gizmo: { type: "cube" } }} />
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <code>detachControls()</code> removes the link and restores the controls&apos;{" "}
          <code>enabled</code>; attaching other controls detaches the first.
        </li>
        <li>
          <code>MapControls</code>, <code>TrackballControls</code> and <code>ArcballControls</code>{" "}
          attach the same way: <code>attachControls</code> takes any object with a{" "}
          <code>target</code>, <code>enabled</code>, <code>update()</code> and a <code>change</code>{" "}
          event.
        </li>
        <li>
          Roll is on by default with OrbitControls from three 0.168, which can take a new up. On
          0.167 pass <code>roll: false</code>, or <code>attachControls</code> throws{" "}
          <code>ROLL_UNSUPPORTED</code> when you ask for roll.
        </li>
        <li>
          Polar and azimuth limits on the controls also bound the gizmo&apos;s turns; see{" "}
          <Link href="/docs/limits/">Limits</Link>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/orbit-controls-events/">OrbitControls events</Link>: the same link wired by
          hand.
        </li>
        <li>
          <Link href="/docs/controlled-mode/">Controlled mode</Link>: the gizmo reports the pose and
          your code moves the camera.
        </li>
        <li>
          <Link href="/docs/api/#methods">API reference: methods</Link>
        </li>
      </ul>
    </>
  );
}
