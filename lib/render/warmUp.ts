import type { Camera, Scene } from "three";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";

/**
 * Compiles the gizmo's own scene with its own camera for the renderer's current render target (P6), so the
 * first `render()` builds no program (WebGL) or pipeline (WebGPU). Both backends' `compileAsync` read the
 * current render target, so a host that warms up while its target is bound gets programs for that target.
 *
 * @param renderer - The host renderer
 * @param scene - The gizmo's scene, holding its root
 * @param camera - The gizmo's own camera
 * @returns Resolves when every program or pipeline is ready
 */
export const warmUp = async (renderer: GizmoRenderer, scene: Scene, camera: Camera): Promise<void> => {
  // Without KHR_parallel_shader_compile (SwiftShader, some phones) WebGL's compileAsync logs "extension not
  // supported" and compiles synchronously anyway, so compile synchronously and log nothing.
  if (!isWebGPURenderer(renderer) && !renderer.extensions.has("KHR_parallel_shader_compile")) {
    renderer.compile(scene, camera);
    return;
  }
  await renderer.compileAsync(scene, camera);
};
