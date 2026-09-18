import { afterEach, describe, expect, it } from "vitest";
import { PerspectiveCamera } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { Line2NodeMaterial } from "three/webgpu";
import { ViewportGizmo } from "../ViewportGizmo.js";
import { createStubRenderer, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
});

function findLineTwo(gizmo: ViewportGizmo) {
  return gizmo.children.find((child) => child.type === "Line2") ?? undefined;
}

describe("axesLines material branch", () => {
  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(10, 10, 10);
  camera.lookAt(0, 0, 0);

  it("selects ShaderMaterial-backed LineMaterial for legacy WebGL-style renderer", () => {
    const renderer = createStubRenderer({ isWebGPURenderer: false });
    const gizmo = new ViewportGizmo(camera, renderer, {
      type: "sphere",
    });

    const line = findLineTwo(gizmo);
    expect(line).toBeDefined();
    expect(line!.material).toBeInstanceOf(LineMaterial);
  });

  it("selects Line2NodeMaterial for WebGPURenderer", () => {
    const renderer = createStubRenderer({ isWebGPURenderer: true });
    const gizmo = new ViewportGizmo(camera, renderer, {
      type: "sphere",
    });

    const line = findLineTwo(gizmo);
    expect(line).toBeDefined();
    expect(line!.material).toBeInstanceOf(Line2NodeMaterial);
  });
});
