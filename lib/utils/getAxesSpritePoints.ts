import { Color, Sprite } from "three";
import { getSpriteMaterial } from "./getSpriteMaterial";
import { GizmoOptions } from "@lib/types";
import { GIZMO_AXES } from "./constants";

export function getAxesSpritePoints(options: GizmoOptions) {
  const colorManager = new Color();
  const { font, resolution: spriteResolution } = options;

  return GIZMO_AXES.map((key, i) => {
    const { text, colors, border } = options[key]!;
    const isPositive = i < 3;
    const axis = (isPositive ? key : key[1]) as "x" | "y" | "z";

    const { text: textColor, main, hover, hoverText } = colors!;
    const color = Array.isArray(main) ? main[1] : main!;
    const forceScale = border && text;

    const sprite = new Sprite(
      getSpriteMaterial(
        font!,
        spriteResolution!,
        colorManager.set(color).getStyle(),
        text,
        textColor != null ? colorManager.set(textColor).getStyle() : null,
        hover != null ? colorManager.set(hover).getStyle() : null,
        hoverText != null ? colorManager.set(hoverText).getStyle() : null,
        border
      )
    );

    sprite.userData.axis = key;
    sprite.userData.forceScale = forceScale;
    sprite.scale.setScalar(forceScale || isPositive ? 0.6 : 0.4);
    sprite.position[axis] = isPositive ? 1.2 : -1.2;
    sprite.renderOrder = 100;

    return sprite;
  });
}
