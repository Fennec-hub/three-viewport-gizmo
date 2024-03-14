import { Camera, Sprite, Vector3 } from "three";

const [POS_X, POS_Y, POS_Z, NEG_X, NEG_Y, NEG_Z] = Array(6)
  .fill(0)
  .map((_, i) => i);

const point = new Vector3();

export function updateSpritesOpacity(sprites: Sprite[], camera: Camera) {
  point.set(0, 0, 1);
  point.applyQuaternion(camera.quaternion);

  if (point.x >= 0) {
    sprites[POS_X].material.opacity = 1;
    sprites[NEG_X].material.opacity = 0.5;
  } else {
    sprites[POS_X].material.opacity = 0.5;
    sprites[NEG_X].material.opacity = 1;
  }

  if (point.y >= 0) {
    sprites[POS_Y].material.opacity = 1;
    sprites[NEG_Y].material.opacity = 0.5;
  } else {
    sprites[POS_Y].material.opacity = 0.5;
    sprites[NEG_Y].material.opacity = 1;
  }

  if (point.z >= 0) {
    sprites[POS_Z].material.opacity = 1;
    sprites[NEG_Z].material.opacity = 0.5;
  } else {
    sprites[POS_Z].material.opacity = 0.5;
    sprites[NEG_Z].material.opacity = 1;
  }
}
