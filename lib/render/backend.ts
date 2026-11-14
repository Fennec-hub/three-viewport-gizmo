import type { WebGLRenderer } from "three";
import type { WebGPURenderer } from "three/webgpu";

export type GizmoRenderer = WebGLRenderer | WebGPURenderer;

/**
 * Whether `renderer` is a `WebGPURenderer` (including its WebGL fallback backend):
 * it takes a top-left viewport origin and node materials.
 */
export const isWebGPURenderer = (renderer: GizmoRenderer): renderer is WebGPURenderer =>
  (renderer as { isWebGPURenderer?: boolean }).isWebGPURenderer === true;
