"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  GizmoFaceName,
  GizmoLimits,
  GizmoOptions,
  GizmoResolvedOptions,
  GizmoTurn,
  GizmoTurnEnd,
} from "@lib/index";
import { Stage } from "@site/components/Stage";
import { AXES, defaultFront, frontsFor, type Axis, type Vec3 } from "@site/components/frames";
import type { StageConfig, StageHandle, ViewReading } from "@site/components/stage-runtime";
import "./playground.css";
import { attachHitRegions, HIT_REGION_COLORS, isSamplingHitRegions, type HitRegions } from "./hitRegions";

const axisLabel = (axis: Axis) => `${axis[0] === "-" ? "−" : "+"}${axis[1].toUpperCase()}`;
const axisChoices = (axes: readonly Axis[]) => axes.map((axis) => [axis, axisLabel(axis)] as const);

const LIMITS: Record<"none" | "horizon" | "front-half", GizmoLimits | undefined> = {
  none: undefined,
  horizon: { maxPolarAngle: Math.PI / 2 },
  "front-half": { minAzimuthAngle: -Math.PI / 2, maxAzimuthAngle: Math.PI / 2 },
};

const CHOICES = {
  renderer: [
    ["webgl", "WebGL"],
    ["webgpu", "WebGPU"],
  ],
  up: axisChoices(AXES),
  type: [
    ["sphere", "Sphere"],
    ["cube", "Cube"],
    ["rounded-cube", "Rounded cube"],
  ],
  controller: [
    ["orbit", "OrbitControls"],
    ["camera-controls", "camera-controls"],
    ["none", "None"],
  ],
  projection: [
    ["perspective", "Perspective"],
    ["orthographic", "Orthographic"],
  ],
  limits: [
    ["none", "None"],
    ["horizon", "Stay above the horizon"],
    ["front-half", "Front half only"],
  ],
  poleEntry: [
    ["front", "From the front"],
    ["nearest", "Nearest side"],
  ],
  gizmoFov: [
    ["default", "Library default (26°)"],
    ["half", "Half the host field of view"],
  ],
  roll: [
    ["default", "Default"],
    ["off", "Off"],
    ["on", "On"],
    ["free", "Free"],
  ],
} as const;

const ROLL: Record<"default" | "off" | "on" | "free", GizmoOptions["roll"]> = {
  default: undefined,
  off: false,
  on: true,
  free: "free",
};

const QUARTER = Math.PI / 2;
const TURNS: readonly (readonly [string, GizmoTurn])[] = [
  ["Azimuth +90°", { azimuth: QUARTER }],
  ["Azimuth −90°", { azimuth: -QUARTER }],
  ["Polar +90°", { polar: QUARTER }],
  ["Polar −90°", { polar: -QUARTER }],
  ["Toward up", { toward: "up" }],
  ["Toward down", { toward: "down" }],
  ["Toward left", { toward: "left" }],
  ["Toward right", { toward: "right" }],
];
const ROLLS: readonly (readonly [string, GizmoTurn])[] = [
  ["Roll +90°", { roll: QUARTER }],
  ["Roll −90°", { roll: -QUARTER }],
];

/** An `end` payload in words: the status, then who interrupted it or why it stopped. */
const describeEnd = ({ cause, outcome }: GizmoTurnEnd) => {
  const detail = "by" in outcome ? `by ${outcome.by}` : "reason" in outcome ? outcome.reason : null;
  return `${outcome.status}${detail ? ` (${detail})` : ""}, ${cause}`;
};

type Choice = keyof typeof CHOICES;
type Values = { [K in Choice]: (typeof CHOICES)[K][number][0] };

const LABELS: Record<Choice, string> = {
  renderer: "Renderer",
  up: "Up axis",
  type: "Gizmo type",
  controller: "Controller",
  projection: "Projection",
  limits: "Limits",
  poleEntry: "Turning to Top or Bottom",
  gizmoFov: "Gizmo's own field of view",
  roll: "Roll",
};

const DEFAULTS: Values = {
  renderer: "webgl",
  up: "+y",
  type: "cube",
  controller: "orbit",
  projection: "perspective",
  limits: "none",
  poleEntry: "front",
  gizmoFov: "default",
  roll: "default",
};

/** The stage camera's field of view, in degrees, and the slider's range. */
const FOV = { initial: 50, min: 1, max: 120 } as const;

/**
 * The gizmo's `fieldOfView` for a host field of view: half the host's angle, clamped to 0–90 and mapped linearly onto
 * 0.1–90°, in radians. An orthographic host counts as 0.
 */
const halfGizmoFieldOfView = (hostDegrees: number) =>
  ((0.1 + (89.9 * Math.min(90, Math.max(0, hostDegrees * 0.5))) / 90) * Math.PI) / 180;

/** The hit-size controls: their URL keys and labels. A missing or out-of-range value is Auto (the type's default). */
const HIT_SIZES = [
  { kind: "corners", key: "cornerHit", label: "Corner hit size" },
  { kind: "edges", key: "edgeHit", label: "Edge hit size" },
] as const;

type HitKind = (typeof HIT_SIZES)[number]["kind"];

/** A hit size from the URL: 0 to 1, or `undefined` for Auto. */
const hitSizeParam = (params: URLSearchParams, key: string) => {
  const raw = params.get(key);
  const value = raw === null || raw === "" ? NaN : Number(raw);
  return value >= 0 && value <= 1 ? value : undefined;
};

/**
 * The hit size the hit box uses, from the resolved options: the library clamps it to `[radius, 1)` on `rounded-cube`,
 * `[0, 1)` for the plain cube's corners and `[0.3, 1)` for its edges (the gap between its face tiles).
 */
const effectiveHitSize = (options: GizmoResolvedOptions, kind: HitKind) => {
  const min = options.type === "rounded-cube" ? builtRadius(options.radius) : kind === "edges" ? 0.3 : 0;
  return Math.min(Math.max(options[kind].hitSize ?? 0, min), 1);
};

/** The radius slider's range. `rounded-cube` builds and hits with `radius` clamped to 0.001–0.999. */
const RADIUS = { min: 0, max: 1, step: 0.01 } as const;
const builtRadius = (radius: number) => Math.min(Math.max(radius, 1e-3), 0.999);

/** `radius` from the URL: a number from 0 to 1, or `undefined` for the type's default. */
const radiusParam = (params: URLSearchParams) => {
  const raw = params.get("radius");
  const value = raw === null || raw === "" ? NaN : Number(raw);
  return value >= RADIUS.min && value <= RADIUS.max ? value : undefined;
};

/** Values links made before a choice was renamed still select it. */
const ALIASES: Partial<Record<Choice, Record<string, string>>> = { gizmoFov: { tau: "half" } };

const FACES: readonly GizmoFaceName[] = ["front", "back", "left", "right", "top", "bottom"];

// A `+` typed into a query string reads back as a space.
const param = (params: URLSearchParams, key: string) => params.get(key)?.replace(/^ /, "+") ?? null;

function pick<K extends Choice>(params: URLSearchParams, key: K): Values[K] {
  const raw = param(params, key);
  const value = raw === null ? null : (ALIASES[key]?.[raw] ?? raw);
  const allowed = CHOICES[key].map(([v]) => v) as readonly string[];
  return (value !== null && allowed.includes(value) ? value : DEFAULTS[key]) as Values[K];
}

const vector = (v: Vec3) => v.map((n) => (Math.abs(n) < 5e-4 ? 0 : n).toFixed(3)).join(", ");

export function Playground() {
  const params = useSearchParams();
  const values = Object.fromEntries(
    (Object.keys(CHOICES) as Choice[]).map((key) => [key, pick(params, key)])
  ) as Values;
  const fronts = frontsFor(values.up);
  const frontParam = param(params, "front") as Axis | null;
  const front = frontParam && fronts.includes(frontParam) ? frontParam : defaultFront(values.up);
  const speedParam = Number(params.get("speed"));
  const speed = speedParam > 0 && speedParam <= 4 ? speedParam : 1;
  const animated = params.get("animated") !== "false";
  const triad = params.get("triad") === "true";
  const controlled = params.get("controlled") === "true";
  const navigation = params.get("navigation") === "true";
  const reversedDepth = params.get("reversed") === "true";
  const fovParam = Math.round(Number(params.get("fov")));
  const fov = fovParam >= FOV.min && fovParam <= FOV.max ? fovParam : FOV.initial;
  const perspective = values.projection === "perspective";
  const hasTriad = values.type !== "sphere";
  const hitSizes = { corners: hitSizeParam(params, "cornerHit"), edges: hitSizeParam(params, "edgeHit") };
  const radius = radiusParam(params);
  const showHitRegions = params.get("hitRegions") === "true";

  const [stage, setStage] = useState<StageHandle | null>(null);
  const [view, setView] = useState<ViewReading | null>(null);
  const [lastEnd, setLastEnd] = useState<string | null>(null);
  const [resolved, setResolved] = useState<GizmoResolvedOptions | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const hitRegions = useRef<HitRegions | null>(null);
  const root = useRef<HTMLDivElement>(null);
  /** Shows the gizmo's current hover in the readout. */
  const publishHover = useCallback(() => {
    const target = stage?.gizmo?.hovered;
    setHovered(target ? `${target.kind}: ${target.label}` : null);
  }, [stage]);

  // The stage column sticks below the site's sticky header, whose height changes as its links wrap.
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".site-header");
    const element = root.current;
    if (!header || !element) return;
    const measure = () => element.style.setProperty("--playground-top", `${header.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    // Next.js keeps useSearchParams in sync with history.replaceState.
    window.history.replaceState(null, "", `?${next}`);
  };

  const onStage = useCallback((next: StageHandle | null) => setStage(next), []);

  useEffect(() => {
    if (!stage) return setView(null);
    const read = () => setView(stage.readView());
    read();
    const stop = stage.onViewChange(read);
    // Clicks and drags on the gizmo end here; refused turns fire no event and are caught from their promise below.
    const onEnd = (end: GizmoTurnEnd) => setLastEnd(describeEnd(end));
    stage.gizmo?.addEventListener("end", onEnd);
    // The hit-region overlay probes through hover: its probes are not the user's, but the hover it restores is, and
    // it publishes that through `publishHover` once it is done.
    const onHover = () => {
      if (!isSamplingHitRegions()) publishHover();
    };
    stage.gizmo?.addEventListener("hoverchange", onHover);
    return () => {
      stop();
      stage.gizmo?.removeEventListener("end", onEnd);
      stage.gizmo?.removeEventListener("hoverchange", onHover);
      setHovered(null);
    };
  }, [stage, publishHover]);

  // The overlay redraws itself on view changes and resizes; option changes reach it below.
  useEffect(() => {
    if (!stage || !showHitRegions) return;
    const current = attachHitRegions(stage, publishHover);
    hitRegions.current = current;
    return () => {
      current.dispose();
      hitRegions.current = null;
    };
  }, [stage, showHitRegions, publishHover]);

  // The host camera's field of view changes in place, without a rebuild, as a host app would change it.
  useEffect(() => {
    stage?.setFieldOfView(fov);
  }, [stage, fov]);

  // Changing any of these rebuilds the stage.
  const config: StageConfig = {
    renderer: values.renderer,
    up: values.up,
    front,
    projection: values.projection,
    // Recreates the renderer: `reversedDepthBuffer` is a constructor parameter.
    reversedDepth,
    controller: values.controller,
    gizmo: {},
  };

  // These go to the running gizmo through `gizmo.set()`.
  const options: GizmoOptions = {
    type: values.type,
    animated,
    speed,
    controlled,
    poleEntry: values.poleEntry,
    limits: LIMITS[values.limits],
    triad: { enabled: hasTriad && triad },
    navigation: { enabled: navigation },
    // Room for the buttons, which sit around the cube and outside its box.
    offset: navigation ? { top: 30, right: 30, bottom: 30, left: 30 } : { top: 10, right: 10, bottom: 10, left: 10 },
    roll: ROLL[values.roll],
    // A host can hand the gizmo a dampened copy of its own field of view; orthographic counts as 0.
    fieldOfView: values.gizmoFov === "half" ? halfGizmoFieldOfView(perspective ? fov : 0) : undefined,
    // Structural: rebuilds the gizmo's targets. `undefined` returns it to the type's default.
    radius,
    // Hit test only, a cheap change: `undefined` (Auto) returns each to its default for the type and `radius`. The
    // sphere ignores them.
    corners: { hitSize: hasTriad ? hitSizes.corners : undefined },
    edges: { hitSize: hasTriad ? hitSizes.edges : undefined },
  };
  const optionsKey = JSON.stringify(options);

  // `set()` runs in the stage's effect, before this one: read `canRoll` and the resolved options after it.
  useEffect(() => {
    if (stage) setView(stage.readView());
    setResolved(stage?.gizmo ? { ...stage.gizmo.options } : null);
    hitRegions.current?.schedule();
  }, [stage, optionsKey]);

  const gizmo = stage?.gizmo;
  const run = (turn: Promise<GizmoTurnEnd> | undefined) =>
    void turn?.then((end) => setLastEnd(describeEnd(end)), (error: unknown) => setLastEnd(String(error)));
  const canRoll = view?.canRoll ?? false;

  return (
    <div className="playground" ref={root}>
      <div className="playground-stage-column">
        <Stage
          config={config}
          options={options}
          onStage={onStage}
          label={`Playground viewport: ${values.renderer}${reversedDepth ? " with reversed depth" : ""}, ${axisLabel(values.up)} up, Front ${axisLabel(front)}, ${values.type} gizmo, ${values.controller} controller, ${perspective ? `perspective camera at ${fov}°` : "orthographic camera"}`}
        />

        <div className="views" role="group" aria-label="Look from">
          {FACES.map((face) => (
            <button
              key={face}
              type="button"
              className="button"
              disabled={!gizmo}
              onClick={() => run(gizmo?.lookFrom(face))}
            >
              {face[0].toUpperCase() + face.slice(1)}
            </button>
          ))}
          <button type="button" className="button" disabled={!gizmo} onClick={() => run(gizmo?.lookFrom("home"))}>
            Home
          </button>
        </div>
        <div className="views" role="group" aria-label="Turn">
          {TURNS.map(([label, turn]) => (
            <button key={label} type="button" className="button" disabled={!gizmo} onClick={() => run(gizmo?.turn(turn))}>
              {label}
            </button>
          ))}
          {ROLLS.map(([label, turn]) => (
            <button
              key={label}
              type="button"
              className="button"
              disabled={!gizmo || !canRoll}
              onClick={() => run(gizmo?.turn(turn))}
            >
              {label}
            </button>
          ))}
          <button type="button" className="button" disabled={!gizmo} onClick={() => gizmo?.cancel()}>
            Cancel
          </button>
        </div>
        {view && !canRoll && <p className="muted">Roll is off for this gizmo, so the roll buttons are disabled.</p>}
        {values.roll === "free" && (
          <p className="muted">
            Free roll turns every click by the shortest rotation. Home and a double-click end
            upright with the screen&apos;s up.
          </p>
        )}
      </div>

      <div className="controls">
        <Segmented name="renderer" values={values} update={update} />

        <label>
          <input
            type="checkbox"
            checked={reversedDepth}
            onChange={(e) => update("reversed", String(e.target.checked))}
          />{" "}
          Reversed depth buffer
        </label>
        <p className="muted">
          Creates the renderer with <code>reversedDepthBuffer: true</code>.
        </p>

        <Segmented name="up" values={values} update={update} />

        <fieldset>
          <legend>Front faces</legend>
          <div className="segmented">
            {axisChoices(fronts).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="front"
                  value={value}
                  checked={front === value}
                  onChange={() => update("front", value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {(["type", "controller", "projection"] as const).map((key) => (
          <Segmented key={key} name={key} values={values} update={update} />
        ))}

        <div>
          <label className="control-label" htmlFor="fov">
            Field of view: {perspective ? `${fov}°` : "orthographic"}
          </label>
          <input
            id="fov"
            type="range"
            min={FOV.min}
            max={FOV.max}
            step={1}
            value={fov}
            disabled={!perspective}
            aria-describedby="fov-note"
            aria-valuetext={perspective ? `${fov} degrees` : "Orthographic"}
            onChange={(e) => update("fov", e.target.value)}
            style={{ width: "100%" }}
          />
          <p className="muted" id="fov-note">
            {perspective
              ? "Sets the host camera's fov and dollies it so the scene keeps its size on screen. With Half the host field of view, the gizmo's own camera gets 0.1° + 89.9° × (fov / 2) / 90°."
              : "Applies to the perspective camera; choose Perspective to change it."}
          </p>
        </div>

        {(["gizmoFov", "limits", "poleEntry", "roll"] as const).map((key) => (
          <Segmented key={key} name={key} values={values} update={update} />
        ))}

        {(() => {
          const auto = radius === undefined;
          const current = resolved?.radius ?? null;
          const shown = current === null ? "…" : current.toFixed(2);
          const rounded = values.type === "rounded-cube";
          const built = rounded && !auto && builtRadius(radius) !== radius;
          const reading = auto
            ? `auto: ${shown}`
            : `${radius.toFixed(2)}${built ? ` (built at ${builtRadius(radius).toFixed(3)})` : ""}`;
          return (
            <div>
              <label className="control-label" htmlFor="radius">
                Radius: {reading}
              </label>
              <input
                id="radius"
                type="range"
                min={RADIUS.min}
                max={RADIUS.max}
                step={RADIUS.step}
                value={auto ? (current ?? 0) : radius}
                disabled={auto}
                aria-describedby="radius-note"
                aria-valuetext={reading}
                onChange={(e) => update("radius", e.target.value)}
                style={{ width: "100%" }}
              />
              <label>
                <input
                  type="checkbox"
                  checked={auto}
                  aria-label="Radius: Auto (default)"
                  onChange={(e) => update("radius", e.target.checked ? "auto" : (current ?? 0.3).toFixed(2))}
                />{" "}
                Auto (default)
              </label>
              <p className="muted" id="radius-note">
                {rounded ? (
                  <>
                    <code>radius</code>: how far the rounded cube&apos;s edges and corners curve in, in gizmo units
                    (a face&apos;s half-width is 1). Default 0.3; built at 0.001 to 0.999. It sets the default hit
                    sizes and their lower bound, so the hit-size readouts follow it.
                  </>
                ) : values.type === "cube" ? (
                  <>
                    <code>radius</code>: the corner rounding of the cube&apos;s face tiles and their labels. Default
                    0.2. Drawing only: the cube&apos;s hit test ignores it.
                  </>
                ) : (
                  <>
                    <code>radius</code>: the corner rounding of the sphere&apos;s target discs; 1, the default, draws
                    circles. Drawing only.
                  </>
                )}
              </p>
            </div>
          );
        })()}

        {HIT_SIZES.map(({ kind, key, label }) => {
          const value = hitSizes[kind];
          const auto = value === undefined;
          const effective = resolved && hasTriad ? effectiveHitSize(resolved, kind) : null;
          const shown = effective === null ? "…" : effective.toFixed(2);
          const clamped = !auto && effective !== null && Math.abs(effective - value) > 5e-3;
          const reading = !hasTriad
            ? "ignored by the sphere"
            : auto
              ? `auto: ${shown}`
              : `${value.toFixed(2)}${clamped ? ` (clamped to ${shown})` : ""}`;
          return (
            <div key={key}>
              <label className="control-label" htmlFor={key}>
                {label}: {reading}
              </label>
              <input
                id={key}
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={auto ? (effective ?? 0) : value}
                disabled={!hasTriad || auto}
                aria-describedby={`${key}-note`}
                aria-valuetext={reading}
                onChange={(e) => update(key, e.target.value)}
                style={{ width: "100%" }}
              />
              <label>
                <input
                  type="checkbox"
                  checked={auto}
                  disabled={!hasTriad}
                  aria-label={`${label}: Auto (default)`}
                  onChange={(e) =>
                    update(key, e.target.checked ? "auto" : (effective ?? (kind === "edges" ? 0.3 : 0.35)).toFixed(2))
                  }
                />{" "}
                Auto (default)
              </label>
              <p className="muted" id={`${key}-note`}>
                {!hasTriad
                  ? "The sphere ignores hit sizes; choose Cube or Rounded cube to change them."
                  : kind === "corners"
                    ? <>
                        <code>corners.hitSize</code>: how far in from the cube&apos;s edge, in gizmo units (a face&apos;s
                        half-width is 1), a pointer still lands on a corner. Hit test only: the drawn corner and its
                        highlight stay the same.
                      </>
                    : <>
                        <code>edges.hitSize</code>: how far in from the cube&apos;s edge a pointer still lands on an
                        edge. Hit test only: the drawn edge and its highlight stay the same.
                      </>}
              </p>
            </div>
          );
        })}

        <div>
          <label>
            <input
              type="checkbox"
              checked={showHitRegions}
              aria-describedby="hit-regions-note"
              onChange={(e) => update("hitRegions", String(e.target.checked))}
            />{" "}
            Show hit regions
          </label>
          <p className="muted" id="hit-regions-note">
            Colours the gizmo by the target the hit test returns under each point:{" "}
            {(["face", "edge", "corner"] as const).map((kind, i) => (
              <span key={kind}>
                {i > 0 && (i === 2 ? " or " : ", ")}
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: "0.8em",
                    height: "0.8em",
                    borderRadius: 2,
                    verticalAlign: "-0.1em",
                    background: HIT_REGION_COLORS[kind],
                  }}
                />{" "}
                {kind}
              </span>
            ))}
            . Redrawn when the view, the radius or a hit size changes. It probes with synthetic mouse moves and reads{" "}
            <code>gizmo.hovered</code>, then puts the hover back.
          </p>
        </div>

        <div>
          <label className="control-label" htmlFor="speed">
            Animation speed: {speed.toFixed(2)}×
          </label>
          <input
            id="speed"
            type="range"
            min={0.25}
            max={4}
            step={0.25}
            value={speed}
            onChange={(e) => update("speed", e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <label>
          <input
            type="checkbox"
            checked={animated}
            onChange={(e) => update("animated", String(e.target.checked))}
          />{" "}
          Animated
        </label>

        <label>
          <input
            type="checkbox"
            checked={hasTriad && triad}
            disabled={!hasTriad}
            onChange={(e) => update("triad", String(e.target.checked))}
          />{" "}
          Axis triad{hasTriad ? "" : " (cube types only)"}
        </label>

        <label>
          <input
            type="checkbox"
            checked={navigation}
            onChange={(e) => update("navigation", String(e.target.checked))}
          />{" "}
          Navigation buttons
        </label>

        <label>
          <input
            type="checkbox"
            checked={controlled}
            onChange={(e) => update("controlled", String(e.target.checked))}
          />{" "}
          Controlled: the page writes the camera from each <code>change</code>
        </label>

        <div>
          <div className="control-label" id="readout-label">
            Camera
          </div>
          <dl className="readout" aria-labelledby="readout-label">
            <dt>backend</dt>
            <dd>
              {stage?.backend ?? "…"}
              {reversedDepth ? ", reversed depth" : ""}
            </dd>
            <dt>fov</dt>
            <dd>
              {perspective ? `${fov}°` : "orthographic"}; gizmo{" "}
              {options.fieldOfView === undefined
                ? "default"
                : `${((options.fieldOfView * 180) / Math.PI).toFixed(2)}°`}
            </dd>
            <dt>direction</dt>
            <dd>{view ? vector(view.direction) : "…"}</dd>
            <dt>up</dt>
            <dd>{view ? vector(view.up) : "…"}</dd>
            <dt>at target</dt>
            <dd>{view ? (view.atTarget ?? "none") : "…"}</dd>
            <dt>heading</dt>
            <dd>{view ? (view.heading ?? "none") : "…"}</dd>
            <dt>hovered</dt>
            <dd>{hovered ?? "none"}</dd>
            <dt>last turn</dt>
            <dd>{lastEnd ?? "none"}</dd>
            <dt>roll</dt>
            <dd>{view ? `${(Math.abs(view.roll) < 0.05 ? 0 : view.roll).toFixed(1)}°` : "…"}</dd>
          </dl>
          <p className="muted">
            Direction points from the orbit target to the camera. Roll is the angle between the
            camera&apos;s right vector and the plane perpendicular to the up axis; it reads 0.0° in
            every view until the view is rolled.
          </p>
        </div>
      </div>
    </div>
  );
}

function Segmented({
  name,
  values,
  update,
}: {
  name: Choice;
  values: Values;
  update: (key: string, value: string) => void;
}) {
  return (
    <fieldset>
      <legend>{LABELS[name]}</legend>
      <div className="segmented">
        {CHOICES[name].map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name={name}
              value={value}
              checked={values[name] === value}
              onChange={() => update(name, value)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
