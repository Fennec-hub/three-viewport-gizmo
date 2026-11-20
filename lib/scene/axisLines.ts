import { BufferAttribute, Color, CylinderGeometry, Mesh, Quaternion, Vector3 } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { fieldOfViewDistance } from "../render/internalCamera";
import { GIZMO_AXES, GIZMO_SPHERE_AXES_DISTANCE } from "../utils/constants";
import type { PartBuilder, SceneOptions } from "./build";
import { meshAttributes, targetMaterial, whiteTexture } from "./materials";

/** Half the sphere's orthographic frustum height, as in `createInternalCamera`. */
const SPHERE_HALF_HEIGHT = 1.8;

/** Length of a line on the cube types, from the centre to just inside the face, as in 2.3.0. */
const CUBE_LINE_LENGTH = 0.975;

/** Sides of each line's cylinder: its silhouette is the line, so its width does not change with the view. */
const RADIAL_SEGMENTS = 8;

/**
 * Screen pixels per world unit at the gizmo's origin, for the gizmo's own camera drawn `size` pixels tall: the
 * sphere's orthographic frustum, or the cube's perspective camera at its field-of-view distance.
 *
 * @param options - Resolved options; reads `type`, `size` and `fieldOfView`
 * @returns CSS pixels per world unit; independent of the host canvas size and device pixel ratio
 */
export const pixelsPerUnit = ({ type, size, fieldOfView }: Pick<SceneOptions, "type" | "size" | "fieldOfView">): number =>
  size /
  (type === "sphere"
    ? 2 * SPHERE_HALF_HEIGHT
    : 2 * fieldOfViewDistance(fieldOfView) * Math.tan(fieldOfView / 2));

const Y = /*@__PURE__*/ new Vector3(0, 1, 0);
const _color = /*@__PURE__*/ new Color();
const _vertex = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();

/**
 * The axis lines as one mesh (R7, P4): six cylinders `lineWidth` CSS pixels wide, one draw and one vertex-coloured
 * material, with no `Line2`, `LineMaterial` or `three/webgpu`. The width is fixed in the gizmo's own pixels, so it does
 * not follow a host canvas resize. A hidden line (`enabled` or `line` off) collapses to the origin, and a cheap
 * change rewrites positions and colours in place without compiling.
 */
export const axisLines: PartBuilder = (_, { frame }, owned) => {
  const unit = new CylinderGeometry(1, 1, 1, RADIAL_SEGMENTS).translate(0, 0.5, 0);
  unit.deleteAttribute("uv");
  const base = unit.attributes.position.array;
  const count = unit.attributes.position.count;
  const rotations = GIZMO_AXES.map((end) => new Quaternion().setFromUnitVectors(Y, frame.byEnd[end].direction));
  // Each line's normals, turned once: the update scales a line only along and across its axis, which keeps them.
  const lines = GIZMO_AXES.map((_, i) => unit.clone().applyQuaternion(rotations[i]));
  const geometry = mergeGeometries(lines);
  for (const line of [unit, ...lines]) line.dispose();
  const colors = new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3);
  meshAttributes(geometry.setAttribute("color", colors));
  // The targets' program: white texture, coloured by vertex.
  const material = targetMaterial({ sprite: false, map: null, color: 0xffffff, opacity: 1 }, whiteTexture(owned));
  owned.add(geometry).add(material);

  const object = new Mesh(geometry, material);
  // ponytail: positions move on every update, so culling would need a bounds refresh; the gizmo is always in view.
  object.frustumCulled = false;

  return {
    object,
    update(o) {
      const radius = o.lineWidth / 2 / pixelsPerUnit(o);
      const positions = geometry.attributes.position as BufferAttribute;
      let shown = false;
      GIZMO_AXES.forEach((end, i) => {
        const { enabled, line, scale, color } = o[end];
        const visible = enabled && line;
        shown ||= visible;
        const length = o.type === "sphere" ? GIZMO_SPHERE_AXES_DISTANCE - scale / 2 : CUBE_LINE_LENGTH;
        if (visible) _scale.set(radius, length, radius);
        else _scale.setScalar(0);
        const { r, g, b } = _color.set(color);
        for (let k = 0; k < count; k++) {
          _vertex.fromArray(base, k * 3).multiply(_scale).applyQuaternion(rotations[i]);
          positions.setXYZ(i * count + k, _vertex.x, _vertex.y, _vertex.z);
          colors.setXYZ(i * count + k, r, g, b);
        }
      });
      positions.needsUpdate = true;
      colors.needsUpdate = true;
      object.visible = shown;
    },
  };
};
