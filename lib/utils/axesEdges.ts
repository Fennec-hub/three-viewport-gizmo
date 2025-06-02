import { GizmoOptionsFallback } from "@lib/types";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Sprite,
  SpriteMaterial,
  Vector3,
  CylinderGeometry,
} from "three";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import { setMapColumnOffset } from "./axesMap";

export const axesEdges = (
  options: GizmoOptionsFallback,
  texture: CanvasTexture,
  textureColumn: number
) => {
  const { isSphere, edges, type } = options;
  const isRoundedCube = type === "rounded-cube";

  if (!edges.enabled) return [];

  const { color, opacity, scale, hover, radius, smoothness } = edges;

  const edgeLength = isRoundedCube ? (2 - radius * 2) : 1.2;
  const geometry = isSphere
    ? null
    : isRoundedCube ?
      new CylinderGeometry(radius, radius, edgeLength, smoothness * 4)
      : roundedRectangleGeometry(radius, smoothness, edgeLength, 0.25);

  const materialConfig: MeshBasicMaterialParameters = {
    transparent: true,
    opacity,
  };

  const positionOffsetRatio = isRoundedCube ? (1 - radius) : 0.925;
  const positions = [
    0, 1, 1, 0, -1, 1, 1, 0, 1, -1, 0, 1, 0, 1, -1, 0, -1, -1, 1, 0, -1, -1, 0,
    -1, 1, 1, 0, 1, -1, 0, -1, 1, 0, -1, -1, 0,
  ].map((val) => val * positionOffsetRatio);

  const target = new Vector3();
  const defaultUp = new Vector3(0, 1, 0);
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

      edge.up.copy(defaultUp);
      edge.lookAt(target.copy(edge.position).multiplyScalar(2));
      if (isRoundedCube) {
        if (!isSphere && !edge.position.z) edge.rotation.z = Math.PI;
        if (!isSphere && !edge.position.x) edge.rotation.x = 0;
        if (!isSphere && !edge.position.x) edge.rotation.z = Math.PI / 2;
      } else {
        if (!isSphere && !edge.position.y) edge.rotation.z = Math.PI / 2;
      }

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
