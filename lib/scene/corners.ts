import { Vector3, type BufferGeometry } from "three";
import type { LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { SceneOptions } from "./build";
import { cornerOf, placeAt, type Placement } from "./faces";
import { meshAttributes } from "./materials";
import { roundedRectangleGeometry } from "./roundedRectangleGeometry";

/** A corner facing out along its diagonal, upright about the label up. */
export function placeCorner(entry: TargetEntry, frame: LabelFrame): Placement {
  const x = new Vector3().crossVectors(frame.up, entry.direction).normalize();
  return placeAt(cornerOf(entry, frame).multiplyScalar(0.85), entry.direction, x);
}

/** The cube's corner geometry: a rounded square. */
export function cornerGeometry(o: SceneOptions): BufferGeometry {
  const { radius, smoothness } = o.corners;
  return meshAttributes(roundedRectangleGeometry(radius, smoothness));
}
