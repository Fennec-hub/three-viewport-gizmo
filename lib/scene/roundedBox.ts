import { BufferGeometry, Float32BufferAttribute, Quaternion, Vector3 } from "three";
import { classifyPoint, type HitBox } from "../interaction/hitTest";
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

/**
 * The hit box of the `rounded-cube`: the closed box `[-1, 1]³` rounded by `radius`, its faces cut at `1 - radius` and
 * its corners exactly the rounded corner patches (`corner = flat`). A corner that reached further into the faces, as
 * the sharp cube's does, would cut a square notch out of every face and edge piece, because the pieces are drawn from
 * the same partition. {@link roundedBoxGeometry} cuts its pieces by this box, so what draws is what the pointer hits.
 *
 * @param radius - The `radius` option; clamped to `[0.001, 0.999]`
 */
export function roundedCubeBox(radius: number): HitBox {
  const r = Math.min(Math.max(radius, RADIUS[0]), RADIUS[1]);
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
 * {@link roundedCubeBox}, so a hover lights exactly the piece the pointer hits and neighbouring pieces share every
 * boundary vertex. The pieces are built in gizmo space and placed at the origin, so shared vertices are transformed
 * identically and the GPU rasterises no crack between them. A face piece carries its label's UVs from the label frame
 * (its top along `textUp`), spanning `±flat`; every piece carries outward normals.
 */
export const roundedBoxGeometry: GeometryProvider = (o, frame, owned) => {
  const box = roundedCubeBox(o.radius);
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
