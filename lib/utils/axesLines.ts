import { Color, Vector2 } from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { GizmoOptionsFallback } from "../types";
import { GIZMO_AXES } from "./constants";

export const axesLines = (options: GizmoOptionsFallback) => {
  const colorManager = new Color();
  const positions: number[] = [];
  const colors: number[] = [];
  const { isSphere } = options;

  GIZMO_AXES.forEach((axisName, i) => {
    const { line, scale, color } = options[axisName];

    if (!line) return;

    const negative = i < 3 ? 1 : -1;
    const distance = isSphere ? 1.4 - scale / 2 : 0.975;
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

  const material = new LineMaterial({
    linewidth: options.lineWidth,
    vertexColors: true,
    resolution: new Vector2(window.innerWidth, window.innerHeight),
  });

  return new Line2(geometry, material).computeLineDistances();
};
