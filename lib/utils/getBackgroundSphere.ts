import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from "three";

export function getBackgroundSphere() {
  const geometry = new SphereGeometry(1.6);
  const sphere = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color: 16777215,
      side: BackSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
  );

  return sphere;
}
