import { Vector3 } from "three";
import type { GizmoFaceName, GizmoTargetKind, GizmoTargetName } from "../types";
import type { LabelFrame } from "./labelFrame";

/** One of the 26 targets of a label frame, before options give it a label. */
export type TargetEntry = Readonly<{
  name: GizmoTargetName;
  kind: GizmoTargetKind;
  /** Unit vector from the orbit target towards the camera when the view looks from this target. World space. */
  direction: Readonly<Vector3>;
  /** The faces it joins, in name order (vertical, depth, lateral): its label is their labels joined by a space. */
  faces: readonly GizmoFaceName[];
}>;

const VERTICAL = ["top", "bottom"] as const;
const DEPTH = ["front", "back"] as const;
const LATERAL = ["right", "left"] as const;

const pairs = (a: readonly GizmoFaceName[], b: readonly GizmoFaceName[]) => a.flatMap((x) => b.map((y) => [x, y]));

/** Faces, then edges, then corners; each name joins its faces vertical, depth, lateral. */
const PARTS: readonly (readonly GizmoFaceName[])[] = [
  ...[...VERTICAL, ...DEPTH, ...LATERAL].map((face) => [face]),
  ...pairs(VERTICAL, DEPTH),
  ...pairs(VERTICAL, LATERAL),
  ...pairs(DEPTH, LATERAL),
  ...pairs(VERTICAL, DEPTH).flatMap((pair) => LATERAL.map((side) => [...pair, side])),
];

const KINDS = ["face", "edge", "corner"] as const;

/**
 * All 26 targets of a label frame: 6 faces, 12 edges, 8 corners. Hidden kinds and targets stay listed (R4, R15), so
 * `gizmo.targets` can be built from it for every type.
 *
 * @returns A new list
 */
export function targetTable(frame: LabelFrame): readonly TargetEntry[] {
  return PARTS.map((faces) => ({
    name: faces.join("-") as GizmoTargetName,
    kind: KINDS[faces.length - 1],
    direction: faces.reduce((sum, face) => sum.add(frame.faces[face].direction), new Vector3()).normalize(),
    faces,
  }));
}
