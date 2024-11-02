import { OrthographicCamera, Sprite, Vector2, Raycaster } from "three";

const _raycaster = /*@__PURE__*/ new Raycaster();
const _mouse = /*@__PURE__*/ new Vector2();

export function getIntersectionObject(
  event: PointerEvent,
  domRect: DOMRect,
  orthoCamera: OrthographicCamera,
  intersectionObjects: Sprite[]
) {
  _mouse.x = ((event.clientX - domRect.left) / domRect.width) * 2 - 1;
  _mouse.y = -((event.clientY - domRect.top) / domRect.height) * 2 + 1;

  _raycaster.setFromCamera(_mouse, orthoCamera);

  const intersects = _raycaster.intersectObjects(intersectionObjects);

  if (!intersects.length) return null;

  const intersection = intersects[0];
  return intersection.object as Sprite;
}
