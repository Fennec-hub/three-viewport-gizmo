export const GIZMO_MAIN_AXES = ["x", "y", "z"] as const;
export const GIZMO_AXES = [...GIZMO_MAIN_AXES, "nx", "ny", "nz"] as const;
/** The sphere's face sprites sit this far from the centre; its edge and corner sprites sit at 1.7. */
export const GIZMO_SPHERE_AXES_DISTANCE = 1.3;
