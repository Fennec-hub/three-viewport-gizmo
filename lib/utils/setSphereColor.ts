import { GizmoOptions } from "@lib/types";
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";

export const setSphereColor = (
  sphere: Mesh<BufferGeometry, MeshBasicMaterial>,
  { color, opacity, hoverColor, hoverOpacity }: GizmoOptions["sphere"] = {},
  hover: boolean = true
) => {
  const material = sphere.material;

  material.color.set((hover && hoverColor) || color || 0xffffff);
  material.opacity = hover ? hoverOpacity ?? 0.2 : opacity ?? 0;
};
