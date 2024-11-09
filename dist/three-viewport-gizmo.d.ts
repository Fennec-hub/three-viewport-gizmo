import { ColorRepresentation } from 'three';
import { Object3D } from 'three';
import { Object3DEventMap } from 'three';
import type { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrthographicCamera } from 'three';
import { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';
import { WebGLRenderer } from 'three';

/**
 * Configuration options for individual gizmo axes.
 * Each axis can be customized with its own appearance and behavior.
 */
export declare type GizmoAxisOptions = {
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
 * Represents the possible placement positions of the gizmo widget in the viewport.
 * The position is determined by combining vertical alignment (top, center, bottom)
 * with horizontal alignment (left, center, right).
 */
export declare type GizmoDomPlacement = "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";

/**
 * Configuration options for the ViewportGizmo.
 * All properties are optional and will fall back to default values if not specified.
 */
export declare type GizmoOptions = {
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
        left?: number;
        /** Offset from the top edge */
        top?: number;
        /** Offset from the right edge */
        right?: number;
        /** Offset from the bottom edge */
        bottom?: number;
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
 * Valid orientation axes for the gizmo.
 * This type is derived from the GIZMO_AXES constant and includes
 * both positive and negative directions for each axis.
 */
export declare type OrientationAxes = "x" | "y" | "z" | "nx" | "ny" | "nz";

/**
 * ViewportGizmo is a 3D camera orientation controller that provides a visual interface
 * for changing the camera's viewing angle. It creates a widget that shows the current
 * camera orientation and allows direct manipulation of the view through clicking or dragging.
 *
 * @fires ViewportGizmo#start - Fired when a view change interaction begins
 * @fires ViewportGizmo#change - Fired during view changes
 * @fires ViewportGizmo#end - Fired when a view change interaction ends
 *
 * @extends Object3D
 */
export declare class ViewportGizmo extends Object3D<ViewportGizmoEventMap> {
    /** Whether the gizmo is currently active and responding to user input */
    enabled: boolean;
    /** The camera being controlled by this gizmo */
    camera: OrthographicCamera | PerspectiveCamera;
    /** The point around which the camera rotates */
    target: Vector3;
    /** Whether view changes should be animated */
    animated: boolean;
    /** The speed of view change animations. Higher values result in faster animations */
    speed: number;
    /**
     * Indicates whether the gizmo is currently being animated or not,
     * Useful when interacting with other camera controllers
     *
     * @readonly This value is set internally.
     **/
    animating: boolean;
    private _sphere?;
    private _sphereConfig?;
    private _spritePoints;
    private _viewport;
    private _originalViewport;
    private _originalScissor;
    private _renderer;
    private _orthoCamera;
    private _container;
    private _domElement;
    private _domRect;
    private _dragging;
    private _distance;
    private _clock;
    private _targetPosition;
    private _targetQuaternion;
    private _quaternionStart;
    private _quaternionEnd;
    private _controls?;
    private _controlsListeners?;
    /**
     * Creates a new ViewportGizmo instance.
     *
     * @param camera - The camera to be controlled by this gizmo
     * @param renderer - The WebGL renderer used to render the scene
     * @param options - {@link GizmoOptions}, Configuration options for the gizmo
     * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
     * @param options.size - Size of the gizmo widget in pixels
     * @param options.placement - Position of the gizmo in the viewport. One of:
     *
     *    - `"top-left"`
     *    - `"top-center"`
     *    - `"top-right"`
     *    - `"center-left"`
     *    - `"center-center"`
     *    - `"center-right"`
     *    - `"bottom-left"`
     *    - `"bottom-center"`
     *    - `"bottom-right"`
     *
     * @param options.animated - Whether view changes should be animated
     * @param options.speed - Animation speed multiplier
     * @param options.lineWidth - Width of the axis lines
     * @param options.offset - Offset from the container edges in pixels
     * @param options.offset.left - Offset from the left edge
     * @param options.offset.top - Offset from the top edge
     * @param options.offset.right - Offset from the right edge
     * @param options.offset.bottom - Offset from the bottom edge
     * @param options.sphere - Configuration for the background sphere
     * @param options.sphere.enabled - Whether to show the background sphere
     * @param options.sphere.color - Color of the background sphere
     * @param options.sphere.opacity - Opacity of the background sphere
     * @param options.sphere.hoverColor - Hover color of the background sphere
     * @param options.sphere.hoverOpacity - Hover opacity of the background sphere
     * @param options.id - HTML id attribute for the gizmo container
     * @param options.className - HTML class attribute for the gizmo container
     * @param options.font - Font configuration for axis labels
     * @param options.font.family - Font family for axis labels
     * @param options.font.weight - Font weight for axis labels
     * @param options.resolution - Resolution of the gizmo rendering
     * @param options.x - Configuration for positive X axis
     * @param options.y - Configuration for positive Y axis
     * @param options.z - Configuration for positive Z axis
     * @param options.nx - Configuration for negative X axis
     * @param options.ny - Configuration for negative Y axis
     * @param options.nz - Configuration for negative Z axis
     *
     * @AXIS The following is the configuration for each AXIS `options.[x | y | z | nx | ny | nz]`:
     *
     * @param options.AXIS.text - Custom text label for the axis
     * @param options.AXIS.circle - Whether to draw a circle indicator
     * @param options.AXIS.line - Whether to draw the axis line
     * @param options.AXIS.border - Whether to draw a border around the axis indicator
     * @param options.AXIS.colors - Color configuration for the axis
     * @param options.AXIS.colors.main - Main color(s) for the axis. Can be a single color or [normal, hover] colors
     * @param options.AXIS.colors.hover - Hover color for the axis
     * @param options.AXIS.colors.text - Color for the axis label
     * @param options.AXIS.colors.hoverText - Color for the axis label on hover
     */
    constructor(camera: PerspectiveCamera | OrthographicCamera, renderer: WebGLRenderer, options?: GizmoOptions);
    /**
     * Renders the gizmo to the screen.
     * This method handles viewport and scissor management to ensure the gizmo
     * renders correctly without affecting the main scene rendering.
     *
     * @returns The gizmo instance for method chaining
     */
    render(): this;
    /**
     * Updates the gizmo's DOM-related properties based on its current position
     * and size in the document.
     *
     * @returns The gizmo instance for method chaining
     */
    domUpdate(): this;
    /**
     * Updates the gizmo's orientation to match the current camera orientation.
     *
     * @returns The gizmo instance for method chaining
     */
    cameraUpdate(): this;
    /**
     * Performs a complete update of the gizmo, including both DOM and camera-related updates.
     *
     * @param controls - Internal. Set to `false` if the update event comes from the attached controls.
     *
     * @returns The gizmo instance for method chaining
     */
    update(controls?: boolean): this;
    /**
     * Connects OrbitControls with the gizmo, handling interaction states and updates.
     * Automatically detaches any previously attached controls.
     *
     * @param controls - The scene's {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
     */
    attachControls(controls: OrbitControls): void;
    /** Removes all control event listeners and references. Safe to call multiple times. */
    detachControls(): void;
    /** Cleans up all resources including geometries, materials, textures, and event listeners. */
    dispose(): void;
    /**
     * Updates the gizmo's orientation either based on the camera or internal state.
     *
     * @private
     * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
     */
    private _updateOrientation;
    /**
     * Handles the animation of camera position and orientation changes.
     *
     * @private
     */
    private _animate;
    /**
     * Sets the camera orientation to look at the target from a specific axis.
     *
     * @private
     * @param axis - The axis to orient the camera along
     */
    private _setOrientation;
    /**
     * Initializes event listeners for user interaction.
     *
     * @private
     */
    private _startListening;
    /**
     * Handles the pointer down event for starting drag operations.
     *
     * @private
     * @param e - The pointer event
     */
    private _onPointerDown;
    /**
     * Handles pointer move events for hover effects and drag operations.
     *
     * @private
     * @param e - The pointer event
     */
    private _onPointerMove;
    /**
     * Handles pointer leave events to reset hover states.
     *
     * @private
     */
    private _onPointerLeave;
    /**
     * Handles click events for axis selection.
     *
     * @private
     * @param e - The pointer event
     */
    private _handleClick;
    /**
     * Handles hover effects for interactive elements.
     *
     * @private
     * @param e - The pointer event
     */
    private _handleHover;
}

/**
 * Map of custom events emitted by the ViewportGizmo.
 * Extends Three.js Object3D events with gizmo-specific interaction events.
 * @extends Object3DEventMap
 */
export declare interface ViewportGizmoEventMap extends Object3DEventMap {
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

export { }
