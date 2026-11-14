import type { GizmoAxisName, GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
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
import { cloneAxisMap } from "./axesMap";

const signToAxis = (
  value: number,
  positive: GizmoAxisName,
  negative: GizmoAxisName
): GizmoAxisName | null => (value === 0 ? null : value > 0 ? positive : negative);

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

  const positionOffsetRatio = isRoundedCube ? (1 - radius) : 0.925;
  const positions = [
    0, 1, 1, 0, -1, 1, 1, 0, 1, -1, 0, 1, 0, 1, -1, 0, -1, -1, 1, 0, -1, -1, 0,
    -1, 1, 1, 0, 1, -1, 0, -1, 1, 0, -1, -1, 0,
  ].map((val) => val * positionOffsetRatio);

  const target = new Vector3();
  const defaultUp = new Vector3(0, 1, 0);
  return Array(positions.length / 3)
    .fill(0)
    .map<GizmoAxisObject>((_, i) => {
      let idleMaterial: MeshBasicMaterial | SpriteMaterial;
      let hoverMaterial: MeshBasicMaterial | SpriteMaterial;

      if (isSphere) {
        const idleMap = cloneAxisMap(texture, textureColumn, false);
        const hoverMap = cloneAxisMap(texture, textureColumn, true);
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

      const edge = isSphere
        ? new Sprite(idleMaterial as SpriteMaterial)
        : new Mesh(geometry!, idleMaterial as MeshBasicMaterial);

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

      const a = signToAxis(edge.position.x, "x", "nx");
      const b = signToAxis(edge.position.y, "y", "ny");
      const c = signToAxis(edge.position.z, "z", "nz");
      const axesList = [a, b, c].filter((x): x is GizmoAxisName => x !== null);

      edge.userData = {
        color,
        opacity,
        scale,
        hover,
        kind: "edge",
        axes: axesList,
        idleMaterial,
        hoverMaterial,
      };

      return edge;
    });
};
