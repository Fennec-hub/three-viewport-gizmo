import {
  BackSide,
  BufferGeometry,
  ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";

export function getBackgroundSphere({
  color,
  opacity,
}: { color?: ColorRepresentation; opacity?: number } = {}) {
  const geometry = new SphereGeometry(1.8, 64, 64);
  const sphere = new Mesh<BufferGeometry, MeshBasicMaterial>(
    geometry,
    new MeshBasicMaterial({
      color,
      side: BackSide,
      transparent: true,
      opacity: opacity ?? 0.2,
    })
  );

  sphere.renderOrder = 0;

  return sphere;
}
