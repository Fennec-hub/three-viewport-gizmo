import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@site/components/Code";
import { UpAxisExample } from "@site/components/examples";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Up axis" };

export default function UpAxisGuide() {
  return (
    <>
      <h1>Up axis</h1>
      <p>
        The gizmo orients its faces, drags and clicks around one world up axis: <code>x</code>,{" "}
        <code>y</code> or <code>z</code>. Z-up is common in CAD; X-up appears in some engineering
        and physics tools.
      </p>
      <table>
        <thead>
          <tr>
            <th>Up</th>
            <th>Right</th>
            <th>Front face</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>Y+</code> (three.js default)
            </td>
            <td>
              <code>X+</code>
            </td>
            <td>
              <code>Z+</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>Z+</code>
            </td>
            <td>
              <code>X+</code>
            </td>
            <td>
              <code>Y-</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>X+</code>
            </td>
            <td>
              <code>Z+</code>
            </td>
            <td>
              <code>Y+</code>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        By default the gizmo reads the axis from <code>Object3D.DEFAULT_UP</code> and follows later
        changes to it on its next <code>update()</code> or <code>render()</code>. Pass{" "}
        <code>up</code> explicitly when views with different up axes share one page, as the{" "}
        <Link href="/matrix/">Matrix</Link> does.
      </p>
      <Code>{`
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

// Either set the process-wide default before creating cameras and controls ...
THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

// ... or set it per camera and per gizmo.
camera.up.set(0, 0, 1); // before creating the controls
const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer, { up: "z" });
gizmo.attachControls(controls);
`}</Code>
      <figure>
        <UpAxisExample />
        <figcaption>
          The same model in each frame; the red, green and blue lines are world X, Y and Z.
        </figcaption>
      </figure>
    </>
  );
}
