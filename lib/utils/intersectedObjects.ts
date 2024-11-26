import { GizmoAxisObject } from "@lib/types";
import {
  Vector2,
  Raycaster,
  type Object3D,
  type Camera,
  Intersection,
} from "three";

const _raycaster = /*@__PURE__*/ new Raycaster();
const _mouse = /*@__PURE__*/ new Vector2();

export const intersectedObjects = (
  event: PointerEvent,
  domRect: DOMRect,
  camera: Camera,
  intersections: Object3D[]
): Intersection<GizmoAxisObject> | null => {
  _mouse.set(
    ((event.clientX - domRect.left) / domRect.width) * 2 - 1,
    -((event.clientY - domRect.top) / domRect.height) * 2 + 1
  );

  _raycaster.setFromCamera(_mouse, camera);

  const intersects = _raycaster.intersectObjects<GizmoAxisObject>(
    intersections,
    false
  );

  return intersects.length ? intersects[0] : null;
};
