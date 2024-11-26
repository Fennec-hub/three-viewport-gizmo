import { GizmoAxisObject, GizmoOptionsFallback } from "@lib/types";
import {
  BackSide,
  BufferGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const gizmoBackground = (
  faces: GizmoAxisObject[],
  options: GizmoOptionsFallback
) => {
  const {
    isSphere,
    background: { enabled, color, opacity, hover },
  } = options;

  let background: Mesh<any, MeshBasicMaterial>;

  const material = new MeshBasicMaterial({
    color,
    side: BackSide,
    opacity: opacity,
    transparent: true,
    depthWrite: false,
  });

  if (!enabled) return null;

  if (isSphere) {
    background = new Mesh<BufferGeometry, MeshBasicMaterial>(
      new SphereGeometry(1.8, 64, 64),
      material
    );
  } else {
    let geometry!: BufferGeometry;

    faces.forEach((plane) => {
      const originalScale = plane.scale.x;
      plane.scale.setScalar(0.9);
      plane.updateMatrix();

      const planeGeometry = plane.geometry.clone();
      planeGeometry.applyMatrix4(plane.matrix);

      geometry = !!geometry
        ? mergeGeometries([geometry, planeGeometry])
        : planeGeometry;

      plane.scale.setScalar(originalScale);
    });

    background = new Mesh(geometry, material);
  }

  background.userData = {
    color,
    opacity,
    hover,
  };

  return background;
};
