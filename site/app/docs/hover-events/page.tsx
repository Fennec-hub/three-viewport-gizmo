import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { HoverEventsExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "Hover events",
  description: "React to the face, edge or corner under the pointer, to presses and to turns with typed payloads.",
};

export default function HoverEventsGuide() {
  return (
    <>
      <h1>Hover events</h1>
      <p>
        Show what the pointer is over, or what a click is turning to, from the gizmo&apos;s typed
        events. Every payload carries a target as data: its <code>name</code> (such as{" "}
        <code>top-front</code>), <code>kind</code> (<code>face</code>, <code>edge</code> or{" "}
        <code>corner</code>), drawn <code>label</code> and unit <code>direction</code>.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Listen for hover, press and change</h3>
      <p>
        The field is <code>hovered</code> or <code>pressed</code>, never <code>target</code>:
        three.js&apos;s <code>EventDispatcher</code> writes the gizmo itself to{" "}
        <code>event.target</code>.
      </p>
      <Sample file="hover-events.ts" />
      <figure>
        <HoverEventsExample />
        <figcaption>
          Hover and click the gizmo&apos;s faces, edges and corners; the log shows the latest
          payloads.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <code>hoverchange</code> also fires when the view turns under a still pointer, and never
          for touch.
        </li>
        <li>
          <code>change</code> fires for every flight frame and drag step. Its <code>heading</code> is
          where a flight is going (<code>null</code> for a drag) and <code>pose</code> is the view
          now.
        </li>
        <li>
          <code>attargetchange</code> says which target the view rests on, or <code>null</code>{" "}
          between targets. <code>gizmo.hovered</code> and <code>gizmo.atTarget</code> read the same
          state at any time.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>: <code>data-hovered</code> for CSS.
        </li>
        <li>
          <Link href="/docs/api/#events">API reference: events</Link>
        </li>
      </ul>
    </>
  );
}
