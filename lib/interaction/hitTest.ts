import { Quaternion, Vector3, type Camera, type Vector3Like } from "three";
import type { TargetEntry } from "../orbit/targets";

/**
 * The closed solid the cube types are hit on, in gizmo space: the box `[-1, 1]³` with its edges and corners rounded
 * by `radius` (0 for a sharp box). {@link classifyPoint} names the target of each point on it from `flat` and
 * `corner`, which the `edges.hitSize` and `corners.hitSize` options set (`flat = 1 - edges.hitSize`, never past the
 * drawn face; `corner = 1 - corners.hitSize`). The defaults are fitted to the 2.3.0 raycaster (`hitTest.test.ts`):
 * - `cube`: `{ radius: 0, flat: 0.7, corner: 0.65 }`; `flat` is its face tiles' half-size, their default `scale`.
 * - `rounded-cube`: `{ radius: r, flat: 1 - max(r, 0.15), corner: max(1 - r - PRIORITY_DEPTH, (1 - r) / 2) }`, `r`
 *   its `radius` option (0.3). Its drawn pieces are cut by `{ radius: r, flat: 1 - r, corner: 1 - r }`, so they have
 *   square faces whatever the hit sizes.
 */
export type HitBox = Readonly<{
  type: "box";
  /** Radius of the rounded edges and corners, in `[0, 1)`. */
  radius: number;
  /**
   * Half-size of a face's region: a coordinate beyond `±flat` leaves the face for the edge or corner on that side. At
   * most `1 - radius`, the drawn face.
   */
  flat: number;
  /**
   * A point with all three coordinates beyond `±corner` is a corner, though it lies on a face or edge: 2.3.0's
   * corner-over-face priority, as a rule on the surface. Above `flat` it adds nothing: three coordinates beyond
   * `±flat` already make a corner.
   */
  corner: number;
}>;

/** A sphere-type target: a disc facing the camera, centred at `center` in gizmo space. */
export type HitDisc = Readonly<{ target: TargetEntry; center: Readonly<Vector3>; radius: number }>;

/** The sphere's discs; where they overlap, the nearer wins, and a corner wins within {@link PRIORITY_DEPTH}. */
export type HitDiscs = Readonly<{ type: "discs"; discs: readonly HitDisc[] }>;

/**
 * What a pointer is tested against. Build it once and keep it: the hit test reads it on every call and allocates
 * nothing.
 */
export type HitScene = Readonly<{
  /** The gizmo's rotation from gizmo space into the camera's world: the inverse of the host camera's rotation. */
  orientation: Readonly<Quaternion>;
  /**
   * The camera the gizmo is drawn with, the same object, so a hit always sees the projection of the last draw and
   * of any field-of-view change since. Only its `position` and `projectionMatrixInverse` are read, in whatever
   * clip-space convention the renderer gave it (`coordinateSystem`, `reversedDepth`); it is assumed unrotated, as
   * `createInternalCamera` makes it. Its world matrix is never read, so a hit before the first render lands (G8).
   */
  camera: Readonly<Camera>;
  shape: HitBox | HitDiscs;
  /** O1's table for the label frame: every hit is one of these entries. */
  targets: readonly TargetEntry[];
  /** Per-kind and per-target gating (U10). A target it refuses is never hit. Default: all enabled. */
  enabled?: (target: TargetEntry) => boolean;
  /** The gizmo's uniform scale, read on every call: 0.7 while the cube types show the triad (S6). Default 1. */
  scale?: number;
}>;

/**
 * Hits within this distance behind the nearest one compete by kind, and a corner wins: 2.3.0's `intersectionOrder`
 * threshold. Gizmo units.
 */
export const PRIORITY_DEPTH = 0.2;

/** 2.3.0's sphere: face discs sit 1.3 from the centre, edge and corner discs 1.7. */
const SPHERE_FACE_DISTANCE = 1.3;
const SPHERE_OTHER_DISTANCE = 1.7;

/** Slack on the box's patch bounds, so a ray along a seam between two patches cannot slip through both. */
const SEAM = 1e-9;

const _origin = /*@__PURE__*/ new Vector3();
const _direction = /*@__PURE__*/ new Vector3();
const _center = /*@__PURE__*/ new Vector3();
const _inverse = /*@__PURE__*/ new Quaternion();
const _o = /*@__PURE__*/ new Float64Array(3);
const _d = /*@__PURE__*/ new Float64Array(3);
const SIGNS = [-1, 1] as const;

/**
 * The target a point on the hit box belongs to: the rule S5's seamless rounded cube partitions its mesh by, so its
 * pieces are what the pointer hits. A point beyond `±corner` on all three axes is that corner; otherwise each
 * coordinate beyond `±flat` names the face on that side, so one names a face and two an edge.
 *
 * @param point - A point on the box's surface, in gizmo space
 * @param box - The hit box
 * @param targets - O1's table
 * @returns The entry of `targets` with the point's signs, or null for a point inside every face region
 */
export function classifyPoint(
  { x, y, z }: Vector3Like,
  { flat, corner }: HitBox,
  targets: readonly TargetEntry[]
): TargetEntry | null {
  const bound = Math.abs(x) > corner && Math.abs(y) > corner && Math.abs(z) > corner ? 0 : flat;
  const sx = x > bound ? 1 : x < -bound ? -1 : 0;
  const sy = y > bound ? 1 : y < -bound ? -1 : 0;
  const sz = z > bound ? 1 : z < -bound ? -1 : 0;
  for (const target of targets) {
    const { direction } = target;
    if (Math.sign(direction.x) === sx && Math.sign(direction.y) === sy && Math.sign(direction.z) === sz) return target;
  }
  return null;
}

/**
 * The sphere's discs at their 2.3.0 places: faces 1.3 and edges and corners 1.7 from the centre along their
 * direction.
 *
 * @param targets - O1's table, or the part of it the sphere draws
 * @param radiusOf - The disc radius of a target: half its `scale` option
 * @returns One disc per target, in `targets` order
 */
export function sphereDiscs(targets: readonly TargetEntry[], radiusOf: (target: TargetEntry) => number): HitDiscs {
  return {
    type: "discs",
    discs: targets.map((target) => ({
      target,
      center: target.direction
        .clone()
        .multiplyScalar(target.kind === "face" ? SPHERE_FACE_DISTANCE : SPHERE_OTHER_DISTANCE),
      radius: radiusOf(target),
    })),
  };
}

/**
 * The target under a pointer, analytically: one ray against the box or the discs, no `Raycaster` and no render mesh,
 * so it does not depend on `smoothness`, on a host-replaced geometry or on the camera having rendered (P7, G8).
 *
 * @param x - Pointer x in normalised device coordinates of the gizmo's rectangle, −1 left to 1 right
 * @param y - Pointer y, −1 bottom to 1 top
 * @param scene - The shape, view and gating to test against
 * @returns An entry of `scene.targets`, or null for a miss or a refused target
 */
export function hitTest(x: number, y: number, scene: HitScene): TargetEntry | null {
  const { camera, shape } = scene;
  // The ray in the camera's world, from the projection as drawn, in any clip-space convention. A renderer rewrites
  // the camera's projection on its first draw: WebGPU's clip z is [0, 1], and reversed depth puts the near plane at 1.
  // Clip z 0 and 1 lie in every convention's range, so both unproject to points on the pointer's line, though which
  // is nearer depends on the convention (-1 is outside some, and lands behind the gizmo, flipping the ray).
  _origin.set(x, y, 0).applyMatrix4(camera.projectionMatrixInverse);
  _direction.set(x, y, 1).applyMatrix4(camera.projectionMatrixInverse).sub(_origin);
  // The camera looks down -z in its own space: point the ray away from it, then start it on the camera's plane (the
  // eye of a perspective camera, the pointer's place on an orthographic one), in front of everything it draws.
  if (_direction.z > 0) _direction.negate();
  _direction.normalize();
  _origin.addScaledVector(_direction, -_origin.z / _direction.z).add(camera.position);
  // A uniform scale commutes with the rotation: shrinking the ray's origin by it equals growing the shape.
  if (scene.scale !== undefined && scene.scale !== 1) _origin.divideScalar(scene.scale);
  return shape.type === "box" ? hitBox(shape, scene) : hitDiscs(shape, scene);
}

function hitBox(box: HitBox, { orientation, targets, enabled }: HitScene): TargetEntry | null {
  _inverse.copy(orientation).invert();
  _origin.applyQuaternion(_inverse);
  _direction.applyQuaternion(_inverse);
  _origin.toArray(_o);
  _direction.toArray(_d);

  const t = boxEntry(box.radius);
  if (t === Infinity) return null;

  const target = classifyPoint(_origin.addScaledVector(_direction, t), box, targets);
  return target && (!enabled || enabled(target)) ? target : null;
}

/** Distance along the ray to where it enters the rounded box: the nearest entry over its 26 patches. */
function boxEntry(radius: number): number {
  const half = 1 - radius;
  let best = Infinity;

  for (let k = 0; k < 3; k++) {
    const i = (k + 1) % 3;
    const j = (k + 2) % 3;
    for (const s of SIGNS) {
      // The flat face at ±1 on axis k, entered from outside only.
      if (_d[k] * s < 0) {
        const t = (s - _o[k]) / _d[k];
        if (t < best && within(i, t, half) && within(j, t, half)) best = t;
      }
      if (radius === 0) continue;
      // The edge cylinders along axis k.
      for (const s2 of SIGNS) {
        const ci = _o[i] - s * half;
        const cj = _o[j] - s2 * half;
        const t = entry(_d[i] * _d[i] + _d[j] * _d[j], ci * _d[i] + cj * _d[j], ci * ci + cj * cj - radius * radius);
        if (t < best && within(k, t, half)) best = t;
      }
    }
  }

  if (radius > 0) {
    // The corner spheres.
    for (const sx of SIGNS) {
      for (const sy of SIGNS) {
        for (const sz of SIGNS) {
          const cx = _o[0] - sx * half;
          const cy = _o[1] - sy * half;
          const cz = _o[2] - sz * half;
          const t = entry(1, cx * _d[0] + cy * _d[1] + cz * _d[2], cx * cx + cy * cy + cz * cz - radius * radius);
          if (t < best) best = t;
        }
      }
    }
  }

  return best;
}

const within = (axis: number, t: number, half: number) => Math.abs(_o[axis] + t * _d[axis]) <= half + SEAM;

/** The entering root of `a t² + 2 halfB t + c = 0`, or Infinity when the ray misses or starts inside. */
function entry(a: number, halfB: number, c: number): number {
  const discriminant = halfB * halfB - a * c;
  if (a === 0 || discriminant < 0) return Infinity;
  const t = (-halfB - Math.sqrt(discriminant)) / a;
  return t >= 0 ? t : Infinity;
}

function hitDiscs({ discs }: HitDiscs, { orientation, enabled }: HitScene): TargetEntry | null {
  // Discs face the camera, so each is tested in the camera's world on the plane through its centre.
  let nearest = Infinity;
  for (const disc of discs) {
    const t = discDistance(disc, orientation, enabled);
    if (t < nearest) nearest = t;
  }
  if (nearest === Infinity) return null;

  let best: HitDisc | null = null;
  let bestDistance = Infinity;
  for (const disc of discs) {
    const t = discDistance(disc, orientation, enabled);
    if (t > nearest + PRIORITY_DEPTH) continue;
    const rank = Number(disc.target.kind === "corner") - Number(best?.target.kind === "corner");
    if (!best || rank > 0 || (rank === 0 && t < bestDistance)) {
      best = disc;
      bestDistance = t;
    }
  }
  return best!.target;
}

function discDistance(
  { target, center, radius }: HitDisc,
  orientation: Readonly<Quaternion>,
  enabled: HitScene["enabled"]
): number {
  if (radius <= 0 || (enabled && !enabled(target))) return Infinity;
  _center.copy(center).applyQuaternion(orientation);
  const t = (_center.z - _origin.z) / _direction.z;
  const dx = _origin.x + t * _direction.x - _center.x;
  const dy = _origin.y + t * _direction.y - _center.y;
  return t >= 0 && dx * dx + dy * dy <= radius * radius ? t : Infinity;
}
