import { Matrix4, Quaternion, Vector3 } from "three";
import type { GizmoLimits, GizmoSide, GizmoTurn } from "../types";
import { orbitFrameAbout } from "./frame";
import type { LabelFrame } from "./labelFrame";
import { clampPose, POLE_SINE, poseQuaternion, readPose, targetPose, type OrbitCamera } from "./pose";
import { orbitFlight, rigidFlight, type Flight } from "./transition";

/** What a plan starts from. Planning allocates; only {@link sample} runs per frame. */
export type TurnContext = Readonly<{
  /** The camera, looking at `target`. */
  camera: OrbitCamera;
  target: Readonly<Vector3>;
  /** The current orbit up `w`: `camera.up` at gesture start when `roll` is on (L2). Ignored when `roll` is off. */
  up: Readonly<Vector3>;
  label: LabelFrame;
  roll: boolean | "free";
  /** Pole entry in the label frame (U7). Default `front`. A rolled frame always uses `nearest`. */
  poleEntry?: "front" | "nearest";
  /** Limits in the orbit frame (U5). `roll: 'free'` has no orbit frame and ignores them. */
  limits?: GizmoLimits;
  /** Turns per second on the largest angle; `Infinity` lands on the first frame. */
  speed: number;
}>;

/** How far a view may be from a target's direction, and its screen up from an allowed up, and still rest on it. */
export const TARGET_TOLERANCE = Math.PI / 180;

const QUARTER = Math.PI / 2;

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

/** The signed world axes, in tie order. */
const CARDINALS: readonly Readonly<Vector3>[] = [Z, X, Y].flatMap((axis) => [axis.clone(), axis.clone().negate()]);

/**
 * The signed world axis nearest `w`; a tie goes to `prefer` (the label up), then to the order +Z, −Z, +X, −X, +Y, −Y.
 *
 * @returns A new vector
 */
export function snapCardinal(w: Readonly<Vector3>, prefer?: Readonly<Vector3>): Vector3 {
  let best = CARDINALS[0];
  let bestDot = -Infinity;
  for (const axis of prefer ? [prefer, ...CARDINALS] : CARDINALS) {
    const dot = axis.dot(w);
    if (dot > bestDot + 1e-9) {
      best = axis;
      bestDot = dot;
    }
  }
  return best.clone();
}

const backOf = (q: Readonly<Quaternion>) => new Vector3(0, 0, 1).applyQuaternion(q);
const upOf = (q: Readonly<Quaternion>) => new Vector3(0, 1, 0).applyQuaternion(q);
const rightOf = (q: Readonly<Quaternion>) => new Vector3(1, 0, 0).applyQuaternion(q);

/**
 * The allowed screen ups of a view from `direction`: every signed axis not along it, projected onto the view plane and
 * turned by whole quarter turns. Four at a face or an edge, twelve at a corner.
 */
function allowedUps(direction: Readonly<Vector3>): Vector3[] {
  const ups: Vector3[] = [];
  for (const axis of CARDINALS) {
    if (Math.abs(axis.dot(direction)) > 0.99) continue;
    const projected = axis.clone().addScaledVector(direction, -axis.dot(direction)).normalize();
    for (let k = 0; k < 4; k++) {
      const up = projected.clone().applyAxisAngle(direction, k * QUARTER);
      if (!ups.some((other) => other.distanceTo(up) < 1e-6)) ups.push(up);
    }
  }
  return ups;
}

/** The orientation that looks from `direction` with screen up `up`. */
const orientation = (direction: Readonly<Vector3>, up: Readonly<Vector3>) =>
  new Quaternion().setFromRotationMatrix(
    new Matrix4().makeBasis(new Vector3().crossVectors(up, direction), up, direction)
  );

/**
 * Whether a view rests on the target at `direction` (roll rulings 2 and B): it looks from that direction, and its screen
 * up is a whole number of quarter turns from a signed axis projected onto the view plane, both within
 * {@link TARGET_TOLERANCE}.
 */
export function restsOn(quaternion: Readonly<Quaternion>, direction: Readonly<Vector3>): boolean {
  const d = direction.clone().normalize();
  if (backOf(quaternion).angleTo(d) > TARGET_TOLERANCE) return false;
  const up = upOf(quaternion);
  return allowedUps(d).some((allowed) => allowed.angleTo(up) < TARGET_TOLERANCE);
}

/** Home: Top Front Right of the label frame. */
export const homeDirection = (label: LabelFrame) =>
  new Vector3().addVectors(label.right, label.up).add(label.front).normalize();

/** `roll: 'free'`: the shortest rotation to the orientation on `direction` nearest the camera's. */
function shortest(context: TurnContext, direction: Readonly<Vector3>): Flight {
  const { quaternion } = context.camera;
  let best: Quaternion | null = null;
  let bestAngle = Infinity;
  for (const up of allowedUps(direction)) {
    const candidate = orientation(direction, up);
    const angle = quaternion.angleTo(candidate);
    if (angle < bestAngle) {
      best = candidate;
      bestAngle = angle;
    }
  }
  return rigidFlight(quaternion, best!, context.speed);
}

/**
 * An orbit turn to `direction` about the orbit up `w1`: 2.3.0's target pose in that frame, from the camera's pose and
 * roll residual in it. A pole takes the Front azimuth only in the label frame with `front` entry, else the nearest
 * quarter turn of the current azimuth (U7, S4).
 */
function orbitTo(context: TurnContext, direction: Readonly<Vector3>, w1: Readonly<Vector3>, front: boolean): Flight {
  const { camera, target, label, limits, speed } = context;
  const frame = orbitFrameAbout(w1, label.front);
  const from = readPose(camera, frame, target);
  const to = targetPose(direction, frame);
  const d = direction.clone().normalize();
  const atPole = !(Math.sqrt(Math.max(0, 1 - d.dot(w1) ** 2)) > POLE_SINE);
  if (atPole && !(front && w1.distanceTo(label.up) < 1e-9)) {
    to.azimuth = Math.round(from.azimuth / QUARTER) * QUARTER;
  }
  return orbitFlight(frame, w1, from, clampPose(to, limits), speed, limits);
}

/** The orbit up a click or a side triangle turns about: the cardinal axis nearest `w` with `roll` on, else the label up. */
const clickUp = ({ roll, up, label }: TurnContext) => (roll ? snapCardinal(up, label.up) : label.up.clone());

/** Upright in the label frame, as 2.3.0 lands, entered from Front at a pole. */
function upright(context: TurnContext, direction: Readonly<Vector3>): Flight {
  if (context.roll !== "free") return orbitTo(context, direction, context.label.up, true);
  const frame = orbitFrameAbout(context.label.up, context.label.front);
  const to = poseQuaternion(targetPose(direction, frame), frame, new Quaternion());
  return rigidFlight(context.camera.quaternion, to, context.speed);
}

/** Options of {@link planView}. */
export type ViewOptions = Readonly<{
  /** `lookFrom(view, { up: 'reset' })`: return to the label up (L6, ruling 3). */
  reset?: boolean;
  /** U6: when the view already rests on `direction`, turn to the opposite one. */
  oppositeOnRepeat?: boolean;
}>;

/**
 * A click or `lookFrom` (L1, U6, U7). The orbit up becomes the cardinal axis nearest the current one (the label up
 * wins a tie) with `roll: true`, the label up with `roll: false` or `reset`; the view lands upright in that frame.
 * `roll: 'free'`: the single shortest rotation to an orientation on the target whose screen up is allowed
 * ({@link restsOn}); `reset` then lands upright in the label frame.
 */
export function planView(context: TurnContext, direction: Readonly<Vector3>, options: ViewOptions = {}): Flight {
  let d = direction.clone().normalize();
  if (options.oppositeOnRepeat && restsOn(context.camera.quaternion, d)) d = d.negate();
  if (options.reset) return upright(context, d);
  if (context.roll === "free") return shortest(context, d);
  return orbitTo(context, d, clickUp(context), context.poleEntry !== "nearest");
}

/** `lookFrom('home')`: Top Front Right, upright in the label frame (L6). */
export const planHome = (context: TurnContext): Flight => upright(context, homeDirection(context.label));

/** The screen direction of a side. */
function sideOf(quaternion: Readonly<Quaternion>, side: GizmoSide): Vector3 {
  const vector = side === "left" || side === "right" ? rightOf(quaternion) : upOf(quaternion);
  return side === "left" || side === "down" ? vector.negate() : vector;
}

/**
 * A relative turn (U9, L6, ruling B).
 * - `toward`: to the face on that side of the screen. Upright about the orbit up a click would use; a pole keeps the
 *   azimuth, so the view carries on over the top. `'free'`: the shortest rotation to it, which from a face view is the
 *   quarter turn about the screen axis.
 * - Angles in the orbit frame `w`. A roll turns `w` about the line of sight (at a pole of `w` it is an azimuth turn)
 *   and runs with the other two as one flight. `'free'`: one rigid rotation about the screen axes.
 *
 * @returns `null` for a roll while `roll` is off: the caller resolves `unavailable` with `roll-off`
 */
export function planTurn(context: TurnContext, turn: GizmoTurn): Flight | null {
  const { camera, target, label, limits, speed } = context;

  if (turn.toward) {
    const face = snapCardinal(sideOf(camera.quaternion, turn.toward));
    if (context.roll === "free") return shortest(context, face);
    return orbitTo(context, face, clickUp(context), false);
  }

  const { azimuth = 0, polar = 0, roll = 0 } = turn;
  if (roll && !context.roll) return null;

  const back = backOf(camera.quaternion);
  if (context.roll === "free") {
    const rotation = new Quaternion()
      .setFromAxisAngle(back, roll)
      .multiply(new Quaternion().setFromAxisAngle(rightOf(camera.quaternion), polar))
      .multiply(new Quaternion().setFromAxisAngle(upOf(camera.quaternion), azimuth));
    return rigidFlight(camera.quaternion, rotation.multiply(camera.quaternion), speed);
  }

  let w1 = context.roll ? new Vector3().copy(context.up).normalize() : label.up.clone();
  const rolled = new Quaternion().setFromAxisAngle(back, roll).multiply(camera.quaternion);
  if (roll && Math.sqrt(Math.max(0, 1 - back.dot(w1) ** 2)) > POLE_SINE) {
    w1.applyAxisAngle(back, roll).normalize();
    const cardinal = snapCardinal(w1);
    if (cardinal.distanceTo(w1) < 1e-6) w1 = cardinal; // keep cardinal axes exact
  }

  const frame = orbitFrameAbout(w1, label.front);
  const from = readPose(camera, frame, target);
  const to = readPose({ position: camera.position, quaternion: rolled }, frame, target);
  to.azimuth += azimuth;
  to.polar += polar;
  return orbitFlight(frame, w1, from, clampPose({ azimuth: to.azimuth, polar: to.polar }, limits), speed, limits);
}
