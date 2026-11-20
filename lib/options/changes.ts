import type { GizmoOptions, GizmoResolvedOptions } from "../types";
import { isPlainObject } from "./validate";

/**
 * What a changed option costs (R8, P5). `cheap` updates in place: material colours and opacities, redrawn label
 * canvases, `visible` flags (U10), the element's layout, the camera and the turn settings. `structural` rebuilds
 * `root`'s children: new geometry, a new texture size, a new label frame or new materials.
 */
export type ChangeClass = "cheap" | "structural";

type PartClasses = { [Key in keyof NonNullable<GizmoOptions["corners"]>]-?: ChangeClass };

/**
 * The class of every option. `satisfies` fails type-checking when an option is added unclassified; the unit test
 * fails at run time against `GizmoOptions` in `lib/types.ts`. `corners` and `edges` split by field: their geometry
 * fields are structural, their styling and `hitSize` (the hit box only, rebuilt on every change) are cheap.
 */
export const OPTION_CHANGES = {
  container: "cheap",
  type: "structural",
  size: "cheap",
  placement: "cheap",
  offset: "cheap",
  animated: "cheap",
  speed: "cheap",
  resolution: "structural",
  up: "structural",
  frontDirection: "structural",
  roll: "cheap",
  poleEntry: "cheap",
  oppositeOnRepeat: "cheap",
  drag: "cheap",
  limits: "cheap",
  controlled: "cheap",
  fieldOfView: "cheap",
  navigation: "cheap",
  triad: "cheap",
  onMaterial: "structural",
  lineWidth: "cheap",
  id: "cheap",
  className: "cheap",
  font: "cheap",
  background: "cheap",
  corners: {
    enabled: "cheap",
    color: "cheap",
    opacity: "cheap",
    scale: "cheap",
    radius: "structural",
    smoothness: "structural",
    hitSize: "cheap",
    hover: "cheap",
  },
  edges: {
    enabled: "cheap",
    color: "cheap",
    opacity: "cheap",
    scale: "cheap",
    radius: "structural",
    smoothness: "structural",
    hitSize: "cheap",
    hover: "cheap",
  },
  radius: "structural",
  smoothness: "structural",
  x: "cheap",
  y: "cheap",
  z: "cheap",
  nx: "cheap",
  ny: "cheap",
  nz: "cheap",
  top: "cheap",
  bottom: "cheap",
  front: "cheap",
  back: "cheap",
  right: "cheap",
  left: "cheap",
} as const satisfies { [Key in keyof GizmoOptions]-?: ChangeClass | PartClasses };

/** Equal by value: plain objects key by key, `Color` and `Vector3` by `equals`, anything else by identity. */
function same(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) if (!same(a[key], b[key])) return false;
    return true;
  }
  const equals = (a as { equals?: (other: unknown) => boolean } | null)?.equals;
  return typeof equals === "function" && a?.constructor === b?.constructor && equals.call(a, b);
}

/**
 * The cost of going from `previous` to `next`.
 *
 * @returns `null` when nothing changed, `structural` when any structural option changed, else `cheap`
 */
export function classifyChange(previous: GizmoResolvedOptions, next: GizmoResolvedOptions): ChangeClass | null {
  let result: ChangeClass | null = null;
  for (const [key, classes] of Object.entries(OPTION_CHANGES)) {
    // The face aliases are merged away at resolution, so they compare equal here.
    const before = (previous as Record<string, unknown>)[key];
    const after = (next as Record<string, unknown>)[key];
    const changes =
      typeof classes === "string"
        ? same(before, after)
          ? []
          : [classes]
        : Object.entries(classes)
            .filter(([field]) => !same((before as any)?.[field], (after as any)?.[field]))
            .map(([, change]) => change);
    if (changes.includes("structural")) return "structural";
    if (changes.length) result = "cheap";
  }
  return result;
}
