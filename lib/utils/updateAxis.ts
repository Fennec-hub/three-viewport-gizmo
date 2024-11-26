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
const primaryOpacity = 1;
const secondaryOpacity = 0.5;

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

    axes[positiveIndex].material.opacity = clamp(
      value >= 0 ? primaryOpacity : secondaryOpacity,
      0,
      1
    );

    axes[negativeIndex].material.opacity = clamp(
      value >= 0 ? secondaryOpacity : primaryOpacity,
      0,
      1
    );
  });
}
