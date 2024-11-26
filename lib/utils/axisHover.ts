import { GizmoAxisObject } from "@lib/types";
import { setMapHoverOffset } from "./axesMap";

export const axisHover = (axis: GizmoAxisObject, hovered: boolean = true) => {
  const { material, userData } = axis;

  const { opacity, color, scale } = hovered ? userData.hover : userData;

  axis.scale.setScalar(scale);
  material.opacity = opacity;

  if (material.map) setMapHoverOffset(material.map, hovered);
  else material.color.set(color);
};
