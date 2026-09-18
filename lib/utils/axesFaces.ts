import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import type { CanvasTexture } from "three";
import {
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { GIZMO_AXES, GIZMO_FACES, GIZMO_SPHERE_AXES_DISTANCE } from "./constants";
import { cloneAxisMap } from "./axesMap";

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

    const idleMap = cloneAxisMap(texture, i, false);
    const hoverMap = cloneAxisMap(texture, i, true);

    const { enabled, scale, opacity, hover } = options[axis];

    const idleParams: MeshBasicMaterialParameters = {
      map: idleMap,
      opacity,
      transparent: true,
    };
    const hoverParams: MeshBasicMaterialParameters = {
      map: hoverMap,
      opacity: hover.opacity,
      transparent: true,
    };

    const idleMaterial = isSphere
      ? new SpriteMaterial(idleParams)
      : new MeshBasicMaterial(idleParams);
    const hoverMaterial = isSphere
      ? new SpriteMaterial(hoverParams)
      : new MeshBasicMaterial(hoverParams);

    const face = isSphere
      ? new Sprite(idleMaterial as SpriteMaterial)
      : new Mesh(geometry, idleMaterial as MeshBasicMaterial);

    const direction = (isPositive ? axis : axis[1]) as "x" | "y" | "z";
    face.position[direction] =
      (isPositive ? 1 : -1) * (isSphere ? GIZMO_SPHERE_AXES_DISTANCE : 1);

    if (!isSphere) {
      // lookAt orients the label around the face's own up, which Object3D seeds from
      // DEFAULT_UP; the gizmo's up axis has to win for the text to read upright.
      face.up.set(0, 0, 0)[options.up] = 1;
      face.lookAt(target.copy(face.position).multiplyScalar(1.7));
      const zUp = options.up === "z";
      const xUp = options.up === "x";
      if (zUp || xUp) {
        // z-up and x-up systems: Special rotation handling for Top and Bottom faces to rotate text for readability.
        if ((axis === "z" && zUp) || (axis === "x" && xUp)) {
          // Top face: rotate 90 degrees clockwise (negative right-hand-rule around +Z) so "top" text reads left-to-right from the front.
          face.rotateZ(-Math.PI / 2);
        } else if ((axis === "nz" && zUp) || (axis === "nx" && xUp)) {
          // Bottom face: rotate 90 degrees counter-clockwise (positive right-hand-rule around +Z) so "bottom" text reads left-to-right from the front.
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
      kind: "face",
      axes: [GIZMO_AXES[i]],
      face: GIZMO_FACES[i],
      idleMaterial,
      hoverMaterial,
    };

    return face;
  });
};
