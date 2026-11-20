import { BufferGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";
import { classifyPoint, PRIORITY_DEPTH, type HitBox } from "../interaction/hitTest";
import type { LabelFrame } from "../orbit/labelFrame";
import { targetTable } from "../orbit/targets";
import type { GeometryProvider } from "./build";
import { meshAttributes } from "./materials";

/**
 * The radius range the box is built and hit with. At 0 a face point sits on `±flat` and `classifyPoint` names nothing;
 * at 1 the faces vanish.
 */
const RADIUS = [1e-3, 0.999] as const;

/** Most arc steps per face along one axis: `(2 × 16 + 3)² × 12` keeps the whole box under 15,000 triangles. */
const MAX_ARC_STEPS = 16;

/** The hit sizes of the cube types, as `corners.hitSize` and `edges.hitSize` take them: gizmo units in from an edge. */
export type HitSizes = Readonly<{ corners: number; edges: number }>;

/** The largest hit size: just below 1, so a corner or edge never takes the face's centre line. */
const MAX_HIT_SIZE = 1 - 1e-6;

/**
 * The plain `cube`'s drawn face region: its face tiles' half-size at their default `scale` (0.7), so the gap between
 * tiles, 0.3 deep, is an edge or a corner. I1's fit to the 2.3.0 raycaster.
 */
const CUBE_FLAT = 0.7;

/** The plain `cube`'s hit sizes (I1's 2.3.0 fit: corners from 0.65, edges from 0.7). The sphere resolves them too. */
const CUBE_HIT_SIZES: HitSizes = Object.freeze({ corners: 0.35, edges: 0.3 });

/** How far the `rounded-cube`'s default edge band reaches beyond its drawn strip (`radius`), in gizmo units. */
const EDGE_BAND = 0.1;

/**
 * The narrowest edge band of the `rounded-cube` by default: it widens the default only below `radius` 0.05, where
 * `radius + EDGE_BAND` falls under 0.15.
 */
const MIN_ROUNDED_EDGE = 0.15;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * The default `corners.hitSize` and `edges.hitSize` of a type. `cube` (and the `sphere`, which ignores them):
 * corners 0.35, edges 0.3. `rounded-cube`, with `r` its `radius` clamped to `[0.001, 0.999]`:
 * - corners `min(r + PRIORITY_DEPTH, (1 + r) / 2)`: the rounded patch plus 0.2 (2.3.0's corner-over-face priority),
 *   but never past the inner half of a face's flat region. It equals 3.0.0-beta.3's
 *   `corner = max(flat − 0.2, flat / 2)` at every radius; the half-face floor takes over at `r = 0.6`.
 * - edges `min(max(r + 0.1, 0.15), (1 + r) / 2)`: the drawn strip plus a 0.1 band, as the corners have their 0.2,
 *   so a pointer just inside an edge lands on it as one near a corner lands on the corner. Never under 0.15 (that
 *   floor acts only below `r = 0.05`) and, like the corners, never past the inner half of a face's flat region (the
 *   cap takes over at `r = 0.8`), so a face always keeps its centre. At the default `radius` 0.3: 0.4.
 *
 * @param type - The `type` option
 * @param radius - The `radius` option
 */
export function defaultHitSizes(type: "sphere" | "cube" | "rounded-cube", radius: number): HitSizes {
  if (type !== "rounded-cube") return CUBE_HIT_SIZES;
  const r = clamp(radius, RADIUS[0], RADIUS[1]);
  const halfFace = (1 + r) / 2;
  return {
    corners: Math.min(r + PRIORITY_DEPTH, halfFace),
    edges: Math.min(Math.max(r + EDGE_BAND, MIN_ROUNDED_EDGE), halfFace),
  };
}

/**
 * The hit box of the plain `cube`: a sharp box whose face region is its tiles' (`flat` 0.7) and whose corners win
 * `corners.hitSize` in from the cube's edge. `edges.hitSize` widens the edge band beyond the tiles' gap, never below
 * it. Hit sizes are clamped to `[0, 1)`.
 *
 * @param hitSizes - The resolved `corners.hitSize` and `edges.hitSize`; default 0.35 and 0.3
 */
export function cubeBox({ corners, edges }: HitSizes = CUBE_HIT_SIZES): HitBox {
  return {
    type: "box",
    radius: 0,
    flat: Math.min(CUBE_FLAT, 1 - clamp(edges, 0, MAX_HIT_SIZE)),
    corner: 1 - clamp(corners, 0, MAX_HIT_SIZE),
  };
}

/**
 * The hit box of the `rounded-cube`: the closed box `[-1, 1]³` rounded by `radius`. A point lands on a corner within
 * `corners.hitSize` of the cube's edge on all three axes, and on an edge within `edges.hitSize` on two (I1, 2.3.0's
 * corner-over-face priority), so a small `radius` still leaves a corner and an edge a target the pointer can find.
 * Hit sizes are clamped to `[radius, 1)`: never smaller than the drawn rounded patch and strip. The drawn pieces come
 * from {@link roundedCubeDrawnBox}, not this box, so the faces stay square: a hover inside a band lights only the drawn
 * piece of the target it names.
 *
 * @param radius - The `radius` option; clamped to `[0.001, 0.999]`
 * @param hitSizes - The resolved `corners.hitSize` and `edges.hitSize`; default {@link defaultHitSizes}
 */
export function roundedCubeBox(radius: number, hitSizes = defaultHitSizes("rounded-cube", radius)): HitBox {
  const drawn = roundedCubeDrawnBox(radius);
  const r = drawn.radius;
  return {
    ...drawn,
    flat: Math.min(drawn.flat, 1 - clamp(hitSizes.edges, r, MAX_HIT_SIZE)),
    corner: 1 - clamp(hitSizes.corners, r, MAX_HIT_SIZE),
  };
}

/**
 * The partition the `rounded-cube` is drawn with: faces cut at `flat = 1 - radius` and corners exactly their rounded
 * patches (`corner = flat`), so no hit band cuts a notch into a face.
 *
 * @param radius - The `radius` option; clamped to `[0.001, 0.999]`
 */
export function roundedCubeDrawnBox(radius: number): HitBox {
  const r = clamp(radius, RADIUS[0], RADIUS[1]);
  return { type: "box", radius: r, flat: 1 - r, corner: 1 - r };
}

/**
 * Cut positions along one axis of a cube face, ascending in `[-1, 1]`: the region cuts `±flat` and `±corner`, then
 * `steps` equal angles over each face's half of a rounded edge (`flat + r·tan θ`, θ to 45°, where the next face takes
 * over). Every face reads the same list, so neighbouring faces share their boundary vertices exactly.
 */
function cuts({ radius, flat, corner }: HitBox, steps: number): number[] {
  // The last cut is exactly 1 (tan 45° is not), so it lands on the cube's edge that the next face starts from.
  const arc = Array.from({ length: steps - 1 }, (_, i) => flat + radius * Math.tan((Math.PI / 4) * ((i + 1) / steps)));
  const half = [Math.max(corner, 0), flat, ...arc, 1];
  const all = [...half.map((t) => -t).reverse(), ...half];
  return all.filter((t, i) => i === 0 || t > all[i - 1]);
}

/**
 * The seamless `rounded-cube` (OD3): one closed rounded box, cut into its 26 targets by {@link classifyPoint} on
 * {@link roundedCubeDrawnBox}, without the hit box's bands, so every face and edge piece is a clean rectangle, a hover
 * lights the piece of the target the pointer hits (only the drawn patch or strip when hit in its band), and
 * neighbouring pieces share every boundary vertex. The pieces are built in gizmo space and placed at the origin, so
 * shared vertices are transformed identically and the GPU rasterises no crack between them. A face piece carries its
 * label's UVs from the label frame (its top along `textUp`), spanning `±flat`; every piece carries outward normals.
 */
export const roundedBoxGeometry: GeometryProvider = (o, frame, owned) => {
  // The drawn partition: corners are exactly the rounded patches, so the hit box's bands cut no notch.
  const box = roundedCubeDrawnBox(o.radius);
  const pieces = roundedBoxPieces(box, Math.min(Math.max(Math.ceil(o.smoothness / 2), 1), MAX_ARC_STEPS), frame);
  for (const geometry of pieces.values()) owned.add(geometry);
  return (entry) => ({ geometry: pieces.get(entry.name)!, position: new Vector3(), quaternion: new Quaternion() });
};

/**
 * The 26 pieces of a rounded box, by target name. Each face of the box `[-1, 1]³` is cut into cells along
 * {@link cuts}; a cell point `p` maps onto the rounded box as `clamp(p, ±flat) + radius · normalize(p − clamp(p))`,
 * which leaves every coordinate within `±flat` unchanged, so each cell lies inside one region of `classifyPoint`.
 *
 * @param steps - Arc steps per face over half a rounded edge
 */
export function roundedBoxPieces(box: HitBox, steps: number, frame: LabelFrame): Map<string, BufferGeometry> {
  const targets = targetTable(frame);
  const t = cuts(box, steps);
  const parts = new Map(targets.map((entry) => [entry.name, { positions: [] as number[], normals: [] as number[], uvs: [] as number[] }]));
  const faceAxes = new Map(
    targets
      .filter((entry) => entry.kind === "face")
      .map((entry) => {
        const { direction, textUp } = frame.faces[entry.faces[0]];
        return [entry.name, { right: new Vector3().crossVectors(textUp, direction), up: textUp }];
      })
  );

  const { radius, flat } = box;
  const p = [0, 0, 0];
  const q = new Vector3();
  const n = new Vector3();
  /** Writes the surface point of cube point `p` into `q` and its normal into `n`, in one fixed order of operations. */
  const surface = () => {
    const cx = Math.min(Math.max(p[0], -flat), flat);
    const cy = Math.min(Math.max(p[1], -flat), flat);
    const cz = Math.min(Math.max(p[2], -flat), flat);
    n.set(p[0] - cx, p[1] - cy, p[2] - cz);
    const length = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
    n.multiplyScalar(1 / length);
    q.set(cx + radius * n.x, cy + radius * n.y, cz + radius * n.z);
  };

  const corners = [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] as const;
  for (let k = 0; k < 3; k++) {
    const i = (k + 1) % 3;
    const j = (k + 2) % 3;
    for (const s of [-1, 1]) {
      // Reverse the winding on the negative face so every triangle faces out.
      const order = s > 0 ? corners : ([...corners].reverse() as unknown as typeof corners);
      for (let a = 0; a + 1 < t.length; a++) {
        for (let b = 0; b + 1 < t.length; b++) {
          p[k] = s;
          p[i] = (t[a] + t[a + 1]) / 2;
          p[j] = (t[b] + t[b + 1]) / 2;
          surface();
          const entry = classifyPoint(q, box, targets)!;
          const part = parts.get(entry.name)!;
          const axes = faceAxes.get(entry.name);
          for (const [da, db] of order) {
            p[k] = s;
            p[i] = t[a + da];
            p[j] = t[b + db];
            surface();
            part.positions.push(q.x, q.y, q.z);
            part.normals.push(n.x, n.y, n.z);
            if (axes) part.uvs.push(q.dot(axes.right) / (2 * flat) + 0.5, q.dot(axes.up) / (2 * flat) + 0.5);
          }
        }
      }
    }
  }

  return new Map(
    [...parts].map(([name, { positions, normals, uvs }]) => {
      const geometry = new BufferGeometry()
        .setAttribute("position", new Float32BufferAttribute(positions, 3))
        .setAttribute("normal", new Float32BufferAttribute(normals, 3));
      if (uvs.length) geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
      return [name, meshAttributes(geometry)];
    })
  );
}
