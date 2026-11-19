import type {
  Color,
  ColorRepresentation,
  Material,
  MeshBasicMaterial,
  SpriteMaterial,
  Texture,
  Vector3,
  Vector3Like,
} from "three";

// The 3.0 public contract. Everything above the "Internal" section is exported from `lib/index.ts`, and the root
// `.d.ts` imports only `three`. "Target" replaces 2.x "axis" in every public name (R15).

// --- Targets (R15, R9, R4) -------------------------------------------------------------------------------------------

/** What a target is: one of the 6 faces, 12 edges or 8 corners. */
export type GizmoTargetKind = "face" | "edge" | "corner";

/** A face, named by the label frame (R4): `top` is the face labelled Top on every up axis. */
export type GizmoFaceName = "top" | "bottom" | "front" | "back" | "right" | "left";

/** One of the 26 targets. Edges and corners join face names in one order: vertical, depth, lateral. */
export type GizmoTargetName =
  | GizmoFaceName
  | `${"top" | "bottom"}-${"front" | "back"}`
  | `${"top" | "bottom"}-${"right" | "left"}`
  | `${"front" | "back"}-${"right" | "left"}`
  | `${"top" | "bottom"}-${"front" | "back"}-${"right" | "left"}`;

/** A target as data. Events and state carry this, never a mesh (R3). */
export type GizmoTarget = Readonly<{
  name: GizmoTargetName;
  kind: GizmoTargetKind;
  /** Unit vector from the orbit target towards the camera when the view looks from this target. World space. */
  direction: Readonly<Vector3>;
  /** The drawn label for a face; the face labels joined by a space for an edge or corner ("Top Front"). */
  label: string;
}>;

// --- Pose, causes and outcomes (R3, L3, U9) --------------------------------------------------------------------------

/** A camera pose. `camera.lookAt` from `direction` with `up` rebuilds the frame exactly (L3). */
export type GizmoPose = Readonly<{
  /** Unit vector from the orbit target to the camera. */
  direction: Readonly<Vector3>;
  /** The up to give the camera: the orbit up at rest, the exact screen up while a roll eases out. */
  up: Readonly<Vector3>;
}>;

/** What moved the view. `navigation` is a press on a built-in navigation button. */
export type GizmoCause = "click" | "drag" | "key" | "navigation" | "api";

/** Where a turn is going. `target` is null when the end pose is not one of the 26. */
export type GizmoHeading = Readonly<{ target: GizmoTarget | null; pose: GizmoPose }>;

/**
 * How a turn or drag ended. Superseded and refused turns are outcomes, never exceptions.
 * - `reached`: the view arrived.
 * - `interrupted`: a newer turn, a grab or a drag took over; `by` says which.
 * - `cancelled`: stopped where it was by `cancel()`, a browser `pointercancel`, `enabled = false`, a `set()` that
 *   rebuilds, or `dispose()`.
 * - `unavailable`: refused before it began; no `start` or `end` fires. `roll-off`: a roll while `canRoll` is false.
 */
export type GizmoOutcome =
  | Readonly<{ status: "reached" }>
  | Readonly<{ status: "interrupted"; by: GizmoCause }>
  | Readonly<{ status: "cancelled"; reason: "cancel" | "pointercancel" | "disabled" | "set" | "dispose" }>
  | Readonly<{ status: "unavailable"; reason: "roll-off" }>;

/** The `end` payload, and what every turn's promise resolves with. `pose` is where the view stopped. */
export type GizmoTurnEnd = Readonly<{ cause: GizmoCause; pose: GizmoPose; outcome: GizmoOutcome }>;

// --- At-target state (roll rulings 2 and B) --------------------------------------------------------------------------

/** A side of the screen, for side-triangle turns. */
export type GizmoSide = "left" | "right" | "up" | "down";

/**
 * The target the view rests on: its direction is the target's within the target tolerance and its screen up is a
 * whole number of quarter turns from upright about it. Null while dragging or animating and after a free drag.
 */
export type GizmoAtTarget = Readonly<{
  target: GizmoTarget;
  /** At a face: the face each side triangle turns to, for its accessible name. Null at an edge or corner. */
  sides: Readonly<Record<GizmoSide, GizmoTarget>> | null;
}>;

// --- Turns (R15, U9, L6, ruling 3) -----------------------------------------------------------------------------------

/** A view to look from: a target, `home` (Top Front Right, upright in the label frame), or any direction. */
export type GizmoView = GizmoTargetName | "home" | Readonly<Vector3Like>;

/** Options of `lookFrom`. */
export type GizmoLookFromOptions = Readonly<{
  /** Whether to turn over time. Default: the `animated` option. */
  animated?: boolean;
  /** `keep` (default) keeps the cardinal up nearest the orbit up; `reset` returns to the label up. `home` resets. */
  up?: "keep" | "reset";
}>;

/**
 * A relative turn: either a side-triangle turn or angles in radians. Angles turn in the orbit frame, so they follow the
 * screen after a roll.
 */
export type GizmoTurn =
  | Readonly<{
      /** Upright to the face on that side of the screen (ruling B). At a pole it carries on over the top. */
      toward: GizmoSide;
      animated?: boolean;
      azimuth?: never;
      polar?: never;
      roll?: never;
    }>
  | Readonly<{
      /** Radians about the orbit up. */
      azimuth?: number;
      /** Radians away from the orbit up. */
      polar?: number;
      /** Radians about the view direction; positive turns the scene clockwise on screen. */
      roll?: number;
      animated?: boolean;
      toward?: never;
    }>;

// --- Controls (R13, U5, U11, L5, ruling A) ---------------------------------------------------------------------------

/**
 * The structural controls contract. `OrbitControls`, `MapControls`, `TrackballControls` and `ArcballControls` satisfy
 * it as they are; camera-controls goes through its adapter. Limits are read when they are numbers (U5).
 */
export type GizmoControls = {
  target: Vector3;
  enabled: boolean;
  update(): unknown;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
  /**
   * Called after the gizmo changes `camera.up`. When present, `roll` defaults on (ruling A). Optional by ruling A, a
   * recorded deviation from library API policy section 11: a method cannot be added to third-party controls.
   */
  updateCameraUp?(): void;
  /** Radians. */
  minPolarAngle?: number;
  /** Radians. */
  maxPolarAngle?: number;
  /** Radians. */
  minAzimuthAngle?: number;
  /** Radians. */
  maxAzimuthAngle?: number;
};

// --- Options (R8, R12, U4 to U8, U10, R11, OD2, OD3, P D19) ----------------------------------------------------------

/**
 * Options for one target. Keys `x` to `nz` of {@link GizmoOptions} name world axis ends; `top`, `bottom`, `front`,
 * `back`, `right` and `left` name faces in the label frame.
 */
export type GizmoTargetOptions = {
  /** Whether to draw the target. Default `true` */
  enabled?: boolean;

  /** Custom text label. Default: the face name */
  label?: string;

  /** 0 to 1. Default `1` */
  opacity?: number;

  /** Multiplier for the indicator size. Default `1` */
  scale?: number;

  /** Whether to draw the axis line. */
  line?: boolean;

  /** The indicator background color. */
  color?: ColorRepresentation;

  /** The label text color. */
  labelColor?: ColorRepresentation;

  /** The border around the indicator. */
  border?: {
    size: number;
    color: ColorRepresentation;
  };

  /** The indicator while hovered. */
  hover?: {
    color?: ColorRepresentation;
    labelColor?: ColorRepresentation;
    /** 0 to 1. Default `1` */
    opacity?: number;
    /** Default `1` */
    scale?: number;
    border?: {
      size: number;
      color: ColorRepresentation;
    };
  };
};

/** Polar and azimuth limits in the orbit frame, with the `OrbitControls` names. Radians. */
export type GizmoLimits = {
  /** Radians. */
  minPolarAngle?: number;
  /** Radians. */
  maxPolarAngle?: number;
  /** Radians. */
  minAzimuthAngle?: number;
  /** Radians. */
  maxAzimuthAngle?: number;
};

/** The built-in navigation buttons (OD2). Off by default. */
export type GizmoNavigationOptions = {
  /** Default `false`: no node is added. */
  enabled?: boolean;
  /** Side triangles at face views. Default `true`. */
  sides?: boolean;
  /** Roll arrows at any target, shown only while `canRoll`. Default `true`. */
  roll?: boolean;
  /** Home, shown at every view. Default `true`. */
  home?: boolean;
  /** `hover` (default): on hover near the gizmo, on focus within it, and always on touch. `always`: always. */
  reveal?: "hover" | "always";
};

/** A material the gizmo can write its colour and label into. `MeshBasicNodeMaterial` qualifies. */
export type GizmoMaterial = Material & { color: Color; map: Texture | null };

/** Which entries of `gizmo.targets` draw with a material, and in which state (P D19). */
export type GizmoMaterialUse = Readonly<{ targets: readonly GizmoTarget[]; state: "idle" | "hover" }>;

/** Configuration of a `ViewportGizmo`. Every option is optional; `set()` merges a partial into the current options. */
export type GizmoOptions = {
  /** Parent element of the gizmo, or a CSS selector. Default: the canvas's parent element */
  container?: HTMLElement | string;

  /** Default `sphere` */
  type?: "sphere" | "cube" | "rounded-cube";

  /** CSS pixels. Default `128` */
  size?: number;

  /** Placement in the container: vertical alignment, then horizontal alignment. */
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

  /** Offset from the container edges in CSS pixels. Each side defaults to `10` */
  offset?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };

  /** Whether view changes are animated. Default: off under `prefers-reduced-motion`, else on */
  animated?: boolean;

  /** Animation speed multiplier. Default `1` */
  speed?: number;

  /**
   * The side of every label texture in texels. Default: unset, each label sized from `size` and the device pixel
   * ratio. Texture sizes are fixed when the scene is built, so a later `size` change keeps them until a rebuild.
   */
  resolution?: number;

  /**
   * Label up. Must be within 1e-6 of a signed axis. Default: `camera.up` at construction (R12), snapped to the nearest
   * signed axis.
   */
  up?: Readonly<Vector3Like>;

  /** Direction the Front label faces, perpendicular to `up` (U8). Default: the 2.x front for that up. */
  frontDirection?: Readonly<Vector3Like>;

  /**
   * Whether the view may roll (L4). Default inferred: on when the gizmo writes the camera (not controlled mode) and
   * no controls are attached or the attached controls can take a new up (`updateCameraUp()`, or `OrbitControls` and
   * `MapControls` from three 0.168); off in controlled mode or when the attached controls cannot take a new up, such as
   * `TrackballControls` and `ArcballControls`. `'free'`: every click, side triangle and roll is the single shortest
   * rotation (free orbit, trackball-style).
   */
  roll?: boolean | "free";

  /** Pole entry in the label frame (U7). A rolled frame always uses `nearest`. Default `front`. */
  poleEntry?: "front" | "nearest";

  /** A click on the target the view rests on turns to the opposite one (U6). Default `false`. */
  oppositeOnRepeat?: boolean;

  /** Whether a drag on the gizmo turns the view (U10). Default `true`. */
  drag?: boolean;

  /** Polar and azimuth limits in the orbit frame (U5). */
  limits?: GizmoLimits;

  /**
   * Report the pose in `change` and write no camera (U4). Default `false`. The host applies each pose (`lookAt` from
   * `direction` with `up` reproduces write mode) and calls `update()`. The gizmo still disables attached controls while
   * it turns, but neither updates them nor calls `updateCameraUp()`: sync controls that keep their own state, such as
   * camera-controls, after `end`.
   */
  controlled?: boolean;

  /** Vertical field of view of the gizmo's own camera, in radians; the cube keeps its apparent size (R11). */
  fieldOfView?: number;

  /** The built-in navigation buttons. */
  navigation?: GizmoNavigationOptions;

  /** The built-in axis triad for the cube types (OD3). Default off. */
  triad?: {
    enabled?: boolean;
    /** Line and label colour of each world axis. Default: Tau's dark red, green and blue. */
    colors?: { x?: ColorRepresentation; y?: ColorRepresentation; z?: ColorRepresentation };
  };

  /** Called for each target material the gizmo builds, on build and on every rebuild; returns its replacement. */
  onMaterial?: (material: MeshBasicMaterial | SpriteMaterial, use: GizmoMaterialUse) => GizmoMaterial;

  /** The width of the axis lines in CSS pixels. */
  lineWidth?: number;

  /** HTML `id` attribute of the gizmo element. */
  id?: string;

  /** HTML `class` attribute of the gizmo element. */
  className?: string;

  /** Font of the labels, as CSS font properties. */
  font?: {
    family?: string;
    weight?: string | number;
    /** CSS pixels. */
    size?: number;
  };

  /** The background disc of the sphere. */
  background?: {
    enabled?: boolean;
    color?: ColorRepresentation;
    /** 0 to 1. */
    opacity?: number;
    hover?: {
      color?: ColorRepresentation;
      /** 0 to 1. */
      opacity?: number;
    };
  };

  /** The corner targets. */
  corners?: {
    /** Default `true` */
    enabled?: boolean;
    color?: ColorRepresentation;
    /** 0 to 1. Default `1` */
    opacity?: number;
    /** Default `1` */
    scale?: number;
    /** 0 to 1. Default `1` for the sphere, `0.2` for the cube */
    radius?: number;
    /** Default `18` */
    smoothness?: number;
    /**
     * How far in from the cube's edge a pointer still lands on a corner, in gizmo units (a face's half-width is 1): a
     * point within it on all three axes is the corner. Hit test only: the drawn corner and its hover highlight are
     * unchanged. Clamped to `[radius, 1)` on `rounded-cube` and `[0, 1)` on `cube`; a corner also reaches as far as
     * the edges meeting there. Default `0.35` for `cube`; `min(radius + 0.2, (1 + radius) / 2)` for `rounded-cube`
     * (the rounded patch plus 0.2, kept off the inner half of each face). Ignored by `sphere`.
     */
    hitSize?: number;
    hover?: {
      color?: ColorRepresentation;
      /** 0 to 1. */
      opacity?: number;
      scale?: number;
    };
  };

  /** The edge targets. */
  edges?: {
    /** Default `true` */
    enabled?: boolean;
    color?: ColorRepresentation;
    /** 0 to 1. Default `1` */
    opacity?: number;
    /** Default `1` */
    scale?: number;
    /** CSS pixels. Default `2` */
    radius?: number;
    /** 1 to 10. Default `8` */
    smoothness?: number;
    /**
     * How far in from the cube's edge a pointer still lands on an edge, in gizmo units (a face's half-width is 1): a
     * point within it on two axes is the edge. Hit test only: the drawn edge and its hover highlight are unchanged.
     * Never narrower than the drawn edge: clamped to `[radius, 1)` on `rounded-cube` and `[0.3, 1)` on `cube` (the gap
     * between its face tiles). Default `0.3` for `cube`; `min(max(radius + 0.1, 0.15), (1 + radius) / 2)` for
     * `rounded-cube` (the drawn strip plus 0.1, as the corners have their 0.2, kept off the inner half of each face;
     * 0.4 at the default `radius`). Ignored by `sphere`.
     */
    hitSize?: number;
    hover?: {
      color?: ColorRepresentation;
      /** 0 to 1. */
      opacity?: number;
      scale?: number;
    };
  };

  /** The edge radius of every target; for `rounded-cube`, the radius of its rounded edges and corners. */
  radius?: number;

  /** The edge smoothness of every target. */
  smoothness?: number;

  /** World +X. */
  x?: GizmoTargetOptions;
  /** World +Y. */
  y?: GizmoTargetOptions;
  /** World +Z. */
  z?: GizmoTargetOptions;
  /** World -X. */
  nx?: GizmoTargetOptions;
  /** World -Y. */
  ny?: GizmoTargetOptions;
  /** World -Z. */
  nz?: GizmoTargetOptions;
  /** The face labelled Top. */
  top?: GizmoTargetOptions;
  /** The face labelled Bottom. */
  bottom?: GizmoTargetOptions;
  /** The face labelled Front. */
  front?: GizmoTargetOptions;
  /** The face labelled Back. */
  back?: GizmoTargetOptions;
  /** The face labelled Right. */
  right?: GizmoTargetOptions;
  /** The face labelled Left. */
  left?: GizmoTargetOptions;
};

/** Every key required, recursively; functions, colours and vectors kept whole. */
type DeepRequired<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends { isColor: true } | { isVector3: true }
    ? T
    : T extends object
      ? { [Key in keyof T]-?: DeepRequired<Exclude<T[Key], undefined>> }
      : T;

/** The face-name style keys: merged into the axis end of the face they name, then dropped. */
type FaceAliasKey = "top" | "bottom" | "front" | "back" | "right" | "left";

/** Options that stay optional once resolved: they have no default. */
type UnfilledKey = "container" | "resolution" | "onMaterial" | "id" | "className";

/**
 * The options as resolved: every default filled at every depth, `up` and `frontDirection` as vectors, `roll` and
 * `animated` decided. The face aliases (`top` to `left`) are merged into the axis end they name and are not kept.
 * `container`, `resolution`, `onMaterial`, `id`, `className` and `font.size` have no default and stay optional.
 */
export type GizmoResolvedOptions = Readonly<
  DeepRequired<Omit<GizmoOptions, FaceAliasKey | UnfilledKey | "up" | "frontDirection" | "roll" | "animated" | "font">> &
    Pick<GizmoOptions, UnfilledKey> & {
      up: Readonly<Vector3>;
      frontDirection: Readonly<Vector3>;
      roll: boolean | "free";
      animated: boolean;
      font: Readonly<{ family: string; weight: string | number; size?: number }>;
    }
>;

// --- Frame (R6, R11) -------------------------------------------------------------------------------------------------

/** The gizmo's rectangle in CSS pixels, in the renderer's `setViewport` convention (y from the bottom on WebGL). */
export type GizmoViewport = Readonly<{ x: number; y: number; width: number; height: number }>;

// --- Events (R3, P11) ------------------------------------------------------------------------------------------------

/** The events of a `ViewportGizmo`. Every payload is fresh per event. */
export type ViewportGizmoEventMap = {
  /**
   * Every accepted press on the element, whether or not a turn follows. The field is not named `target`: three's
   * `EventDispatcher` writes the dispatcher to `event.target`.
   */
  press: Readonly<{ pressed: GizmoTarget | null }>;
  /** A turn or drag began. Never for a press that turns nothing. `heading` is null for a drag. */
  start: Readonly<{ cause: GizmoCause; heading: GizmoHeading | null }>;
  /** Every flight frame and every drag step. */
  change: Readonly<{ cause: GizmoCause; heading: GizmoHeading | null; pose: GizmoPose }>;
  /** Balanced with `start` under cancel, dispose, `set()` and `enabled = false`. */
  end: GizmoTurnEnd;
  /** Pointer hover changed, including after the view turns under a still pointer. Never for touch. */
  hoverchange: Readonly<{ hovered: GizmoTarget | null }>;
  /** The target the view rests on changed. */
  attargetchange: Readonly<{ atTarget: GizmoAtTarget | null }>;
  /** The gizmo needs a frame: a flight step, hover, pose or option change (P11). */
  invalidate: Readonly<Record<never, never>>;
};
