import { Vector3, type Vector3Like } from "three";

/**
 * Right-handed frame `(e1, e2, u)` about an up axis `u`. Azimuth is measured
 * from `e1` toward `e2`; polar angle from `u`.
 */
export type OrbitFrame = {
  readonly e1: Readonly<Vector3>;
  readonly e2: Readonly<Vector3>;
  readonly u: Readonly<Vector3>;
  /** Azimuth of the Front face. Pole views are entered from this side, so their labels read upright. */
  readonly frontAzimuth: number;
};

const AXES = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)] as const;

/** Below this squared length the reference, projected off the up, has no direction. */
const DEGENERATE = 1e-12;

/**
 * The orbit frame about any unit vector `up` (R12, U8): `e1` is `reference` projected off `up`, so the reference sits
 * at azimuth 0. When `reference` is parallel to `up`, `e1` comes from the world axis least aligned with `up`.
 *
 * @param up - The orbit up; normalised here
 * @param reference - Usually the label front, so `frontAzimuth` is 0
 * @returns A new frame
 */
export function orbitFrameAbout(up: Readonly<Vector3Like>, reference: Readonly<Vector3Like>): OrbitFrame {
  const u = new Vector3().copy(up).normalize();
  const e1 = new Vector3().copy(reference).normalize();
  e1.addScaledVector(u, -e1.dot(u));

  if (e1.lengthSq() < DEGENERATE) {
    const least = AXES.reduce((best, axis) => (Math.abs(axis.dot(u)) < Math.abs(best.dot(u)) ? axis : best));
    e1.copy(least).addScaledVector(u, -least.dot(u));
  }

  e1.normalize();
  return { e1, e2: new Vector3().crossVectors(u, e1), u, frontAzimuth: 0 };
}
