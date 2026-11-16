import { Vector3, type Vector3Like } from "three";
import { ViewportGizmoError } from "../errors";
import type { GizmoFaceName } from "../types";

/** A signed world axis, named like the per-axis option keys: `x` is +X, `nx` is −X. */
export type AxisEnd = "x" | "y" | "z" | "nx" | "ny" | "nz";

/** One face of a label frame. Its name, drawn label, style alias and event name all come from this one record (R4). */
export type LabelFace = Readonly<{
  /** The face name in events and targets, and the face-style alias (`front: {...}`). */
  name: GizmoFaceName;
  /** The default drawn label: the name capitalised. */
  label: string;
  /** The world axis end the face sits on: the per-axis option key that `name` aliases. */
  end: AxisEnd;
  /** Unit vector from the cube centre to the face. World space. */
  direction: Readonly<Vector3>;
  /** Where the top of the label text points, so it reads upright from Front at a side and on pole entry from Front. */
  textUp: Readonly<Vector3>;
}>;

/**
 * One of the 24 cardinal label frames. `(right, up, front)` is a right-handed basis of signed world axes, as a
 * camera's `(x, y, z)` is when it looks at the Front face.
 */
export type LabelFrame = Readonly<{
  up: Readonly<Vector3>;
  front: Readonly<Vector3>;
  right: Readonly<Vector3>;
  /** Each face by name. */
  faces: Readonly<Record<GizmoFaceName, LabelFace>>;
  /** Each face by the world axis end it sits on. */
  byEnd: Readonly<Record<AxisEnd, LabelFace>>;
}>;

/** How far a label `up` or `frontDirection`, once normalised, may be from a signed axis. */
const AXIS_TOLERANCE = 1e-6;

const AXIS_ENDS: readonly (readonly [AxisEnd, Readonly<Vector3>])[] = [
  ["x", new Vector3(1, 0, 0)],
  ["y", new Vector3(0, 1, 0)],
  ["z", new Vector3(0, 0, 1)],
  ["nx", new Vector3(-1, 0, 0)],
  ["ny", new Vector3(0, -1, 0)],
  ["nz", new Vector3(0, 0, -1)],
];

/** The 2.x front of each up axis, kept for the negative ends: Y-up looks from +Z, Z-up from −Y, X-up from +Y. */
const DEFAULT_FRONT: Readonly<Record<"x" | "y" | "z", AxisEnd>> = { x: "y", y: "z", z: "ny" };

const _vector = /*@__PURE__*/ new Vector3();

const format = ({ x, y, z }: Vector3Like) => `(${x}, ${y}, ${z})`;

/**
 * The signed axis `vector` points along: its direction, not its length, counts, within {@link AXIS_TOLERANCE}
 * (R18 U2: `(0, 0, 0.9999999)` is +Z and `(0, 0, -1)` is −Z, where 2.3.0 read both as +Y).
 *
 * @returns The axis end, or `null` for a zero, non-finite or non-cardinal vector
 */
export function axisEndOf(vector: Vector3Like): AxisEnd | null {
  const length = _vector.set(vector.x, vector.y, vector.z).length();
  if (!Number.isFinite(length) || length === 0) return null;
  _vector.divideScalar(length);
  for (const [end, axis] of AXIS_ENDS) if (_vector.distanceTo(axis) <= AXIS_TOLERANCE) return end;
  return null;
}

const axisOf = (end: AxisEnd) => AXIS_ENDS.find(([name]) => name === end)![1];

/**
 * The label frame for a label `up` and an optional `frontDirection` (R4, R12, U8). Without a front, the 2.x front of
 * that up axis is used, for either sign of it.
 *
 * @param up - The label up; a signed axis within 1e-6 once normalised
 * @param frontDirection - The direction the Front face looks along; a signed axis perpendicular to `up`
 * @returns A new frame
 * @throws ViewportGizmoError `INVALID_FRAME` when `up` is not a signed axis, or `frontDirection` is not a signed axis
 * perpendicular to it
 */
export function labelFrame(up: Vector3Like, frontDirection?: Vector3Like): LabelFrame {
  const upEnd = axisEndOf(up);
  if (upEnd === null) {
    throw new ViewportGizmoError(
      "INVALID_FRAME",
      `\`up\` ${format(up)} is not a signed axis. Pass a vector within 1e-6 of ±X, ±Y or ±Z, such as (0, 0, 1).`
    );
  }

  const upAxis = axisOf(upEnd);
  const frontEnd =
    frontDirection === undefined ? DEFAULT_FRONT[upEnd.at(-1) as "x" | "y" | "z"] : axisEndOf(frontDirection);
  if (frontEnd === null || frontEnd.at(-1) === upEnd.at(-1)) {
    throw new ViewportGizmoError(
      "INVALID_FRAME",
      `\`frontDirection\` ${format(frontDirection!)} must be a signed axis perpendicular to \`up\` ${format(up)}, ` +
        `such as ${format(axisOf(DEFAULT_FRONT[upEnd.at(-1) as "x" | "y" | "z"]))}.`
    );
  }

  // Exact ±1 and +0 components: every vector of the frame is a copy of a canonical axis.
  const exact = (vector: Vector3Like) => axisOf(axisEndOf(vector)!).clone();
  const upVector = upAxis.clone();
  const front = axisOf(frontEnd).clone();
  const right = exact(new Vector3().crossVectors(upVector, front));
  const back = exact(front.clone().negate());

  // [name, direction, textUp]: side labels stand on the label up; the poles' read upright entered from Front.
  const rows: readonly [GizmoFaceName, Vector3, Vector3][] = [
    ["top", upVector, back],
    ["bottom", exact(upVector.clone().negate()), front],
    ["front", front, upVector],
    ["back", back, upVector],
    ["right", right, upVector],
    ["left", exact(right.clone().negate()), upVector],
  ];

  const faces = {} as Record<GizmoFaceName, LabelFace>;
  const byEnd = {} as Record<AxisEnd, LabelFace>;
  for (const [name, direction, textUp] of rows) {
    const face: LabelFace = {
      name,
      label: name[0].toUpperCase() + name.slice(1),
      end: axisEndOf(direction)!,
      direction,
      textUp,
    };
    faces[name] = face;
    byEnd[face.end] = face;
  }

  return { up: upVector, front, right, faces, byEnd };
}
