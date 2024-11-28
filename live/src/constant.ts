import { GizmoOptions } from "@lib/types";

const colors = {
  color: 0x333333,
  labelColor: 0xdddddd,
  hover: {
    color: 0x4bac84,
    labelColor: 0xffffff,
  },
};

const deepClone = <T>(obj: T) => JSON.parse(JSON.stringify(obj)) as T;

export const cubeDarkTheme: GizmoOptions = {
  type: "cube",
  background: {
    color: 0x444444,
    hover: { color: 0x444444 },
  },
  corners: deepClone(colors),
  edges: deepClone(colors),
  right: deepClone(colors),
  top: deepClone(colors),
  front: deepClone(colors),
};
