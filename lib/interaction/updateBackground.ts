import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";

export const updateBackground = (
  background: Mesh<BufferGeometry, MeshBasicMaterial>,
  hovered: boolean = true
) => {
  const { material, userData } = background;
  const { color, opacity } = hovered ? userData.hover : userData;

  material.color.set(color);
  material.opacity = opacity;
};
