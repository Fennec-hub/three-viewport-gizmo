import { Vector3 } from "three";
import type { GizmoUpAxis } from "../types";

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

const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

/** Cyclic permutations of the world axes, one per up axis. */
const FRAMES: Record<GizmoUpAxis, OrbitFrame> = {
  y: { e1: Z, e2: X, u: Y, frontAzimuth: 0 },
  z: { e1: X, e2: Y, u: Z, frontAzimuth: -Math.PI / 2 },
  x: { e1: Y, e2: Z, u: X, frontAzimuth: 0 },
};

/** The orbit frame for an up axis. */
export const orbitFrame = (up: GizmoUpAxis): OrbitFrame => FRAMES[up];
