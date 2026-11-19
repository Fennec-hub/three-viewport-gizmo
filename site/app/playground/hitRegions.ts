import type { GizmoTargetKind, ViewportGizmo } from "@lib/index";
import type { StageHandle } from "@site/components/stage-runtime";

/** The overlay's colour for each target kind the hit test returns. */
export const HIT_REGION_COLORS: Record<GizmoTargetKind, string> = {
  face: "rgba(59, 130, 246, 0.5)",
  edge: "rgba(245, 158, 11, 0.65)",
  corner: "rgba(217, 70, 239, 0.7)",
};

/** CSS pixels between samples. */
const STEP = 2;
/**
 * A redraw waits until changes pause this long (ms), and never longer than `MAX_WAIT` after the first change: a full
 * sample is about 4,000 probes, tens of milliseconds, so it never runs per frame.
 */
const DEBOUNCE = 100;
const MAX_WAIT = 500;

let sampling = false;

/**
 * The real pointer's last position and the element under it, from trusted events since this module loaded (with the
 * playground, before any stage mounts), so an overlay enabled under a still mouse knows where to put the hover back.
 * Null before the first move and after the pointer leaves the window.
 */
let lastPointer: { x: number; y: number; target: EventTarget | null; touch: boolean } | null = null;
if (typeof document !== "undefined") {
  const track = (e: PointerEvent) => {
    if (e.isTrusted) lastPointer = { x: e.clientX, y: e.clientY, target: e.target, touch: e.pointerType === "touch" };
  };
  document.addEventListener("pointermove", track, { capture: true, passive: true });
  document.addEventListener("pointerdown", track, { capture: true, passive: true });
  document.addEventListener(
    "pointerout",
    (e) => {
      if (e.isTrusted && e.relatedTarget === null) lastPointer = null;
    },
    { capture: true, passive: true }
  );
}

/** True while the overlay is sampling: the gizmo's `hoverchange` events then come from its probes, not the user. */
export const isSamplingHitRegions = () => sampling;

export type HitRegions = {
  /** Redraws once changes pause (debounced, with a maximum wait). */
  schedule(): void;
  dispose(): void;
};

/**
 * Overlays the gizmo element with a map of the target kind its hit test returns under each point.
 *
 * The library has no public "target at a point" query, so this probes through public behaviour only: it dispatches a
 * synthetic mouse `pointermove` at each grid point of the gizmo's element and reads the public `gizmo.hovered`, then
 * restores the real hover in the same task (a move to where the real mouse is, or a `pointerleave`). No frame renders
 * in between, a move never presses or turns, and sampling waits while a press is held.
 *
 * @param stage - The running stage; its container receives the overlay canvas
 * @returns Controls to redraw and to remove the overlay
 */
export function attachHitRegions(stage: StageHandle, onSampled?: () => void): HitRegions {
  const gizmo = stage.gizmo;
  if (!gizmo) return { schedule() {}, dispose() {} };
  const element = gizmo.domElement;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.hitRegions = "";
  // Inline sizes override the stage's `canvas { width: 100% }` rule.
  Object.assign(canvas.style, { position: "absolute", pointerEvents: "none", display: "block" });
  stage.container.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  let pressed = false;
  const onDown = (e: PointerEvent) => {
    if (e.isTrusted) pressed = true;
  };
  const onUp = (e: PointerEvent) => {
    if (e.isTrusted) pressed = false;
  };
  element.addEventListener("pointerdown", onDown);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  let timer: ReturnType<typeof setTimeout> | undefined;
  /** When the first change since the last redraw came in, or null when none is pending. */
  let pendingSince: number | null = null;
  let disposed = false;

  const draw = () => {
    timer = undefined;
    pendingSince = null;
    if (disposed) return;
    // Never probe under a press: a move would become a drag. Try again once it is released.
    if (pressed || gizmo.dragging || !gizmo.enabled) return schedule();

    const rect = element.getBoundingClientRect();
    const host = stage.container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    Object.assign(canvas.style, {
      left: `${rect.left - host.left}px`,
      top: `${rect.top - host.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    sampling = true;
    try {
      for (let y = 0; y < rect.height; y += STEP) {
        for (let x = 0; x < rect.width; x += STEP) {
          const kind = probe(gizmo, rect.left + x + STEP / 2, rect.top + y + STEP / 2);
          if (!kind) continue;
          ctx.fillStyle = HIT_REGION_COLORS[kind];
          ctx.fillRect(x, y, STEP, STEP);
        }
      }
    } finally {
      // Put the hover back as the user left it, inside the same task: a move where the real mouse is when the element
      // last heard it (its own listener would have), else a leave, since the pointer is outside or never moved.
      const real = lastPointer;
      const over = real && !real.touch && real.target instanceof Node && element.contains(real.target);
      if (over) probe(gizmo, real.x, real.y);
      else element.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse", isPrimary: true }));
      sampling = false;
    }
    // The probes' hover events are filtered out; the restored hover is the user's and goes out now.
    onSampled?.();
  };

  const schedule = () => {
    if (disposed) return;
    const now = performance.now();
    pendingSince ??= now;
    clearTimeout(timer);
    timer = setTimeout(draw, Math.max(0, Math.min(DEBOUNCE, pendingSince + MAX_WAIT - now)));
  };

  const stopView = stage.onViewChange(schedule);
  const observer = new ResizeObserver(schedule);
  observer.observe(stage.container);
  observer.observe(element);
  schedule();

  return {
    schedule,
    dispose() {
      disposed = true;
      clearTimeout(timer);
      stopView();
      observer.disconnect();
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      canvas.remove();
    },
  };
}

/** The kind the gizmo hovers after a synthetic mouse move to a client point. */
function probe(gizmo: ViewportGizmo, clientX: number, clientY: number): GizmoTargetKind | null {
  gizmo.domElement.dispatchEvent(
    new PointerEvent("pointermove", { clientX, clientY, pointerType: "mouse", isPrimary: true })
  );
  return gizmo.hovered?.kind ?? null;
}
