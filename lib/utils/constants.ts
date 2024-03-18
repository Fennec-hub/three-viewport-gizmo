import { GizmoOptions } from "@lib/types";
import { Color } from "three";

export const GIZMO_AXES = ["x", "y", "z", "nx", "ny", "nz"] as const;
export const GIZMO_DEFAULT_OPTIONS: GizmoOptions = {
  container: document.body,
  placement: "top-right",
  size: 128,
  lineWidth: 3,
  offset: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  x: {
    text: "X",
    colors: {
      main: "#ff3653",
    },
  },
  y: {
    text: "Y",
    colors: {
      main: "#8adb00",
    },
  },
  z: {
    text: "Z",
    colors: {
      main: "#2c8fff",
    },
  },
  nx: {
    drawLine: false,
    colors: {
      main: "#ff3653",
    },
  },
  ny: {
    drawLine: false,
    colors: {
      main: "#8adb00",
    },
  },
  nz: {
    drawLine: false,
    colors: {
      main: "#2c8fff",
    },
  },
  backgroundSphere: {
    enabled: true,
    color: 0xffffff,
    opacity: 0.2,
  },
};
export const COLOR_MANAGER = new Color();
