import { BufferGeometry, LineBasicMaterial, LineSegments } from "three";
import { GizmoOptions } from "../types";
export declare const getAxesLines: (options: GizmoOptions) => LineSegments<BufferGeometry<import("three").NormalBufferAttributes>, LineBasicMaterial, import("three").Object3DEventMap>;
