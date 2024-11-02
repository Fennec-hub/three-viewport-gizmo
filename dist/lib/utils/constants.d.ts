import { GizmoOptions, OrientationAxes } from '../types';
import { Vector3Tuple } from "three";
export declare const GIZMO_TURN_RATE: number;
export declare const GIZMO_DEFAULT_OPTIONS: GizmoOptions;
export declare const GIZMO_AXES: readonly ["x", "y", "z", "nx", "ny", "nz"];
export declare const GIZMO_AXES_ORIENTATIONS: Record<OrientationAxes, [
    position: Vector3Tuple,
    orientation: Vector3Tuple
]>;
