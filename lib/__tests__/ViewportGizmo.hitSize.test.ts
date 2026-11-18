// `corners.hitSize` and `edges.hitSize` through the class: a `set()` changes what the pointer hits, in place.
import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3, type Object3D } from "three";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { fire, mountGizmo } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

/** The kind hovered at each pixel from the element's centre along `step`, until the pointer leaves the cube. */
function scan(gizmo: ViewportGizmo, element: HTMLElement, step: readonly [number, number]) {
  const kinds: string[] = [];
  for (let i = 0; i < 64; i++) {
    fire(element, "pointermove", { x: 64 + step[0] * i, y: 64 + step[1] * i });
    if (!gizmo.hovered) break;
    kinds.push(gizmo.hovered.kind);
  }
  return kinds;
}

/** Every object and geometry under `root`, to tell an in-place update from a rebuild. */
function parts(root: Object3D) {
  const found: unknown[] = [];
  root.traverse((object) => {
    found.push(object);
    const geometry = (object as { geometry?: unknown }).geometry;
    if (geometry) found.push(geometry);
  });
  return found;
}

describe("hit sizes", () => {
  it.each(["cube", "rounded-cube"] as const)(
    "should move the %s's corner and edge bands on set() without rebuilding a mesh",
    (type) => {
      const { gizmo, element } = mountGizmo({
        cameraPosition: new Vector3(0, 0, 5),
        gizmoOptions: { type, radius: 0.05 },
      });
      const before = parts(gizmo.root);
      const diagonal = scan(gizmo, element, [1, -1]).indexOf("corner");
      const side = scan(gizmo, element, [0, -1]).indexOf("edge");
      expect(diagonal).toBeGreaterThan(0);
      expect(side).toBeGreaterThan(0);

      let invalidated = 0;
      gizmo.addEventListener("invalidate", () => invalidated++);
      gizmo.set({ corners: { hitSize: 0.6 }, edges: { hitSize: 0.5 } });

      expect(invalidated).toBeGreaterThan(0);
      expect(parts(gizmo.root)).toEqual(before);
      expect(parts(gizmo.root).every((part, i) => part === before[i])).toBe(true);
      // indexOf is -1 when the scan finds no corner or edge at all: require one before comparing.
      const widerDiagonal = scan(gizmo, element, [1, -1]).indexOf("corner");
      const widerSide = scan(gizmo, element, [0, -1]).indexOf("edge");
      expect(widerDiagonal).toBeGreaterThanOrEqual(0);
      expect(widerSide).toBeGreaterThanOrEqual(0);
      expect(widerDiagonal).toBeLessThan(diagonal);
      expect(widerSide).toBeLessThan(side);

      // Back to the defaults: the bands return.
      gizmo.set({ corners: { hitSize: undefined }, edges: { hitSize: undefined } });
      const restoredDiagonal = scan(gizmo, element, [1, -1]).indexOf("corner");
      const restoredSide = scan(gizmo, element, [0, -1]).indexOf("edge");
      expect(restoredDiagonal).toBeGreaterThanOrEqual(0);
      expect(restoredSide).toBeGreaterThanOrEqual(0);
      expect(restoredDiagonal).toBe(diagonal);
      expect(restoredSide).toBe(side);
      gizmo.dispose();
    }
  );

  it("should ignore both on the sphere", () => {
    const { gizmo, element } = mountGizmo({
      cameraPosition: new Vector3(0, 0, 5),
      gizmoOptions: { type: "sphere", edges: { enabled: true }, corners: { enabled: true } },
    });
    const diagonal = scan(gizmo, element, [1, -1]);
    gizmo.set({ corners: { hitSize: 0.9 }, edges: { hitSize: 0.9 } });
    expect(scan(gizmo, element, [1, -1])).toEqual(diagonal);
    gizmo.dispose();
  });
});
