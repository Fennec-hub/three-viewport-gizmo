import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { UpAxisExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "Up axis",
  description: "Orient the gizmo for Z-up, X-up or any signed up axis, and choose which way Front faces.",
};

/** The default Front and the Right it gives for each up: `right = up × front`, the same Front for either sign. */
const FRAMES = [
  ["+Y (three.js default)", "+Z", "+X"],
  ["−Y", "+Z", "−X"],
  ["+Z", "−Y", "+X"],
  ["−Z", "−Y", "−X"],
  ["+X", "+Y", "+Z"],
  ["−X", "+Y", "−Z"],
] as const;

export default function UpAxisGuide() {
  return (
    <>
      <h1>Up axis</h1>
      <p>
        The gizmo labels its faces, and orients its drags and clicks, around one world up: any of
        the six signed axes. Z-up is common in CAD; X-up appears in some engineering tools.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Set the camera&apos;s up before creating the controls and the gizmo</h3>
      <p>
        The gizmo reads its up from <code>camera.up</code> when it is created, snapped to the
        nearest signed axis. It never reads <code>Object3D.DEFAULT_UP</code> and does not follow
        later changes to it.
      </p>
      <Sample file="up-axis.ts" />
      <figure>
        <UpAxisExample />
        <figcaption>
          The same model in each frame; the red, green and blue lines are world X, Y and Z.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <p>
        Without <code>frontDirection</code>, Front faces the axis 2.x used for that up, for either
        sign of it:
      </p>
      <table>
        <thead>
          <tr>
            <th>Up</th>
            <th>Front</th>
            <th>Right</th>
          </tr>
        </thead>
        <tbody>
          {FRAMES.map(([up, front, right]) => (
            <tr key={up}>
              <td>
                <code>{up}</code>
              </td>
              <td>
                <code>{front}</code>
              </td>
              <td>
                <code>{right}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ul>
        <li>
          <code>up</code> and <code>frontDirection</code> are vectors: <code>up</code> must be a
          signed axis and <code>frontDirection</code> perpendicular to it, or the gizmo throws{" "}
          <code>INVALID_FRAME</code>. The 2.x form <code>up: &quot;z&quot;</code> throws{" "}
          <code>REMOVED_OPTION</code>.
        </li>
        <li>
          Face names follow the labels on every up: <code>top</code> is the face labelled Top, and
          the face-style options (<code>top</code>, <code>front</code>, …) style it.
        </li>
        <li>
          Pass <code>up</code> explicitly when views with different up axes share a page, as the{" "}
          <Link href="/matrix/">Matrix</Link> does.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/#gizmo-options">API reference: up and frontDirection</Link>
        </li>
        <li>
          <Link href="/docs/migrating/">Migrating from 2.x</Link>
        </li>
      </ul>
    </>
  );
}
