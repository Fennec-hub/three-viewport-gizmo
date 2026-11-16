import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { RoundedCubeTriadExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "Rounded cube and triad",
  description: "Use the seamless rounded view cube and switch the built-in X, Y, Z axis triad on and off at runtime.",
};

export default function RoundedCubeGuide() {
  return (
    <>
      <h1>Rounded cube and triad</h1>
      <p>
        <code>type: &quot;rounded-cube&quot;</code> draws one closed rounded box whose faces, edges and
        corners are its 26 targets. The built-in axis triad shows the world X, Y and Z axes from the
        cube&apos;s corner.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>.
      </p>

      <h2>Steps</h2>
      <h3>1. Pick the type and switch the triad</h3>
      <Sample file="rounded-cube.ts" />
      <figure>
        <RoundedCubeTriadExample />
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <code>radius</code> sets the rounding of every edge and corner (default 0.3). Its faces stay
          square, and its corners take the edge colour unless you pass <code>corners.color</code>.
        </li>
        <li>
          The triad is off by default and works on <code>cube</code> and <code>rounded-cube</code>.
          While it shows, the cube is drawn at 70% of its size to make room. Toggling it through{" "}
          <code>set()</code> never rebuilds the cube.
        </li>
        <li>
          <code>triad.colors</code> takes a colour for each of <code>x</code>, <code>y</code> and{" "}
          <code>z</code>, for its lines and labels.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>
        </li>
        <li>
          <Link href="/docs/api/#gizmo-options">API reference: options</Link>
        </li>
      </ul>
    </>
  );
}
