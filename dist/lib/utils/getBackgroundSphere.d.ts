import { BufferGeometry, ColorRepresentation, Mesh, MeshBasicMaterial } from "three";
export declare function getBackgroundSphere({ color, opacity, }?: {
    color?: ColorRepresentation;
    opacity?: number;
}): Mesh<BufferGeometry<import("three").NormalBufferAttributes>, MeshBasicMaterial, import("three").Object3DEventMap>;
