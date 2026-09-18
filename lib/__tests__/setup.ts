import { vi } from "vitest";

const noop = vi.fn();

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  arcTo: noop,
  beginPath: noop,
  closePath: noop,
  fill: noop,
  fillText: noop,
  lineTo: noop,
  measureText: (text: string) => ({
    fontBoundingBoxDescent: 10,
    width: text.length * 10,
  }),
  moveTo: noop,
  stroke: noop,
})) as typeof HTMLCanvasElement.prototype.getContext;
