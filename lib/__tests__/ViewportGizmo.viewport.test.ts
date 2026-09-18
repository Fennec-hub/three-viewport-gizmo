import { afterEach, describe, expect, it, vi } from "vitest";
import { PerspectiveCamera } from "three";
import { ViewportGizmo } from "../ViewportGizmo.js";
import { createStubRenderer, resetDefaultUp } from "./test-utils.js";

function getDomElement(gizmo: ViewportGizmo): HTMLElement {
  return (gizmo as unknown as { _domElement: HTMLElement })._domElement;
}

function getViewport(gizmo: ViewportGizmo): readonly number[] {
  return (gizmo as unknown as { _viewport: number[] })._viewport;
}

afterEach(() => {
  resetDefaultUp();
});

describe("domUpdate viewport Y", () => {
  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(5, 5, 5);
  camera.lookAt(0, 0, 0);

  it("stores bottom-origin Y when using legacy WebGL-style renderer", () => {
    const renderer = createStubRenderer({ isWebGPURenderer: false });
    vi.spyOn(renderer.domElement, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 800, height: 600 })
    );

    const gizmo = new ViewportGizmo(camera, renderer, {
      type: "cube",
      container: document.body,
      placement: "top-right",
      size: 128,
      offset: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const domEl = getDomElement(gizmo);
    vi.spyOn(domEl, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 672, y: 0, width: 128, height: 128 })
    );

    gizmo.update(false);

    const vp = getViewport(gizmo);
    expect(vp[0]).toBe(672);
    expect(vp[1]).toBe(472);
    expect(vp[2]).toBe(128);
    expect(vp[3]).toBe(128);

    vi.restoreAllMocks();
  });

  it("stores top-origin Y when using WebGPURenderer", () => {
    const renderer = createStubRenderer({ isWebGPURenderer: true });
    vi.spyOn(renderer.domElement, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 800, height: 600 })
    );

    const gizmo = new ViewportGizmo(camera, renderer, {
      type: "cube",
      container: document.body,
      placement: "top-right",
      size: 128,
      offset: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const domEl = getDomElement(gizmo);
    vi.spyOn(domEl, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 672, y: 0, width: 128, height: 128 })
    );

    gizmo.update(false);

    const vp = getViewport(gizmo);
    expect(vp[0]).toBe(672);
    expect(vp[1]).toBe(0);
    expect(vp[2]).toBe(128);
    expect(vp[3]).toBe(128);

    vi.restoreAllMocks();
  });
});
