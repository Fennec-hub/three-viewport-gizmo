import { Vector2 } from "three";
import { isClick } from "./isClick";

export type PointerSessionHandlers = {
  /** Pointer travel since the press, in pixels, once it has left the click threshold. */
  drag: (dx: number, dy: number) => void;
  /** Released without leaving the click threshold. */
  click: () => void;
  /** Released after a drag. */
  dragEnd: () => void;
};

/**
 * Follows one press on the document until the pointer is released.
 *
 * @returns A function that stops listening without calling a handler
 */
export function pointerSession(press: PointerEvent, handlers: PointerSessionHandlers): () => void {
  const start = new Vector2(press.clientX, press.clientY);
  let dragging = false;

  const move = (e: PointerEvent) => {
    if (!dragging) {
      if (isClick(e, start)) return;
      dragging = true;
    }
    handlers.drag(e.clientX - start.x, e.clientY - start.y);
  };

  const stop = () => {
    document.removeEventListener("pointermove", move, false);
    document.removeEventListener("pointerup", release, false);
  };

  const release = () => {
    stop();
    if (dragging) handlers.dragEnd();
    else handlers.click();
  };

  document.addEventListener("pointermove", move, false);
  document.addEventListener("pointerup", release, false);

  return stop;
}
