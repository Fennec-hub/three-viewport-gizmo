import { Sprite } from "three";
import { getSpriteMaterial } from "./getSpriteMaterial";
import { AxesColors } from "@lib/types";

export function getAxesSpritePoints(colors: AxesColors) {
  const axes = ["x", "y", "z"] as const;
  return Array(6)
    .fill(0)
    .map((_, i) => {
      const isPositive = i < 3;
      const sign = isPositive ? "+" : "-";
      const axis = axes[i % 3];
      const color = colors[i % 3];

      const sprite = new Sprite(
        getSpriteMaterial(color, colors[3], isPositive ? axis : null)
      );
      sprite.userData.type = `${sign}${axis}`;
      sprite.scale.setScalar(isPositive ? 0.6 : 0.4);
      sprite.position[axis] = isPositive ? 1.2 : -1.2;
      sprite.renderOrder = 1;

      return sprite;
    });
}
