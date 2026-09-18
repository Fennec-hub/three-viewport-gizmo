import type { GizmoAxisObjectUserData } from "@lib/types";
import type { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import { Camera, MathUtils, Vector3 } from "three";

const { clamp } = MathUtils;

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

function applySphereDepthFade(
  object: GizmoAxisObject,
  baseOpacity: number
): void {
  const { idleMaterial, hoverMaterial, hover, opacity } =
    object.userData as GizmoAxisObjectUserData & {
      opacity: number;
      hover: { opacity: number };
    };

  if (!idleMaterial || !hoverMaterial) {
    object.material.opacity = baseOpacity;
    return;
  }

  idleMaterial.opacity = baseOpacity;
  const denom = opacity > 0 ? opacity : 1;
  const hoverOpacity = clamp(
    baseOpacity * (hover.opacity / denom),
    0,
    1
  );
  hoverMaterial.opacity = hoverOpacity;
}

export function updateAxis(
  { isSphere }: GizmoOptionsFallback,
  axes: GizmoAxisObject[],
  camera: Camera
): void {
  if (!isSphere) return;

  point.set(0, 0, 1).applyQuaternion(camera.quaternion);

  axisMap.forEach(([axis, positiveIndex, negativeIndex]) => {
    const value = point[axis];

    let object = axes[positiveIndex]!;
    let opacity = object.userData.opacity as number;

    applySphereDepthFade(
      object,
      clamp(value >= 0 ? opacity : opacity / 2, 0, 1)
    );

    object = axes[negativeIndex]!;
    opacity = object.userData.opacity as number;

    applySphereDepthFade(
      object,
      clamp(value >= 0 ? opacity / 2 : opacity, 0, 1)
    );
  });
}
