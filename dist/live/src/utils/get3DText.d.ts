import { Material, Mesh } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
export declare const get3DText: (text: string, font: string, material?: Material) => Promise<Mesh<TextGeometry, Material, import("three").Object3DEventMap> | null>;
