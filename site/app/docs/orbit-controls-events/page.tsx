import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { OrbitControlsEventsExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "OrbitControls events",
  description: "Wire OrbitControls to the gizmo with events instead of attachControls, for finer control.",
};

export default function OrbitControlsEventsGuide() {
  return (
    <>
      <h1>OrbitControls events</h1>
      <p>
        Wire the controls yourself when <code>attachControls</code> does more than you want: copy the
        target, pause the controls between the gizmo&apos;s <code>start</code> and <code>end</code>,
        and update the gizmo on every controls change.
      </p>

      <h2>Prerequisites</h2>
      <p>
        <Link href="/docs/orbit-controls/">OrbitControls</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Copy the target, pause the controls and follow their changes</h3>
      <p>
        The gizmo&apos;s <code>target</code> is its own vector for life: copy into it, never assign
        it. Unattached controls are never told about a new <code>camera.up</code>, so keep roll off.
      </p>
      <Sample file="orbit-controls-events.ts" />
      <figure>
        <OrbitControlsEventsExample />
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <code>start</code> fires only when a turn or drag begins. To react to every press on the
          gizmo, including one that turns nothing, listen for <code>press</code>.
        </li>
        <li>
          <code>end</code> carries an <code>outcome</code>: <code>reached</code>,{" "}
          <code>interrupted</code> or <code>cancelled</code>. It always balances <code>start</code>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/hover-events/">Hover events</Link>
        </li>
        <li>
          <Link href="/docs/api/#events">API reference: events</Link>
        </li>
      </ul>
    </>
  );
}
