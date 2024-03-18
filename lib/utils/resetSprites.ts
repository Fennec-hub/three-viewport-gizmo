import { Sprite } from "three";

export function resetSprites(sprites: Sprite[]) {
  let i = sprites.length;

  while (i--) {
    sprites[i].scale.setScalar(
      i < 3 || sprites[i].userData.forceScale ? 0.6 : 0.4
    );
    sprites[i].material.map!.offset.x = 1;
  }
}
