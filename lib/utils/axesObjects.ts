import { GizmoOptionsFallback, GizmoAxisObject } from "../types";
import { axesMap } from "./axesMap";
import { axesFaces } from "./axesFaces";
import { axesCorners } from "./axesCorners";
import { axesEdges } from "./axesEdges";
import { gizmoBackground } from "./gizmoBackground";
import { axesLines } from "./axesLines";

export const axesObjects = (options: GizmoOptionsFallback) => {
  const axes: GizmoAxisObject[] = [];
  const map = axesMap(options);

  const faces = axesFaces(options, map);
  const cornersAxes = axesCorners(options, map);
  const edgesAxes = axesEdges(options, map, options.corners.enabled ? 7 : 6);

  axes.push(...faces);
  axes.push(...cornersAxes);
  axes.push(...edgesAxes);

  const background = gizmoBackground(faces, options);

  const lines = axesLines(options);

  return [axes, background, lines] as const;
};
