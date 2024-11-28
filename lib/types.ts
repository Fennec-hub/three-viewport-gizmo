import { DeepRequired } from "utility-types";
import {
  BufferGeometry,
  ColorRepresentation,
  Mesh,
  MeshBasicMaterial,
  Object3DEventMap,
  Sprite,
} from "three";

/**
 * Configuration options for the ViewportGizmo.
 * All properties are optional and will fall back to default values if not specified.
 */
export type GizmoOptions = {
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
  placement?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center-center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";

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

/**
 * Configuration options for individual gizmo axes.
 * Each axis can be customized with its own appearance and behavior.
 */
export type GizmoAxisOptions = {
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

/** The {@link GizmoOptions } with all options set with their respective default and fallback */
export type GizmoOptionsFallback = DeepRequired<GizmoOptions> & {
  isSphere: boolean;
};

/** Axes Object */
export type GizmoAxisObject = Mesh<BufferGeometry, MeshBasicMaterial> | Sprite;
