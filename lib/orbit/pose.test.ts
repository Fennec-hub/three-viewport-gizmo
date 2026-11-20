import { PerspectiveCamera, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { orbitFrameAbout } from "./frame";
import { clampPose, POLE_EPSILON, readPose, writePose } from "./pose";

const target = new Vector3(1, -2, 3);

describe("readPose and writePose", () => {
  it("should read back the azimuth, polar angle and roll they wrote, in any orbit frame", () => {
    const camera = new PerspectiveCamera();
    for (let i = 0; i < 100; i++) {
      const up = new Vector3(Math.sin(i), Math.cos(i * 1.7), Math.sin(i * 0.3 + 2)).normalize();
      const frame = orbitFrameAbout(up, { x: 0, y: 0, z: 1 });
      const pose = { azimuth: ((i % 13) - 6) * 0.45, polar: 0.2 + (i % 7) * 0.4, roll: ((i % 11) - 5) * 0.5 };
      writePose(camera, pose, frame, target, 4);
      expect(camera.position.distanceTo(target)).toBeCloseTo(4, 12);
      const read = readPose(camera, frame, target);
      expect(read.azimuth).toBeCloseTo(pose.azimuth, 9);
      expect(read.polar).toBeCloseTo(pose.polar, 9);
      expect(read.roll).toBeCloseTo(pose.roll, 9);
    }
  });

  it("should write an upright camera that equals lookAt with the frame's up when there is no roll", () => {
    const frame = orbitFrameAbout({ x: 0, y: 0, z: 1 }, { x: 0, y: -1, z: 0 });
    const camera = new PerspectiveCamera();
    const reference = new PerspectiveCamera();
    writePose(camera, { azimuth: 0.7, polar: 1.1 }, frame, target, 5);
    reference.position.copy(camera.position);
    reference.up.set(0, 0, 1);
    reference.lookAt(target);
    expect(Math.abs(camera.quaternion.dot(reference.quaternion))).toBeCloseTo(1, 12);
  });

  it("should read a pole's azimuth from the camera's right vector, with no roll", () => {
    const frame = orbitFrameAbout({ x: 0, y: 1, z: 0 }, { x: 0, y: 0, z: 1 });
    const camera = new PerspectiveCamera();
    writePose(camera, { azimuth: 0, polar: 0, roll: 0.9 }, frame, target, 2);
    expect(readPose(camera, frame, target)).toEqual({ azimuth: expect.closeTo(0.9, 6), polar: POLE_EPSILON, roll: 0 });
  });
});

describe("clampPose", () => {
  it("should clamp the polar angle to the limits and off the poles (U5)", () => {
    expect(clampPose({ azimuth: 0, polar: 3 }, { maxPolarAngle: Math.PI / 2 }).polar).toBe(Math.PI / 2);
    expect(clampPose({ azimuth: 0, polar: 0 }, undefined).polar).toBe(POLE_EPSILON);
    expect(clampPose({ azimuth: 0, polar: 0.1 }, { minPolarAngle: 0.5, maxPolarAngle: 0.2 }).polar).toBe(0.5);
  });

  it("should clamp the azimuth as OrbitControls does, including a window across ±π", () => {
    const window = { minAzimuthAngle: -1, maxAzimuthAngle: 1 };
    expect(clampPose({ azimuth: 2, polar: 1 }, window).azimuth).toBe(1);
    expect(clampPose({ azimuth: -3, polar: 1 }, window).azimuth).toBe(-1);
    const across = { minAzimuthAngle: 2.5, maxAzimuthAngle: -2.5 };
    expect(clampPose({ azimuth: 3, polar: 1 }, across).azimuth).toBe(3);
    expect(clampPose({ azimuth: 1, polar: 1 }, across).azimuth).toBe(2.5);
    expect(clampPose({ azimuth: -1, polar: 1 }, across).azimuth).toBe(-2.5);
    expect(clampPose({ azimuth: 7, polar: 1 }, { minAzimuthAngle: -Infinity, maxAzimuthAngle: 1 }).azimuth).toBe(7);
  });
});
