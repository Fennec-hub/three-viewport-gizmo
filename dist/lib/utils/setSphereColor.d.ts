import { GizmoOptions } from '../types';
import { BufferGeometry, Mesh, MeshBasicMaterial } from "three";
export declare const setSphereColor: (sphere: Mesh<BufferGeometry, MeshBasicMaterial>, { color, opacity, hoverColor, hoverOpacity }?: GizmoOptions["sphere"], hover?: boolean) => void;
