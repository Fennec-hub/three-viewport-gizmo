import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3 } from "three";
import type { GizmoUpAxis } from "../types.js";
import { createGizmo, resetDefaultUp, runFlight } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

const unit = (up: GizmoUpAxis) => {
  const v = new Vector3();
  v[up] = 1;
  return v;
};

describe("lookFrom", () => {
  it("starts the turn from the camera's own orientation (Y-up corner to +x)", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const start = gizmo.camera.quaternion.clone();

    gizmo.lookFrom(new Vector3(1, 0, 0));
    const firstFrame = runFlightFrames(gizmo)[0]!;

    expect(firstFrame.angleTo(start)).toBeLessThan(1e-7);
  });

  it.each([
    ["Z-up Bottom", "z", new Vector3(0, 0, -1)],
    ["Z-up Top", "z", new Vector3(0, 0, 1)],
    ["X-up Right", "x", new Vector3(1, 0, 0)],
    ["X-up Left", "x", new Vector3(-1, 0, 0)],
    ["Y-up Top", "y", new Vector3(0, 1, 0)],
  ] as const)("is a no-op when already on %s", (_, up, direction) => {
    const gizmo = createGizmo({
      cameraPosition: new Vector3(3, 4, 5),
      gizmoOptions: { type: "cube", up },
    });
    gizmo.lookFrom(direction, false);
    const settled = gizmo.camera.quaternion.clone();
    const position = gizmo.camera.position.clone();

    gizmo.lookFrom(direction);
    expect(runFlight(gizmo)).toBe(1);

    // Quaternion.angleTo bottoms out near 4e-8 (acos of a dot product at 1).
    expect(gizmo.camera.quaternion.angleTo(settled)).toBeLessThan(1e-7);
    expect(gizmo.camera.position.distanceTo(position)).toBeLessThan(1e-9);
    expect(new Vector3(1, 0, 0).applyQuaternion(settled).dot(unit(up))).toBeCloseTo(0, 12);
  });

  it("reads the radius from the camera at call time", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    gizmo.target.set(1, 2, 3);
    gizmo.camera.position.set(1, 2, 3 + 4);
    gizmo.camera.lookAt(gizmo.target);

    gizmo.lookFrom(new Vector3(1, 1, 0));
    runFlight(gizmo, () => expect(gizmo.camera.position.distanceTo(gizmo.target)).toBeCloseTo(4, 9));

    const eye = gizmo.camera.position.clone().sub(gizmo.target).normalize();
    expect(eye.angleTo(new Vector3(1, 1, 0).normalize())).toBeLessThan(1e-9);
  });

  it("reads time from performance.now in seconds and eases the turn", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(0, 0, 10) });
    // Front to Right is a quarter turn of azimuth: 0.25 s at speed 1.
    gizmo.lookFrom(new Vector3(1, 0, 0));

    const now = vi.spyOn(performance, "now");
    now.mockReturnValue(2000);
    gizmo.render();
    expect(gizmo.camera.position.toArray().map((v) => +v.toFixed(9))).toEqual([0, 0, 10]);

    now.mockReturnValue(2125); // halfway in time; smoothstep(0.5) is 0.5
    gizmo.render();
    const eye = gizmo.camera.position.clone().normalize();
    expect(eye.angleTo(new Vector3(1, 0, 1).normalize())).toBeLessThan(1e-9);
    expect(gizmo.animating).toBe(true);

    now.mockReturnValue(2250);
    gizmo.render();
    expect(gizmo.animating).toBe(false);
  });

  it("fires start, change per frame and end; without animation it finishes in the call", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const events: string[] = [];
    for (const type of ["start", "change", "end"] as const) {
      gizmo.addEventListener(type, () => events.push(type));
    }

    gizmo.lookFrom(new Vector3(0, 0, 1), false);
    expect(events).toEqual(["start", "change", "end"]);
    expect(gizmo.animating).toBe(false);

    events.length = 0;
    gizmo.lookFrom(new Vector3(1, 0, 0));
    const frames = runFlight(gizmo);
    expect(events).toEqual(["start", ...Array(frames).fill("change"), "end"]);
  });

  it("retargets a turn in progress without a second start", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(0, 0, 10) });
    const events: string[] = [];
    gizmo.addEventListener("start", () => events.push("start"));
    gizmo.addEventListener("end", () => events.push("end"));

    gizmo.lookFrom(new Vector3(1, 0, 0));
    gizmo.lookFrom(new Vector3(0, 0, -1));
    runFlight(gizmo);

    expect(events).toEqual(["start", "end"]);
    expect(gizmo.camera.position.clone().normalize().z).toBeCloseTo(-1, 9);
  });
});

function runFlightFrames(gizmo: ReturnType<typeof createGizmo>) {
  const frames: ReturnType<typeof gizmo.camera.quaternion.clone>[] = [];
  runFlight(gizmo, () => frames.push(gizmo.camera.quaternion.clone()));
  return frames;
}
