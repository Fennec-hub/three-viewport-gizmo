import { MathUtils, Matrix4, Quaternion, Vector3 } from "three";
import { GIZMO_POLE_EPSILON } from "../utils/constants";
import type { OrbitFrame } from "./frame";

const { clamp } = MathUtils;

/** An upright camera about a target: azimuth and polar angle in an {@link OrbitFrame}. */
export type OrbitPose = { azimuth: number; polar: number };

/** The camera state a pose is read from and written to. */
export type OrbitCamera = {
  readonly position: Vector3;
  readonly quaternion: Quaternion;
};

/** Below this `sin(polar)` the azimuth of a position is undefined and is read from the camera's right vector. */
const POLE_SINE = 1e-3;

const _back = /*@__PURE__*/ new Vector3();
const _right = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3();
const _matrix = /*@__PURE__*/ new Matrix4();

/** Keeps the polar angle off the poles by {@link GIZMO_POLE_EPSILON}, so position-based controllers keep the azimuth. */
export const clampPolar = (polar: number) =>
  clamp(polar, GIZMO_POLE_EPSILON, Math.PI - GIZMO_POLE_EPSILON);

/**
 * Places the camera at `pose`, `radius` from `target`. The orientation is built
 * from the pose alone (right, up, back), so it is upright on every call and equals
 * `lookAt(position, target, u)`.
 */
export function writePose(
  camera: OrbitCamera,
  pose: OrbitPose,
  { e1, e2, u }: OrbitFrame,
  target: Vector3,
  radius: number
) {
  const { azimuth } = pose;
  const polar = clampPolar(pose.polar);
  const sinPolar = Math.sin(polar);

  _back
    .copy(e1)
    .multiplyScalar(sinPolar * Math.cos(azimuth))
    .addScaledVector(e2, sinPolar * Math.sin(azimuth))
    .addScaledVector(u, Math.cos(polar));
  _right.copy(e1).multiplyScalar(-Math.sin(azimuth)).addScaledVector(e2, Math.cos(azimuth));
  _up.crossVectors(_back, _right);

  camera.quaternion.setFromRotationMatrix(_matrix.makeBasis(_right, _up, _back));
  camera.position.copy(target).addScaledVector(_back, radius);
}

/**
 * Reads the pose of a camera looking at `target`. At a pole, where the position
 * carries no azimuth, the azimuth comes from the camera's right vector.
 */
export function readPose(camera: OrbitCamera, { e1, e2, u }: OrbitFrame, target: Vector3): OrbitPose {
  _back.subVectors(camera.position, target).normalize();
  const polar = Math.acos(clamp(_back.dot(u), -1, 1));

  if (Math.sin(polar) > POLE_SINE) {
    return { azimuth: Math.atan2(_back.dot(e2), _back.dot(e1)), polar: clampPolar(polar) };
  }

  _right.set(1, 0, 0).applyQuaternion(camera.quaternion);
  return { azimuth: Math.atan2(-_right.dot(e1), _right.dot(e2)), polar: clampPolar(polar) };
}

/** The pose that looks from `direction` toward the target. Poles take the Front azimuth. */
export function targetPose(direction: Vector3, frame: OrbitFrame): OrbitPose {
  const { e1, e2, u, frontAzimuth } = frame;
  _back.copy(direction).normalize();
  const polar = Math.acos(clamp(_back.dot(u), -1, 1));
  const azimuth =
    Math.sin(polar) > POLE_SINE ? Math.atan2(_back.dot(e2), _back.dot(e1)) : frontAzimuth;

  return { azimuth, polar: clampPolar(polar) };
}
