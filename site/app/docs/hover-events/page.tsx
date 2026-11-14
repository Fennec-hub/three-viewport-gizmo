import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { HoverEventsExample } from "@site/components/examples";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Hover events" };

export default function HoverEventsGuide() {
  return (
    <>
      <h1>Hover events</h1>
      <p>
        <code>hoverchange</code> fires when the pointer moves onto a different face, edge or corner,
        and <code>change</code> fires when the view changes. Both carry the hit&apos;s identity:{" "}
        <code>kind</code> (<code>face</code>, <code>edge</code> or <code>corner</code>),{" "}
        <code>axes</code>, <code>face</code> (faces only) and <code>direction</code>, a unit{" "}
        <code>Vector3</code>.
      </p>
      <p>
        On <code>hoverchange</code>, <code>object</code> is the hovered mesh or sprite, or{" "}
        <code>null</code> when the pointer leaves; the identity fields are then <code>null</code>.
        On <code>change</code>, a click dispatches the identity once; drag and animation frames
        carry <code>null</code>.
      </p>
      <Code>{`
import { ViewportGizmo } from "${PACKAGE}";

const gizmo = new ViewportGizmo(camera, renderer, { type: "rounded-cube" });
gizmo.attachControls(controls);

gizmo.addEventListener("hoverchange", ({ object, kind, axes, face, direction }) => {
  console.log("hoverchange", { object, kind, axes, face, direction: direction?.toArray() });
});

gizmo.addEventListener("change", ({ kind, axes, face, direction }) => {
  console.log("change", { kind, axes, face, direction: direction?.toArray() });
});
`}</Code>
      <figure>
        <HoverEventsExample />
        <figcaption>
          Hover and click the gizmo&apos;s faces, edges and corners; the log shows the latest
          payloads.
        </figcaption>
      </figure>
    </>
  );
}
