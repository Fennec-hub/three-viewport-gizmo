import { ColorRepresentation, Object3DEventMap } from "three";
/**
 * Map of custom events emitted by the ViewportGizmo.
 * Extends Three.js Object3D events with gizmo-specific interaction events.
 * @extends Object3DEventMap
 */
export interface ViewportGizmoEventMap extends Object3DEventMap {
    /**
     * Fired when a view change interaction begins.
     * This can be triggered by:
     * - Starting a drag operation
     * - Clicking an axis to start a view transition
     */
    start: {};
    /**
     * Fired when a view change interaction completes.
     * This can be triggered by:
     * - Releasing a drag operation
     * - Completing a view transition animation
     */
    end: {};
    /**
     * Fired during view changes.
     * This can be triggered by:
     * - Active drag operations updating the view
     * - View transition animations in progress
     * - Any other camera orientation updates
     */
    change: {};
}
/**
 * Configuration options for the ViewportGizmo.
 * All properties are optional and will fall back to default values if not specified.
 */
export type GizmoOptions = {
    /** Parent element for the gizmo. Can be an HTMLElement or a CSS selector string */
    container?: HTMLElement | string;
    /** Size of the gizmo widget in pixels */
    size?: number;
    /** Position of the gizmo in the viewport */
    placement?: GizmoDomPlacement;
    /** Whether view changes should be animated */
    animated?: boolean;
    /** Animation speed multiplier. Higher values result in faster animations */
    speed?: number;
    /** Width of the axis lines in pixels */
    lineWidth?: number;
    /**
     * Offset of the gizmo from the container edges in pixels.
     * All offset properties default to 0 if not specified.
     */
    offset?: {
        /** Offset from the left edge */
        left?: 0;
        /** Offset from the top edge */
        top?: 0;
        /** Offset from the right edge */
        right?: 0;
        /** Offset from the bottom edge */
        bottom?: 0;
    };
    /**
     * Configuration for the background sphere.
     * The sphere provides visual context for the current orientation.
     */
    sphere?: {
        /** Whether to show the background sphere */
        enabled?: boolean;
        /** Color of the background sphere in normal state */
        color?: ColorRepresentation;
        /** Opacity of the background sphere in normal state (0-1) */
        opacity?: number;
        /** Color of the background sphere when hovered */
        hoverColor?: ColorRepresentation;
        /** Opacity of the background sphere when hovered (0-1) */
        hoverOpacity?: number;
    };
    /** HTML id attribute for the gizmo container */
    id?: string;
    /** HTML class attribute for the gizmo container */
    className?: string;
    /**
     * Font configuration for axis labels.
     * Follows standard CSS font properties.
     */
    font?: {
        /** Font family for axis labels */
        family?: string;
        /** Font weight for axis labels */
        weight?: string | number;
    };
    /** Resolution multiplier for the gizmo rendering. Higher values improve quality at the cost of performance */
    resolution?: number;
    /**
     * Configuration for positive X axis.
     * @see {@link GizmoAxisOptions}
     */
    x?: GizmoAxisOptions;
    /**
     * Configuration for positive Y axis.
     * @see {@link GizmoAxisOptions}
     */
    y?: GizmoAxisOptions;
    /**
     * Configuration for positive Z axis.
     * @see {@link GizmoAxisOptions}
     */
    z?: GizmoAxisOptions;
    /**
     * Configuration for negative X axis.
     * @see {@link GizmoAxisOptions}
     */
    nx?: GizmoAxisOptions;
    /**
     * Configuration for negative Y axis.
     * @see {@link GizmoAxisOptions}
     */
    ny?: GizmoAxisOptions;
    /**
     * Configuration for negative Z axis.
     * @see {@link GizmoAxisOptions}
     */
    nz?: GizmoAxisOptions;
};
/**
 * Represents the possible placement positions of the gizmo widget in the viewport.
 * The position is determined by combining vertical alignment (top, center, bottom)
 * with horizontal alignment (left, center, right).
 */
export type GizmoDomPlacement = "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
/**
 * Configuration options for individual gizmo axes.
 * Each axis can be customized with its own appearance and behavior.
 */
export type GizmoAxisOptions = {
    /** Custom text label for the axis. If not specified, defaults to the axis name */
    text?: string;
    /** Whether to draw a circle indicator for this axis */
    circle?: boolean;
    /** Whether to draw the axis line */
    line?: boolean;
    /** Whether to draw a border around the axis indicator */
    border?: boolean;
    /**
     * Color configuration for the axis.
     * Supports normal and hover states for both the axis and its label.
     */
    colors?: {
        /**
         * Main color for the axis.
         * Can be either a single color,
         * or a gradient between two colors represented as a tuple of [color, color]
         */
        main?: ColorRepresentation | [ColorRepresentation, ColorRepresentation];
        /** Color when the axis is hovered */
        hover?: ColorRepresentation;
        /** Color for the axis label in normal state */
        text?: ColorRepresentation;
        /** Color for the axis label when hovered */
        hoverText?: ColorRepresentation;
    };
};
/**
 * Valid orientation axes for the gizmo.
 * This type is derived from the GIZMO_AXES constant and includes
 * both positive and negative directions for each axis.
 */
export type OrientationAxes = "x" | "y" | "z" | "nx" | "ny" | "nz";
