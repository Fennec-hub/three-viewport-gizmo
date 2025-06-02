import {
  GizmoAxisOptions,
  GizmoOptions,
  GizmoOptionsFallback,
} from "@lib/types";
import {
  GIZMO_MAIN_AXES,
  GIZMO_AXES,
  GIZMO_AXES_X_UP,
  GIZMO_AXES_Z_UP,
  GIZMO_FACES,
  GIZMO_FACE_TOP,
  GIZMO_FACE_RIGHT,
  GIZMO_FACE_FRONT,
  GIZMO_FACE_BOTTOM,
  GIZMO_FACE_LEFT,
  GIZMO_FACE_BACK,
} from "./constants";

import { deepClone } from "./deepClone";
import { Object3D } from "three";

export const optionsFallback = (
  options: GizmoOptions
): GizmoOptionsFallback => {
  const type = options.type || "sphere";
  const isSphere = type === "sphere";
  const isRoundedCube = type === "rounded-cube";
  const resolution = options.resolution || isSphere ? 64 : 128;

  const defaultUp = Object3D.DEFAULT_UP;
  const zUp = defaultUp.z === 1;
  const xUp = defaultUp.x === 1;

  const { container } = options;
  options.container = undefined;
  options = JSON.parse(JSON.stringify(options));
  options.container = container;

  // Convert face axis to regular axis
  const faceAxis = zUp ? GIZMO_AXES_Z_UP : xUp ? GIZMO_AXES_X_UP : GIZMO_AXES;
  GIZMO_FACES.forEach((face, index) => {
    if ((options as any)[face])
      options[faceAxis[index]] = (options as any)[face];
  });

  // Positive Axes fallback options
  const axesFallback: GizmoAxisOptions = {
    enabled: true,
    color: 0xffffff,
    opacity: 1,
    scale: isSphere ? 0.7 : 0.7,
    labelColor: 0x222222,
    line: false,
    border: {
      size: 0,
      color: 0xdddddd,
    },
    hover: {
      color: isSphere ? 0xffffff : 0x93d3eb,
      labelColor: 0x222222,
      opacity: 1,
      scale: isSphere ? 0.7 : 0.7,
      border: {
        size: 0,
        color: 0xdddddd,
      },
    },
  };

  // Negative Axes fallback options
  const negativeAxesFallback = {
    line: false,
    scale: isSphere ? 0.45 : 0.7,
    hover: {
      scale: isSphere ? 0.5 : 0.7,
    },
  };

  const optionsFallback: GizmoOptions = {
    type,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution,
    lineWidth: 4,
    radius: isSphere ? 1 : 0.2,
    smoothness: 18,
    animated: true,
    speed: 1,
    background: {
      enabled: true,
      color: isSphere ? 0xffffff : 0xe0e6ec,
      opacity: isSphere ? 0 : 1,
      hover: {
        color: isSphere ? 0xffffff : 0xe0e6ec,
        opacity: isSphere ? 0.2 : 1,
      },
    },
    font: {
      family: "sans-serif",
      weight: 900,
    },
    offset: {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10,
    },
    corners: {
      enabled: !isSphere,
      color: isSphere ? 0xf2d962 : 0xffffff,
      opacity: 1,
      scale: isSphere ? 0.15 : 0.2,
      radius: 1,
      smoothness: 18,
      hover: {
        color: isSphere ? 0xffffff : 0x93d3eb,
        opacity: 1,
        scale: isSphere ? 0.2 : 0.225,
      },
    },
    edges: {
      enabled: !isSphere,
      color: isSphere ? 0xf2d962 : isRoundedCube ? 0xeeeeee : 0xffffff,
      opacity: isSphere ? 1 : 0,
      radius: isSphere ? 1 : 0.125,
      smoothness: 18,
      scale: isSphere ? 0.15 : 1,
      hover: {
        color: isSphere ? 0xffffff : 0x93d3eb,
        opacity: 1,
        scale: isSphere ? 0.2 : 1,
      },
    },
    x: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? { label: "X", color: 0xff3653, line: true }
        : { label: xUp ? GIZMO_FACE_TOP : GIZMO_FACE_RIGHT }),
    },
    y: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? { label: "Y", color: 0x8adb00, line: true }
        : { label: zUp || xUp ? GIZMO_FACE_FRONT : GIZMO_FACE_TOP }),
    },
    z: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? { label: "Z", color: 0x2c8fff, line: true }
        : {
            label: zUp
              ? GIZMO_FACE_TOP
              : xUp
              ? GIZMO_FACE_RIGHT
              : GIZMO_FACE_FRONT,
          }),
    },
    nx: {
      ...deepClone(negativeAxesFallback),
      label: isSphere ? "" : xUp ? GIZMO_FACE_BOTTOM : GIZMO_FACE_LEFT,
    },
    ny: {
      ...deepClone(negativeAxesFallback),
      label: isSphere ? "" : zUp || xUp ? GIZMO_FACE_BACK : GIZMO_FACE_BOTTOM,
    },
    nz: {
      ...deepClone(negativeAxesFallback),
      label: isSphere
        ? ""
        : zUp
        ? GIZMO_FACE_BOTTOM
        : xUp
        ? GIZMO_FACE_LEFT
        : GIZMO_FACE_BACK,
    },
  };

  assignNestedDefaults(options, optionsFallback);

  /** Handle rounded-cube type options */
  if (isRoundedCube) {
    const mergedOptions = options as GizmoOptionsFallback;
    mergedOptions.edges.radius = mergedOptions.radius;
    mergedOptions.edges.scale = 1;
    mergedOptions.edges.opacity = 1;
    mergedOptions.edges.hover.scale = 1;
    mergedOptions.edges.hover.opacity = 1;
    mergedOptions.corners.radius = mergedOptions.radius;
    mergedOptions.corners.scale = 1;
    mergedOptions.corners.opacity = 1;
    mergedOptions.corners.hover.scale = 1;
    mergedOptions.corners.hover.opacity = 1;
    mergedOptions.radius = 0;
    GIZMO_AXES.forEach(axis => {
      mergedOptions[axis].scale = 1;
      mergedOptions[axis].opacity = 1;
      mergedOptions[axis].hover.scale = 1;
      mergedOptions[axis].hover.opacity = 1;
    });
  }

  // Negative axis fallback to positive axis
  GIZMO_MAIN_AXES.forEach((axis) =>
    assignNestedDefaults(
      (options as any)[`n${axis}`],
      deepClone((options as any)[axis])
    )
  );

  return { ...options, isSphere } as GizmoOptionsFallback;
};

function assignNestedDefaults<T>(target: T, ...defaultObjects: T[]) {
  if (
    target instanceof HTMLElement ||
    typeof target !== "object" ||
    target === null
  )
    return target;

  for (const defaults of defaultObjects) {
    for (const key in defaults) {
      if (key === "container") continue;

      if (key in (defaults as any)) {
        if (target[key] === undefined) {
          (target as any)[key] = defaults[key];
        } else if (
          typeof defaults[key] === "object" &&
          !Array.isArray(defaults[key])
        ) {
          (target as any)[key] = assignNestedDefaults(
            (target as any)[key] || {},
            defaults[key]
          );
        }
      }
    }
  }

  return target as T;
}
