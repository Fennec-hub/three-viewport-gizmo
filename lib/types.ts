import { Color, Object3DEventMap } from "three";

export type GizmoOrientation = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";

export type DomPlacement =
  | "top-left"
  | "top-right"
  | "top-center"
  | "center-right"
  | "center-left"
  | "center-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export type AxesColors = [X: Color, Y: Color, Z: Color, text: Color];

export interface ViewportGizmoEventMap extends Object3DEventMap {
  start: {};
  end: {};
  change: {};
}
