export const EPSILON = 1e-6;
export const GIZMO_TURN_RATE = 2 * Math.PI;
export const AXES = ["x", "y", "z"] as const;
export const GIZMO_AXES = [...AXES, "nx", "ny", "nz"] as const;
export const GIZMO_FACES = [
  "right",
  "top",
  "front",
  "left",
  "bottom",
  "back",
] as const;
export const GIZMO_SPHERE_AXES_DISTANCE = 1.3;
