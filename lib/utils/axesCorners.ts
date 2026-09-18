import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  MeshBasicMaterialParameters,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { cloneAxisMap } from "./axesMap";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import { GIZMO_AXES } from "./constants";

/** Row index into the atlas for sphere corners (after the six +/- axis rows). */
const SPHERE_CORNER_ATLAS_ROW = GIZMO_AXES.length;

export const axesCorners = (
  options: GizmoOptionsFallback,
  texture: CanvasTexture
) => {
  const { isSphere, corners, type } = options;
  const isRoundedCube = type === "rounded-cube";

  if (!corners.enabled) return [];

  const { color, opacity, scale, radius, smoothness, hover } = corners;

  const geometry = isSphere
    ? null
    : isRoundedCube ?
      new SphereGeometry(radius, smoothness * 2, smoothness)
      : roundedRectangleGeometry(radius, smoothness);

  const positionOffsetRatio = isRoundedCube ? (1 - radius) : 0.85;
  const positions = [
    1, 1, 1, -1, 1, 1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, -1, -1, -1,
    -1, -1,
  ].map((val) => val * positionOffsetRatio);

  const target = new Vector3();
  return Array(positions.length / 3)
    .fill(0)
    .map<GizmoAxisObject>((_, i) => {
      let idleMaterial: MeshBasicMaterial | SpriteMaterial;
      let hoverMaterial: MeshBasicMaterial | SpriteMaterial;

      if (isSphere) {
        const idleMap = cloneAxisMap(texture, SPHERE_CORNER_ATLAS_ROW, false);
        const hoverMap = cloneAxisMap(texture, SPHERE_CORNER_ATLAS_ROW, true);
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
        idleMaterial = new SpriteMaterial(idleParams);
        hoverMaterial = new SpriteMaterial(hoverParams);
      } else {
        idleMaterial = new MeshBasicMaterial({
          transparent: true,
          opacity,
          color,
        });
        hoverMaterial = new MeshBasicMaterial({
          transparent: true,
          opacity: hover.opacity,
          color: hover.color ?? color,
        });
      }

      const corner = isSphere
        ? new Sprite(idleMaterial as SpriteMaterial)
        : new Mesh(geometry!, idleMaterial as MeshBasicMaterial);

      const i3 = i * 3;
      corner.position.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);

      if (isSphere) corner.position.normalize().multiplyScalar(1.7);

      corner.scale.setScalar(scale);
      corner.up.set(0, 0, 0)[options.up] = 1;
      corner.lookAt(target.copy(corner.position).multiplyScalar(2));
      corner.renderOrder = 1;

      const axes = [
        corner.position.x > 0 ? "x" : "nx",
        corner.position.y > 0 ? "y" : "ny",
        corner.position.z > 0 ? "z" : "nz",
      ];

      corner.userData = {
        color,
        opacity,
        scale,
        hover,
        intersectionOrder: 1,
        kind: "corner",
        axes,
        idleMaterial,
        hoverMaterial,
      };

      return corner;
    });
};
