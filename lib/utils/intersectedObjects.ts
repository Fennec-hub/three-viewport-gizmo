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

  // If we have intersections, apply smart sorting that respects both
  // distance (occlusion) and intersectionOrder
  if (intersects.length > 0) {
    // First, sort by distance (default behavior from raycaster)
    intersects.sort((a, b) => a.distance - b.distance);

    // Distance threshold for considering objects at similar depth
    // Objects within this threshold of the closest hit will be 
    // considered at the same depth and sorted by intersectionOrder instead
    const DISTANCE_THRESHOLD = 0.2;

    // Get the distance of the closest hit
    const closestDistance = intersects[0].distance;

    // Find all intersections within the threshold of the closest hit
    const nearHits = intersects.filter(
      hit => hit.distance <= closestDistance + DISTANCE_THRESHOLD
    );

    // If we have multiple hits at similar distance, sort them by intersectionOrder
    if (nearHits.length > 1) {
      nearHits.sort((a, b) => {
        return (b.object.userData.intersectionOrder || 0) - (a.object.userData.intersectionOrder || 0);
      });

      // Put the highest intersectionOrder object that's within the threshold at the beginning
      intersects.splice(0, nearHits.length, ...nearHits);
    }
  }

  const intersection = intersects.length ? intersects[0] : null;

  return !intersection || !intersection.object.visible ? null : intersection;
};
