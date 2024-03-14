import { OrthographicCamera, Sprite } from "three";
import { updatePointer } from "./updatePointer";
import { raycaster } from "../ViewportGizmo";

export function getIntersectionObject(
  event: PointerEvent,
  domRect: DOMRect,
  orthoCamera: OrthographicCamera,
  intersectionObjects: Sprite[]
) {
  updatePointer(event, domRect, orthoCamera);

  const intersects = raycaster.intersectObjects(intersectionObjects);

  if (!intersects.length) return null;

  const intersection = intersects[0];
  return intersection.object as Sprite;
}
