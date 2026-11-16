import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "Limits, pole entry and opposite click",
  description: "Bound the gizmo's turns with polar and azimuth limits, choose how Top and Bottom are entered, and flip to the opposite view.",
};

export default function LimitsGuide() {
  return (
    <>
      <h1>Limits, pole entry and opposite click</h1>
      <p>
        Three options shape where a click or drag on the gizmo lands: <code>limits</code> bounds the
        view, <code>poleEntry</code> picks the heading at Top and Bottom, and{" "}
        <code>oppositeOnRepeat</code> turns a second click to the opposite view.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Set the options</h3>
      <Sample file="limits.ts" />
      <figure>
        <Stage
          label="Cube gizmo that stays above the horizon"
          config={{
            controller: "orbit",
            gizmo: { type: "cube", limits: { maxPolarAngle: Math.PI / 2 }, poleEntry: "nearest", oppositeOnRepeat: true },
          }}
        />
        <figcaption>
          Click Bottom: the view stops at the horizon. Click Front, then click it again: the second
          click turns to Back.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <strong>Limits.</strong> Radians in the orbit frame, named as on OrbitControls: polar from
          the up axis (0 to π), azimuth about it. They clamp drags, clicks and{" "}
          <code>lookFrom</code>, which lands on the nearest allowed view. The two azimuth limits apply
          only when both are finite.
        </li>
        <li>
          <strong>Limits from controls.</strong> Numeric limits on attached controls (OrbitControls,
          camera-controls) narrow the gizmo&apos;s own polar limits; their azimuth limits apply when{" "}
          <code>limits</code> sets none. Azimuth limits read from controls match the controls exactly
          only with <code>roll: false</code>.
        </li>
        <li>
          <strong>
            <code>roll: &quot;free&quot;</code>
          </strong>{" "}
          turns by the shortest rotation and ignores limits.
        </li>
        <li>
          <strong>Pole entry.</strong> <code>front</code> (default) enters Top and Bottom upright with
          the Front face toward the bottom or top of the screen; <code>nearest</code> keeps the heading
          the view had, to the nearest quarter turn. A rolled view always uses <code>nearest</code>.
        </li>
        <li>
          <strong>Double-click.</strong> A second press on the same spot within 400 ms returns the view
          to upright on the target the first click turned to, and never flips to the opposite. With{" "}
          <code>roll: false</code> it keeps the first click&apos;s turn; with{" "}
          <code>roll: &quot;free&quot;</code> it ends upright with the label up as screen up.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/orbit-controls/">OrbitControls</Link>
        </li>
        <li>
          <Link href="/docs/api/#gizmo-options">API reference: options</Link>
        </li>
      </ul>
    </>
  );
}
