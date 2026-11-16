import type { RenderTarget, Vector4 } from "three";
import type { GizmoViewport } from "../types";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";

/** The gizmo's rectangle, written in place by {@link measureViewport}; the class exposes it as `viewport`. */
export type MutableViewport = { -readonly [Key in keyof GizmoViewport]: GizmoViewport[Key] };

/**
 * Measures `element` against the renderer's canvas and writes the rectangle in CSS pixels, in the renderer's
 * `setViewport` convention: y from the top on `WebGPURenderer`, from the bottom on `WebGLRenderer` (issue #48). Call it
 * at render, so the rectangle follows layout without a `domUpdate()` (R6). Writes into `out` and keeps nothing else.
 *
 * @param renderer - The host renderer, whose canvas the rectangle is relative to
 * @param element - The gizmo's element
 * @param out - Receives the rectangle
 * @returns `out`
 */
export function measureViewport(renderer: GizmoRenderer, element: HTMLElement, out: MutableViewport): MutableViewport {
  const canvas = renderer.domElement;
  const rect = element.getBoundingClientRect();
  const canvasRect = canvas.getBoundingClientRect();
  const top = rect.top - canvasRect.top;
  out.x = rect.left - canvasRect.left;
  out.y = isWebGPURenderer(renderer) ? top : canvas.clientHeight - (top + rect.height);
  out.width = rect.width;
  out.height = rect.height;
  return out;
}

/**
 * The gizmo's rectangle on a host render target, in the target's pixels: `rect` scaled from the canvas's CSS size to
 * the target's size, so a target the size of the drawing buffer gets `rect × pixelRatio` (D15). Both backends keep their
 * canvas origin on a target (bottom-left on WebGL, top-left on WebGPU), so only the scale changes.
 *
 * @param renderer - The host renderer
 * @param rect - From {@link measureViewport}
 * @param target - The renderer's current render target
 * @param out - Receives `x, y, width, height` as `x, y, z, w`
 * @returns `out`
 */
export function targetRect(renderer: GizmoRenderer, rect: GizmoViewport, target: RenderTarget, out: Vector4): Vector4 {
  const canvas = renderer.domElement;
  // ponytail: a canvas with no CSS size (detached, display: none) maps 1:1; such a host sees no gizmo anyway.
  const sx = canvas.clientWidth ? target.width / canvas.clientWidth : 1;
  const sy = canvas.clientHeight ? target.height / canvas.clientHeight : 1;
  return out.set(rect.x * sx, rect.y * sy, rect.width * sx, rect.height * sy);
}
