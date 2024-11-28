import { GizmoOptionsFallback } from "@lib/types";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import { setMapColumnOffset } from "./axesMap";

export const axesEdges = (
  options: GizmoOptionsFallback,
  texture: CanvasTexture,
  textureColumn: number
) => {
  const { isSphere, edges } = options;

  if (!edges.enabled) return [];

  const { color, opacity, scale, hover, radius, smoothness } = edges;

  const geometry = isSphere
    ? null
    : roundedRectangleGeometry(radius, smoothness, 1.2, 0.25);

  const materialConfig: MeshBasicMaterialParameters = {
    transparent: true,
    opacity,
  };

  const positions = [
    0, 1, 1, 0, -1, 1, 1, 0, 1, -1, 0, 1, 0, 1, -1, 0, -1, -1, 1, 0, -1, -1, 0,
    -1, 1, 1, 0, 1, -1, 0, -1, 1, 0, -1, -1, 0,
  ].map((val) => val * 0.925);

  const target = new Vector3();
  return Array(positions.length / 3)
    .fill(0)
    .map<Mesh<any, MeshBasicMaterial> | Sprite>((_, i) => {
      if (isSphere) {
        const map = texture.clone();
        setMapColumnOffset(map, textureColumn);
        materialConfig.map = map;
      } else {
        materialConfig.color = color;
      }

      const edge = isSphere
        ? new Sprite(new SpriteMaterial(materialConfig))
        : new Mesh(geometry!, new MeshBasicMaterial(materialConfig));

      const i3 = i * 3;
      edge.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      if (isSphere) edge.position.normalize().multiplyScalar(1.7);
      edge.scale.setScalar(scale);

      edge.lookAt(target.copy(edge.position).multiplyScalar(2));

      if (!isSphere && !edge.position.y) edge.rotation.z = Math.PI / 2;

      edge.renderOrder = 1;

      edge.userData = {
        color,
        opacity,
        scale,
        hover,
      };

      return edge;
    });
};
