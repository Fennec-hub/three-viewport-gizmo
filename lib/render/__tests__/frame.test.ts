import { AlwaysDepth, NeverDepth, PerspectiveCamera, RenderTarget, REVISION, Scene, Vector4 } from "three";
import { describe, expect, it } from "vitest";
import { createDepthReset, renderInRect } from "../frame";
import { measureViewport, targetRect, type MutableViewport } from "../rect";
import type { GizmoRenderer } from "../backend";

/** The renderer state `renderInRect` touches, recording what each `render()` saw. */
function fakeRenderer({ webgpu = false, reversed = false, target = null as RenderTarget | null, fail = false } = {}) {
  const canvas = document.createElement("canvas");
  Object.defineProperties(canvas, { clientWidth: { value: 800 }, clientHeight: { value: 600 } });
  const state = { viewport: new Vector4(10, 20, 300, 200), scissor: new Vector4(1, 2, 3, 4), scissorTest: false };
  const seen: Array<{ viewport: number[]; scissor: number[]; scissorTest: boolean; autoClear: boolean; target?: number[] }> = [];
  const renderer = {
    isWebGPURenderer: webgpu || undefined,
    domElement: canvas,
    autoClear: true,
    reversedDepthBuffer: reversed,
    capabilities: { reversedDepthBuffer: reversed },
    getRenderTarget: () => target,
    setRenderTarget: () => {},
    getActiveCubeFace: () => 0,
    getActiveMipmapLevel: () => 0,
    getViewport: (v: Vector4) => v.copy(state.viewport),
    getScissor: (v: Vector4) => v.copy(state.scissor),
    getScissorTest: () => state.scissorTest,
    setViewport: (x: number | Vector4, y?: number, z?: number, w?: number) =>
      x instanceof Vector4 ? state.viewport.copy(x) : state.viewport.set(x, y!, z!, w!),
    setScissor: (x: number | Vector4, y?: number, z?: number, w?: number) =>
      x instanceof Vector4 ? state.scissor.copy(x) : state.scissor.set(x, y!, z!, w!),
    setScissorTest: (on: boolean) => (state.scissorTest = on),
    render: () => {
      seen.push({
        viewport: state.viewport.toArray(),
        scissor: state.scissor.toArray(),
        scissorTest: state.scissorTest,
        autoClear: renderer.autoClear,
        target: target?.viewport.toArray(),
      });
      if (fail) throw new Error("lost context");
    },
  };
  return { renderer: renderer as unknown as GizmoRenderer, state, seen };
}

const rect = { x: 664, y: 8, width: 128, height: 128 };
const setup = () => {
  const reset = createDepthReset(new Set());
  const scene = new Scene().add(reset);
  const camera = new PerspectiveCamera(26, 1, 5, 10);
  camera.position.set(0, 0, 7);
  return { reset, scene, camera };
};

describe("renderInRect", () => {
  it("draws scissored to the rectangle with no clear, and restores the host's live state", () => {
    const { renderer, state, seen } = fakeRenderer();
    const { reset, scene, camera } = setup();
    renderInRect(renderer, scene, camera, rect, reset);
    expect(seen).toEqual([{ viewport: [664, 8, 128, 128], scissor: [664, 8, 128, 128], scissorTest: true, autoClear: false, target: undefined }]);
    expect(state.viewport.toArray()).toEqual([10, 20, 300, 200]);
    expect(state.scissor.toArray()).toEqual([1, 2, 3, 4]);
    expect(state.scissorTest).toBe(false);
    expect(renderer.autoClear).toBe(true);
  });

  it("restores the host's state when the draw throws", () => {
    const { renderer, state } = fakeRenderer({ fail: true });
    const { reset, scene, camera } = setup();
    expect(() => renderInRect(renderer, scene, camera, rect, reset)).toThrow("lost context");
    expect(state.viewport.toArray()).toEqual([10, 20, 300, 200]);
    expect(state.scissorTest).toBe(false);
    expect(renderer.autoClear).toBe(true);
  });

  it("writes a host render target's rectangles in its pixels and restores them", () => {
    const target = new RenderTarget(1600, 1200);
    target.viewport.set(1, 2, 3, 4);
    target.scissor.set(5, 6, 7, 8);
    const { renderer, seen } = fakeRenderer({ webgpu: true, target });
    const { reset, scene, camera } = setup();
    renderInRect(renderer, scene, camera, rect, reset);
    expect(seen[0].target).toEqual([1328, 16, 256, 256]);
    expect([target.viewport.toArray(), target.scissor.toArray(), target.scissorTest]).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], false]);
  });

  it("spells depth test 'always' so the installed three maps it to 'always' (the browser case reads the depth)", () => {
    const { reset, scene, camera } = setup();
    // Before r187 three maps Always to Never under reversed depth, so the reset asks for Never; from r187, Always.
    const reversedAlways = Number.parseInt(REVISION, 10) < 187 ? NeverDepth : AlwaysDepth;
    for (const [reversed, func] of [[false, AlwaysDepth], [true, reversedAlways]] as const) {
      renderInRect(fakeRenderer({ reversed }).renderer, scene, camera, rect, reset);
      expect(reset.material.depthFunc).toBe(func);
    }
  });

  it("places the quad just inside the far plane, covering the view, as the camera moves", () => {
    const { reset, scene, camera } = setup();
    const { renderer } = fakeRenderer();
    for (const z of [7, 3.4]) {
      camera.position.z = z;
      renderInRect(renderer, scene, camera, rect, reset);
      const e = reset.matrix.elements;
      expect(e[14]).toBeCloseTo(z - 9.9);
      expect(e[0]).toBeGreaterThan(2 * 9.9 * Math.tan((13 * Math.PI) / 180));
    }
  });
});

describe("measureViewport and targetRect", () => {
  it("measure in the setViewport convention: y from the top on WebGPU, from the bottom on WebGL", () => {
    const element = document.createElement("div");
    element.getBoundingClientRect = () => new DOMRect(664, 8, 128, 128);
    for (const [webgpu, y] of [[true, 8], [false, 600 - 136]] as const) {
      const { renderer } = fakeRenderer({ webgpu });
      renderer.domElement.getBoundingClientRect = () => new DOMRect(0, 0, 800, 600);
      const out: MutableViewport = { x: 0, y: 0, width: 0, height: 0 };
      expect(measureViewport(renderer, element, out)).toEqual({ x: 664, y, width: 128, height: 128 });
    }
  });

  it("scales the rectangle from the canvas's CSS size to the target's size", () => {
    const { renderer } = fakeRenderer();
    expect(targetRect(renderer, rect, new RenderTarget(400, 300), new Vector4()).toArray()).toEqual([332, 4, 64, 64]);
  });
});
