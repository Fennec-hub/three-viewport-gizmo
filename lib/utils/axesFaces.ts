import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { GIZMO_AXES, GIZMO_SPHERE_AXES_DISTANCE } from "./constants";

import { setMapColumnOffset } from "./axesMap";

export const axesFaces = (
  options: GizmoOptionsFallback,
  texture: CanvasTexture
): GizmoAxisObject[] => {
  const target = new Vector3();
  const { isSphere, radius, smoothness } = options;
  const geometry = roundedRectangleGeometry(radius, smoothness);

  return GIZMO_AXES.map((_, i) => {
    const isPositive = i < 3;

    const axis = GIZMO_AXES[i];
    const map = i ? texture.clone() : texture;

    setMapColumnOffset(map, i);

    const { enabled, scale, opacity, hover } = options[axis];

    const materialConfig: MeshBasicMaterialParameters = {
      map,
      opacity,
      transparent: true,
    };

    const face = isSphere
      ? new Sprite(new SpriteMaterial(materialConfig))
      : new Mesh(geometry, new MeshBasicMaterial(materialConfig));

    const direction = (isPositive ? axis : axis[1]) as "x" | "y" | "z";
    face.position[direction] =
      (isPositive ? 1 : -1) * (isSphere ? GIZMO_SPHERE_AXES_DISTANCE : 1);

    if (!isSphere) face.lookAt(target.copy(face.position).multiplyScalar(1.7));

    face.scale.setScalar(scale);
    face.renderOrder = 1;
    face.visible = enabled;
    face.userData = {
      scale,
      opacity,
      hover,
    };

    return face;
  });
};
