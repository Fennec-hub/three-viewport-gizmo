import { classifyClick, isClick, noClick, type ClickMark } from "./isClick";

/** An accepted press: the event and the element's rectangle measured at that press (R5, I6). */
export type PointerPress = Readonly<{ event: PointerEvent; rect: DOMRect }>;

/** What the gizmo does with its element's pointer input. Every handler runs synchronously inside the DOM event. */
export type PointerHandlers = {
  /**
   * A primary-button press of the primary pointer while no press is held. Return false to refuse it (the gizmo is
   * disabled): nothing is captured and the browser's default runs. A flight is no reason to refuse: stop it where
   * it is and return true, so the press grabs the view (R5).
   */
  press: (press: PointerPress) => boolean;
  /** Travel since the press in CSS pixels, from the first move that leaves the click slop. */
  drag: (dx: number, dy: number) => void;
  /** Released after a drag. */
  dragEnd: () => void;
  /**
   * Released within the slop. `double` is true for a double-click's second click (ruling 3): reset the up axis,
   * and never turn to the opposite target.
   */
  click: (press: PointerPress, double: boolean) => void;
  /** The browser cancelled the held pointer, or its capture was lost without a release: end with `cancelled`. */
  cancel: () => void;
  /**
   * A mouse or pen over the element with no press held, with a rectangle measured now, or null when it leaves.
   * Never for touch (R18, I7).
   */
  hover: (event: PointerEvent | null, rect: DOMRect) => void;
};

/** The pointer input attached to one element. */
export type PointerInput = {
  /** Drops the held press, if any, without calling a handler, and releases its capture. Returns whether one was held. */
  release: () => boolean;
  /** Releases any held press and removes every listener. */
  detach: () => void;
};

/**
 * Follows the gizmo element's pointer input: one captured pointer at a time, primary button only, `pointercancel`
 * heard, the rectangle measured at each press, hover only for mouse and pen, and double-clicks classified.
 *
 * @param element - The gizmo's element; it should carry `touch-action: none` (E1)
 * @param handlers - What to do on each step
 * @returns Controls for the held press and the listeners
 */
export function attachPointer(element: HTMLElement, handlers: PointerHandlers): PointerInput {
  let held: { press: PointerPress; dragging: boolean } | null = null;
  let lastClick: ClickMark = noClick;

  const ours = (e: PointerEvent) => held !== null && e.pointerId === held.press.event.pointerId;

  const end = () => {
    const press = held!.press;
    held = null;
    return press;
  };

  const down = (e: PointerEvent) => {
    // A second finger, a second device and every non-primary button are refused while or before anything is held.
    if (held || !e.isPrimary || e.button !== 0) return;
    const press = { event: e, rect: element.getBoundingClientRect() };
    if (!handlers.press(press)) return;
    e.preventDefault();
    element.setPointerCapture(e.pointerId);
    held = { press, dragging: false };
  };

  const move = (e: PointerEvent) => {
    if (!held) {
      if (e.pointerType !== "touch") handlers.hover(e, element.getBoundingClientRect());
      return;
    }
    if (!ours(e)) return;
    const start = held.press.event;
    if (!held.dragging) {
      if (isClick(e, { x: start.clientX, y: start.clientY })) return;
      held.dragging = true;
    }
    handlers.drag(e.clientX - start.clientX, e.clientY - start.clientY);
  };

  const up = (e: PointerEvent) => {
    if (!ours(e)) return;
    const dragging = held!.dragging;
    const press = end();
    if (dragging) {
      lastClick = noClick;
      handlers.dragEnd();
      return;
    }
    const { event } = press;
    const { double, next } = classifyClick(lastClick, { at: event.timeStamp, x: event.clientX, y: event.clientY });
    lastClick = next;
    handlers.click(press, double);
  };

  const cancel = (e: PointerEvent) => {
    if (!ours(e)) return;
    end();
    lastClick = noClick;
    handlers.cancel();
  };

  const leave = (e: PointerEvent) => {
    if (!held && e.pointerType !== "touch") handlers.hover(null, element.getBoundingClientRect());
  };

  const release = () => {
    if (!held) return false;
    const { pointerId } = end().event;
    if (element.hasPointerCapture(pointerId)) element.releasePointerCapture(pointerId);
    return true;
  };

  const listeners = {
    pointerdown: down,
    pointermove: move,
    pointerup: up,
    pointercancel: cancel,
    lostpointercapture: cancel,
    pointerleave: leave,
  } as const;

  for (const [type, listener] of Object.entries(listeners)) element.addEventListener(type, listener as EventListener);

  return {
    release,
    detach: () => {
      release();
      for (const [type, listener] of Object.entries(listeners))
        element.removeEventListener(type, listener as EventListener);
    },
  };
}

/**
 * Forwards a wheel over the gizmo element to the host's canvas, which the element covers and which therefore never
 * hears it (S R27, I8). The host's controls on that canvas zoom as if the gizmo were not there; when they take the
 * wheel (`preventDefault`), the original is taken too, so the page does not scroll. Nothing is forwarded when the
 * target already contains the element, since the wheel bubbles there on its own.
 *
 * @param element - The gizmo's element
 * @param target - The host's canvas, usually `renderer.domElement`
 * @returns A function that stops forwarding
 */
export function forwardWheel(element: HTMLElement, target: Element): () => void {
  if (target.contains(element)) return () => {};
  const wheel = (e: WheelEvent) => {
    const copy = new WheelEvent(e.type, e);
    target.dispatchEvent(copy);
    if (copy.defaultPrevented) e.preventDefault();
  };
  element.addEventListener("wheel", wheel, { passive: false });
  return () => element.removeEventListener("wheel", wheel);
}
