import {
  BackSide,
  ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";

export function getBackgroundSphere(color: ColorRepresentation) {
  const geometry = new SphereGeometry(1.6, 64, 64);
  const sphere = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color,
      side: BackSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
  );

  return sphere;
}
