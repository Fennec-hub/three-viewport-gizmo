import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
} from "three";
import { GizmoOptions } from "../types";
import { COLOR_MANAGER, GIZMO_AXES } from "./constants";

export const getAxesLines = (options: GizmoOptions) => {
  const positions: number[] = [];
  const colors: number[] = [];

  GIZMO_AXES.forEach((key, i) => {
    const axis = options[key]!;

    if (axis.drawLine === false) return;

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
      ...COLOR_MANAGER.set(color2).toArray(),
      ...COLOR_MANAGER.set(color1).toArray()
    );
  });

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3)
  );
  geometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(colors), 3)
  );

  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      linewidth: options.lineWidth ?? 3,
      vertexColors: true,
    })
  );
};
