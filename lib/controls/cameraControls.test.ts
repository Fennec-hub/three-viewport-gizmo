// C2: the camera-controls adapter against real camera-controls 3.1.2.
import { afterEach, describe, expect, it, vi } from "vitest";
import * as THREE from "three";
import { PerspectiveCamera, Vector3 } from "three";
import CameraControls from "camera-controls";
import { createGizmo } from "../__tests__/test-utils";
import { cameraControls } from "./cameraControls";
import { assertControls, cameraUpRefusal, readControlsLimits, refreshCameraUp } from "./contract";

CameraControls.install({ THREE });

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const setup = () => {
  const gizmo = createGizmo({ cameraPosition: new Vector3(0, 0, 5) });
  const camera = gizmo.camera as PerspectiveCamera;
  const raw = new CameraControls(camera, document.body);
  const controls = cameraControls(raw);
  return { gizmo, camera, raw, controls };
};

describe("cameraControls (U11)", () => {
  it("passes the contract, maps enabled and limits, and takes a new up so roll defaults on", () => {
    const { raw, controls } = setup();
    expect(() => assertControls(controls)).not.toThrow();
    expect(cameraUpRefusal(controls)).toBeNull();

    controls.enabled = false;
    expect(raw.enabled).toBe(false);
    raw.enabled = true;
    expect(controls.enabled).toBe(true);

    raw.minPolarAngle = 0.1;
    raw.maxAzimuthAngle = 1;
    expect(readControlsLimits(controls)).toEqual({
      minPolarAngle: 0.1,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: 1,
    });
  });

  it("copies the target instead of aliasing it, and refreshes the copy on each update", () => {
    const { raw, controls } = setup();
    void raw.setTarget(1, 2, 3, false);
    expect(controls.target).toEqual(new Vector3(0, 0, 0));
    const change = vi.fn();
    controls.addEventListener("change", change);
    raw.update(0);
    expect(change).toHaveBeenCalledTimes(1);
    expect(controls.target).toEqual(new Vector3(1, 2, 3));
    expect(controls.target).not.toBe(raw.getTarget(new Vector3()));

    controls.removeEventListener("change", change);
    void raw.setTarget(0, 0, 0, false);
    raw.update(0);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("attaches, and a gizmo turn survives the next camera-controls update", () => {
    const { gizmo, camera, raw, controls } = setup();
    gizmo.attachControls(controls);
    void gizmo.lookFrom(new Vector3(1, 0, 0), { animated: false });
    expect(camera.position.x).toBeCloseTo(5, 6);

    raw.update(1 / 60);
    expect(camera.position.x).toBeCloseTo(5, 6);
    expect(raw.getPosition(new Vector3()).x).toBeCloseTo(5, 6);
    expect(raw.enabled).toBe(true);
  });

  it("pushes a target the host moved through the copy", () => {
    const { raw, controls } = setup();
    controls.target.set(0, 1, 0);
    controls.update();
    expect(raw.getTarget(new Vector3()).y).toBeCloseTo(1, 9);
  });

  it("after a roll and updateCameraUp(), keeps the roll and orbits the new up", () => {
    const { camera, raw, controls } = setup();
    camera.up.set(-1, 0, 0);
    camera.lookAt(0, 0, 0);
    refreshCameraUp(controls);
    raw.update(0);
    expect(camera.up.x).toBeCloseTo(-1, 9);
    expect(new Vector3(0, 1, 0).applyQuaternion(camera.quaternion).x).toBeCloseTo(-1, 6);

    void raw.rotate(0.5, 0, false);
    raw.update(0);
    expect(camera.position.x).toBeCloseTo(0, 6);
    expect(Math.abs(camera.position.y)).toBeGreaterThan(1);
  });

  it("does not re-enter the gizmo from its own update, even when the listener calls update()", () => {
    const { gizmo, controls } = setup();
    gizmo.attachControls(controls);
    const update = vi.spyOn(gizmo, "update");
    const reenter = vi.fn(() => controls.update());
    controls.addEventListener("change", reenter);
    void gizmo.lookFrom(new Vector3(0, 1, 0), { animated: false });
    controls.update();
    gizmo.update();
    expect(reenter).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });
});
