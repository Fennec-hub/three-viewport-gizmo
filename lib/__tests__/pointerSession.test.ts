import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachPointer, forwardWheel, type PointerHandlers, type PointerInput } from "../interaction/pointerSession";

type PointerInit = {
  pointerId?: number;
  pointerType?: "mouse" | "pen" | "touch";
  isPrimary?: boolean;
  button?: number;
  x?: number;
  y?: number;
  timeStamp?: number;
};

// jsdom has no PointerEvent: a MouseEvent with the pointer fields defined on it.
const pointer = (type: string, init: PointerInit = {}) => {
  const { pointerId = 1, pointerType = "mouse", isPrimary = true, button = 0, x = 20, y = 20, timeStamp } = init;
  const e = new MouseEvent(type, { clientX: x, clientY: y, button, bubbles: true, cancelable: true });
  Object.defineProperties(e, {
    pointerId: { value: pointerId },
    pointerType: { value: pointerType },
    isPrimary: { value: isPrimary },
    ...(timeStamp === undefined ? {} : { timeStamp: { value: timeStamp } }),
  });
  return e as PointerEvent;
};

const rectAt = (left: number, top: number) => ({ left, top, width: 100, height: 100 }) as DOMRect;

describe("attachPointer", () => {
  let element: HTMLElement;
  let input: PointerInput;
  let captured: Set<number>;
  let top: number;
  let handlers: { [K in keyof PointerHandlers]: ReturnType<typeof vi.fn> };

  const fire = (type: string, init?: PointerInit) => {
    const e = pointer(type, init);
    element.dispatchEvent(e);
    return e;
  };

  beforeEach(() => {
    element = document.createElement("div");
    document.body.appendChild(element);
    captured = new Set();
    top = 0;
    element.setPointerCapture = (id) => void captured.add(id);
    element.releasePointerCapture = (id) => void captured.delete(id);
    element.hasPointerCapture = (id) => captured.has(id);
    element.getBoundingClientRect = () => rectAt(0, top);
    handlers = {
      press: vi.fn(() => true),
      drag: vi.fn(),
      dragEnd: vi.fn(),
      click: vi.fn(),
      cancel: vi.fn(),
      hover: vi.fn(),
    };
    input = attachPointer(element, handlers as unknown as PointerHandlers);
  });

  afterEach(() => {
    input.detach();
    element.remove();
  });

  describe("press", () => {
    it("should capture the primary pointer and prevent its default", () => {
      const e = fire("pointerdown");
      expect(handlers.press).toHaveBeenCalledTimes(1);
      expect(e.defaultPrevented).toBe(true);
      expect([...captured]).toEqual([1]);
    });

    it("should do nothing for a right button, leaving the context menu alone", () => {
      const e = fire("pointerdown", { button: 2 });
      fire("pointermove", { button: 2, x: 80 });
      fire("pointerup", { button: 2, x: 80 });
      expect(e.defaultPrevented).toBe(false);
      expect(handlers.press).not.toHaveBeenCalled();
      expect(handlers.drag).not.toHaveBeenCalled();
      expect(handlers.click).not.toHaveBeenCalled();
    });

    it("should ignore a second finger's press, move and release", () => {
      fire("pointerdown", { pointerType: "touch", pointerId: 1 });
      fire("pointerdown", { pointerType: "touch", pointerId: 2, isPrimary: false, x: 300 });
      fire("pointermove", { pointerType: "touch", pointerId: 2, x: 400 });
      fire("pointerup", { pointerType: "touch", pointerId: 2, x: 400 });
      expect(handlers.press).toHaveBeenCalledTimes(1);
      expect(handlers.drag).not.toHaveBeenCalled();
      expect(handlers.click).not.toHaveBeenCalled();
      expect(captured).toEqual(new Set([1]));
    });

    it("should ignore a primary press of another device while one is held", () => {
      fire("pointerdown", { pointerType: "touch", pointerId: 1 });
      fire("pointerdown", { pointerType: "mouse", pointerId: 7 });
      expect(handlers.press).toHaveBeenCalledTimes(1);
    });

    it("should neither capture nor prevent default when the press is refused", () => {
      handlers.press.mockReturnValue(false);
      const e = fire("pointerdown");
      fire("pointermove", { x: 80 });
      expect(e.defaultPrevented).toBe(false);
      expect(captured.size).toBe(0);
      expect(handlers.drag).not.toHaveBeenCalled();
    });

    it("should measure the rectangle at the press, so a scroll before it does not shift the hit", () => {
      top = 0;
      fire("pointermove");
      top = -250; // the page scrolled by 250 px with no resize and no domUpdate()
      fire("pointerdown");
      fire("pointerup");
      expect(handlers.press.mock.calls[0][0].rect.top).toBe(-250);
      expect(handlers.click.mock.calls[0][0].rect.top).toBe(-250);
    });
  });

  describe("drag and click", () => {
    it("should report travel from the press once past the slop, then end the drag", () => {
      fire("pointerdown", { x: 20, y: 20 });
      fire("pointermove", { x: 25, y: 20 });
      fire("pointermove", { x: 40, y: 10 });
      fire("pointerup", { x: 40, y: 10 });
      expect(handlers.drag.mock.calls).toEqual([[20, -10]]);
      expect(handlers.dragEnd).toHaveBeenCalledTimes(1);
      expect(handlers.click).not.toHaveBeenCalled();
    });

    it("should click with the press and its rectangle when released within the slop", () => {
      const down = fire("pointerdown", { x: 20, y: 20 });
      fire("pointerup", { x: 24, y: 22 });
      expect(handlers.click).toHaveBeenCalledWith({ event: down, rect: rectAt(0, 0) }, false);
    });

    it("should accept a new press after the release", () => {
      fire("pointerdown");
      fire("pointerup");
      fire("pointerdown", { pointerId: 2 });
      expect(handlers.press).toHaveBeenCalledTimes(2);
    });
  });

  describe("double-click", () => {
    const clickAt = (timeStamp: number, x: number) => {
      fire("pointerdown", { timeStamp, x });
      fire("pointerup", { timeStamp: timeStamp + 50, x });
    };

    it("should mark a second click on the same spot within 400 ms, then start over", () => {
      clickAt(1000, 20);
      clickAt(1200, 22);
      clickAt(1300, 22);
      expect(handlers.click.mock.calls.map((c) => c[1])).toEqual([false, true, false]);
    });

    it("should not mark a quick second click on another spot", () => {
      clickAt(1000, 20);
      clickAt(1100, 60);
      expect(handlers.click.mock.calls.map((c) => c[1])).toEqual([false, false]);
    });

    it("should not pair two clicks across a drag", () => {
      clickAt(1000, 20);
      fire("pointerdown", { timeStamp: 1050, x: 20 });
      fire("pointermove", { x: 60 });
      fire("pointerup", { x: 60 });
      clickAt(1100, 20);
      expect(handlers.click.mock.calls.map((c) => c[1])).toEqual([false, false]);
    });
  });

  describe("cancel", () => {
    it("should end a cancelled touch with cancel and accept the next press", () => {
      fire("pointerdown", { pointerType: "touch" });
      fire("pointermove", { pointerType: "touch", x: 60 });
      fire("pointercancel", { pointerType: "touch", x: 60 });
      fire("pointerup", { pointerType: "touch", x: 60 });
      expect(handlers.cancel).toHaveBeenCalledTimes(1);
      expect(handlers.dragEnd).not.toHaveBeenCalled();
      expect(handlers.click).not.toHaveBeenCalled();
      fire("pointerdown", { pointerType: "touch", pointerId: 2 });
      expect(handlers.press).toHaveBeenCalledTimes(2);
    });

    it("should cancel when the capture is lost without a release", () => {
      fire("pointerdown");
      fire("lostpointercapture");
      expect(handlers.cancel).toHaveBeenCalledTimes(1);
    });

    it("should not cancel on the capture loss that follows a release", () => {
      fire("pointerdown");
      fire("pointerup");
      fire("lostpointercapture");
      expect(handlers.cancel).not.toHaveBeenCalled();
    });

    it("should drop a held press silently on release()", () => {
      fire("pointerdown");
      expect(input.release()).toBe(true);
      fire("pointermove", { x: 80 });
      fire("pointerup", { x: 80 });
      expect(captured.size).toBe(0);
      expect(handlers.drag).not.toHaveBeenCalled();
      expect(handlers.cancel).not.toHaveBeenCalled();
      expect(input.release()).toBe(false);
    });
  });

  describe("hover", () => {
    it("should hover a mouse and a pen with a rectangle measured at the move", () => {
      fire("pointermove");
      top = 30;
      fire("pointermove", { pointerType: "pen" });
      expect(handlers.hover.mock.calls.map((c) => c[1].top)).toEqual([0, 30]);
    });

    it("should never hover for touch", () => {
      fire("pointermove", { pointerType: "touch" });
      fire("pointerleave", { pointerType: "touch" });
      expect(handlers.hover).not.toHaveBeenCalled();
    });

    it("should not hover while a press is held", () => {
      fire("pointerdown");
      fire("pointermove", { x: 21 });
      fire("pointermove", { pointerId: 9, x: 21 });
      expect(handlers.hover).not.toHaveBeenCalled();
    });

    it("should report a mouse leaving with null", () => {
      fire("pointerleave");
      expect(handlers.hover).toHaveBeenCalledWith(null, rectAt(0, 0));
    });
  });

  it("should stop listening after detach", () => {
    input.detach();
    fire("pointerdown");
    fire("pointermove");
    expect(handlers.press).not.toHaveBeenCalled();
    expect(handlers.hover).not.toHaveBeenCalled();
  });
});

describe("forwardWheel", () => {
  it("should hand the wheel to the canvas and take the original when the canvas takes the copy", () => {
    const canvas = document.createElement("canvas");
    const element = document.createElement("div");
    document.body.append(canvas, element);
    const heard: WheelEvent[] = [];
    canvas.addEventListener("wheel", (e) => {
      heard.push(e);
      e.preventDefault();
    });
    const stop = forwardWheel(element, canvas);

    const e = new WheelEvent("wheel", { deltaY: 120, clientX: 30, clientY: 40, cancelable: true, bubbles: true });
    element.dispatchEvent(e);

    expect(heard.map((w) => [w.deltaY, w.clientX, w.clientY])).toEqual([[120, 30, 40]]);
    expect(e.defaultPrevented).toBe(true);

    stop();
    element.dispatchEvent(new WheelEvent("wheel", { deltaY: 1 }));
    expect(heard).toHaveLength(1);
    canvas.remove();
    element.remove();
  });

  it("should forward nothing when the wheel already bubbles to the target", () => {
    const parent = document.createElement("div");
    const element = parent.appendChild(document.createElement("div"));
    const heard = vi.fn();
    parent.addEventListener("wheel", heard);
    forwardWheel(element, parent);
    element.dispatchEvent(new WheelEvent("wheel", { bubbles: true }));
    expect(heard).toHaveBeenCalledTimes(1);
  });
});
