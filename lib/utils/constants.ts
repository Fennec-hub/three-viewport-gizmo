export const GIZMO_EPSILON = 1e-6;
export const GIZMO_TURN_RATE = 2 * Math.PI;
export const GIZMO_MAIN_AXES = ["x", "y", "z"] as const;
export const GIZMO_AXES = [...GIZMO_MAIN_AXES, "nx", "ny", "nz"] as const;
export const GIZMO_AXES_Z_UP = ["x", "z", "y", "nx", "nz", "ny"] as const;
export const GIZMO_AXES_X_UP = ["z", "x", "y", "nz", "nx", "ny"] as const;
export const GIZMO_FACE_RIGHT = "Right";
export const GIZMO_FACE_TOP = "Top";
export const GIZMO_FACE_FRONT = "Front";
export const GIZMO_FACE_LEFT = "Left";
export const GIZMO_FACE_BOTTOM = "Bottom";
export const GIZMO_FACE_BACK = "Back";
export const GIZMO_FACES = [
  GIZMO_FACE_RIGHT,
  GIZMO_FACE_TOP,
  GIZMO_FACE_FRONT,
  GIZMO_FACE_LEFT,
  GIZMO_FACE_BOTTOM,
  GIZMO_FACE_BACK,
].map((face) => face.toLocaleLowerCase());
export const GIZMO_SPHERE_AXES_DISTANCE = 1.3;
