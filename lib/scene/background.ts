import {
  CircleGeometry,
  Matrix4,
  Mesh,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Camera,
  type Object3D,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { PartBuilder } from "./build";
import { meshAttributes, targetMaterial, whiteTexture } from "./materials";

/** The 2.3.0 sphere background's radius, which fills the sphere camera's ±1.8 frustum. */
export const BACKGROUND_RADIUS = 1.8;

/** Segments of the sphere's disc: one triangle each, and a silhouette within 0.001 units of a circle (P10). */
export const BACKGROUND_SEGMENTS = 128;

const _parent = /*@__PURE__*/ new Quaternion();

/**
 * An `onBeforeRender` that turns a quad to face `camera`, as a sprite does, so it draws with the meshes' program
 * instead of the sprite program (perf budget `programs`).
 */
export function turnToCamera(this: Object3D, _renderer: unknown, _scene: unknown, camera: Camera): void {
  if (this.parent) this.parent.getWorldQuaternion(_parent).invert();
  else _parent.identity();
  camera.getWorldQuaternion(this.quaternion).premultiply(_parent);
  this.updateMatrixWorld();
}

/**
 * Turns the disc to face `camera` and moves it to the back of the 2.3.0 sphere, so the axis lines behind the origin
 * still draw in front of it as they did. Runs before the renderer reads the disc's world matrix.
 */
function faceCamera(this: Mesh, renderer: unknown, scene: unknown, camera: Camera): void {
  turnToCamera.call(this, renderer, scene, camera);
  this.position.set(0, 0, -BACKGROUND_RADIUS).applyQuaternion(this.quaternion);
  this.updateMatrixWorld();
}

/**
 * The gizmo's background (P10). On the sphere a camera-facing disc of {@link BACKGROUND_SEGMENTS} triangles draws
 * what 2.3.0's 8,064-triangle back-facing sphere drew: its orthographic silhouette. On the cubes the faces are merged
 * at 0.9 scale, as in 2.3.0. Its colour and opacity follow the pointer being over the gizmo.
 *
 * It draws with the targets' program (`targetMaterial`), so it draws its front side: the cubes' far faces, which
 * 2.3.0 drew with `BackSide`, are mirrored across each face's local X, which reverses their winding and leaves the
 * shape in place (a cube face is a symmetric rectangle, and the rounded cube's six pieces mirror onto each other).
 * Only the sphere's disc writes depth, which hides nothing behind it; the cubes' must not hide the edges and line tips
 * that reach past its far faces, as in 2.3.0, so on WebGPU the cubes' background is the gizmo's second pipeline.
 */
export const background: PartBuilder = (o, { targets }, owned) => {
  const sphere = o.type === "sphere";
  const material = targetMaterial({ sprite: false, map: null, color: 0xffffff, opacity: 1 }, whiteTexture(owned));
  material.depthWrite = sphere;
  const scale = new Vector3(-0.9, 0.9, 0.9);
  const geometry: BufferGeometry = sphere
    ? new CircleGeometry(BACKGROUND_RADIUS, BACKGROUND_SEGMENTS)
    : mergeGeometries(
        targets
          .filter(({ end }) => end)
          .map(({ object }) =>
            (object as Mesh).geometry.clone().applyMatrix4(new Matrix4().compose(object.position, object.quaternion, scale))
          )
      );
  owned.add(material).add(meshAttributes(geometry));
  const object = new Mesh(geometry, material);
  if (sphere) object.onBeforeRender = faceCamera;
  return {
    object,
    update(o, over) {
      const { enabled, color, opacity, hover } = o.background;
      object.visible = enabled;
      material.color.set(over ? hover.color : color);
      material.opacity = over ? hover.opacity : opacity;
    },
  };
};
