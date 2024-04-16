import { GizmoOptions } from '../types';
import { SpriteMaterial } from "three";
export declare function getSpriteMaterial(font: Required<GizmoOptions>["font"], resolution: number, color: string, text: string | undefined, textColor: string | null, hover: string | null, hoverText: string | null, border?: boolean): SpriteMaterial;
