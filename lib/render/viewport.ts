import { Vector4, type Camera, type Scene } from "three";
import type { GizmoViewportArray } from "../types";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";

const _vec4 = /*@__PURE__*/ new Vector4();

/** Writes the renderer viewport covering `rect` (client pixels) to `out`, in the backend's origin convention. */
export function viewportRect(renderer: GizmoRenderer, rect: DOMRect, out: GizmoViewportArray) {
  const canvas = renderer.domElement;
  const canvasRect = canvas.getBoundingClientRect();
  const yFromCanvasTop = rect.top - canvasRect.top;

  // WebGPURenderer (and its WebGL fallback backend) takes a top-left origin;
  // WebGLRenderer passes y to gl.viewport, which is bottom-left. See issue #48.
  out[0] = rect.left - canvasRect.left;
  out[1] = isWebGPURenderer(renderer)
    ? yFromCanvasTop
    : canvas.clientHeight - (yFromCanvasTop + rect.height);
  out[2] = rect.width;
  out[3] = rect.height;
}

/** Copies the renderer's current viewport, and its scissor when scissor test is on. */
export function saveViewport(
  renderer: GizmoRenderer,
  viewport: GizmoViewportArray,
  scissor: GizmoViewportArray
) {
  renderer.getViewport(_vec4).toArray(viewport);
  if (renderer.getScissorTest()) renderer.getScissor(_vec4).toArray(scissor);
}

/**
 * Renders `scene` into `rect` over the existing frame, clearing depth only,
 * then restores the saved viewport, scissor and clear flags.
 */
export function renderInRect(
  renderer: GizmoRenderer,
  scene: Scene,
  camera: Camera,
  rect: GizmoViewportArray,
  viewport: GizmoViewportArray,
  scissor: GizmoViewportArray
) {
  const scissorTest = renderer.getScissorTest();
  const { autoClear, autoClearColor, autoClearDepth, autoClearStencil } = renderer;

  // Clear depth inline with the gizmo render pass instead of via renderer.clear().
  // On the WebGPU common Renderer, renderer.clear() triggers an extra _renderOutput
  // quad pass over the current sub-rect viewport (Renderer.js Renderer.clear), which
  // rewrites the swap chain with a tone-mapped/linearToSRGB sample of the FB MSAA-
  // resolved texture and produces a translucent halo. autoClear*-driven clearing
  // happens inside the single subsequent render pass on both backends.
  renderer.autoClear = true;
  renderer.autoClearColor = false;
  renderer.autoClearDepth = true;
  renderer.autoClearStencil = false;

  renderer.setViewport(...rect);
  if (scissorTest) renderer.setScissor(...rect);

  renderer.render(scene, camera);

  renderer.setViewport(...viewport);
  if (scissorTest) renderer.setScissor(...scissor);

  Object.assign(renderer, { autoClear, autoClearColor, autoClearDepth, autoClearStencil });
}
