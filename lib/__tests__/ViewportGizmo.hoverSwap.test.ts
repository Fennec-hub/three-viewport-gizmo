import { afterEach, describe, expect, it } from "vitest";
import type { MeshBasicMaterial } from "three";
import type { GizmoAxisName, GizmoAxisObject } from "../types.js";
import { axisHover } from "../utils/axisHover.js";
import { axesObjects } from "../utils/axesObjects.js";
import { optionsFallback } from "../utils/optionsFallback.js";
import { createStubRenderer, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
});

function findFace(axes: GizmoAxisObject[], axisName: GizmoAxisName): GizmoAxisObject {
  const found = axes.find(
    (a) =>
      a.userData.kind === "face" &&
      a.userData.axes?.length === 1 &&
      a.userData.axes[0] === axisName
  );
  if (!found) {
    throw new Error(`face not found: ${axisName}`);
  }
  return found;
}

describe("dual-material hover swap (WebGPU-safe atlas)", () => {
  it("sphere +X swaps Sprite materials; hover map uses right atlas column", () => {
    const opts = optionsFallback({ type: "sphere" });
    const [axes] = axesObjects(opts, createStubRenderer());
    const xFace = findFace(axes, "x");
    const idleMap = xFace.userData.idleMaterial!.map!;
    const hoverMap = xFace.userData.hoverMaterial!.map!;
    const { offsetX } = idleMap.userData as { offsetX: number };
    expect(idleMap.offset.x).toBeCloseTo(offsetX);
    expect(hoverMap.offset.x).toBeCloseTo(0.5 + offsetX);
    expect(xFace.userData.idleMaterial).not.toBe(xFace.userData.hoverMaterial);

    axisHover(xFace, true);
    expect(xFace.material).toBe(xFace.userData.hoverMaterial);
    axisHover(xFace, false);
    expect(xFace.material).toBe(xFace.userData.idleMaterial);
  });

  it("cube Right face swaps MeshBasic materials with locked atlas offsets", () => {
    const opts = optionsFallback({ type: "cube" });
    const [axes] = axesObjects(opts, createStubRenderer());
    const xFace = findFace(axes, "x");
    const idleMat = xFace.userData.idleMaterial as MeshBasicMaterial;
    const hoverMat = xFace.userData.hoverMaterial as MeshBasicMaterial;
    const { offsetX } = idleMat.map!.userData as { offsetX: number };
    expect(idleMat.map!.offset.x).toBeCloseTo(offsetX);
    expect(hoverMat.map!.offset.x).toBeCloseTo(0.5 + offsetX);

    axisHover(xFace, true);
    expect(xFace.material).toBe(hoverMat);
    axisHover(xFace, false);
    expect(xFace.material).toBe(idleMat);
  });

  it("rounded-cube corner uses paired materials (color dual)", () => {
    const opts = optionsFallback({ type: "rounded-cube" });
    const [axes] = axesObjects(opts, createStubRenderer());
    const corner = axes.find((a) => a.userData.kind === "corner")!;
    expect(corner.userData.idleMaterial).toBeDefined();
    expect(corner.userData.hoverMaterial).toBeDefined();
    expect(corner.userData.idleMaterial).not.toBe(corner.userData.hoverMaterial);
    axisHover(corner, true);
    expect(corner.material).toBe(corner.userData.hoverMaterial);
    axisHover(corner, false);
    expect(corner.material).toBe(corner.userData.idleMaterial);
  });

  it("sphere with corners retains dual materials on sprites at corners row", () => {
    const opts = optionsFallback({ type: "sphere", corners: { enabled: true } });
    const [axes] = axesObjects(opts, createStubRenderer());
    const corner = axes.find((a) => a.userData.kind === "corner")!;
    expect(corner.userData.idleMaterial).toBeDefined();
    expect(corner.userData.hoverMaterial?.map).toBeDefined();
    axisHover(corner, true);
    expect(corner.material).toBe(corner.userData.hoverMaterial);
  });

  it("every axesObjects axis has paired materials for sphere, cube, rounded-cube", () => {
    for (const type of ["sphere", "cube", "rounded-cube"] as const) {
      const opts = optionsFallback({ type });
      const [axes] = axesObjects(opts, createStubRenderer());
      for (const a of axes) {
        expect.soft(a.userData.idleMaterial, `${type} ${String(a.userData.kind)}`).toBeDefined();
        expect.soft(a.userData.hoverMaterial, `${type} ${String(a.userData.kind)}`).toBeDefined();
      }
    }
  });
});
