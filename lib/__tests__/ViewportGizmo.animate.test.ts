import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3 } from "three";
import { createGizmo, getInternals, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

describe("_animate", () => {
  it("advances _lastAnimateTimeSeconds using performance.now in seconds", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();
    internals._setOrientation(new Vector3(1, 0, 0));
    expect(gizmo.animating).toBe(true);

    const spy = vi
      .spyOn(performance, "now")
      .mockReturnValueOnce(2000)
      .mockReturnValueOnce(2001);

    internals._animate();
    expect(internals._lastAnimateTimeSeconds).toBe(2);

    internals._animate();
    expect(internals._lastAnimateTimeSeconds).toBeCloseTo(2.001, 10);

    spy.mockRestore();
  });
});
