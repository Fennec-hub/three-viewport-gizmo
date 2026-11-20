"use client";

import { useSearchParams } from "next/navigation";
import { Stage } from "@site/components/Stage";
import { AXES, type Axis } from "@site/components/frames";

const RENDERERS = [
  ["webgl", "WebGL"],
  ["webgpu", "WebGPU"],
] as const;
const TYPES = [
  ["sphere", "Sphere"],
  ["cube", "Cube"],
  ["rounded-cube", "Rounded cube"],
] as const;

type GizmoType = (typeof TYPES)[number][0];

const axisLabel = (axis: Axis) => `${axis[0] === "-" ? "−" : "+"}${axis[1].toUpperCase()}`;
// A `+` typed into a query string reads back as a space.
const param = (params: URLSearchParams, key: string) => params.get(key)?.replace(/^ /, "+") ?? null;

/**
 * Type × six up axes × two renderers. `?type=` picks the gizmo type (one type per page keeps the page under the
 * browser's WebGL context limit); `?backend=` and `?up=` narrow to one row or one viewport for screenshot runs.
 */
export function Matrix() {
  const params = useSearchParams();
  const typeParam = param(params, "type");
  const type: GizmoType = TYPES.some(([t]) => t === typeParam) ? (typeParam as GizmoType) : "cube";
  const backend = param(params, "backend");
  const up = param(params, "up");
  const renderers = RENDERERS.filter(([r]) => !backend || r === backend);
  const ups = AXES.filter((a) => !up || a === up);

  const select = (value: GizmoType) => {
    const next = new URLSearchParams(params);
    next.set("type", value);
    window.history.replaceState(null, "", `?${next}`);
  };

  return (
    <>
      <fieldset style={{ marginBottom: "1rem" }}>
        <legend>Gizmo type</legend>
        <div className="segmented">
          {TYPES.map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="type" checked={type === value} onChange={() => select(value)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="matrix">
        {renderers.flatMap(([renderer, rendererLabel]) =>
          ups.map((axis) => {
            const title = `${rendererLabel}, ${axisLabel(axis)} up`;
            return (
              <section key={`${renderer}-${axis}-${type}`} aria-label={title}>
                <h2>{title}</h2>
                <Stage
                  label={`${title}, ${type} gizmo`}
                  config={{ renderer, up: axis, controller: "orbit", gizmo: { type, size: 96 } }}
                />
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
