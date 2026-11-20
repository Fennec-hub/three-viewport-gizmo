import { Quaternion, Vector3 } from "three";
import type { GizmoLimits } from "../types";
import type { OrbitFrame } from "./frame";
import { hasAzimuthLimits, poseQuaternion, wrapAngle, type OrbitPose } from "./pose";

/** Radians per second at speed 1. */
export const TURN_RATE = 2 * Math.PI;

/** A turn shorter than this, in radians, takes no time. */
const EPSILON = 1e-6;

const TWO_PI = 2 * Math.PI;

/**
 * A turn between two poses: azimuth, polar angle and the roll residual move on one eased parameter, so the roll only
 * shrinks (L1). The end pose has no roll.
 */
export type OrbitTransition = {
  readonly from: Readonly<Required<OrbitPose>>;
  /** Azimuth change: the shortest arc in `(−π, π]`, or the arc inside the azimuth limits. */
  readonly azimuth: number;
  readonly polar: number;
  /** The roll residual at the start, in `(−π, π]`; it eases to 0. */
  readonly roll: number;
  /** Seconds. */
  readonly duration: number;
};

/**
 * A planned flight. `orbit`: an {@link OrbitTransition} in the destination orbit frame. `rigid`: the single shortest
 * rotation between two orientations (`roll: 'free'`).
 */
export type Flight =
  | (OrbitTransition &
      Readonly<{
        kind: "orbit";
        frame: OrbitFrame;
        /** The orbit up at the end: written to `camera.up` on the last frame (L2). */
        up: Readonly<Vector3>;
      }>)
  | Readonly<{
      kind: "rigid";
      from: Readonly<Quaternion>;
      to: Readonly<Quaternion>;
      /** The rotation from `from` to `to`, about a fixed axis: the shortest one. */
      axis: Readonly<Vector3>;
      /** Radians, in `[0, π]`. */
      angle: number;
      /** The end's screen up, the free orbit up. */
      up: Readonly<Vector3>;
      /** Seconds. */
      duration: number;
    }>;

/** One frame of a flight: the orientation, and the up to give the camera so `lookAt` rebuilds it (L2, L3). */
export type FlightFrame = { readonly quaternion: Quaternion; readonly up: Vector3 };

const durationOf = (length: number, speed: number) => (length < EPSILON ? 0 : length / (TURN_RATE * speed));

/** The azimuth change from `from` to `to`; inside the limits' window when both are finite, else the shortest arc. */
const azimuthChange = (from: number, to: number, limits: GizmoLimits | undefined) => {
  if (!hasAzimuthLimits(limits)) return wrapAngle(to - from);
  const min = limits!.minAzimuthAngle!;
  const max = limits!.maxAzimuthAngle!;
  // Both ends measured from `min` in [0, 2π), so the linear path never crosses the excluded arc.
  const offset = (angle: number) => angle - min - TWO_PI * Math.floor((angle - min) / TWO_PI);
  const span = max >= min ? max - min : offset(max);
  if (span >= TWO_PI) return wrapAngle(to - from);
  let start = offset(from);
  // Outside the window (or a rounding step below `min`): approach it from the nearer side.
  if (start > span && TWO_PI - start < start - span) start -= TWO_PI;
  return offset(to) - start;
};

/**
 * Plans a turn from `from` to `to` at `speed` turns per second on the largest of the three angles. A turn shorter than
 * 1e-6 rad, or an infinite `speed`, takes no time. `to.roll` is ignored: every turn ends upright in its frame.
 */
export function orbitTransition(
  from: Readonly<OrbitPose>,
  to: Readonly<OrbitPose>,
  speed: number,
  limits?: GizmoLimits
): OrbitTransition {
  const azimuth = azimuthChange(from.azimuth, to.azimuth, limits);
  const polar = to.polar - from.polar;
  // A residual below EPSILON is read-back noise, not a roll: the flight stays on the orbit up (L2).
  const residual = wrapAngle(from.roll ?? 0);
  const roll = Math.abs(residual) < EPSILON ? 0 : residual;
  const duration = durationOf(Math.max(Math.abs(azimuth), Math.abs(polar), Math.abs(roll)), speed);

  return { from: { azimuth: from.azimuth, polar: from.polar, roll }, azimuth, polar, roll, duration };
}

/** An orbit flight in `frame` ending on the orbit up `up`. */
export function orbitFlight(
  frame: OrbitFrame,
  up: Readonly<Vector3>,
  from: Readonly<OrbitPose>,
  to: Readonly<OrbitPose>,
  speed: number,
  limits?: GizmoLimits
): Flight {
  return { kind: "orbit", frame, up: up.clone(), ...orbitTransition(from, to, speed, limits) };
}

/** The single shortest rotation from `from` to `to`; its orbit up is the end's screen up. */
export function rigidFlight(from: Readonly<Quaternion>, to: Readonly<Quaternion>, speed: number): Flight {
  // The rotation `to · from⁻¹` as an axis and an angle, on the shorter arc.
  const turn = new Quaternion().copy(to).multiply(new Quaternion().copy(from).invert());
  if (turn.w < 0) turn.set(-turn.x, -turn.y, -turn.z, -turn.w);
  const angle = 2 * Math.acos(Math.min(1, turn.w));
  const axis = new Vector3(turn.x, turn.y, turn.z);
  if (axis.lengthSq() > 0) axis.normalize();
  else axis.set(0, 0, 1);

  return {
    kind: "rigid",
    from: from.clone(),
    to: to.clone(),
    axis,
    angle,
    up: new Vector3(0, 1, 0).applyQuaternion(to),
    duration: durationOf(angle, speed),
  };
}

/**
 * Writes the pose `elapsed` seconds into the turn to `out`, on a smoothstep: same average rate, no abrupt start or stop.
 *
 * @returns Whether the turn has finished; `out` is then the end pose, with roll 0
 */
export function sampleTransition(transition: OrbitTransition, elapsed: number, out: OrbitPose): boolean {
  const { from, azimuth, polar, roll, duration } = transition;
  const finished = !(elapsed < duration);
  const t = finished ? 1 : elapsed / duration;
  const e = t * t * (3 - 2 * t);

  out.azimuth = from.azimuth + azimuth * e;
  out.polar = from.polar + polar * e;
  out.roll = roll * (1 - e);

  return finished;
}

/** Writes the camera's screen up, `(0, 1, 0)` turned by `q`, to `out`. */
const screenUp = ({ x, y, z, w }: Quaternion, out: Vector3) =>
  out.set(2 * (x * y - w * z), 1 - 2 * (x * x + z * z), 2 * (y * z + w * x));

const _pose: Required<OrbitPose> = { azimuth: 0, polar: 0, roll: 0 };

/**
 * Writes the frame `elapsed` seconds into `flight` to `out`, allocating nothing (I4). The up is the orbit up when no
 * roll is left and on the last frame, and the exact screen up while a roll eases out (L2).
 *
 * Scalar math only: a double passed to or returned from a call the JIT does not inline is boxed on the heap.
 *
 * @returns Whether the flight has finished; `out` is then its end
 */
export function sample(flight: Flight, elapsed: number, out: FlightFrame): boolean {
  const finished = !(elapsed < flight.duration);

  if (flight.kind === "rigid") {
    const { from, to, axis, angle, duration } = flight;
    if (finished) out.quaternion.copy(to);
    else {
      const t = elapsed / duration;
      const half = (angle * t * t * (3 - 2 * t)) / 2;
      const s = Math.sin(half);
      const rx = axis.x * s;
      const ry = axis.y * s;
      const rz = axis.z * s;
      const rw = Math.cos(half);
      out.quaternion.set(
        rw * from.x + rx * from.w + ry * from.z - rz * from.y,
        rw * from.y - rx * from.z + ry * from.w + rz * from.x,
        rw * from.z + rx * from.y - ry * from.x + rz * from.w,
        rw * from.w - rx * from.x - ry * from.y - rz * from.z
      );
    }
    screenUp(out.quaternion, out.up);
    return finished;
  }

  sampleTransition(flight, elapsed, _pose);
  poseQuaternion(_pose, flight.frame, out.quaternion);
  if (finished || _pose.roll === 0) out.up.copy(flight.up);
  else screenUp(out.quaternion, out.up);
  return finished;
}
