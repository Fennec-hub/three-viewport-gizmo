import { ColorRepresentation, Object3DEventMap } from "three";
export type DomPlacement = "top-left" | "top-right" | "top-center" | "center-right" | "center-left" | "center-center" | "bottom-left" | "bottom-right" | "bottom-center";
export interface ViewportGizmoEventMap extends Object3DEventMap {
    start: {};
    end: {};
    change: {};
}
export type GizmoOptions = Partial<{
    container: HTMLElement;
    size: number;
    placement: DomPlacement;
    lineWidth: number;
    offset: {
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    };
    backgroundSphere: Partial<{
        enabled: boolean;
        color: ColorRepresentation;
        opacity: number;
    }>;
    font: {
        family?: string;
        weight?: string | number;
    };
    resolution: number;
    x: GizmoAxisOptions;
    y: GizmoAxisOptions;
    z: GizmoAxisOptions;
    nx: GizmoAxisOptions;
    ny: GizmoAxisOptions;
    nz: GizmoAxisOptions;
}>;
export type GizmoAxisOptions = {
    text?: string;
    drawCircle?: boolean;
    drawLine?: boolean;
    border?: boolean;
    colors: Partial<{
        main: ColorRepresentation | [ColorRepresentation, ColorRepresentation];
        hover?: ColorRepresentation;
        text?: ColorRepresentation;
        hoverText?: ColorRepresentation;
    }>;
};
