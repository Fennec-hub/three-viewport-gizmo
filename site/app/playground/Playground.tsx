"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Stage } from "@site/components/Stage";
import { VIEWS } from "@site/components/frames";
import type { Pose, StageConfig, StageHandle } from "@site/components/stage-runtime";

const CHOICES = {
  renderer: [
    ["webgl", "WebGL"],
    ["webgpu", "WebGPU"],
  ],
  up: [
    ["x", "X"],
    ["y", "Y"],
    ["z", "Z"],
  ],
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
} as const;

type Choice = keyof typeof CHOICES;
type Values = { [K in Choice]: (typeof CHOICES)[K][number][0] };

const LABELS: Record<Choice, string> = {
  renderer: "Renderer",
  up: "Up axis",
  type: "Gizmo type",
  controller: "Controller",
  projection: "Projection",
};

const DEFAULTS: Values = {
  renderer: "webgl",
  up: "y",
  type: "cube",
  controller: "orbit",
  projection: "perspective",
};

function pick<K extends Choice>(params: URLSearchParams, key: K): Values[K] {
  const value = params.get(key);
  const allowed = CHOICES[key].map(([v]) => v) as readonly string[];
  return (value !== null && allowed.includes(value) ? value : DEFAULTS[key]) as Values[K];
}

export function Playground() {
  const params = useSearchParams();
  const values = Object.fromEntries(
    (Object.keys(CHOICES) as Choice[]).map((key) => [key, pick(params, key)])
  ) as Values;
  const speedParam = Number(params.get("speed"));
  const speed = speedParam > 0 && speedParam <= 4 ? speedParam : 1;
  const animated = params.get("animated") !== "false";

  const [stage, setStage] = useState<StageHandle | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    // Next.js keeps useSearchParams in sync with history.replaceState.
    window.history.replaceState(null, "", `?${next}`);
  };

  const onStage = useCallback((next: StageHandle | null) => setStage(next), []);

  useEffect(() => {
    if (!stage) return setPose(null);
    const read = () => setPose(stage.readPose());
    read();
    return stage.onViewChange(read);
  }, [stage]);

  const config: StageConfig = {
    renderer: values.renderer,
    up: values.up,
    projection: values.projection,
    controller: values.controller,
    gizmo: { type: values.type },
  };

  const gizmo = stage?.gizmo;
  const canLookFrom = !!gizmo && typeof (gizmo as { lookFrom?: unknown }).lookFrom === "function";

  return (
    <div className="playground">
      <div>
        <Stage
          config={config}
          animated={animated}
          speed={speed}
          onStage={onStage}
          label={`Playground viewport: ${values.renderer}, ${values.up.toUpperCase()}-up, ${values.type} gizmo, ${values.controller} controller, ${values.projection} camera`}
        />
        <div className="views" role="group" aria-label="Look from">
          {VIEWS.map(({ name, dir }) => (
            <button
              key={name}
              type="button"
              className="button"
              disabled={!canLookFrom}
              onClick={() => {
                if (!stage?.gizmo || !canLookFrom) return;
                stage.gizmo.lookFrom(stage.toWorld([...dir]).normalize(), animated);
              }}
            >
              {name}
            </button>
          ))}
        </div>
        {stage && !canLookFrom && (
          <p className="muted">
            View buttons call <code>gizmo.lookFrom()</code>, which this build of the library does
            not have yet.
          </p>
        )}
      </div>

      <div className="controls">
        {(Object.keys(CHOICES) as Choice[]).map((key) => (
          <fieldset key={key}>
            <legend>{LABELS[key]}</legend>
            <div className="segmented">
              {CHOICES[key].map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name={key}
                    value={value}
                    checked={values[key] === value}
                    onChange={() => update(key, value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

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

        <div>
          <div className="control-label" id="readout-label">
            Camera
          </div>
          <dl className="readout" aria-labelledby="readout-label">
            <dt>backend</dt>
            <dd>{stage?.backend ?? "…"}</dd>
            <dt>azimuth</dt>
            <dd>{pose ? `${pose.azimuth.toFixed(1)}°` : "…"}</dd>
            <dt>polar</dt>
            <dd>{pose ? `${pose.polar.toFixed(1)}°` : "…"}</dd>
            <dt>roll</dt>
            <dd>{pose ? `${pose.roll.toFixed(1)}°` : "…"}</dd>
          </dl>
          <p className="muted">
            Roll is the angle between the camera&apos;s right vector and the plane perpendicular to
            the up axis. It should read 0.0° in every view.
          </p>
        </div>
      </div>
    </div>
  );
}
