import { Sprite } from "three";
import { getSpriteMaterial } from "./getSpriteMaterial";

export function getAxesSpritePoints() {
  const axes = ["x", "y", "z"] as const;
  return Array(6)
    .fill(0)
    .map((_, i) => {
      const isPositive = i < 3;
      const sign = isPositive ? "+" : "-";
      const axis = axes[i % 3];
      const color = this.colors[i % 3];

      const sprite = new Sprite(
        getSpriteMaterial(color, isPositive ? axis : null)
      );
      sprite.userData.type = `${sign}${axis}`;
      sprite.scale.setScalar(isPositive ? 0.6 : 0.4);
      sprite.position[axis] = isPositive ? 1.2 : -1.2;
      sprite.renderOrder = 1;

      return sprite;
    });
}
