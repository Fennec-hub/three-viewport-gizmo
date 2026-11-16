import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sample } from "@site/components/Sample";

export const metadata: Metadata = {
  title: "API reference",
  description: "ViewportGizmo's constructor, properties, methods, events, options, error codes and the camera-controls adapter.",
};

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
  ["camera", "PerspectiveCamera | OrthographicCamera", "The camera it turns. Reassignable, to swap perspective and orthographic."],
  ["renderer", "WebGLRenderer | WebGPURenderer (read-only)", "The renderer that draws the scene and the gizmo."],
  ["root", "Object3D (read-only)", <>The gizmo&apos;s scene object, drawn with its own camera. Never add it to your scene: <code>render()</code> takes it back.</>],
  ["target", "Vector3 (read-only)", "The orbit target. One vector for life: copy into it. Copied from attached controls, never shared."],
  ["domElement", "HTMLElement (read-only)", <>The gizmo&apos;s one element, kept through every <code>set()</code>, with <code>data-hovered</code>, <code>data-dragging</code> and <code>data-disabled</code>.</>],
  ["enabled", "boolean", <>Display only when <code>false</code>: ends hover, any press and any turn, and takes the element out of the tab order.</>],
  ["options", "GizmoResolvedOptions (read-only)", <>The options with every default filled. Changed only through <code>set()</code>.</>],
  ["targets", "readonly GizmoTarget[] (read-only)", "All 26 targets in the label frame, for every type; a hidden target stays in the list."],
  ["up", "Readonly<Vector3> (read-only)", "The orbit up: the label up until the view is rolled."],
  ["canRoll", "boolean (read-only)", <>Whether roll commands work: the resolved <code>roll</code> is not <code>false</code>.</>],
  ["hovered", "GizmoTarget | null (read-only)", "The target under the mouse or pen."],
  ["dragging", "boolean (read-only)", "Whether a drag on the gizmo is turning the view."],
  ["animating", "boolean (read-only)", "Whether a turn is running."],
  ["heading", "GizmoHeading | null (read-only)", "Where the running turn is going."],
  ["atTarget", "GizmoAtTarget | null (read-only)", <>The target the view rests on, and at a face the face each side turns to; <code>null</code> while dragging, while animating and between targets.</>],
  ["viewport", "GizmoViewport (read-only)", <>The gizmo&apos;s rectangle in CSS pixels as <code>render()</code> last measured it, in the renderer&apos;s <code>setViewport</code> convention.</>],
];

const methods: Entry[] = [
  ["render", "(): void", "Advances a running turn and draws into the gizmo's rectangle over your frame. Call it after rendering the scene."],
  ["update", "(): void", <>Syncs from the camera after you move it without attached controls; asks for a frame when the camera turned. Steps no controls.</>],
  ["set", "(options: GizmoOptions): void", <>Merges a partial into the current options; an explicit <code>undefined</code> restores a default. Cheap changes apply in place; a structural one (such as <code>type</code>) rebuilds the targets and cancels a running turn. Throws and changes nothing for bad options.</>],
  ["lookFrom", "(view: GizmoView, options?: GizmoLookFromOptions): Promise<GizmoTurnEnd>", <>Turns to a target name, <code>&quot;home&quot;</code> (Top Front Right, upright) or a direction from the target toward the camera. <code>{"{ animated, up: \"keep\" | \"reset\" }"}</code>. Resolves with the <code>end</code> payload; rejects only with <code>UNKNOWN_VIEW</code> or <code>DISPOSED</code>.</>],
  ["turn", "(turn: GizmoTurn): Promise<GizmoTurnEnd>", <>A relative turn: <code>{"{ toward: \"left\" | \"right\" | \"up\" | \"down\" }"}</code> to the face on that side of the screen, or <code>azimuth</code>, <code>polar</code> and <code>roll</code> in radians in the orbit frame. A roll while <code>canRoll</code> is false resolves <code>unavailable</code> and fires nothing.</>],
  ["cancel", "(): void", <>Stops the turn or drag where it is: <code>end</code> with <code>cancelled</code>.</>],
  ["attachControls", "(controls: GizmoControls): void", <>Connects controls: copies their target on attach and each <code>change</code>, disables them while the gizmo turns and restores their previous <code>enabled</code>, and tells them after each <code>camera.up</code> write. Detaches previous controls.</>],
  ["detachControls", "(): void", <>Disconnects the controls and restores their <code>enabled</code>. Safe with none attached.</>],
  ["compile", "(): Promise<void>", "Compiles the gizmo's programs or pipelines for the renderer's current render target."],
  ["dispose", "(): void", <>Ends a running turn, detaches controls, removes the element and frees what the gizmo created. Later calls throw <code>DISPOSED</code>.</>],
];

const events: Entry[] = [
  ["press", "{ pressed: GizmoTarget | null }", "Every accepted press on the element, whether or not a turn follows."],
  ["start", "{ cause, heading: GizmoHeading | null }", <>A turn or drag began. Never for a press that turns nothing. <code>heading</code> is <code>null</code> for a drag.</>],
  ["change", "{ cause, heading, pose: GizmoPose }", "Every turn frame and drag step."],
  ["end", "GizmoTurnEnd: { cause, pose, outcome }", <>Balances <code>start</code>, including under cancel, dispose, <code>set()</code> and <code>enabled = false</code>.</>],
  ["hoverchange", "{ hovered: GizmoTarget | null }", "The hovered target changed, also after the view turns under a still pointer. Never for touch."],
  ["attargetchange", "{ atTarget: GizmoAtTarget | null }", "The target the view rests on changed."],
  ["invalidate", "{}", "The gizmo needs a frame: a turn step, hover, pose or option change."],
];

const options: Entry[] = [
  ["container", "HTMLElement | string", <>Parent element, or a CSS selector. Default: the canvas&apos;s parent.</>],
  ["type", "\"sphere\" | \"cube\" | \"rounded-cube\"", "Default \"sphere\"."],
  ["size", "number", "CSS pixels. Default 128."],
  ["placement", "\"top-left\" | \"top-center\" | … | \"bottom-right\"", "Vertical then horizontal alignment in the container. Default \"top-right\"."],
  ["offset", "{ left?, top?, right?, bottom? }", "CSS pixels from the container edges. Default 10 each."],
  ["animated", "boolean", <>Default: off under <code>prefers-reduced-motion</code>, else on.</>],
  ["speed", "number", "Animation speed multiplier; a turn's duration follows its angle. Default 1."],
  ["up", "Vector3Like", <>Label up; a signed axis. Default: <code>camera.up</code> at construction, snapped to the nearest signed axis.</>],
  ["frontDirection", "Vector3Like", <>The direction the Front label faces, perpendicular to <code>up</code>. Default: the 2.x Front for that up axis. See <Link href="/docs/up-axis/">Up axis</Link>.</>],
  ["roll", "boolean | \"free\"", <>Whether the view may roll. Default: on when the gizmo writes the camera and the attached controls (if any) can take a new up; off in controlled mode. <code>&quot;free&quot;</code>: every click and turn is the shortest rotation, and drags tumble.</>],
  ["poleEntry", "\"front\" | \"nearest\"", <>How Top and Bottom are entered. Default &quot;front&quot;. See <Link href="/docs/limits/">Limits</Link>.</>],
  ["oppositeOnRepeat", "boolean", "A click on the target the view rests on turns to the opposite one. Default false."],
  ["drag", "boolean", "Whether a drag on the gizmo turns the view. Default true."],
  ["limits", "{ minPolarAngle?, maxPolarAngle?, minAzimuthAngle?, maxAzimuthAngle? }", "Radians in the orbit frame, narrowed by attached controls' limits."],
  ["controlled", "boolean", <>Report the pose in <code>change</code> and write no camera. Default false. See <Link href="/docs/controlled-mode/">Controlled mode</Link>.</>],
  ["fieldOfView", "number", "Vertical field of view of the gizmo's own camera, in radians, in (0, 100°]; the cube keeps its apparent size. No effect on the sphere, which is drawn orthographic. Default 26°."],
  ["navigation", "GizmoNavigationOptions", <>Built-in navigation buttons. Off by default. See <Link href="/docs/navigation/">Navigation buttons</Link>.</>],
  ["triad", "{ enabled?, colors?: { x?, y?, z? } }", <>The axis triad for the cube types. Default off. See <Link href="/docs/rounded-cube/">Rounded cube and triad</Link>.</>],
  ["onMaterial", "(material, use: GizmoMaterialUse) => GizmoMaterial", "Replaces each target material the gizmo builds, on every build."],
  ["resolution", "number", <>Side of every label texture in texels. Default: each label sized from <code>size</code> and the device pixel ratio.</>],
  ["lineWidth", "number", "Axis line width in CSS pixels. Default 4."],
  ["id, className", "string", "Attributes of the gizmo element."],
  ["font", "{ family?, weight?, size? }", "Label font, as CSS font properties. Default sans-serif, weight 900."],
  ["radius", "number", "Edge radius of every target; for rounded-cube the rounding of its edges and corners. Default 1 for the sphere, 0.2 for the cube, 0.3 for the rounded cube."],
  ["smoothness", "number", "Edge smoothness of every target. Default 18."],
  ["background", "{ enabled?, color?, opacity?, hover? }", "The sphere's background disc, or the cube's body colour."],
  ["corners, edges", "{ enabled?, color?, opacity?, scale?, radius?, smoothness?, hover? }", "Corner and edge targets; on by default for the cubes only."],
  ["x, y, z, nx, ny, nz", "GizmoTargetOptions", "The world axis ends."],
  ["top, bottom, front, back, right, left", "GizmoTargetOptions", "The face with that label, on every up axis; wins over the axis key."],
];

const targetOptions: Entry[] = [
  ["enabled", "boolean", "Draw the target and let it be clicked. Default true."],
  ["label", "string", "Label text. Default: the face name; on the sphere, the axis letter on the positive ends and none on the negative."],
  ["opacity", "number", "0 to 1. Default 1."],
  ["scale", "number", "Indicator size multiplier. Default 1."],
  ["line", "boolean", "Draw the axis line. Default: on for the sphere's positive ends, else off."],
  ["color, labelColor", "ColorRepresentation", "Fill and label colours."],
  ["border", "{ size, color }", "Border around the indicator."],
  ["hover", "{ color?, labelColor?, opacity?, scale?, border? }", "The same while hovered."],
];

const errors: Entry[] = [
  ["DOCUMENT_MISSING", "constructor", <>No <code>document</code>, such as a worker or server render.</>],
  ["CONTAINER_MISSING", "constructor", <>No <code>container</code> and the canvas has no parent, or a selector matched nothing.</>],
  ["UNKNOWN_OPTION", "constructor, set", "An option key the library does not know."],
  ["INVALID_OPTION", "constructor, set, attachControls", "A known option with the wrong type or out of range; controls without the contract's members."],
  ["REMOVED_OPTION", "constructor, set, lookFrom", <>A 2.x form, such as <code>up: &quot;z&quot;</code> or <code>lookFrom(view, false)</code>.</>],
  ["REMOVED_MEMBER", "2.x members", <>A 2.x member called from JavaScript, such as <code>domUpdate()</code>.</>],
  ["INVALID_FRAME", "constructor, set", <><code>up</code> is not a signed axis, or <code>frontDirection</code> is not perpendicular to it.</>],
  ["ROLL_UNSUPPORTED", "set, attachControls", <><code>roll</code> on with controls that cannot take a new up.</>],
  ["UNKNOWN_VIEW", "lookFrom", "A name that is not a view, or a zero vector."],
  ["INVALID_TURN", "turn", <>No field, a non-finite angle, or <code>toward</code> beside an angle.</>],
  ["DISPOSED", "every method", <>Any call after <code>dispose()</code>.</>],
];

const outcomes: Entry[] = [
  ["reached", "{ status }", "The view arrived."],
  ["interrupted", "{ status, by: GizmoCause }", "A newer turn, a grab or a drag took over."],
  ["cancelled", "{ status, reason }", <><code>cancel</code>, <code>pointercancel</code>, <code>disabled</code>, <code>set</code> or <code>dispose</code>.</>],
  ["unavailable", "{ status, reason: \"roll-off\" }", <>A roll while <code>canRoll</code> is false; no <code>start</code> or <code>end</code> fires.</>],
];

export default function ApiReference() {
  return (
    <>
      <h1>API reference</h1>
      <p>
        Look up <code>ViewportGizmo</code>&apos;s members, events, options and errors. It extends three.js&apos;s{" "}
        <code>EventDispatcher</code>; every public type is exported from the package root.
      </p>

      <h2 id="constructor">ViewportGizmo</h2>
      <p>
        <code>new ViewportGizmo(camera, renderer, options?)</code>. The camera&apos;s <code>up</code> at this call is
        the default label up. Throws <code>ViewportGizmoError</code>.
      </p>
      <h3>Usage</h3>
      <Sample file="api.ts" />

      <h2 id="properties">Properties</h2>
      <Entries items={properties} />

      <h2 id="methods">Methods</h2>
      <Entries items={methods} />

      <h2 id="events">Events</h2>
      <p>
        Listen with <code>gizmo.addEventListener(type, listener)</code>. <code>cause</code> is{" "}
        <code>&quot;click&quot; | &quot;drag&quot; | &quot;key&quot; | &quot;navigation&quot; | &quot;api&quot;</code>.
        A <code>GizmoTarget</code> is <code>{"{ name, kind, direction, label }"}</code>; a <code>GizmoPose</code> is{" "}
        <code>{"{ direction, up }"}</code>. Every payload is fresh per event.
      </p>
      <Entries items={events} />

      <h3 id="outcomes">GizmoOutcome</h3>
      <Entries items={outcomes} />

      <h2 id="gizmo-options">GizmoOptions</h2>
      <p>
        Every option is optional. <code>set()</code> merges a partial into the current options.
      </p>
      <Entries items={options} />

      <h2 id="gizmo-target-options">GizmoTargetOptions</h2>
      <Entries items={targetOptions} />

      <h2 id="errors">ViewportGizmoError</h2>
      <p>
        Thrown for caller mistakes, with a stable <code>code</code> and a message that names the fix. Superseded and
        refused turns are outcomes, never errors.
      </p>
      <Entries items={errors} />

      <h2 id="camera-controls">cameraControls</h2>
      <p>
        <code>cameraControls(controls: CameraControls): GizmoControls</code>, from{" "}
        <code>@taulabs/three-viewport-gizmo/camera-controls</code>, adapts camera-controls 3 for{" "}
        <code>attachControls</code>. See <Link href="/docs/camera-controls/">camera-controls</Link>.
      </p>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/quickstart/">Quickstart</Link>
        </li>
        <li>
          <Link href="/docs/migrating/">Migrating from 2.x</Link>
        </li>
      </ul>
    </>
  );
}
