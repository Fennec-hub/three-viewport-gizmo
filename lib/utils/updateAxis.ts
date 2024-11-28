import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import { Camera, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils.js";

const axisMap: [
  axis: "x" | "y" | "z",
  positiveIndex: number,
  negativeIndex: number
][] = [
  ["x", 0, 3],
  ["y", 1, 4],
  ["z", 2, 5],
];

const point = /*@__PURE__*/ new Vector3();
export function updateAxis(
  { isSphere }: GizmoOptionsFallback,
  axes: GizmoAxisObject[],
  camera: Camera
): void {
  if (!isSphere) return;

  point.set(0, 0, 1).applyQuaternion(camera.quaternion);

  axisMap.forEach(([axis, positiveIndex, negativeIndex]) => {
    const value = point[axis];

    let object = axes[positiveIndex];
    let opacity = object.userData.opacity;

    object.material.opacity = clamp(value >= 0 ? opacity : opacity / 2, 0, 1);

    object = axes[negativeIndex];
    opacity = object.userData.opacity;

    object.material.opacity = clamp(value >= 0 ? opacity / 2 : opacity, 0, 1);
  });
}
