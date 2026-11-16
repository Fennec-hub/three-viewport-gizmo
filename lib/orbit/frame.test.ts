import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { orbitFrameAbout, type OrbitFrame } from "./frame";
import { labelFrame } from "./labelFrame";
import { targetPose, writePose } from "./pose";
import { targetTable } from "./targets";

/** 2.3.0's frame per up axis, the reference `orbitFrameAbout` must reproduce. */
const V = (x: number, y: number, z: number) => new Vector3(x, y, z);
const FRAMES_2_3: Record<"x" | "y" | "z", OrbitFrame> = {
  y: { e1: V(0, 0, 1), e2: V(1, 0, 0), u: V(0, 1, 0), frontAzimuth: 0 },
  z: { e1: V(1, 0, 0), e2: V(0, 1, 0), u: V(0, 0, 1), frontAzimuth: -Math.PI / 2 },
  x: { e1: V(0, 1, 0), e2: V(0, 0, 1), u: V(1, 0, 0), frontAzimuth: 0 },
};

const expectOrthonormalRightHanded = ({ e1, e2, u }: OrbitFrame) => {
  expect(e1.length()).toBeCloseTo(1, 12);
  expect(e2.length()).toBeCloseTo(1, 12);
  expect(u.length()).toBeCloseTo(1, 12);
  expect(e1.dot(u)).toBeCloseTo(0, 12);
  expect(e2.dot(u)).toBeCloseTo(0, 12);
  expect(new Vector3().crossVectors(e1, e2).distanceTo(u)).toBeCloseTo(0, 12);
};

describe("orbitFrameAbout", () => {
  it("should put the reference at azimuth 0", () => {
    const up = new Vector3(1, 2, 3).normalize();
    const frame = orbitFrameAbout(up, { x: 0, y: 0, z: 1 });
    expectOrthonormalRightHanded(frame);
    expect(frame.frontAzimuth).toBe(0);
    expect(frame.u.distanceTo(up)).toBeCloseTo(0, 12);
    const projected = new Vector3(0, 0, 1).addScaledVector(up, -up.z).normalize();
    expect(frame.e1.distanceTo(projected)).toBeCloseTo(0, 12);
  });

  it("should build an orthonormal frame about any unit vector", () => {
    for (let i = 0; i < 200; i++) {
      const up = new Vector3(Math.sin(i * 1.3), Math.cos(i * 0.7), Math.sin(i * 2.9 + 1)).normalize();
      expectOrthonormalRightHanded(orbitFrameAbout(up, { x: 1, y: 0, z: 0 }));
    }
  });

  it("should fall back to the least aligned world axis when the reference is parallel to up", () => {
    const frame = orbitFrameAbout({ x: 0, y: 0, z: 1 }, { x: 0, y: 0, z: -1 });
    expectOrthonormalRightHanded(frame);
    expect(Math.abs(frame.e1.z)).toBe(0);
  });

  it.each(["x", "y", "z"] as const)(
    "should write the same camera as the 2.3.0 frame at every target for %s up",
    (axis) => {
      const up = new Vector3();
      up[axis] = 1;
      const label = labelFrame(up);
      const before = FRAMES_2_3[axis];
      const after = orbitFrameAbout(label.up, label.front);
      const target = new Vector3();
      const a = new PerspectiveCamera();
      const b = new PerspectiveCamera();

      for (const { name, direction } of targetTable(label)) {
        writePose(a, targetPose(direction as Vector3, before), before, target, 5);
        writePose(b, targetPose(direction as Vector3, after), after, target, 5);
        expect(b.position.distanceTo(a.position), name).toBeCloseTo(0, 9);
        expect(Math.abs(b.quaternion.dot(a.quaternion)), name).toBeCloseTo(1, 9);
      }
    }
  );
});
