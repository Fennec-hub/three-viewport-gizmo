import { vi } from "vitest";
import type { WebGLRenderer } from "three";
import { PerspectiveCamera, REVISION, Vector3, Vector4 } from "three";
import type { GizmoOptions } from "../index.js";
import { ViewportGizmo } from "../ViewportGizmo.js";

export type StubRendererOptions = {
  readonly isWebGPURenderer?: boolean;
};

/** Minimal renderer stub — never performs GL / WebGPU initialization. */
export function createStubRenderer(options: StubRendererOptions = {}): WebGLRenderer {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 600;
  Object.defineProperty(canvas, "clientWidth", { value: 800, configurable: true, enumerable: true });
  Object.defineProperty(canvas, "clientHeight", { value: 600, configurable: true, enumerable: true });

  const stub = {
    domElement: canvas,
    isWebGPURenderer: options.isWebGPURenderer === true,
    autoClear: true,
    autoClearColor: true,
    autoClearDepth: true,
    autoClearStencil: true,
    getViewport: (target: Vector4): Vector4 => target.set(0, 0, 800, 600),
    getScissorTest: (): boolean => false,
    setScissorTest: (): void => {},
    getRenderTarget: (): null => null,
    capabilities: { reversedDepthBuffer: false },
    getScissor: (target: Vector4): Vector4 => target.set(0, 0, 800, 600),
    setViewport: (): void => {},
    setScissor: (): void => {},
    clear: (): void => {},
    render: (): void => {},
    compileAsync: async (): Promise<void> => {},
    compile: (): void => {},
    extensions: { has: (): boolean => true },
  };
  return stub as unknown as WebGLRenderer;
}

export type CreateGizmoOptions = {
  /** `camera.up`, and so the label up unless the options set one. Default +Y. */
  readonly up?: Vector3;
  readonly cameraPosition: Vector3;
  readonly gizmoOptions?: GizmoOptions;
};

/** A gizmo on a stub renderer in a fresh container; the caller disposes it. */
export function createGizmo({ up = new Vector3(0, 1, 0), cameraPosition, gizmoOptions = { type: "cube" } }: CreateGizmoOptions) {
  const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
  camera.up.copy(up);
  camera.position.copy(cameraPosition);
  camera.lookAt(0, 0, 0);
  const container = document.createElement("div");
  document.body.appendChild(container);
  return new ViewportGizmo(camera, createStubRenderer(), { container, ...gizmoOptions });
}

/** The rectangle every mounted gizmo element measures as: a 128 px square at the page origin. */
export const RECT = DOMRect.fromRect({ x: 0, y: 0, width: 128, height: 128 });

/**
 * Creates a gizmo whose element measures as {@link RECT} and takes pointer capture, as jsdom's does not.
 *
 * @returns The gizmo and its element
 */
export function mountGizmo(options: CreateGizmoOptions) {
  const gizmo = createGizmo(options);
  const element = gizmo.domElement;
  const captured = new Set<number>();
  element.getBoundingClientRect = () => RECT;
  element.setPointerCapture = (id) => void captured.add(id);
  element.releasePointerCapture = (id) => void captured.delete(id);
  element.hasPointerCapture = (id) => captured.has(id);
  return { gizmo, element };
}

export type PointerInit = {
  pointerId?: number;
  pointerType?: "mouse" | "pen" | "touch";
  button?: number;
  x?: number;
  y?: number;
  timeStamp?: number;
};

/** A pointer event; jsdom has no `PointerEvent`, so a `MouseEvent` with the pointer fields defined on it. */
export function pointer(type: string, init: PointerInit = {}): PointerEvent {
  const { pointerId = 1, pointerType = "mouse", button = 0, x = 64, y = 64, timeStamp } = init;
  const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, cancelable: true });
  Object.defineProperties(e, {
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
    isPrimary: { value: true },
    ...(timeStamp === undefined ? {} : { timeStamp: { value: timeStamp } }),
  });
  return e as PointerEvent;
}

/** Fires a pointer event at `element`. */
export const fire = (element: HTMLElement, type: string, init?: PointerInit) => element.dispatchEvent(pointer(type, init));

/** One frame of an animated view change, at 60 frames per second. */
export const FRAME_MS = 1000 / 60;

/**
 * Renders `gizmo` once per frame, `FRAME_MS` apart on a mocked `performance.now` that starts at `startMs`, until its
 * view change ends.
 *
 * @returns The number of frames rendered
 */
export function runFlight(gizmo: ViewportGizmo, onFrame?: (frame: number) => void, startMs = 0): number {
  let now = startMs;
  const spy = vi.spyOn(performance, "now").mockImplementation(() => now);
  let frame = 0;
  for (; gizmo.animating && frame < 600; frame++) {
    gizmo.render();
    onFrame?.(frame);
    now += FRAME_MS;
  }
  spy.mockRestore();
  return frame;
}

/** OrbitControls exposes its cached up from three 0.168 (R16); below it roll with OrbitControls is refused. */
export const ORBIT_TAKES_UP = Number(REVISION) >= 168;
