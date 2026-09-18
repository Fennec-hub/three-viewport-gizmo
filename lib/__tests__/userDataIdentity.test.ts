import { afterEach, describe, expect, it } from "vitest";
import { CanvasTexture, Object3D } from "three";
import { optionsFallback } from "../utils/optionsFallback.js";
import { axesFaces } from "../utils/axesFaces.js";
import { axesCorners } from "../utils/axesCorners.js";
import { axesEdges } from "../utils/axesEdges.js";
import { GIZMO_AXES, GIZMO_FACES } from "../utils/constants.js";
import { resetDefaultUp } from "./test-utils.js";

function stubTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  return new CanvasTexture(canvas);
}

afterEach(() => {
  resetDefaultUp();
});

describe("userData identity (faces / corners / edges)", () => {
  it("writes kind, axes, and face on each face mesh", () => {
    Object3D.DEFAULT_UP.set(0, 1, 0);
    const faces = axesFaces(optionsFallback({ type: "cube" }), stubTexture());
    expect(faces).toHaveLength(6);
    for (let i = 0; i < 6; i += 1) {
      const face = faces[i]!;
      expect(face.userData.kind).toBe("face");
      expect(face.userData.axes).toEqual([GIZMO_AXES[i]]);
      expect(face.userData.face).toBe(GIZMO_FACES[i]);
    }
  });

  it("writes kind and three axes on each corner (cube)", () => {
    Object3D.DEFAULT_UP.set(0, 1, 0);
    const corners = axesCorners(optionsFallback({ type: "cube" }), stubTexture());
    expect(corners).toHaveLength(8);
    expect(corners[0]!.userData.kind).toBe("corner");
    expect(corners[0]!.userData.axes).toEqual(["x", "y", "z"]);
  });

  it("writes kind and two axes on each edge (position 0,1,1 → y,z)", () => {
    Object3D.DEFAULT_UP.set(0, 1, 0);
    const opts = optionsFallback({ type: "cube" });
    const edges = axesEdges(opts, stubTexture(), 6);
    expect(edges.length).toBe(12);
    expect(edges[0]!.userData.kind).toBe("edge");
    expect(edges[0]!.userData.axes).toEqual(["y", "z"]);
  });

  it("sphere mode preserves edge axis signs after normalize", () => {
    Object3D.DEFAULT_UP.set(0, 1, 0);
    const opts = optionsFallback({ type: "sphere", edges: { enabled: true } });
    const edges = axesEdges(opts, stubTexture(), 6);
    expect(edges[0]!.userData.kind).toBe("edge");
    expect(edges[0]!.userData.axes).toEqual(["y", "z"]);
  });
});
