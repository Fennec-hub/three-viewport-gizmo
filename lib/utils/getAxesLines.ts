import {
  BufferAttribute,
  BufferGeometry,
  LineBasicMaterial,
  LineSegments,
} from "three";
import { AxesColors } from "../types";

export const getAxesLines = (colors: AxesColors) => {
  const distance = 0.9;
  const position = Array(3)
    .fill(0)
    .map((_, i) => [
      !i ? distance : 0,
      i === 1 ? distance : 0,
      i === 2 ? distance : 0,
      0,
      0,
      0,
    ])
    .flat();
  const color = Array(6)
    .fill(0)
    .map((_, i) =>
      i < 2
        ? colors[0].toArray()
        : i < 4
        ? colors[1].toArray()
        : colors[2].toArray()
    )
    .flat();

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(position), 3)
  );
  geometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(color), 3)
  );

  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      linewidth: 3,
      vertexColors: true,
    })
  );
};
