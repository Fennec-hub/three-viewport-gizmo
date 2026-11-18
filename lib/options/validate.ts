import { ViewportGizmoError } from "../errors";
import type { GizmoOptions } from "../types";

/** Throws when `value`, found at `path`, is not a valid option value. */
type Rule = (value: unknown, path: string) => void;

/** The widest gizmo field of view, in radians: above about 108° the cube clips the near plane (F2). */
export const MAX_FIELD_OF_VIEW = (100 * Math.PI) / 180;

const show = (value: unknown) =>
  typeof value === "string" ? `"${value}"` : typeof value === "function" ? "a function" : String(value);

const invalid = (path: string, expected: string, value: unknown, hint = ""): never => {
  throw new ViewportGizmoError("INVALID_OPTION", `\`${path}\` must be ${expected}, got ${show(value)}.${hint}`);
};

/** A plain object literal, not a class instance such as a `Color`, a `Vector3` or an element. */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const bool: Rule = (value, path) => {
  if (typeof value !== "boolean") invalid(path, "a boolean", value);
};

const text: Rule = (value, path) => {
  if (typeof value !== "string") invalid(path, "a string", value);
};

const fn: Rule = (value, path) => {
  if (typeof value !== "function") invalid(path, "a function", value);
};

/** A number in `[min, max]`; `±Infinity` passes only when the bound allows it. */
const num =
  (min = -Infinity, max = Infinity, expected = "a number"): Rule =>
  (value, path) => {
    if (typeof value !== "number" || Number.isNaN(value) || value < min || value > max) invalid(path, expected, value);
  };

const finite = (min = -Infinity, expected = "a finite number"): Rule => {
  const range = num(min, Infinity, expected);
  return (value, path) => {
    range(value, path);
    if (!Number.isFinite(value)) invalid(path, expected, value);
  };
};

const unit = num(0, 1, "a number from 0 to 1");
const atLeastZero = finite(0, "a positive number");
const positive: Rule = (value, path) => {
  atLeastZero(value, path);
  if (value === 0) invalid(path, "a positive number", value);
};
const nonNegative = finite(0, "a number of at least 0");

const oneOf =
  (...values: readonly string[]): Rule =>
  (value, path) => {
    if (!values.includes(value as string)) invalid(path, `one of ${values.map(show).join(", ")}`, value);
  };

/** A `ColorRepresentation`: a number, a CSS colour string or a `THREE.Color`. */
const color: Rule = (value, path) => {
  const isColor = typeof value === "object" && value !== null && (value as { isColor?: unknown }).isColor === true;
  if (typeof value !== "number" && typeof value !== "string" && !isColor) {
    invalid(path, "a colour number, a CSS colour string or a THREE.Color", value);
  }
};

const vector: Rule = (value, path) => {
  const { x, y, z } = (value ?? {}) as { x?: unknown; y?: unknown; z?: unknown };
  if (![x, y, z].every((part) => typeof part === "number" && Number.isFinite(part))) {
    invalid(path, "a vector with finite x, y and z, such as new Vector3(0, 0, 1)", value);
  }
};

/** An object whose every key has a rule; an unknown key throws `UNKNOWN_OPTION`. `undefined` values pass. */
const shape =
  (rules: Readonly<Record<string, Rule>>): Rule =>
  (value, path) => {
    if (!isPlainObject(value)) invalid(path, "an object", value);
    for (const key of Object.keys(value as object)) {
      const keyPath = path ? `${path}.${key}` : key;
      const rule = Object.prototype.hasOwnProperty.call(rules, key) ? rules[key] : undefined;
      if (!rule) {
        throw new ViewportGizmoError(
          "UNKNOWN_OPTION",
          `\`${keyPath}\` is not an option${path ? ` of \`${path}\`` : ""}. Known: ${Object.keys(rules).join(", ")}.`
        );
      }
      const entry = (value as Record<string, unknown>)[key];
      if (entry !== undefined) rule(entry, keyPath);
    }
  };

const border = shape({ size: nonNegative, color });

const target = shape({
  enabled: bool,
  label: text,
  opacity: unit,
  scale: nonNegative,
  line: bool,
  color,
  labelColor: color,
  border,
  hover: shape({ color, labelColor: color, opacity: unit, scale: nonNegative, border }),
});

const part = shape({
  enabled: bool,
  color,
  opacity: unit,
  scale: nonNegative,
  radius: nonNegative,
  smoothness: nonNegative,
  // Gizmo units; the hit box clamps it to the type's range.
  hitSize: nonNegative,
  hover: shape({ color, opacity: unit, scale: nonNegative }),
});

const polar = num(0, Math.PI, "radians from 0 to π");
const azimuth = num(-Infinity, Infinity, "radians, or ±Infinity for no limit");

/** The 2.x `up: 'x' | 'y' | 'z'` became a vector (R12). */
const up: Rule = (value, path) => {
  if (typeof value === "string") {
    const axis = { x: "1, 0, 0", y: "0, 1, 0", z: "0, 0, 1" }[value] ?? "0, 0, 1";
    throw new ViewportGizmoError(
      "REMOVED_OPTION",
      `\`up: ${show(value)}\` is the 2.x form. Pass the up vector: \`up: new Vector3(${axis})\`, or omit it to use \`camera.up\`.`
    );
  }
  vector(value, path);
};

/** Every top-level option's rule. `satisfies` keeps it in step with {@link GizmoOptions} at type-check time. */
const RULES = {
  container: (value, path) => {
    if (typeof value !== "string" && !(value instanceof HTMLElement)) invalid(path, "an element or a selector", value);
  },
  type: oneOf("sphere", "cube", "rounded-cube"),
  size: positive,
  placement: oneOf(
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center-center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right"
  ),
  offset: shape({ left: finite(), top: finite(), right: finite(), bottom: finite() }),
  animated: bool,
  speed: positive,
  resolution: positive,
  up,
  frontDirection: vector,
  roll: (value, path) => {
    if (typeof value !== "boolean" && value !== "free") invalid(path, `true, false or "free"`, value);
  },
  poleEntry: oneOf("front", "nearest"),
  oppositeOnRepeat: bool,
  drag: bool,
  limits: shape({ minPolarAngle: polar, maxPolarAngle: polar, minAzimuthAngle: azimuth, maxAzimuthAngle: azimuth }),
  controlled: bool,
  // The one range check of `fieldOfView`; F2's `setFieldOfView` keeps its wider (0, π) guard for direct callers.
  fieldOfView: (value, path) => {
    if (!(typeof value === "number" && value > 0 && value <= MAX_FIELD_OF_VIEW)) {
      invalid(path, "radians in (0, 100°]", value, " three.js's `fov` is degrees; convert with MathUtils.degToRad.");
    }
  },
  navigation: shape({ enabled: bool, sides: bool, roll: bool, home: bool, reveal: oneOf("hover", "always") }),
  triad: shape({ enabled: bool, colors: shape({ x: color, y: color, z: color }) }),
  onMaterial: fn,
  lineWidth: nonNegative,
  id: text,
  className: text,
  font: shape({
    family: text,
    weight: (value, path) => {
      if (typeof value !== "string" && typeof value !== "number") invalid(path, "a CSS font weight", value);
    },
    size: positive,
  }),
  background: shape({ enabled: bool, color, opacity: unit, hover: shape({ color, opacity: unit }) }),
  corners: part,
  edges: part,
  radius: nonNegative,
  smoothness: nonNegative,
  x: target,
  y: target,
  z: target,
  nx: target,
  ny: target,
  nz: target,
  top: target,
  bottom: target,
  front: target,
  back: target,
  right: target,
  left: target,
} satisfies { [Key in keyof GizmoOptions]-?: Rule };

const options = shape(RULES);

/**
 * Checks options as a caller passed them, to the constructor or to `set()`. `undefined` values pass: `set()` reads
 * them as "back to the default".
 *
 * @throws {ViewportGizmoError} `UNKNOWN_OPTION` for a key the library does not know, at any depth; `REMOVED_OPTION`
 * for a 2.x form, naming its 3.0 replacement; `INVALID_OPTION` for a wrong type or an out-of-range value
 */
export function validateOptions(value: unknown): asserts value is GizmoOptions {
  if (!isPlainObject(value)) invalid("options", "an object", value);
  options(value, "");
}
