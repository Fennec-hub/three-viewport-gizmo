import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";
import "@site/samples/responsive.css";

export const metadata: Metadata = {
  title: "Responsive",
  description: "Size the gizmo with CSS so it follows its container's layout.",
};

export default function ResponsiveGuide() {
  return (
    <>
      <h1>Responsive</h1>
      <p>
        The gizmo is one element inside its <code>container</code>. Give it a class and size it with
        CSS; it measures its box every time it renders, so layout changes need no call.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>. The container needs a{" "}
        <code>position</code> other than <code>static</code> for the gizmo to sit in its corner.
      </p>

      <h2>Steps</h2>
      <h3>1. Give the gizmo a class</h3>
      <Sample file="responsive.ts" />
      <h3>2. Size it in CSS</h3>
      <Sample file="responsive.css" label="responsive.css" />
      <figure>
        <Stage
          className="resizable"
          label="Resizable viewport whose gizmo is sized with CSS"
          config={{ controller: "orbit", gizmo: { type: "rounded-cube", className: "responsive-gizmo" } }}
        />
        <figcaption>Drag the bottom-right corner of the viewport to resize it.</figcaption>
      </figure>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>
        </li>
        <li>
          <Link href="/docs/api/#gizmo-options">API reference: size, placement and offset</Link>
        </li>
      </ul>
    </>
  );
}
