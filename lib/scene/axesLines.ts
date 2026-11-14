import { Color, Vector2 } from "three";
import { Line2NodeMaterial } from "three/webgpu";
import { Line2 as Line2Gl } from "three/addons/lines/Line2.js";
import { Line2 as Line2Gpu } from "three/addons/lines/webgpu/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { GizmoOptionsFallback } from "../types";
import { GIZMO_AXES, GIZMO_SPHERE_AXES_DISTANCE } from "../utils/constants";
import { isWebGPURenderer, type GizmoRenderer } from "../render/backend";

/** Fat-line helpers differ between WebGL `LineMaterial` (GLSL) and WebGPU `Line2NodeMaterial` (TSL). */
export const axesLines = (
  options: GizmoOptionsFallback,
  renderer: GizmoRenderer
) => {
  const colorManager = new Color();
  const positions: number[] = [];
  const colors: number[] = [];
  const { isSphere } = options;

  GIZMO_AXES.forEach((axisName, i) => {
    const { enabled, line, scale, color } = options[axisName];

    if (!enabled || !line) return;

    const negative = i < 3 ? 1 : -1;
    const distance = isSphere ? GIZMO_SPHERE_AXES_DISTANCE - scale / 2 : 0.975;
    const point = distance * negative;

    positions.push(
      axisName.includes("x") ? point : 0,
      axisName.includes("y") ? point : 0,
      axisName.includes("z") ? point : 0,
      0,
      0,
      0
    );

    const colorArray = colorManager.set(color).toArray();
    colors.push(...colorArray, ...colorArray);
  });

  if (!positions.length) return null;

  const geometry = new LineGeometry().setPositions(positions).setColors(colors);

  if (isWebGPURenderer(renderer)) {
    const material = new Line2NodeMaterial({
      linewidth: options.lineWidth,
      vertexColors: true,
      worldUnits: false,
    });
    return new Line2Gpu(geometry, material).computeLineDistances();
  }

  const material = new LineMaterial({
    linewidth: options.lineWidth,
    vertexColors: true,
    resolution: new Vector2(window.innerWidth, window.innerHeight),
  });

  return new Line2Gl(geometry, material).computeLineDistances();
};
