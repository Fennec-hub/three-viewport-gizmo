"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
    ["tau", "Tau's mapping"],
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
 * The gizmo's `fieldOfView` for a host field of view, as Tau's viewer sets it (`gizmoFieldOfView`): half the host's
 * angle, clamped to 0–90 and mapped linearly onto 0.1–90°, in radians. Tau's slider reads 0 for orthographic.
 */
const tauGizmoFieldOfView = (hostDegrees: number) =>
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
  const min = options.type === "rounded-cube" ? options.radius : kind === "edges" ? 0.3 : 0;
  return Math.min(Math.max(options[kind].hitSize ?? 0, min), 1);
};

const FACES: readonly GizmoFaceName[] = ["front", "back", "left", "right", "top", "bottom"];

// A `+` typed into a query string reads back as a space.
const param = (params: URLSearchParams, key: string) => params.get(key)?.replace(/^ /, "+") ?? null;

function pick<K extends Choice>(params: URLSearchParams, key: K): Values[K] {
  const value = param(params, key);
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

  const [stage, setStage] = useState<StageHandle | null>(null);
  const [view, setView] = useState<ViewReading | null>(null);
  const [lastEnd, setLastEnd] = useState<string | null>(null);
  const [resolved, setResolved] = useState<GizmoResolvedOptions | null>(null);

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
    return () => {
      stop();
      stage.gizmo?.removeEventListener("end", onEnd);
    };
  }, [stage]);

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
    // Tau hands the gizmo a dampened copy of its own field of view; orthographic is 0 on Tau's slider.
    fieldOfView: values.gizmoFov === "tau" ? tauGizmoFieldOfView(perspective ? fov : 0) : undefined,
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
  }, [stage, optionsKey]);

  const gizmo = stage?.gizmo;
  const run = (turn: Promise<GizmoTurnEnd> | undefined) =>
    void turn?.then((end) => setLastEnd(describeEnd(end)), (error: unknown) => setLastEnd(String(error)));
  const canRoll = view?.canRoll ?? false;

  return (
    <div className="playground">
      <div>
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
          Reversed depth buffer: the renderer is created with <code>reversedDepthBuffer: true</code>, as
          Tau&apos;s WebGPU viewport is
        </label>

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
              ? "Sets the host camera's fov and dollies it so the scene keeps its size on screen, as Tau's Field of view slider does: Tau at 51° is this slider at 51°. With Tau's mapping the gizmo's own camera gets half the angle, 0.1° + 89.9° × (fov / 2) / 90°, as Tau sets it."
              : "Applies to the perspective camera; choose Perspective to change it."}
          </p>
        </div>

        {(["gizmoFov", "limits", "poleEntry", "roll"] as const).map((key) => (
          <Segmented key={key} name={key} values={values} update={update} />
        ))}

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
