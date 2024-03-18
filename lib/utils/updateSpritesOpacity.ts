import { Camera, Sprite, Vector3 } from "three";

const enum Axes {
  PositiveX,
  PositiveY,
  PositiveZ,
  NegativeX,
  NegativeY,
  NegativeZ,
}

const point = new Vector3();

export function updateSpritesOpacity(sprites: Sprite[], camera: Camera) {
  point.set(0, 0, 1);
  point.applyQuaternion(camera.quaternion);

  if (point.x >= 0) {
    sprites[Axes.PositiveX].material.opacity = 1;
    sprites[Axes.NegativeX].material.opacity = 0.5;
  } else {
    sprites[Axes.PositiveX].material.opacity = 0.5;
    sprites[Axes.NegativeX].material.opacity = 1;
  }

  if (point.y >= 0) {
    sprites[Axes.PositiveY].material.opacity = 1;
    sprites[Axes.NegativeY].material.opacity = 0.5;
  } else {
    sprites[Axes.PositiveY].material.opacity = 0.5;
    sprites[Axes.NegativeY].material.opacity = 1;
  }

  if (point.z >= 0) {
    sprites[Axes.PositiveZ].material.opacity = 1;
    sprites[Axes.NegativeZ].material.opacity = 0.5;
  } else {
    sprites[Axes.PositiveZ].material.opacity = 0.5;
    sprites[Axes.NegativeZ].material.opacity = 1;
  }
}
