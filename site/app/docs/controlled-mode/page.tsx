import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "Controlled mode",
  description: "Let the gizmo report each camera pose and move the camera yourself, as a state store or animation system needs.",
};

export default function ControlledModeGuide() {
  return (
    <>
      <h1>Controlled mode</h1>
      <p>
        With <code>controlled: true</code> the gizmo writes no camera. Each turn and drag reports the
        pose it would have written in <code>change</code>, and your code applies it, so the camera
        can live in your own state, animation system or undo history.
      </p>

      <h2>Prerequisites</h2>
      <p>
        <Link href="/docs/orbit-controls/">OrbitControls</Link> or{" "}
        <Link href="/docs/camera-controls/">camera-controls</Link> attached as usual.
      </p>

      <h2>Steps</h2>
      <h3>1. Apply each pose, then sync your controls when the turn ends</h3>
      <p>
        <code>camera.lookAt</code> from <code>pose.direction</code> with <code>pose.up</code>{" "}
        reproduces exactly what the gizmo writes itself. Call <code>gizmo.update()</code> after
        moving the camera.
      </p>
      <Sample file="controlled-mode.ts" />
      <figure>
        <Stage
          label="Controlled cube gizmo: the page applies every pose"
          config={{ controller: "orbit", gizmo: { type: "cube", controlled: true } }}
        />
        <figcaption>
          The gizmo reports; the page moves the camera and updates the controls after <code>end</code>.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          The gizmo still disables attached controls while it turns and restores them after, but it
          never calls their <code>update()</code> or <code>updateCameraUp()</code>. Controls that keep
          their own state, such as camera-controls, jump back on the next drag unless you sync them
          after <code>end</code>.
        </li>
        <li>
          Roll is off by default in this mode. With <code>roll: true</code>, also call your
          controls&apos; <code>updateCameraUp()</code> after <code>end</code> when they have one.
        </li>
        <li>
          Applying a pose late, or skipping one, never changes a turn: until it ends, the gizmo plans
          from the pose it reported, not from the camera.
        </li>
        <li>
          <code>end</code> reports where the view stopped in <code>pose</code>, and why in{" "}
          <code>outcome</code>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/#events">API reference: events</Link>
        </li>
        <li>
          <Link href="/docs/render-on-demand/">Render on demand and warm-up</Link>
        </li>
      </ul>
    </>
  );
}
