import {
  AlwaysDepth,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NeverDepth,
  PlaneGeometry,
  REVISION,
  Vector4,
  type OrthographicCamera,
  type PerspectiveCamera,
  type RenderTarget,
  type Scene,
} from "three";
import type { GizmoViewport } from "../types";
import { meshAttributes, whiteTexture, type Owned } from "../scene/materials";
import { isWebGPURenderer, type GizmoRenderer } from "./backend";
import { targetRect } from "./rect";

/** The gizmo's depth-reset quad, from {@link createDepthReset}. */
export type DepthReset = Mesh<PlaneGeometry, MeshBasicMaterial>;

/**
 * How far toward the internal camera's far plane the reset quad sits, as a fraction of the clip range from `near` to
 * `far`. A fraction of the range, not of `far`: at a narrow field of view the camera is far away (distance 1588 at
 * 0.1°), and 99 % of `far` would put the quad in front of the gizmo and even of the near plane.
 */
const RESET_DEPTH = 0.99;

/** Margin of the quad over the frustum's cross-section at its depth. */
const RESET_COVER = 1.1;

const _viewport = /*@__PURE__*/ new Vector4();
const _scissor = /*@__PURE__*/ new Vector4();
const _targetViewport = /*@__PURE__*/ new Vector4();
const _targetScissor = /*@__PURE__*/ new Vector4();
const _rect = /*@__PURE__*/ new Vector4();

/**
 * Creates the quad that resets depth inside the gizmo's rectangle (P2, F0's mechanism). Drawn first, colour off, depth
 * write on, depth test "always", just inside the internal camera's far plane: inside the rectangle the host's depth is
 * replaced by "far" for the gizmo's own draws, and outside it the scissor keeps every host depth value. A clear cannot
 * do this on WebGPU, whose `depthLoadOp: 'clear'` covers the whole attachment whatever the scissor.
 *
 * Its geometry and material carry `targetMaterial`'s attributes and flags, so on WebGL it draws with the gizmo's
 * one mesh program; on WebGPU the colour and depth state are part of the pipeline, so it adds one pipeline. Both are
 * registered in `owned` and freed with the scene. Add the quad to the gizmo's scene as a sibling of `root`, never
 * under it: {@link renderInRect} places it from the camera each frame.
 *
 * @param owned - The gizmo scene's owned resources; supplies the shared white texture
 * @returns The quad
 */
export function createDepthReset(owned: Owned): DepthReset {
  const geometry = meshAttributes(new PlaneGeometry());
  const material = new MeshBasicMaterial({
    map: whiteTexture(owned),
    vertexColors: true,
    // ponytail: `transparent` as targetMaterial's (WebGL program key `OPAQUE`), so the quad sorts with the gizmo's
    // transparent list; a host `onMaterial` that returns an opaque material draws before the reset.
    transparent: true,
    toneMapped: false,
    colorWrite: false,
    depthWrite: true,
    depthTest: true,
    depthFunc: AlwaysDepth,
  });
  owned.add(geometry).add(material);
  const reset: DepthReset = new Mesh(geometry, material);
  reset.name = "depthReset";
  reset.renderOrder = Number.MIN_SAFE_INTEGER;
  reset.frustumCulled = false;
  reset.matrixAutoUpdate = false;
  return reset;
}

/** three's `ReversedDepthFuncs` maps "always" to "never" before r187 (fixed upstream in r187). */
const SWAPS_ALWAYS = Number.parseInt(REVISION, 10) < 187;

/**
 * Places `reset` just inside `camera`'s far plane, covering its view, and spells "always" for the renderer: before
 * r187 three maps `AlwaysDepth` to `NeverDepth` under a reversed depth buffer (`ReversedDepthFuncs`), so a reversed host
 * on those releases gets `NeverDepth`, which three turns back into "always"; r187 maps "always" to itself (H2).
 * Allocates nothing; follows field-of-view changes (F2).
 */
function placeDepthReset(reset: DepthReset, camera: PerspectiveCamera | OrthographicCamera, renderer: GizmoRenderer) {
  const reversed = isWebGPURenderer(renderer) ? renderer.reversedDepthBuffer : renderer.capabilities.reversedDepthBuffer;
  reset.material.depthFunc = reversed && SWAPS_ALWAYS ? NeverDepth : AlwaysDepth;

  const distance = camera.near + (camera.far - camera.near) * RESET_DEPTH;
  const half =
    "isPerspectiveCamera" in camera
      ? distance * Math.tan(camera.fov * 0.5 * MathUtils.DEG2RAD) * Math.max(camera.aspect, 1)
      : Math.max(Math.abs(camera.left), Math.abs(camera.right), Math.abs(camera.top), Math.abs(camera.bottom)) /
        camera.zoom;
  // Written element by element: doubles passed to a three.js call are boxed, 12 B a frame (perf budget `alloc`).
  const e = reset.matrix.identity().elements;
  e[0] = e[5] = 2 * half * RESET_COVER;
  e[14] = -distance;
  camera.updateMatrixWorld();
  reset.matrix.premultiply(camera.matrixWorld);
  reset.matrixWorldNeedsUpdate = true;
}

/** WebGL applies a target's rectangles when the target is bound; WebGPU reads them at each render. */
function rebindTarget(renderer: GizmoRenderer) {
  if (!isWebGPURenderer(renderer))
    renderer.setRenderTarget(renderer.getRenderTarget(), renderer.getActiveCubeFace(), renderer.getActiveMipmapLevel());
}

/**
 * Draws the gizmo's scene into `rect` over the host's frame (R6, P2, G4, G5). Always scissors the rectangle, clears
 * nothing and resets depth inside it with `reset`, so depth, colour, viewport and scissor outside the rectangle are the
 * host's. Reads the host's viewport, scissor, scissor test and `autoClear` at the call and restores them in `finally`
 * (P12: a host that changes its viewport between frames gets its live one back). When the renderer has a render target,
 * the rectangle is written to that target's `viewport` and `scissor` in its pixels and restored after, so a draw into a
 * host target lands in the right place on both backends with no host code (D15). Allocates nothing.
 *
 * @param renderer - The host renderer
 * @param scene - The gizmo's scene: `root` and `reset` as siblings
 * @param camera - The gizmo's own camera
 * @param rect - The gizmo's rectangle from `measureViewport`
 * @param reset - From {@link createDepthReset}, in `scene`
 */
export function renderInRect(
  renderer: GizmoRenderer,
  scene: Scene,
  camera: PerspectiveCamera | OrthographicCamera,
  rect: GizmoViewport,
  reset: DepthReset
): void {
  const target = renderer.getRenderTarget() as RenderTarget | null;
  const autoClear = renderer.autoClear;
  const scissorTest = renderer.getScissorTest();
  renderer.getViewport(_viewport);
  renderer.getScissor(_scissor);
  const targetScissorTest = target?.scissorTest ?? false;
  if (target) {
    _targetViewport.copy(target.viewport);
    _targetScissor.copy(target.scissor);
  }

  try {
    placeDepthReset(reset, camera, renderer);
    // Nothing is cleared: the reset quad replaces the depth clear, inside the scissor only.
    renderer.autoClear = false;
    // WebGPU reads the scissor test from the canvas even when it draws into a target.
    renderer.setScissorTest(true);
    if (target) {
      targetRect(renderer, rect, target, _rect);
      target.viewport.copy(_rect);
      target.scissor.copy(_rect);
      target.scissorTest = true;
      rebindTarget(renderer);
    } else {
      // Passed as a Vector4 filled field by field: a fractional coordinate passed as a number to a call V8 does not
      // inline is boxed, 12 B each, about 24 B a frame for a gizmo at a subpixel offset (perf budget `alloc`).
      _rect.x = rect.x;
      _rect.y = rect.y;
      _rect.z = rect.width;
      _rect.w = rect.height;
      renderer.setViewport(_rect);
      renderer.setScissor(_rect);
    }
    renderer.render(scene, camera);
  } finally {
    renderer.setViewport(_viewport);
    renderer.setScissor(_scissor);
    renderer.setScissorTest(scissorTest);
    if (target) {
      target.viewport.copy(_targetViewport);
      target.scissor.copy(_targetScissor);
      target.scissorTest = targetScissorTest;
      rebindTarget(renderer);
    }
    renderer.autoClear = autoClear;
  }
}
