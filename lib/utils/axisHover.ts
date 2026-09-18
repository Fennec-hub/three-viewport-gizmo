import type { GizmoAxisObject } from "../types.js";

export const axisHover = (axis: GizmoAxisObject, hovered: boolean = true) => {
  const { userData } = axis;
  const { idleMaterial, hoverMaterial } = userData;

  axis.scale.setScalar((hovered ? userData.hover : userData).scale as number);

  axis.material = hovered ? hoverMaterial! : idleMaterial!;
};
