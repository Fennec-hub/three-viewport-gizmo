import {
  GizmoAxisOptions,
  GizmoOptions,
  GizmoOptionsFallback,
} from "@lib/types";
import { AXES, GIZMO_AXES, GIZMO_FACES } from "./constants";

import { deepClone } from "./deepClone";

export const optionsFallback = (
  options: GizmoOptions
): GizmoOptionsFallback => {
  const type = options.type || "sphere";
  const isSphere = type === "sphere";
  const resolution = options.resolution || isSphere ? 64 : 128;

  // Convert face axis to regular axis
  GIZMO_FACES.forEach((face, index) => {
    if (options[face]) options[GIZMO_AXES[index]] = options[face];
  });

  // Positive Axes fallback options
  const axesFallback: GizmoAxisOptions = {
    color: 0xffffff,
    opacity: 1,
    scale: isSphere ? 0.7 : 0.8,
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
      scale: isSphere ? 0.7 : 0.8,
      border: {
        size: 0,
        color: 0xdddddd,
      },
    },
  };

  // Negative Axes fallback options
  const negativeAxesFallback = {
    line: false,
    scale: isSphere ? 0.45 : 0.8,
    hover: {
      scale: isSphere ? 0.5 : 0.8,
    },
  };

  const optionsFallback: GizmoOptions = {
    type,
    container: document.body,
    size: 128,
    placement: "top-right",
    resolution,
    lineWidth: 20,
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
      color: isSphere ? 0xffffff : 0xffffff,
      opacity: 1,
      scale: isSphere ? 0.15 : 0.175,
      radius: 1,
      smoothness: 18,
      hover: {
        color: isSphere ? 0xffffff : 0x93d3eb,
        opacity: 1,
        scale: isSphere ? 0.4 : 0.2,
      },
    },
    edges: {
      enabled: !isSphere,
      color: isSphere ? 0xffffff : 0xffffff,
      opacity: isSphere ? 1 : 0,
      radius: isSphere ? 1 : 0.125,
      smoothness: 18,
      scale: isSphere ? 0.15 : 1,
      hover: {
        color: isSphere ? 0xffffff : 0x93d3eb,
        opacity: 1,
        scale: isSphere ? 0.4 : 1,
      },
    },
    x: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? {
            label: "X",
            color: 0xff3653,
            line: true,
          }
        : {
            label: "Right",
          }),
    },
    y: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? {
            label: "Y",
            color: 0x8adb00,
            line: true,
          }
        : {
            label: "Top",
          }),
    },
    z: {
      ...deepClone(axesFallback),
      ...(isSphere
        ? {
            label: "Z",
            color: 0x2c8fff,
            line: true,
          }
        : {
            label: "Front",
          }),
    },
    nx: {
      ...deepClone(negativeAxesFallback),
      label: isSphere ? "" : "Left",
    },
    ny: {
      ...deepClone(negativeAxesFallback),
      label: isSphere ? "" : "Bottom",
    },
    nz: {
      ...deepClone(negativeAxesFallback),
      label: isSphere ? "" : "Back",
    },
  };

  assignNestedDefaults(options, optionsFallback);

  // Negative axis fallback to positive axis
  AXES.forEach((axis) =>
    assignNestedDefaults((options as any)[`n${axis}`], (options as any)[axis])
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
