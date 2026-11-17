import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";
import "@site/samples/styling.css";

export const metadata: Metadata = {
  title: "Styling and state",
  description: "Style the gizmo's element with CSS state attributes, colour its targets, and read its state.",
};

const ATTRIBUTES = [
  ["data-hovered", <>The kind under the mouse or pen: <code>face</code>, <code>edge</code> or <code>corner</code>. Never for touch</>],
  ["data-dragging", "Present while a drag on the gizmo turns the view"],
  ["data-disabled", <>Present while <code>enabled</code> is <code>false</code></>],
] as const;

export default function StylingGuide() {
  return (
    <>
      <h1>Styling and state</h1>
      <p>
        The gizmo&apos;s look is split in two: the page styles its element with CSS, and options
        colour the targets it draws. Its interaction state is read-only, on the element as
        attributes and on the gizmo as properties and events.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Give the element a class and colour the targets</h3>
      <p>
        <code>gizmo.domElement</code> is one element for the gizmo&apos;s whole life:{" "}
        <code>set()</code> updates it in place, so classes, attributes and children you add stay.
      </p>
      <Sample file="styling.ts" />

      <h3>2. Style its states in CSS</h3>
      <p>
        The library writes only the element&apos;s position, size, margin and{" "}
        <code>touch-action: none</code> inline. Size and margin read the custom properties{" "}
        <code>--viewport-gizmo-width</code>, <code>--viewport-gizmo-height</code> and{" "}
        <code>--viewport-gizmo-margin</code> first, so a class can resize the gizmo without{" "}
        <code>!important</code>. Cursor, stacking order, corner radius and focus ring are yours, keyed on
        these attributes:
      </p>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          {ATTRIBUTES.map(([name, meaning]) => (
            <tr key={name}>
              <td>
                <code>{name}</code>
              </td>
              <td>{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Sample file="styling.css" label="styling.css" />
      <figure>
        <Stage
          label="Cube gizmo styled with state attributes"
          config={{
            controller: "orbit",
            gizmo: {
              type: "cube",
              className: "view-cube",
              background: { color: 0xdde3ea },
              front: { color: 0x3d8be8, labelColor: "white", hover: { color: 0x5aa0f0 } },
            },
          }}
        />
        <figcaption>
          The hand shows only over a target, and the grabbing cursor while dragging; Tab focuses the
          cube.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <strong>Display only.</strong> <code>gizmo.enabled = false</code> ends any hover, press or
          turn, takes the element out of the tab order and sets <code>data-disabled</code>.
        </li>
        <li>
          <strong>Finer switches.</strong> <code>set({"{ drag: false }"})</code> keeps clicks and drops
          drags; <code>enabled: false</code> on a target (<code>bottom</code>, <code>nx</code>, …)
          hides it and makes it unclickable. Neither rebuilds the gizmo.
        </li>
        <li>
          <strong>Colours.</strong> Axis keys (<code>x</code> to <code>nz</code>) style world axis
          ends; face keys (<code>top</code> to <code>left</code>) style the face with that label and
          win over the axis key. Colours are display colours: they are not tone mapped.
        </li>
        <li>
          <strong>Materials.</strong> <code>onMaterial(material, use)</code> swaps each target material
          the gizmo builds for your own, such as a node material.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/hover-events/">Hover events</Link>
        </li>
        <li>
          <Link href="/docs/keyboard/">Keyboard and accessibility</Link>
        </li>
        <li>
          <Link href="/docs/api/#properties">API reference: properties</Link>
        </li>
      </ul>
    </>
  );
}
