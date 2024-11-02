import { Camera, Sprite, Vector3 } from "three";

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
export function updateSpritesOpacity(sprites: Sprite[], camera: Camera): void {
  point.set(0, 0, 1).applyQuaternion(camera.quaternion);

  axisMap.forEach(([axis, positiveIndex, negativeIndex]) => {
    const value = point[axis];

    sprites[positiveIndex].material.opacity =
      value >= 0 ? primaryOpacity : secondaryOpacity;
    sprites[negativeIndex].material.opacity =
      value >= 0 ? secondaryOpacity : primaryOpacity;
  });
}
