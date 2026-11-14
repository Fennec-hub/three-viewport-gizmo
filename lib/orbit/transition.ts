import { GIZMO_EPSILON, GIZMO_TURN_RATE } from "../utils/constants";
import type { OrbitPose } from "./pose";

/** A turn between two poses: shortest azimuth arc and linear polar change on one eased parameter. */
export type OrbitTransition = {
  readonly from: OrbitPose;
  /** Azimuth change in `(−π, π]`. */
  readonly azimuth: number;
  readonly polar: number;
  /** Seconds. */
  readonly duration: number;
};

/** Wraps an angle to `(−π, π]`. */
const wrapAngle = (angle: number) => angle - 2 * Math.PI * Math.ceil((angle - Math.PI) / (2 * Math.PI));

/**
 * Plans a turn from `from` to `to` at `speed` turns per second on the larger angle.
 * A turn shorter than {@link GIZMO_EPSILON}, or an infinite `speed`, takes no time.
 */
export function orbitTransition(from: OrbitPose, to: OrbitPose, speed: number): OrbitTransition {
  const azimuth = wrapAngle(to.azimuth - from.azimuth);
  const polar = to.polar - from.polar;
  const length = Math.max(Math.abs(azimuth), Math.abs(polar));
  const duration = length < GIZMO_EPSILON ? 0 : length / (GIZMO_TURN_RATE * speed);

  return { from: { ...from }, azimuth, polar, duration };
}

/**
 * Writes the pose `elapsed` seconds into the turn to `out`.
 *
 * @returns Whether the turn has finished; `out` is then the end pose
 */
export function sampleTransition(transition: OrbitTransition, elapsed: number, out: OrbitPose): boolean {
  const { from, azimuth, polar, duration } = transition;
  const finished = !(elapsed < duration);
  const t = finished ? 1 : elapsed / duration;
  const eased = t * t * (3 - 2 * t); // smoothstep: same average rate, no abrupt start or stop

  out.azimuth = from.azimuth + azimuth * eased;
  out.polar = from.polar + polar * eased;

  return finished;
}
