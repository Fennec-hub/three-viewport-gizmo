import { GizmoOptions, OrientationAxes } from "@lib/types";
import { Vector3Tuple } from "three";

export const GIZMO_TURN_RATE = 2 * Math.PI;

export const GIZMO_DEFAULT_OPTIONS: GizmoOptions = {
  container: document.body,
  placement: "top-right",
  size: 128,
  lineWidth: 20,
  animated: true,
  speed: 1,
  offset: {
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
  },
  font: {
    family: "helvetica",
    weight: 900,
  },
  resolution: 64,
  sphere: {
    enabled: true,
    color: 0xffffff,
    opacity: 0,
    hoverColor: 0xffffff,
    hoverOpacity: 0.2,
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
    line: false,
    colors: {
      main: "#ff3653",
    },
  },
  ny: {
    line: false,
    colors: {
      main: "#8adb00",
    },
  },
  nz: {
    line: false,
    colors: {
      main: "#2c8fff",
    },
  },
};

export const GIZMO_AXES = ["x", "y", "z", "nx", "ny", "nz"] as const;

export const GIZMO_AXES_ORIENTATIONS: Record<
  OrientationAxes,
  [position: Vector3Tuple, orientation: Vector3Tuple]
> = {
  x: [
    [1, 0, 0],
    [0, Math.PI * 0.5, 0],
  ],

  y: [
    [0, 1, 0],
    [-Math.PI * 0.5, 0, 0],
  ],

  z: [
    [0, 0, 1],
    [0, 0, 0],
  ],

  nx: [
    [-1, 0, 0],
    [0, -Math.PI * 0.5, 0],
  ],

  ny: [
    [0, -1, 0],
    [Math.PI * 0.5, 0, 0],
  ],

  nz: [
    [0, 0, -1],
    [0, Math.PI, 0],
  ],
};
