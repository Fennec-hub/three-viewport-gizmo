import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Object3D,
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
  const { isSphere, radius, smoothness, type } = options;
  const isRoundedCube = type === "rounded-cube";
  const faceLength = isRoundedCube ? (2 - options.edges.radius * 2) : 2;
  const geometry = roundedRectangleGeometry(radius, smoothness, faceLength, faceLength);

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

    if (!isSphere) {
      face.lookAt(target.copy(face.position).multiplyScalar(1.7));
      const zUp = Object3D.DEFAULT_UP.z === 1;
      const xUp = Object3D.DEFAULT_UP.x === 1;
      if (zUp || xUp) {
        // z-up and x-up systems: Special rotation handling for Top and Bottom faces to rotate text for readability.
        if ((axis === "z" && zUp) || (axis === "x" && xUp)) {
          // Top face: rotate 90 degrees counter-clockwise around positive-Z-axis to make "top" text readable left-to-right (from front)
          face.rotateZ(-Math.PI / 2);
        } else if ((axis === "nz" && zUp) || (axis === "nx" && xUp)) {
          // Bottom face: rotate 90 degrees clockwise around positive-Z-axis to make "bottom" text readable left-to-right (from front)
          face.rotateZ(Math.PI / 2);
        }
      }
    }

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
