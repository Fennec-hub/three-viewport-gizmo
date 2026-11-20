import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sample } from "@site/components/Sample";
import "@site/samples/migrating.css";

export const metadata: Metadata = {
  title: "Migrating from 2.x",
  description: "Upgrade from three-viewport-gizmo 2.x to 3.0: every breaking change and the code that replaces it.",
};

type Change = [area: string, before: ReactNode, after: ReactNode];

/** Every breaking change of 3.0, in the order a 2.x caller meets them. */
const CHANGES: Change[] = [
  [
    "Package",
    <>
      <code>require()</code>, or a <code>&lt;script&gt;</code> tag
    </>,
    <>
      ESM only, with <code>types</code> conditions: import from the package or an ESM CDN. camera-controls
      support is the <code>/camera-controls</code> subpath
    </>,
  ],
  [
    "Container",
    <>
      <code>document.body</code> by default
    </>,
    <>
      The canvas&apos;s parent; <code>CONTAINER_MISSING</code> when the canvas has none or a selector matches
      nothing
    </>,
  ],
  [
    "Element styles",
    <>
      <code>cursor</code>, <code>z-index</code> and <code>border-radius</code> set inline on a private element
      that <code>set()</code> replaced
    </>,
    <>
      One public <code>domElement</code> for life with <code>data-hovered</code>, <code>data-dragging</code>{" "}
      and <code>data-disabled</code>; the host&apos;s CSS sets the look. <code>touch-action: none</code> is
      inline
    </>,
  ],
  [
    "Base class",
    <>
      Extends <code>Object3D</code>: <code>gizmo.add(x)</code>, <code>gizmo.scale</code>,{" "}
      <code>gizmo.children</code>
    </>,
    <>
      Extends <code>EventDispatcher</code>; the scene object is <code>gizmo.root</code> and the 26 targets are{" "}
      <code>gizmo.targets</code>
    </>,
  ],
  [
    "State",
    <>
      Writable <code>placement</code>, <code>animated</code>, <code>speed</code>; private{" "}
      <code>_camera</code>, <code>_viewport</code>, <code>_domElement</code>
    </>,
    <>
      Options, through <code>set()</code> and <code>gizmo.options</code> (the old members throw{" "}
      <code>REMOVED_MEMBER</code> from JavaScript). Read-only <code>viewport</code>, <code>domElement</code>,{" "}
      <code>hovered</code>, <code>dragging</code>, <code>animating</code>, <code>heading</code>,{" "}
      <code>atTarget</code>; the <code>fieldOfView</code> option. <code>target</code> is one vector for life:
      copy into it
    </>,
  ],
  [
    "set()",
    "Rebuilds from defaults plus the options passed; unchecked",
    <>
      Merges a partial into the current options and keeps the element; an explicit <code>undefined</code>{" "}
      restores a default. Bad options throw <code>ViewportGizmoError</code> with a <code>code</code> and change
      nothing
    </>,
  ],
  [
    "Events",
    <>
      <code>change</code> and <code>hoverchange</code> with <code>kind</code>, <code>axes</code>,{" "}
      <code>face</code>, <code>direction</code> (or nulls); <code>start</code> on any press
    </>,
    <>
      <code>start</code>, <code>change</code> and <code>end</code> carry <code>cause</code>,{" "}
      <code>heading</code>, <code>pose</code> and <code>outcome</code>; <code>hoverchange</code> carries{" "}
      <code>{"{ hovered }"}</code>. A press that turns nothing fires <code>press</code>, not <code>start</code>.
      New: <code>attargetchange</code>, <code>invalidate</code>
    </>,
  ],
  [
    "Names",
    <>
      &quot;Axis&quot; types, unexported; <code>lookFrom(direction, animate)</code>
    </>,
    <>
      &quot;Target&quot; types (<code>GizmoTarget</code>, <code>GizmoTargetName</code>, …), all exported;{" "}
      <code>lookFrom(view, {"{ animated, up }"})</code> takes a target name, <code>&quot;home&quot;</code> or a
      vector and resolves with the <code>end</code> payload
    </>,
  ],
  [
    "Face names",
    <>
      <code>face</code> and the face-style options follow the world axes
    </>,
    <>Follow the drawn labels on every up axis</>,
  ],
  [
    "Up axis",
    <>
      <code>Object3D.DEFAULT_UP</code>, followed every frame; <code>up: &quot;x&quot; | &quot;y&quot; | &quot;z&quot;</code>
    </>,
    <>
      <code>camera.up</code> when the gizmo is created, or the <code>up</code> vector (any signed axis) with an
      optional <code>frontDirection</code>. <code>up: &quot;z&quot;</code> throws <code>REMOVED_OPTION</code>
    </>,
  ],
  [
    "camera.up",
    "A turn writes the camera position and orientation",
    <>
      A turn also writes <code>camera.up</code> and tells attached controls
    </>,
  ],
  [
    "Frame",
    <>
      <code>domUpdate()</code> after layout changes, <code>cameraUpdate()</code>; <code>update()</code> steps
      attached controls; gizmo colours tone mapped
    </>,
    <>
      <code>render()</code> measures its box and leaves the host&apos;s viewport, scissor and depth outside its
      rectangle as they were, on a render target too. <code>update()</code> steps no controls.{" "}
      <code>domUpdate</code> and <code>cameraUpdate</code> are gone. Materials are not tone mapped
    </>,
  ],
  [
    "attachControls",
    <>
      OrbitControls only; shares its <code>target</code>; forces <code>enabled = true</code> after a turn
    </>,
    <>
      Any controls with <code>target</code>, <code>enabled</code>, <code>update()</code> and a{" "}
      <code>change</code> event; copies the target; restores the previous <code>enabled</code>
    </>,
  ],
  [
    "Motion",
    <>
      <code>animated</code> defaults to <code>true</code>
    </>,
    <>
      Unset, it follows <code>prefers-reduced-motion</code>
    </>,
  ],
  [
    "Pointer",
    "Any button or a second finger can drag",
    <>
      One captured primary pointer; <code>pointercancel</code> ends the drag; a press grabs a running turn; the
      wheel passes through to the canvas. Hit regions shift by a few pixels (an analytic hit test)
    </>,
  ],
  [
    "Keyboard",
    "Not focusable",
    <>
      A tab stop with <code>role=&quot;application&quot;</code>, an accessible name and keys; see{" "}
      <Link href="/docs/keyboard/">Keyboard and accessibility</Link>
    </>,
  ],
];

export default function MigratingGuide() {
  return (
    <>
      <h1>Migrating from 2.x</h1>
      <p>
        3.0 is one breaking release. Most apps change a few lines: the container, the up axis, three
        lines of CSS and their event listeners. The table at the end lists every break.
      </p>

      <h2>Prerequisites</h2>
      <p>
        <code>three</code> 0.167 or later (2.x took 0.162), 0.171 or later with <code>WebGPURenderer</code>,
        and an ESM build. Roll needs three 0.168 or later when OrbitControls are attached.
      </p>

      <h2>Steps</h2>
      <h3>1. Load the package as ESM</h3>
      <p>
        There is no CommonJS or UMD build: replace <code>require()</code> and{" "}
        <code>&lt;script&gt;</code> tags with <code>import</code>.
      </p>

      <h3>2. Create the gizmo after the canvas, with its up</h3>
      <p>
        The gizmo goes into the canvas&apos;s parent unless you pass <code>container</code>, and
        reads its up from <code>camera.up</code> once, when it is created. Front faces the axis it
        faced in 2.x for that up; a negative up, new in 3.0, takes the same Front as its positive.
      </p>
      <Sample file="migrating-setup.ts" />

      <h3>3. Restore the 2.x look with three lines of CSS</h3>
      <p>
        The library no longer writes a cursor, stacking order or corner radius. These rules put back
        what 2.x wrote inline; keep only the ones you want. On a cube, <code>border-radius</code> clips
        the corners.
      </p>
      <Sample file="migrating.css" label="migrating.css" />

      <h3>4. Update event listeners, turns and update calls</h3>
      <Sample file="migrating-events.ts" />

      <h3>5. Check colours under tone mapping</h3>
      <p>
        The gizmo&apos;s materials ignore the renderer&apos;s <code>toneMapping</code>. If you
        brightened or darkened its colours to make up for tone mapping, return them to the colours
        you want to see.
      </p>

      <h3>6. Check your keyboard shortcuts</h3>
      <p>
        The gizmo is now a tab stop that takes the arrow keys, digits 1 to 6 and Home while it has
        focus. Global shortcut handlers should skip keys it consumed; see{" "}
        <Link href="/docs/keyboard/">Keyboard and accessibility</Link>.
      </p>

      <h2>Variations</h2>
      <ul>
        <li>
          To keep the 2.x upright behaviour exactly, pass <code>roll: false</code>; see the{" "}
          <Link href="/docs/api/#gizmo-options">roll option</Link>.
        </li>
        <li>
          If your code moved the camera itself from the gizmo&apos;s events, use{" "}
          <Link href="/docs/controlled-mode/">controlled mode</Link>.
        </li>
        <li>
          camera-controls glue written by hand is replaced by the{" "}
          <Link href="/docs/camera-controls/">cameraControls adapter</Link>.
        </li>
      </ul>

      <h2>Every breaking change</h2>
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>2.x</th>
            <th>3.0</th>
          </tr>
        </thead>
        <tbody>
          {CHANGES.map(([area, before, after]) => (
            <tr key={area}>
              <td>{area}</td>
              <td>{before}</td>
              <td>{after}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/">API reference</Link>
        </li>
        <li>
          <Link href="/docs/styling/">Styling and state</Link>
        </li>
        <li>
          <Link href="/docs/up-axis/">Up axis</Link>
        </li>
      </ul>
    </>
  );
}
