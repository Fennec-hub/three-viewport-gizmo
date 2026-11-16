import type { Vector3Like } from "three";
import { ViewportGizmoError } from "../errors";
import { cameraUpRefusal } from "../controls/contract";
import { TRIAD_COLORS } from "../scene/triad";
import { axisEndOf, labelFrame, type AxisEnd, type LabelFrame } from "../orbit/labelFrame";
import { DEFAULT_FIELD_OF_VIEW } from "../render/internalCamera";
import type {
  GizmoControls,
  GizmoFaceName,
  GizmoOptions,
  GizmoResolvedOptions,
  GizmoTargetKind,
  GizmoTargetOptions,
} from "../types";
import { isPlainObject, validateOptions } from "./validate";

type Plain = Record<string, unknown>;

/** What options resolve against besides themselves. */
export type ResolveContext = Readonly<{
  /** The default label up: `camera.up` at construction (R12). */
  up: Readonly<Vector3Like>;
  /** The attached controls, which decide the `roll` default (ruling A). */
  controls?: GizmoControls | null;
}>;

const FACE_NAMES: readonly GizmoFaceName[] = ["top", "bottom", "front", "back", "right", "left"];

/**
 * Deep-merges `partial` into `base` without touching either: plain objects merge, anything else (a `Color`, a vector,
 * an element, a function) replaces. An explicit `undefined` removes the key, so it falls back to its default.
 *
 * @returns A new options object
 */
export function mergeOptions(base: GizmoOptions, partial: GizmoOptions): GizmoOptions {
  return merge(base as Plain, partial as Plain) as GizmoOptions;
}

function merge(base: Plain, partial: Plain): Plain {
  const result: Plain = { ...base };
  for (const [key, value] of Object.entries(partial)) {
    if (value === undefined) delete result[key];
    else if (isPlainObject(value) && isPlainObject(result[key])) result[key] = merge(result[key] as Plain, value);
    else result[key] = value;
  }
  return result;
}

/** `value` with every key it lacks taken from the layers, first layer first. Plain objects fill recursively. */
function fill<T>(value: T | undefined, ...layers: readonly unknown[]): T {
  const result: Plain = isPlainObject(value) ? { ...value } : {};
  for (const layer of layers) {
    if (!isPlainObject(layer)) continue;
    for (const [key, fallback] of Object.entries(layer)) {
      const current = result[key];
      if (current === undefined) result[key] = isPlainObject(fallback) ? fill(fallback) : fallback;
      else if (isPlainObject(current) && isPlainObject(fallback)) result[key] = fill(current, fallback);
    }
  }
  return result as T;
}

/** Whether the user asked for reduced motion; false where `matchMedia` is missing. */
export const prefersReducedMotion = (): boolean =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Validates options and fills every default for their type, label frame and context (R8, R14, O1 to O4). Values are
 * kept, not cloned, so a `THREE.Color` or a function survives. The face aliases (`front`, ...) merge over the axis end
 * of the face they name in the label frame and are not kept; the negative ends fill from the positive ones, as in 2.x.
 * `rounded-cube` only changes defaults; every option a caller passes applies.
 *
 * @param options - The options as merged from the constructor and every `set()`
 * @returns A new resolved options object; `options` is untouched
 * @throws {ViewportGizmoError} The codes of {@link validateOptions}; `INVALID_FRAME` from the label frame;
 * `INVALID_OPTION` for a minimum limit above its maximum; `ROLL_UNSUPPORTED` for `roll` on with controls that cannot
 * take a new up
 */
export function resolveOptions(options: GizmoOptions, context: ResolveContext): GizmoResolvedOptions {
  validateOptions(options);

  const type = options.type ?? "sphere";
  const isSphere = type === "sphere";
  const isRounded = type === "rounded-cube";
  const frame = labelFrame(options.up ?? context.up, options.frontDirection);
  const controlled = options.controlled ?? false;
  const radius = options.radius ?? (isSphere ? 1 : isRounded ? 0.3 : 0.2);

  const { controls } = context;
  // Ruling A: roll defaults on when no controls are attached or the attached ones can take a new up.
  const refusal = cameraUpRefusal(controls);
  const controlsTakeUp = refusal === null;
  if (options.roll && refusal) throw new ViewportGizmoError("ROLL_UNSUPPORTED", refusal);

  const limits = fill(options.limits, {
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
  });
  for (const angle of ["Polar", "Azimuth"] as const) {
    if (limits[`min${angle}Angle`]! > limits[`max${angle}Angle`]!) {
      throw new ViewportGizmoError(
        "INVALID_OPTION",
        `\`limits.min${angle}Angle\` must not be above \`limits.max${angle}Angle\`.`
      );
    }
  }

  // rounded-cube: seamless edges and corners at `radius`, full-size, opaque targets. Defaults only (O2).
  const roundedPart = isRounded ? { radius, scale: 1, opacity: 1, hover: { scale: 1, opacity: 1 } } : {};
  const roundedTarget = isRounded ? { scale: 1, opacity: 1, hover: { scale: 1, opacity: 1 } } : {};

  const targets = resolveTargets(options, frame, isSphere, roundedTarget);

  const { top, bottom, front, back, right, left, ...rest } = options;

  // `fill` fills every key it is given defaults for, at every depth; the options tests check the result.
  return {
    ...rest,
    type,
    size: options.size ?? 128,
    placement: options.placement ?? "top-right",
    offset: fill(options.offset, { top: 10, left: 10, bottom: 10, right: 10 }),
    animated: options.animated ?? !prefersReducedMotion(),
    speed: options.speed ?? 1,
    up: frame.up,
    frontDirection: frame.front,
    roll: options.roll ?? (!controlled && controlsTakeUp),
    poleEntry: options.poleEntry ?? "front",
    oppositeOnRepeat: options.oppositeOnRepeat ?? false,
    drag: options.drag ?? true,
    limits,
    controlled,
    fieldOfView: options.fieldOfView ?? DEFAULT_FIELD_OF_VIEW,
    navigation: fill(options.navigation, { enabled: false, sides: true, roll: true, home: true, reveal: "hover" }),
    triad: fill(options.triad, { enabled: false, colors: TRIAD_COLORS }),
    lineWidth: options.lineWidth ?? 4,
    font: fill(options.font, { family: "sans-serif", weight: 900 }),
    background: fill(options.background, {
      enabled: true,
      color: isSphere ? 0xffffff : 0xe0e6ec,
      opacity: isSphere ? 0 : 1,
      hover: { color: isSphere ? 0xffffff : 0xe0e6ec, opacity: isSphere ? 0.2 : 1 },
    }),
    corners: fill(options.corners, roundedPart, {
      enabled: !isSphere,
      // rounded-cube: the corners share the edges' colour, so its one rim of edges and corners takes one material.
      color: isSphere ? 0xf2d962 : isRounded ? 0xeeeeee : 0xffffff,
      opacity: 1,
      scale: isSphere ? 0.15 : 0.2,
      radius: 1,
      smoothness: 18,
      hover: { color: isSphere ? 0xffffff : 0x93d3eb, opacity: 1, scale: isSphere ? 0.2 : 0.225 },
    }),
    edges: fill(options.edges, roundedPart, {
      enabled: !isSphere,
      color: isSphere ? 0xf2d962 : isRounded ? 0xeeeeee : 0xffffff,
      opacity: isSphere ? 1 : 0,
      radius: isSphere ? 1 : 0.125,
      smoothness: 18,
      scale: isSphere ? 0.15 : 1,
      hover: { color: isSphere ? 0xffffff : 0x93d3eb, opacity: 1, scale: isSphere ? 0.2 : 1 },
    }),
    radius,
    smoothness: options.smoothness ?? 18,
    ...targets,
  } as GizmoResolvedOptions;
}

/**
 * The six axis ends: the axis key over the type defaults, a negative end filling from its positive one as in 2.x, then
 * each face alias over the end of the face it names. An alias styles only its own face, never the opposite one.
 */
function resolveTargets(
  options: GizmoOptions,
  frame: LabelFrame,
  isSphere: boolean,
  rounded: GizmoTargetOptions
): Record<AxisEnd, GizmoTargetOptions> {
  const positive: GizmoTargetOptions = {
    enabled: true,
    color: 0xffffff,
    opacity: 1,
    scale: 0.7,
    labelColor: 0x222222,
    line: false,
    border: { size: 0, color: 0xdddddd },
    hover: {
      color: isSphere ? 0xffffff : 0x93d3eb,
      labelColor: 0x222222,
      opacity: 1,
      scale: 0.7,
      border: { size: 0, color: 0xdddddd },
    },
  };
  const sphereAxes = { x: ["X", 0xff3653], y: ["Y", 0x8adb00], z: ["Z", 0x2c8fff] } as const;

  const resolved = {} as Record<AxisEnd, GizmoTargetOptions>;
  for (const end of ["x", "y", "z"] as const) {
    const [label, color] = sphereAxes[end];
    const own = isSphere ? { label, color, line: true } : { label: frame.byEnd[end].label };
    resolved[end] = fill(options[end], own, rounded, positive);
  }
  for (const end of ["nx", "ny", "nz"] as const) {
    const own = {
      label: isSphere ? "" : frame.byEnd[end].label,
      line: false,
      scale: isSphere ? 0.45 : 0.7,
      hover: { scale: isSphere ? 0.5 : 0.7 },
    };
    resolved[end] = fill(options[end], rounded, own, resolved[end.slice(1) as "x" | "y" | "z"]);
  }
  for (const name of FACE_NAMES) {
    const { end } = frame.faces[name];
    if (options[name]) resolved[end] = fill(options[name], resolved[end]);
  }
  return resolved;
}

/**
 * Whether a target takes hover, clicks and drags-from (U10): a face by its axis end's `enabled`, an edge or corner by
 * `edges.enabled` or `corners.enabled`. A disabled target stays in `gizmo.targets` and stays built.
 */
export function targetEnabled(
  options: GizmoResolvedOptions,
  target: Readonly<{ kind: GizmoTargetKind; direction: Readonly<Vector3Like> }>
): boolean {
  if (target.kind === "edge") return options.edges?.enabled !== false;
  if (target.kind === "corner") return options.corners?.enabled !== false;
  return options[axisEndOf(target.direction)!]?.enabled !== false;
}
