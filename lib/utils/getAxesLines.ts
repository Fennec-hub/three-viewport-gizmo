import { Color, Vector2 } from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { GizmoOptions } from "../types";
import { GIZMO_AXES } from "./constants";

export const getAxesLines = (options: GizmoOptions) => {
  const colorManager = new Color();
  const positions: number[] = [];
  const colors: number[] = [];

  GIZMO_AXES.forEach((key, i) => {
    const axis = options[key]!;

    if (axis.line === false) return;

    const negative = i < 3 ? 1 : -1;
    const distance = i < 3 ? 0.9 : 1.025;

    positions.push(
      key.includes("x") ? distance * negative : 0,
      key.includes("y") ? distance * negative : 0,
      key.includes("z") ? distance * negative : 0,
      0,
      0,
      0
    );

    const main = axis.colors!.main!;

    const [color1, color2] = Array.isArray(main) ? main : [main, main];
    colors.push(
      ...colorManager.set(color2).toArray(),
      ...colorManager.set(color1).toArray()
    );
  });

  if (!positions.length) return null;

  const geometry = new LineGeometry();
  geometry.setPositions(positions);
  geometry.setColors(colors);

  const material = new LineMaterial({
    linewidth: options.lineWidth ?? 20,
    vertexColors: true,
    resolution: new Vector2(window.innerWidth, window.innerHeight),
  });

  // Create Line2 instead of LineSegments
  const line = new Line2(geometry, material);
  line.computeLineDistances();
  line.scale.set(1, 1, 1);
  line.renderOrder = 1;

  return line;
};
