import { Color } from "three";

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

export type AxesColors = [X: Color, Y: Color, Z: Color];
