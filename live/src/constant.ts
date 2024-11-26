import { GizmoOptions } from "@lib/types";

const mainColor = 0x333333;
const hoverColor = 0x4bac84;
const background = 0x444444;
const label = 0xdddddd;
const labelHover = 0xffffff;

const colors = {
  color: mainColor,
  labelColor: label,
  hover: {
    color: hoverColor,
    labelColor: labelHover,
  },
};

const deepClone = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

export const cubeDarkTheme: GizmoOptions = {
  type: "cube",
  background: {
    color: background,
    hover: {
      color: background,
    },
  },
  corners: deepClone(colors),
  edges: deepClone(colors),
  right: deepClone(colors),
  top: deepClone(colors),
  front: deepClone(colors),
};
