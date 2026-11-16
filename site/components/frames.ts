/** A signed world axis, as the site's controls and URLs write it. */
export type Axis = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";
/** The up axis of a stage: any signed axis. */
export type UpAxis = Axis;
export type Vec3 = [number, number, number];

export const AXES: readonly Axis[] = ["+x", "-x", "+y", "-y", "+z", "-z"];

export const axisVector = (axis: Axis): Vec3 => {
  const sign = axis[0] === "-" ? -1 : 1;
  const i = "xyz".indexOf(axis[1]);
  return [0, 1, 2].map((j) => (j === i ? sign : 0)) as Vec3;
};

/** The library's default Front for an up axis: the 2.x front of that axis, for either sign. */
export const defaultFront = (up: Axis): Axis => ({ x: "+y", y: "+z", z: "-y" } as const)[up[1] as "x" | "y" | "z"];

/** The four axes a Front can face for an up axis: the ones perpendicular to it. */
export const frontsFor = (up: Axis): Axis[] => AXES.filter((axis) => axis[1] !== up[1]);

const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];

/**
 * Maps a vector written in Y-up terms (right X, up Y, front Z) into the frame of `up` and `front`. The basis is the
 * gizmo's label frame: `(right, up, front)` is right-handed, so `right = up × front`, and the scene reads the same
 * way from the gizmo's Front on every up axis.
 */
export function fromYUp([x, y, z]: Vec3, up: Axis, front: Axis = defaultFront(up)): Vec3 {
  const u = axisVector(up);
  const f = axisVector(front);
  const r = cross(u, f);
  return [0, 1, 2].map((i) => x * r[i] + y * u[i] + z * f[i]) as Vec3;
}
