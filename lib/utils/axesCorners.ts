import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
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

export const axesCorners = (
  options: GizmoOptionsFallback,
  texture: CanvasTexture
) => {
  const { isSphere, corners } = options;

  if (!corners.enabled) return [];

  const { color, opacity, scale, radius, smoothness, hover } = corners;

  const geometry = isSphere
    ? null
    : roundedRectangleGeometry(radius, smoothness);

  const materialConfig: MeshBasicMaterialParameters = {
    transparent: true,
    opacity,
  };

  const positions = [
    1, 1, 1, -1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, -1, -1, -1,
    -1, -1,
  ].map((val) => val * 0.85);

  const target = new Vector3();
  return Array(positions.length / 3)
    .fill(0)
    .map<GizmoAxisObject>((_, i) => {
      if (isSphere) {
        const map = texture.clone();
        setMapColumnOffset(map, 6);
        materialConfig.map = map;
      } else {
        materialConfig.color = color;
      }

      const corner = isSphere
        ? new Sprite(new SpriteMaterial(materialConfig))
        : new Mesh(geometry!, new MeshBasicMaterial(materialConfig));

      const i3 = i * 3;
      corner.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

      if (isSphere) corner.position.normalize().multiplyScalar(1.7);

      corner.scale.setScalar(scale);
      corner.lookAt(target.copy(corner.position).multiplyScalar(2));

      corner.userData = {
        color,
        opacity,
        scale,
        hover,
      };

      return corner;
    });
};
