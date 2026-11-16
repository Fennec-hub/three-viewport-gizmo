import { Matrix4, Quaternion, Vector3, type BufferGeometry, type Texture } from "three";
import type { AxisEnd, LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import { meshAttributes, type Disposable } from "./materials";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";
import type { SceneOptions } from "./build";

/** Where a target's geometry sits: local +Z points outward, local +X along its long side or its label's right. */
export type Placement = Readonly<{ position: Vector3; quaternion: Quaternion }>;

const _y = /*@__PURE__*/ new Vector3();
const _basis = /*@__PURE__*/ new Matrix4();

/** A placement at `position` with local +Z along `out` and local +X along `x`; both unit and perpendicular. */
export function placeAt(position: Vector3, out: Readonly<Vector3>, x: Readonly<Vector3>): Placement {
  _y.crossVectors(out, x);
  return { position, quaternion: new Quaternion().setFromRotationMatrix(_basis.makeBasis(x, _y, out)) };
}

/** The sum of a target's face directions: a face's axis, an edge's `(±1, ±1, 0)` or a corner's `(±1, ±1, ±1)`. */
export const cornerOf = (entry: TargetEntry, frame: LabelFrame): Vector3 =>
  entry.faces.reduce((sum, face) => sum.add(frame.faces[face].direction), new Vector3());

/**
 * A face at `distance` from the centre with its label's top towards the face's `textUp` from the label frame (O1), so
 * every face reads upright on every up and front. This replaces 2.x's per-up `rotateZ` turns of the poles.
 */
export function placeFace(entry: TargetEntry, frame: LabelFrame, distance = 1): Placement {
  const { direction, textUp } = frame.faces[entry.faces[0]];
  return placeAt(direction.clone().multiplyScalar(distance), direction, new Vector3().crossVectors(textUp, direction));
}

/** The cube's face geometry: a rounded rectangle. The rounded cube's faces are pieces of its box (`roundedBox.ts`). */
export function faceGeometry(o: SceneOptions): BufferGeometry {
  return meshAttributes(roundedRectangleGeometry(o.radius, o.smoothness));
}

/** The label textures of a scene. Every texture it hands out is its own and freed by its `dispose()`. */
export type LabelTextures = Disposable & {
  /** The texture of a face, by its axis end, or of every edge or corner sprite of the sphere. */
  texture(part: AxisEnd | "edge" | "corner", state: "idle" | "hover"): Texture;
  /** Redraws every texture in place for a cheap change: same textures, new pixels. */
  update(o: SceneOptions): void;
  /** Called after the provider redrew on its own, for a late font: the host needs a frame. */
  onRedraw?: () => void;
};

/** Makes the label textures for a build. The default is `canvasLabels` in `labels.ts`. */
export type LabelProvider = (o: SceneOptions) => LabelTextures;
