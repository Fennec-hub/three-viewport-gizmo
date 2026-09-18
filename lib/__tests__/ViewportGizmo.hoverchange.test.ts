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

describe("hoverchange", () => {
  it("fires on focus transitions and debounces the same object", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();

    const a = internals._intersections[0]!;
    const b = internals._intersections[1]!;

    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);
    const first = onHover.mock.calls[0]![0];
    expect(first.object).toBe(a);
    expect(first.kind).toBe("face");
    expect(first.axes).toEqual(["x"]);
    expect(first.face).toBe("right");
    expect(first.direction).not.toBeNull();
    expect(first.direction!.x).toBeCloseTo(a.position.clone().normalize().x);
    expect(first.direction!.y).toBeCloseTo(a.position.clone().normalize().y);
    expect(first.direction!.z).toBeCloseTo(a.position.clone().normalize().z);

    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);

    intersectedObjects.mockReturnValueOnce({
      object: b,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(2);
    const second = onHover.mock.calls[1]![0];
    expect(second.object).toBe(b);
    expect(second.kind).toBe("face");
    expect(second.axes).toEqual(["y"]);
    expect(second.face).toBe("top");

    intersectedObjects.mockReturnValueOnce(null);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(3);
    const cleared = onHover.mock.calls[2]![0];
    expect(cleared.object).toBeNull();
    expect(cleared.kind).toBeNull();
    expect(cleared.axes).toBeNull();
    expect(cleared.face).toBeNull();
    expect(cleared.direction).toBeNull();

    intersectedObjects.mockReturnValueOnce(null);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(3);
  });

  it("fires null from _onPointerLeave once when focus existed", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    const a = internals._intersections[0]!;
    intersectedObjects.mockReturnValueOnce({
      object: a,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);
    expect(onHover).toHaveBeenCalledTimes(1);

    internals._onPointerLeave();
    expect(onHover).toHaveBeenCalledTimes(2);
    const leave = onHover.mock.calls[1]![0];
    expect(leave.object).toBeNull();
    expect(leave.kind).toBeNull();
    expect(leave.axes).toBeNull();
    expect(leave.face).toBeNull();
    expect(leave.direction).toBeNull();

    internals._onPointerLeave();
    expect(onHover).toHaveBeenCalledTimes(2);
  });

  it("includes corner identity on hover (face null)", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.length();

    const corner = internals._intersections[6]!;
    expect(corner.userData.kind).toBe("corner");

    const onHover = vi.fn();
    gizmo.addEventListener("hoverchange", onHover);

    intersectedObjects.mockReturnValueOnce({
      object: corner,
      distance: 1,
    } as Intersection<GizmoAxisObject>);
    internals._handleHover({} as PointerEvent);

    expect(onHover).toHaveBeenCalledTimes(1);
    const evt = onHover.mock.calls[0]![0];
    expect(evt.object).toBe(corner);
    expect(evt.kind).toBe("corner");
    expect(evt.axes).toEqual(["x", "y", "z"]);
    expect(evt.face).toBeNull();
    expect(evt.direction).not.toBeNull();
  });
});
