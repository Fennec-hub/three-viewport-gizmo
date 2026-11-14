import { afterEach, describe, expect, it, vi } from "vitest";
import { Matrix4, Quaternion, Vector3 } from "three";
import type { GizmoUpAxis } from "../types.js";
import { GIZMO_TURN_RATE } from "../utils/constants.js";
import { FRAME_MS, createGizmo, resetDefaultUp, runFlight } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

const TARGET = new Vector3(3, -4, 2);
const RADIUS = 9;

/** Nominal turn per frame at speed 1; smoothstep peaks at 1.5x, two angles together at about 2.1x. */
const NOMINAL_STEP = GIZMO_TURN_RATE * (FRAME_MS / 1000);
const MAX_STEP = 2.2 * NOMINAL_STEP;

const axis = (x: number, y: number, z: number) => new Vector3(x, y, z);
/** Up axis, then the horizontal axes azimuth runs between, independent of the library's frame table. */
const FRAMES: Record<GizmoUpAxis, [u: Vector3, e1: Vector3, e2: Vector3]> = {
  y: [axis(0, 1, 0), axis(0, 0, 1), axis(1, 0, 0)],
  z: [axis(0, 0, 1), axis(1, 0, 0), axis(0, 1, 0)],
  x: [axis(1, 0, 0), axis(0, 1, 0), axis(0, 0, 1)],
};
/** Screen-right at Top and Bottom: the views are entered from the Front face's side. */
const POLE_RIGHT: Record<GizmoUpAxis, Vector3> = {
  y: axis(1, 0, 0),
  z: axis(1, 0, 0),
  x: axis(0, 0, 1),
};

const DIRECTIONS: Vector3[] = [];
for (const x of [-1, 0, 1])
  for (const y of [-1, 0, 1])
    for (const z of [-1, 0, 1]) if (x || y || z) DIRECTIONS.push(axis(x, y, z));

const _matrix = new Matrix4();
const _lookAt = new Quaternion();
const _right = new Vector3();

describe.each(["x", "y", "z"] as const)("every view change on a %s-up gizmo", (up) => {
  const [u, e1, e2] = FRAMES[up];

  type Start = { name: string; apply: (gizmo: ReturnType<typeof createGizmo>) => void };
  const starts: Start[] = DIRECTIONS.map((direction) => ({
    name: `view ${direction.toArray()}`,
    apply: (gizmo) => gizmo.lookFrom(direction, false),
  }));
  for (const pole of [1, -1]) {
    for (const azimuth of [0.3, 1.7, -2.9, Math.PI]) {
      const horizontal = e1.clone().multiplyScalar(Math.cos(azimuth)).addScaledVector(e2, Math.sin(azimuth));
      // A host camera parked next to a pole at some azimuth, oriented by lookAt.
      starts.push({
        name: `near pole ${pole} at azimuth ${azimuth}`,
        apply: ({ camera }) => {
          const eye = horizontal.clone().multiplyScalar(Math.sin(1e-4)).addScaledVector(u, pole * Math.cos(1e-4));
          camera.position.copy(TARGET).addScaledVector(eye, RADIUS);
          camera.up.copy(u);
          camera.lookAt(TARGET);
        },
      });
      // Exactly on a pole, turned about the view axis (labels sideways).
      starts.push({
        name: `on pole ${pole} turned to azimuth ${azimuth}`,
        apply: ({ camera }) => {
          const back = u.clone().multiplyScalar(pole);
          const right = e1.clone().multiplyScalar(-Math.sin(azimuth)).addScaledVector(e2, Math.cos(azimuth));
          camera.quaternion.setFromRotationMatrix(_matrix.makeBasis(right, back.clone().cross(right), back));
          camera.position.copy(TARGET).addScaledVector(back, RADIUS);
        },
      });
    }
  }

  it(`stays upright, steps evenly and lands canonically for ${starts.length} starts x ${DIRECTIONS.length} targets`, () => {
    const gizmo = createGizmo({ cameraPosition: axis(5, 6, 7), gizmoOptions: { type: "cube", up } });
    gizmo.target.copy(TARGET);
    gizmo.camera.position.copy(TARGET).add(axis(5, 6, 7).setLength(RADIUS));

    const failures: string[] = [];
    let worstTilt = 0;
    let worstStep = 0;
    let worstLookAt = 0;
    let worstRadius = 0;

    for (const start of starts) {
      for (const to of DIRECTIONS) {
        start.apply(gizmo);
        const previous = gizmo.camera.quaternion.clone();
        const radius = gizmo.camera.position.distanceTo(TARGET);

        gizmo.lookFrom(to);
        runFlight(gizmo, () => {
          const { quaternion, position } = gizmo.camera;
          worstTilt = Math.max(worstTilt, Math.abs(_right.set(1, 0, 0).applyQuaternion(quaternion).dot(u)));
          worstStep = Math.max(worstStep, previous.angleTo(quaternion));
          _lookAt.setFromRotationMatrix(_matrix.lookAt(position, TARGET, u));
          worstLookAt = Math.max(worstLookAt, _lookAt.angleTo(quaternion));
          worstRadius = Math.max(worstRadius, Math.abs(position.distanceTo(TARGET) - radius));
          previous.copy(quaternion);
        });

        const eye = gizmo.camera.position.clone().sub(TARGET).normalize();
        const isPole = Math.abs(to.clone().normalize().dot(u)) > 0.999;
        const right = _right.set(1, 0, 0).applyQuaternion(gizmo.camera.quaternion);
        const expectedRight = isPole ? POLE_RIGHT[up] : u.clone().cross(to).normalize();
        const name = `${start.name} -> ${to.toArray()}`;

        if (gizmo.animating) failures.push(`${name}: did not finish`);
        if (eye.angleTo(to.clone().normalize()) > 1.1e-4) failures.push(`${name}: ends looking from ${eye.toArray()}`);
        if (right.dot(expectedRight) < 1 - 1e-9) failures.push(`${name}: ends with right ${right.toArray()}`);
      }
    }

    expect(failures.slice(0, 10)).toEqual([]);
    expect(worstTilt).toBeLessThan(1e-9);
    expect(worstStep).toBeLessThan(MAX_STEP);
    expect(worstLookAt).toBeLessThan(1e-6);
    expect(worstRadius).toBeLessThan(1e-9);

    gizmo.dispose();
  });
});
