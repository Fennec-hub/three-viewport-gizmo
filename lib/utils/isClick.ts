import { Vector2 } from "three";

export const isClick = (
  e: PointerEvent,
  startCoords: Vector2,
  threshold: number = 10
) =>
  Math.abs(e.clientX - startCoords.x) < threshold &&
  Math.abs(e.clientY - startCoords.y) < threshold;
