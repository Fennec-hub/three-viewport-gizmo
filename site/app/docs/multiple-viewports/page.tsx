import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { MultipleViewportsExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "Multiple viewports",
  description: "Draw several scissored views with one renderer, each with its own camera, controls and gizmo.",
};

export default function MultipleViewportsGuide() {
  return (
    <>
      <h1>Multiple viewports</h1>
      <p>
        One renderer can draw several views with the scissor test. Give each view its own element,
        camera, controls and gizmo, then render each view and its gizmo inside the view&apos;s
        rectangle.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. One gizmo per view, with the view&apos;s element as its container</h3>
      <p>
        <code>gizmo.render()</code> draws only inside its own rectangle and puts back the viewport,
        scissor and scissor test it found, so the next view renders unchanged.
      </p>
      <Sample file="multiple-viewports.ts" />
      <figure>
        <MultipleViewportsExample />
        <figcaption>Four views, one WebGL renderer. Each view orbits on its own.</figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          Pass each view&apos;s <code>up</code> explicitly when the views use different up axes; see{" "}
          <Link href="/docs/up-axis/">Up axis</Link>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/#properties">API reference: viewport</Link>
        </li>
      </ul>
    </>
  );
}
