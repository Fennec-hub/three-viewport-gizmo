import { ColorRepresentation } from 'three';
import { DeepRequired } from 'utility-types';
import { Object3D } from 'three';
import { Object3DEventMap } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { OrthographicCamera } from 'three';
import { PerspectiveCamera } from 'three';
import { Vector3 } from 'three';
import { WebGLRenderer } from 'three';

/**
 * Configuration options for individual gizmo axes.
 * Each axis can be customized with its own appearance and behavior.
 */
export declare type GizmoAxisOptions = {
    /** Whether to draw the axis. Default `true` */
    enabled?: boolean;
    /** Custom text label for the axis. If not specified, defaults to the axis name */
    label?: string;
    /** The axis opacity. Default `1` */
    opacity?: number;
    /** The scale multiplayer for the indicator size. Default `1` */
    scale?: number;
    /** Whether to draw the the axis line. */
    line?: boolean;
    /** The axis indicator background color. */
    color?: ColorRepresentation;
    /** Color for the axis text label */
    labelColor?: ColorRepresentation;
    /** The border around the axis indicator. */
    border?: {
        /** The border size around the axis indicator. */
        size: number;
        /** The border color around the axis indicator. */
        color: ColorRepresentation;
    };
    /** The axis indicator hover options. */
    hover?: {
        /** The fill color on hover */
        color?: ColorRepresentation;
        /** The label text color when the axis is hovered. */
        labelColor?: ColorRepresentation;
        /** The opacity when the axis is hovered. Default `1` */
        opacity?: number;
        /** The indicator scale multiplayer when the axis is hovered Default `1` */
        scale?: number;
        /** The border around the axis indicator. */
        border?: {
            /** The border size around the axis indicator. */
            size: number;
            /** The border color around the axis indicator. */
            color: ColorRepresentation;
        };
    };
};

/**
 * Configuration options for the ViewportGizmo.
 * All properties are optional and will fall back to default values if not specified.
 */
export declare type GizmoOptions = {
    /** Parent element for the gizmo. Can be an HTMLElement or a CSS selector string */
    container?: HTMLElement | string;
    /** The Gizmo support two types a `sphere` and a `cube` configuration. Default `sphere` */
    type?: "sphere" | "cube";
    /** Size of the gizmo widget in pixels. Default `128`*/
    size?: number;
    /**
     * Represents the possible placement positions of the gizmo widget in the viewport.
     * The position is determined by combining vertical alignment (top, center, bottom)
     * with horizontal alignment (left, center, right).
     */
    placement?: "top-left" | "top-center" | "top-right" | "center-left" | "center-center" | "center-right" | "bottom-left" | "bottom-center" | "bottom-right";
    /** Offset of the gizmo from the container edges in pixels. */
    offset?: {
        /** Offset from the left edge in pixel. Default `10` */
        left?: number;
        /** Offset from the top edge in pixel. Default `10` */
        top?: number;
        /** Offset from the right edge in pixel. Default `10` */
        right?: number;
        /** Offset from the bottom edge in pixel. Default `10` */
        bottom?: number;
    };
    /** Whether view changes should be animated. Default `true` */
    animated?: boolean;
    /** Animation speed multiplier. Higher values result in faster animations. Default `1` */
    speed?: number;
    /**
     * The texture resolution. Higher values improve quality at the cost of performance.
     * Default `64` for a `sphere` type, and `128` for the cube.
     **/
    resolution?: number;
    /** The width of the axes lines material in pixels.   LineMaterial2 */
    lineWidth?: number;
    /** HTML `id` attribute for the gizmo container */
    id?: string;
    /** HTML `class` attribute for the gizmo container */
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
    /**
     * The gizmo background configuration.
     * The sphere provides visual context for the current orientation.
     */
    background?: {
        /** Whether to display the background sphere */
        enabled?: boolean;
        /** Color of the background sphere in normal state */
        color?: ColorRepresentation;
        /** Opacity of the background sphere in normal state (0-1) */
        opacity?: number;
        hover?: {
            /** Color of the background sphere when hovered */
            color?: ColorRepresentation;
            /** Opacity of the background sphere when hovered (0-1) */
            opacity?: number;
        };
    };
    /**
     * Configuration for the corner axes indicators of the gizmo.
     * Corners provide additional visual cues for orientation, particularly useful in cube mode.
     */
    corners?: {
        /** Whether to display corner indicators. Default `true` */
        enabled?: boolean;
        /** Base color of the corner indicators in normal state */
        color?: ColorRepresentation;
        /** Opacity of corner indicators in normal state (0-1). Default `1` */
        opacity?: number;
        /** Scale multiplier for corner indicator size. Default `1` */
        scale?: number;
        /** Radius of the corner indicators in range [0, 1]. Controls the roundness.
         * Default `1` for sphere type, `0.2` for the cube type.
         */
        radius?: number;
        /** Smoothness of the corner indicators. Higher values create smoother transitions. Default `18` */
        smoothness?: number;
        /** Corner indicator appearance when hovered */
        hover?: {
            /** Color of corner indicators when hovered */
            color?: ColorRepresentation;
            /** Opacity of corner indicators when hovered (0-1) */
            opacity?: number;
            /** Scale multiplier for corner indicators when hovered */
            scale?: number;
        };
    };
    /**
     * Configuration for the edge indicators of the gizmo.
     * Edges help define the boundaries between faces and improve spatial understanding.
     */
    edges?: {
        /** Whether to display edge indicators. Default `true` */
        enabled?: boolean;
        /** Base color of the edge indicators in normal state */
        color?: ColorRepresentation;
        /** Opacity of edge indicators in normal state (0-1). Default `1` */
        opacity?: number;
        /** Scale multiplier for edge indicator thickness. Default `1` */
        scale?: number;
        /** Radius of the edge indicators in pixels. Controls the roundness. Default `2` */
        radius?: number;
        /** Smoothness of the edge indicators (1-10). Higher values create smoother transitions. Default `8` */
        smoothness?: number;
        /** Edge indicator appearance when hovered */
        hover?: {
            /** Color of edge indicators when hovered */
            color?: ColorRepresentation;
            /** Opacity of edge indicators when hovered (0-1) */
            opacity?: number;
            /** Scale multiplier for edge indicators when hovered */
            scale?: number;
        };
    };
    /** The axes edge radius, applied to all axes */
    radius?: number;
    /** The axes edge smoothness, applied to all axes */
    smoothness?: number;
    /**
     * Configuration for positive `X` axis or the `Right` face.
     * @see {@link GizmoAxisOptions}
     */
    x?: GizmoAxisOptions;
    /**
     * Configuration for positive `Y` axis or the `Top` face.
     * @see {@link GizmoAxisOptions}
     */
    y?: GizmoAxisOptions;
    /**
     * Configuration for positive `Z` axis or the `Front` face.
     * @see {@link GizmoAxisOptions}
     */
    z?: GizmoAxisOptions;
    /**
     * Configuration for negative X axis or the `Left` face.
     * @see {@link GizmoAxisOptions}
     */
    nx?: GizmoAxisOptions;
    /**
     * Configuration for negative Y axis or the `Bottom` face.
     * @see {@link GizmoAxisOptions}
     */
    ny?: GizmoAxisOptions;
    /**
     * Configuration for negative Z axis or the `Back` face.
     * @see {@link GizmoAxisOptions}
     */
    nz?: GizmoAxisOptions;
    /**
     * @alias An alias for the negative `x` axis configuration `options.nx`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    right?: GizmoAxisOptions;
    /**
     * @alias An alias for the `y` axis configuration `options.y`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    top?: GizmoAxisOptions;
    /**
     * @alias An alias for the `z` axis configuration `options.z`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    front?: GizmoAxisOptions;
    /**
     * @alias An alias for the `x` axis configuration `options.x`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    left?: GizmoAxisOptions;
    /**
     * @alias An alias for the negative `y` axis configuration `options.ny`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    bottom?: GizmoAxisOptions;
    /**
     * @alias An alias for the negative `z` axis configuration `options.nz`,
     * can be used with a cube configuration for more clarity.
     *
     * @see {@link GizmoAxisOptions}
     */
    back?: GizmoAxisOptions;
};

/** The {@link GizmoOptions } with all options set with their respective default and fallback */
declare type GizmoOptionsFallback = DeepRequired<GizmoOptions> & {
    isSphere: boolean;
};

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
    type: string;
    /** Whether the gizmo is currently active and responding to user input */
    enabled: boolean;
    /** The camera being controlled by this gizmo */
    camera: OrthographicCamera | PerspectiveCamera;
    /** The WebGLRenderer rendering the gizmo */
    renderer: WebGLRenderer;
    /** The configuration options */
    options: GizmoOptions;
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
    private _options;
    private _intersections;
    private _background;
    private _viewport;
    private _originalViewport;
    private _originalScissor;
    private _camera;
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
    private _pointerStart;
    private _focus;
    private _placement;
    private _controls?;
    private _controlsListeners?;
    /**
     * Creates a new ViewportGizmo instance.
     *
     * @param camera - The camera to be controlled by this gizmo
     * @param renderer - The WebGL renderer used to render the scene
     * @param options - {@link GizmoOptions}, Configuration options for the gizmo.
     * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
     * @param options.type - The gizmo configuration type. Either 'sphere' or 'cube', defaults to 'sphere'
     * @param options.size - Size of the gizmo widget in pixels. Defaults to 128
     * @param options.placement - Position of the gizmo in the viewport
     *    Options include:
     *    - `"top-left"`
     *    - `"top-center"`
     *    - `"top-right"`
     *    - `"center-left"`
     *    - `"center-center"`
     *    - `"center-right"`
     *    - `"bottom-left"`
     *    - `"bottom-center"`
     *    - `"bottom-right"`
     * @param options.offset - Offset of the gizmo from container edges in pixels
     * @param options.offset.left - Offset from the left edge
     * @param options.offset.top - Offset from the top edge
     * @param options.offset.right - Offset from the right edge
     * @param options.offset.bottom - Offset from the bottom edge
     * @param options.animated - Whether view changes should be animated. Defaults to true
     * @param options.speed - Animation speed multiplier. Defaults to 1
     * @param options.resolution - Texture resolution. Defaults to 64 for sphere, 128 for cube
     * @param options.lineWidth - Width of the axes lines in pixels
     * @param options.id - HTML `id` attribute for the gizmo container
     * @param options.className - HTML `class` attribute for the gizmo container
     * @param options.font - Font configuration for axis labels
     * @param options.font.family - Font family for axis labels
     * @param options.font.weight - Font weight for axis labels
     * @param options.background - Configuration for the background sphere/cube
     * @param options.background.enabled - Whether to display the background
     * @param options.background.color - Color of the background in normal state
     * @param options.background.opacity - Opacity of the background in normal state
     * @param options.background.hover.color - Color of the background when hovered
     * @param options.background.hover.opacity - Opacity of the background when hovered
     * @param options.corners - Configuration for corner indicators
     * @param options.corners.enabled - Whether to display corner indicators
     * @param options.corners.color - Base color of corner indicators
     * @param options.corners.opacity - Opacity of corner indicators
     * @param options.corners.scale - Scale multiplier for corner indicators
     * @param options.corners.radius - Radius of corner indicators
     * @param options.corners.smoothness - Smoothness of corner indicators
     * @param options.corners.hover.color - Color of corner indicators when hovered
     * @param options.corners.hover.opacity - Opacity of corner indicators when hovered
     * @param options.corners.hover.scale - Scale of corner indicators when hovered
     * @param options.edges - Configuration for edge indicators
     * @param options.edges.enabled - Whether to display edge indicators
     * @param options.edges.color - Base color of edge indicators
     * @param options.edges.opacity - Opacity of edge indicators
     * @param options.edges.scale - Scale multiplier for edge indicators
     * @param options.edges.radius - Radius of edge indicators
     * @param options.edges.smoothness - Smoothness of edge indicators
     * @param options.edges.hover.color - Color of edge indicators when hovered
     * @param options.edges.hover.opacity - Opacity of edge indicators when hovered
     * @param options.edges.hover.scale - Scale of edge indicators when hovered
     * @param options.x - Configuration for positive X axis/face
     * @param options.y - Configuration for positive Y axis/face
     * @param options.z - Configuration for positive Z axis/face
     * @param options.nx - Configuration for negative X axis/face
     * @param options.ny - Configuration for negative Y axis/face
     * @param options.nz - Configuration for negative Z axis/face
     *
     * @remarks Axis-specific configuration can also use alias names for cube mode:
     * - `right` (same as `x`)
     * - `left` (same as `nx`)
     * - `top` (same as `y`)
     * - `bottom` (same as `ny`)
     * - `front` (same as `z`)
     * - `back` (same as `nz`)
     *
     * For each axis/face configuration, the following options are available:
     * @param options.AXIS.enabled - Whether to draw the axis
     * @param options.AXIS.label - Custom text label for the axis
     * @param options.AXIS.opacity - Axis opacity
     * @param options.AXIS.scale - Scale multiplier for indicator size
     * @param options.AXIS.line - Whether to draw the axis line
     * @param options.AXIS.color - Axis indicator background color
     * @param options.AXIS.labelColor - Axis label color
     * @param options.AXIS.border.size - Border size around the axis indicator
     * @param options.AXIS.border.color - Border color around the axis indicator
     * @param options.AXIS.hover.color - Fill color on hover
     * @param options.AXIS.hover.labelColor - Label text color on hover
     * @param options.AXIS.hover.opacity - Opacity when hovered
     * @param options.AXIS.hover.scale - Indicator scale when hovered
     * @param options.AXIS.hover.border.size - Hover border size
     * @param options.AXIS.hover.border.color - Hover border color
     */
    constructor(camera: PerspectiveCamera | OrthographicCamera, renderer: WebGLRenderer, options?: GizmoOptions);
    /** Gets the current placement of the gizmo relative to its container. */
    get placement(): GizmoOptionsFallback["placement"];
    /**
     * Sets and update the placement of the gizmo relative to its container.
     *
     * @param placement - The new placement position
     */
    set placement(placement: GizmoOptionsFallback["placement"]);
    /**
     * Regenerates the gizmo with the new options.
     *
     * @remarks
     * - Not recommended for use in real-time rendering or animation loops
     * - Provides a way to completely rebuild the gizmo with new options
     * - Can be computationally expensive, so use sparingly
     */
    set(options?: GizmoOptions): this;
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
    attachControls(controls: OrbitControls): this;
    /** Removes all control event listeners and references. Safe to call multiple times. */
    detachControls(): this | undefined;
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
     * @param position - The axis point position
     */
    private _setOrientation;
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
