import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Code } from "@site/components/Code";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "API reference" };

type Entry = [name: string, type: string, description: ReactNode];

function Entries({ items }: { items: Entry[] }) {
  return (
    <dl className="api">
      {items.map(([name, type, description]) => (
        <div key={name}>
          <dt>
            {name} <span className="muted">{type}</span>
          </dt>
          <dd>{description}</dd>
        </div>
      ))}
    </dl>
  );
}

const properties: Entry[] = [
  ["enabled", "boolean", "Whether the gizmo responds to user input."],
  ["camera", "PerspectiveCamera | OrthographicCamera", "The camera the gizmo controls."],
  ["renderer", "WebGLRenderer | WebGPURenderer", "The renderer the gizmo draws with."],
  ["target", "Vector3", "The point the camera orbits around. Shared with attached OrbitControls."],
  ["placement", "GizmoOptions[\"placement\"]", "Gets or sets the placement within the container."],
  ["animated", "boolean", "Whether view changes are animated."],
  ["speed", "number", "Animation speed multiplier; higher is faster."],
  ["animating", "boolean (read-only)", <>True while a view change is animating.</>],
];

const methods: Entry[] = [
  [
    "lookFrom",
    "(direction: Vector3, animate?: boolean): void",
    <>
      Turns the view so the camera looks at <code>target</code> from <code>direction</code> (a
      world-space vector; its length is ignored). The orbit radius is read from the camera when
      called. Animates by default when <code>animated</code> is true; pass <code>false</code> to
      jump.
    </>,
  ],
  [
    "set",
    "(options?: GizmoOptions): ViewportGizmo",
    <>
      Rebuilds the gizmo with new options. Expensive: do not call it every frame.
    </>,
  ],
  ["render", "(): ViewportGizmo", "Draws the gizmo. Call it after rendering the scene, every frame."],
  ["domUpdate", "(): ViewportGizmo", "Re-reads the gizmo element's position and size in the page."],
  ["cameraUpdate", "(): ViewportGizmo", "Matches the gizmo's orientation to the camera."],
  [
    "update",
    "(controls?: boolean): ViewportGizmo",
    <>
      <code>domUpdate()</code> and <code>cameraUpdate()</code> together; also updates attached
      controls unless <code>controls</code> is <code>false</code>. Call it on resize.
    </>,
  ],
  ["attachControls", "(controls: OrbitControls): ViewportGizmo", "Links OrbitControls: shared target, paused during gizmo interaction, gizmo updated on every change. Detaches previous controls."],
  ["detachControls", "(): ViewportGizmo", "Removes the controls link. Safe to call more than once."],
  ["dispose", "(): void", "Releases geometries, materials, textures, listeners and the gizmo element."],
];

const events: Entry[] = [
  ["start", "{}", "A drag starts, or a click starts a view transition."],
  [
    "change",
    "{ kind, axes, face, direction }",
    <>
      The view changes: during a drag, on every animation frame, and once on a click. On a click
      the fields identify the hit; on drag and animation frames they are <code>null</code>.
    </>,
  ],
  ["end", "{}", "A drag ends, or a view transition completes."],
  [
    "hoverchange",
    "{ object, kind, axes, face, direction }",
    <>
      The hovered face, edge or corner changes. <code>object</code> is the hovered mesh or sprite,
      or <code>null</code> when the pointer leaves.
    </>,
  ],
];

const options: Entry[] = [
  ["container", "HTMLElement | string", "Parent element, or a CSS selector for it. Default document.body."],
  ["type", "\"sphere\" | \"cube\" | \"rounded-cube\"", "Gizmo shape. Default \"sphere\"."],
  ["size", "number", "Widget size in pixels. Default 128."],
  ["placement", "\"top-left\" | \"top-center\" | … | \"bottom-right\"", "Position within the container: top, center or bottom combined with left, center or right. Default \"top-right\"."],
  ["offset", "{ left?, top?, right?, bottom? }", "Offset from the container edges in pixels. Default 10 each."],
  ["animated", "boolean", "Animate view changes. Default true."],
  ["speed", "number", "Animation speed multiplier. Default 1."],
  ["resolution", "number", "Texture resolution. Default 64 for the sphere, 128 for the cubes."],
  [
    "up",
    "\"x\" | \"y\" | \"z\"",
    <>
      The world up axis faces, drags and clicks are oriented around. Defaults to the axis in{" "}
      <code>Object3D.DEFAULT_UP</code> and follows it: a gizmo without an explicit <code>up</code>{" "}
      regenerates on its next <code>update()</code> or <code>render()</code> after the global
      changes. Pass it explicitly when views with different up axes share a page.
    </>,
  ],
  ["lineWidth", "number", "Axis line width in pixels. Default 4."],
  ["id", "string", "id attribute of the gizmo element."],
  ["className", "string", "class attribute of the gizmo element."],
  ["font", "{ family?, weight?, size? }", "Font of the axis labels."],
  ["radius", "number", "Axis edge radius; for rounded-cube, the radius of its edges and corners. Default 1 for the sphere, 0.2 for the cube, 0.3 for the rounded cube."],
  ["smoothness", "number", "Axis edge smoothness. Default 18."],
  ["background", "{ enabled?, color?, opacity?, hover?: { color?, opacity? } }", "The background sphere or cube."],
  ["corners", "{ enabled?, color?, opacity?, scale?, radius?, smoothness?, hover? }", "Corner indicators; enabled by default on the cubes only. Radius default 1, smoothness default 18."],
  ["edges", "{ enabled?, color?, opacity?, scale?, radius?, smoothness?, hover? }", "Edge indicators; enabled by default on the cubes only. Radius default 1 for the sphere, 0.125 for the cubes; smoothness default 18."],
  ["x, y, z, nx, ny, nz", "GizmoAxisOptions", "Per-axis options for the positive and negative axes."],
  ["right, top, front, left, bottom, back", "GizmoAxisOptions", "Face-name aliases for the axis options, for cubes."],
];

const axisOptions: Entry[] = [
  ["enabled", "boolean", "Draw the axis. Default true."],
  ["label", "string", "Label text. Defaults to the axis or face name."],
  ["opacity", "number", "Opacity. Default 1."],
  ["scale", "number", "Indicator size multiplier. Default 1."],
  ["line", "boolean", "Draw the axis line."],
  ["color", "ColorRepresentation", "Indicator fill colour."],
  ["labelColor", "ColorRepresentation", "Label colour."],
  ["border", "{ size, color }", "Border around the indicator."],
  ["hover", "{ color?, labelColor?, opacity?, scale?, border? }", "The same properties while hovered."],
];

export default function ApiReference() {
  return (
    <>
      <h1>API reference</h1>
      <p>
        <code>ViewportGizmo</code> is a camera orientation widget: it shows where the camera is
        looking and turns the view when clicked or dragged. It extends <code>Object3D</code> and
        dispatches the events below.
      </p>
      <Code>{`import { ViewportGizmo, type GizmoOptions } from "${PACKAGE}";`}</Code>

      <h2 id="constructor">Constructor</h2>
      <Code>{`new ViewportGizmo(
  camera: PerspectiveCamera | OrthographicCamera,
  renderer: WebGLRenderer | WebGPURenderer,
  options?: GizmoOptions,
)`}</Code>

      <h2 id="properties">Properties</h2>
      <Entries items={properties} />

      <h2 id="methods">Methods</h2>
      <Entries items={methods} />

      <h2 id="events">Events</h2>
      <p>
        Listen with <code>gizmo.addEventListener(type, listener)</code>. In the payloads,{" "}
        <code>kind</code> is <code>&quot;face&quot; | &quot;edge&quot; | &quot;corner&quot;</code>,{" "}
        <code>axes</code> the axis names, <code>face</code> the face name (faces only) and{" "}
        <code>direction</code> a unit <code>Vector3</code>.
      </p>
      <Entries items={events} />

      <h2 id="gizmo-options">GizmoOptions</h2>
      <p>Every option is optional.</p>
      <Entries items={options} />

      <h2 id="gizmo-axis-options">GizmoAxisOptions</h2>
      <Entries items={axisOptions} />
    </>
  );
}
