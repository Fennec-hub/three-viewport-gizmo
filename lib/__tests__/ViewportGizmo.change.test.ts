import { afterEach, describe, expect, it, vi } from "vitest";
import type { Intersection } from "three";
import { Vector3 } from "three";
import type { GizmoAxisObject } from "../types.js";
import { createGizmo, getInternals, resetDefaultUp } from "./test-utils.js";

const intersectedObjects = vi.fn();
vi.mock("../utils/intersectedObjects.js", () => ({
  intersectedObjects: (...args: unknown[]) => intersectedObjects(...args),
}));

afterEach(() => {
  resetDefaultUp();
  vi.clearAllMocks();
});

describe("_handleClick change payload", () => {
  it("dispatches enriched change for a face hit", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();

    const face = internals._intersections[0]!;
    intersectedObjects.mockReturnValue({
      object: face,
      distance: 1,
    } as Intersection<GizmoAxisObject>);

    const onChange = vi.fn();
    gizmo.addEventListener("change", onChange);

    internals._handleClick({} as PointerEvent);

    expect(onChange).toHaveBeenCalledTimes(1);
    const detail = onChange.mock.calls[0]![0];
    expect(detail.kind).toBe("face");
    expect(detail.axes).toEqual(["x"]);
    expect(detail.face).toBe("right");
    expect(detail.direction).not.toBeNull();
    expect(detail.direction!.x).toBeCloseTo(face.position.clone().normalize().x);
    expect(detail.direction!.y).toBeCloseTo(face.position.clone().normalize().y);
    expect(detail.direction!.z).toBeCloseTo(face.position.clone().normalize().z);
  });

  it("emits one balanced interaction with no change after end", () => {
    const queuedFrames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      queuedFrames.push(callback);
      return queuedFrames.length;
    });

    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    const face = internals._intersections[0]!;
    intersectedObjects.mockReturnValue({ object: face, distance: 1 } as Intersection<GizmoAxisObject>);

    const events: string[] = [];
    gizmo.addEventListener("start", () => events.push("start"));
    gizmo.addEventListener("change", () => events.push("change"));
    gizmo.addEventListener("end", () => events.push("end"));

    internals._onPointerDown({
      clientX: 20,
      clientY: 20,
      preventDefault: vi.fn(),
    } as unknown as PointerEvent);
    document.dispatchEvent(new MouseEvent("pointerup", { clientX: 20, clientY: 20 }));

    internals._quaternionStart.copy(internals._quaternionEnd);
    internals._animate();
    queuedFrames.splice(0).forEach((callback) => callback(0));

    expect(events.filter((event) => event === "start")).toHaveLength(1);
    expect(events.filter((event) => event === "end")).toHaveLength(1);
    expect(events.at(-1)).toBe("end");
  });

  it("balances pointer start with end when a click misses the gizmo", () => {
    intersectedObjects.mockReturnValue(null);
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    const events: string[] = [];
    gizmo.addEventListener("start", () => events.push("start"));
    gizmo.addEventListener("end", () => events.push("end"));

    internals._onPointerDown({
      clientX: 20,
      clientY: 20,
      preventDefault: vi.fn(),
    } as unknown as PointerEvent);
    document.dispatchEvent(new MouseEvent("pointerup", { clientX: 20, clientY: 20 }));

    expect(events).toEqual(["start", "end"]);
  });
});
