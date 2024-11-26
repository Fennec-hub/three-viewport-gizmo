import { GizmoOptionsFallback, GizmoAxisObject } from "../types";
import { axesMap } from "./axesMap";
import { axesFaces } from "./axesFaces";
import { axesCorners } from "./axesCorners";
import { axesEdges } from "./axesEdges";
import { gizmoBackground } from "./gizmoBackground";
import { axesLines } from "./axesLines";

export const axesObjects = (options: GizmoOptionsFallback) => {
  const { corners, edges } = options;

  const axes: GizmoAxisObject[] = [];
  const map = axesMap(options);

  const faces = axesFaces(options, map);

  axes.push(...faces);
  if (corners.enabled) axes.push(...axesCorners(options, map));
  if (edges.enabled)
    axes.push(...axesEdges(options, map, corners.enabled ? 7 : 6));

  const background = gizmoBackground(faces, options);

  const lines = axesLines(options);

  return [axes, background, lines] as const;
};
