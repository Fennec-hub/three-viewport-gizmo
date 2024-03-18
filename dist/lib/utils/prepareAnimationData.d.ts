import { OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { GIZMO_AXES } from "./constants";
export declare function prepareAnimationData(camera: OrthographicCamera | PerspectiveCamera, focusPoint: Vector3, axis: (typeof GIZMO_AXES)[number], radius: {
    value: number;
}): void;
