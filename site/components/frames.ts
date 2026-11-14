export type UpAxis = "x" | "y" | "z";
export type Vec3 = [number, number, number];

/**
 * Images of the Y-up basis vectors (right X, up Y, front Z) in each up frame.
 * Each is a proper rotation, and matches the face labels the gizmo draws:
 * Z-up is right X, top Z, front -Y; X-up is right Z, top X, front Y.
 */
const BASIS: Record<UpAxis, readonly [Vec3, Vec3, Vec3]> = {
  y: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  z: [
    [1, 0, 0],
    [0, 0, 1],
    [0, -1, 0],
  ],
  x: [
    [0, 0, 1],
    [1, 0, 0],
    [0, 1, 0],
  ],
};

/** Maps a vector written in Y-up terms (right, up, front) into the given up frame. */
export function fromYUp([x, y, z]: Vec3, up: UpAxis): Vec3 {
  const [r, u, f] = BASIS[up];
  return [0, 1, 2].map((i) => x * r[i] + y * u[i] + z * f[i]) as Vec3;
}

export const VIEWS = [
  { name: "Front", dir: [0, 0, 1] },
  { name: "Back", dir: [0, 0, -1] },
  { name: "Left", dir: [-1, 0, 0] },
  { name: "Right", dir: [1, 0, 0] },
  { name: "Top", dir: [0, 1, 0] },
  { name: "Bottom", dir: [0, -1, 0] },
  { name: "Iso", dir: [1, 1, 1] },
] as const satisfies readonly { name: string; dir: Vec3 }[];
