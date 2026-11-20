import type { BufferGeometry } from "three";
import type { LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { SceneOptions } from "./build";
import { cornerOf, placeAt, type Placement } from "./faces";
import { meshAttributes } from "./materials";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";

/**
 * An edge along the frame axis that joins its faces, oriented by the label frame (R18): its long side is the positive
 * one of `right`, `up` or `front` that both faces are perpendicular to, never a fixed world Y.
 */
export function placeEdge(entry: TargetEntry, frame: LabelFrame): Placement {
  const along = [frame.right, frame.up, frame.front].find((axis) =>
    entry.faces.every((face) => frame.faces[face].direction.dot(axis) === 0)
  )!;
  return placeAt(cornerOf(entry, frame).multiplyScalar(0.925), entry.direction, along);
}

/** The cube's edge geometry, long along local X: a rounded bar. */
export function edgeGeometry(o: SceneOptions): BufferGeometry {
  const { radius, smoothness } = o.edges;
  return meshAttributes(roundedRectangleGeometry(radius, smoothness, 1.2, 0.25));
}
