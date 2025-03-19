# ViewportGizmo

A 3D camera orientation controller that provides a visual interface for manipulating the camera's viewing angle. The widget displays the current camera orientation and allows users to adjust the view directly by clicking or dragging.

## Constructor

`constructor( camera: PerspectiveCamera | OrthographicCamera, renderer: WebGLRenderer, options?: GizmoOptions )`

- **`camera`** — `PerspectiveCamera | OrthographicCamera`

  The camera to be controlled by the gizmo.

- **`renderer`** — `WebGLRenderer`

  The renderer used to render the scene.

- **`options`** — [GizmoOptions](#gizmooptions) (optional)

  Configuration options for the gizmo.

## Events

- **`start`** — Triggered when a view change interaction begins.

  Occurs when:

  - Dragging starts
  - Clicking an axis initiates a view transition

- **`change`** — Triggered during view changes.

  Occurs when:

  - Dragging updates the view
  - View transition animations are in progress
  - Any camera orientation updates happen

- **`end`** — Triggered when a view change interaction ends.

  Occurs when:

  - Dragging stops
  - View transition animation completes

## Properties

- **`enabled`** — `boolean`

  Specifies if the gizmo is active and responsive to user input.

- **`camera`** — `OrthographicCamera | PerspectiveCamera`

  The camera controlled by this gizmo.

- **`target`** — `Vector3`

  The point around which the camera rotates.

- **`placement`** — `boolean`

  Sets and update the placement of the gizmo relative to its container.

- **`animated`** — `boolean`

  Specifies if view changes should be animated.

- **`speed`** — `number`

  Controls animation speed, where higher values result in faster animations.

- **`animating`** — `boolean` (readonly)

  `True` if the gizmo is currently animating view changes.

## Methods

- **`set`** — `( options?: GizmoOptions ): ViewportGizmo`

  Regenerates the gizmo with the new options.

  ::: warning

  - Not recommended for use in real-time rendering or animation loops
  - Provides a way to completely rebuild the gizmo with new options
  - Can be computationally expensive, so use sparingly
    :::

- **`render`** — `(): ViewportGizmo`

  Renders the gizmo within the viewport.

- **`domUpdate`** — `(): ViewportGizmo`

  Updates the gizmo's DOM properties based on position and size in the document.

- **`cameraUpdate`** — `(): ViewportGizmo`

  Updates the gizmo's orientation to match the current camera orientation.

- **`update`** — `( controls?: boolean ): ViewportGizmo`

  Performs a full update of the gizmo, including DOM and camera-related updates.

- **`attachControls`** — `( controls: OrbitControls ): void`

  Links `OrbitControls` with the gizmo, managing interaction states and updates.

- **`detachControls`** — `(): void`

  Removes all event listeners and detaches controls if previously attached.

- **`dispose`** — `(): void`

  Cleans up all resources, including geometries, materials, textures, and event listeners.

---

## Interfaces

### GizmoOptions

```typescript
type GizmoOptions = {
  container?: HTMLElement | string;
  type?: "sphere" | "cube";
  size?: number;
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

  offset?: {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
  };

  animated?: boolean;
  speed?: number;
  resolution?: number;
  lineWidth?: number;
  id?: string;
  className?: string;

  font?: {
    family?: string;
    weight?: string | number;
  };

  background?: {
    enabled?: boolean;
    color?: ColorRepresentation;
    opacity?: number;

    hover?: {
      color?: ColorRepresentation;
      opacity?: number;
    };
  };

  corners?: {
    enabled?: boolean;
    color?: ColorRepresentation;
    opacity?: number;
    scale?: number;
    radius?: number;
    smoothness?: number;
    hover?: {
      color?: ColorRepresentation;
      opacity?: number;
      scale?: number;
    };
  };

  edges?: {
    enabled?: boolean;
    color?: ColorRepresentation;
    opacity?: number;
    scale?: number;
    radius?: number;
    smoothness?: number;
    hover?: {
      color?: ColorRepresentation;
      opacity?: number;
      scale?: number;
    };
  };

  radius?: number;
  smoothness?: number;

  x?: GizmoAxisOptions;
  y?: GizmoAxisOptions;
  z?: GizmoAxisOptions;
  nx?: GizmoAxisOptions;
  ny?: GizmoAxisOptions;
  nz?: GizmoAxisOptions;

  right?: GizmoAxisOptions;
  top?: GizmoAxisOptions;
  front?: GizmoAxisOptions;
  left?: GizmoAxisOptions;
  bottom?: GizmoAxisOptions;
  back?: GizmoAxisOptions;
};

type GizmoAxisOptions = {
  enabled?: boolean;
  label?: string;
  opacity?: number;
  scale?: number;
  line?: boolean;
  color?: ColorRepresentation;
  labelColor?: ColorRepresentation;

  border?: {
    size: number;
    color: ColorRepresentation;
  };

  hover?: {
    color?: ColorRepresentation;
    labelColor?: ColorRepresentation;
    opacity?: number;
    scale?: number;
    border?: {
      size: number;
      color: ColorRepresentation;
    };
  };
};
```

Defines comprehensive configuration options for the `ViewportGizmo`. Each option customizes the appearance or behavior of the gizmo in the viewport.

- **`container`** — `HTMLElement | string`

  Specifies the parent container for the gizmo. Can be an HTML element or a CSS selector string.

- **`type`** — `"sphere" | "cube"`

  Determines the gizmo configuration type. Defaults to `"sphere"`.

- **`size`** — `number`

  Sets the size of the gizmo widget in pixels. Defaults to `128`.

- **`placement`** — `GizmoDomPlacement`

  Determines the position of the gizmo in the viewport. Valid values include:

  - `"top-left"`
  - `"top-center"`
  - `"top-right"`
  - `"center-left"`
  - `"center-center"`
  - `"center-right"`
  - `"bottom-left"`
  - `"bottom-center"`
  - `"bottom-right"`

- **`offset`** — `object`

  Configures offset from container edges in pixels.

  - **`left`** — `number`

    Offset from the left edge.

  - **`top`** — `number`

    Offset from the top edge.

  - **`right`** — `number`

    Offset from the right edge.

  - **`bottom`** — `number`

    Offset from the bottom edge.

- **`animated`** — `boolean`

  Enables or disables animations for view changes. Defaults to `true`.

- **`speed`** — `number`

  Adjusts the animation speed for view transitions. Defaults to `1`.

- **`resolution`** — `number`

  Adjusts the texture resolution. Defaults to `64` for sphere, `128` for cube.

- **`lineWidth`** — `number`

  Sets the width of the axes lines in pixels.

- **`id`** — `string`

  Sets the HTML `id` attribute for the gizmo container element.

- **`className`** — `string`

  Sets the HTML `class` attribute for the gizmo container element.

- **`font`** — `object`

  Configuration for the font used in axis labels.

  - **`family`** — `string`
    - Specifies the font family for the axis labels.
  - **`weight`** — `string | number`
    - Sets the font weight for axis labels.

- **`background`** — `object`

  Configures the background sphere/cube.

  - **`enabled`** — `boolean`

    Enables or disables the background.

  - **`color`** — `ColorRepresentation`

    Sets the background color in normal state.

  - **`opacity`** — `number`

    Sets the background opacity in normal state.

  - **`hover`** — `object`

    - **`color`** — `ColorRepresentation`

      Sets the background color when hovered.

    - **`opacity`** — `number`

      Sets the background opacity when hovered.

- **`corners`** — `object`

  Configures corner indicators.

  - **`enabled`** — `boolean`

    Enables or disables corner indicators.

  - **`color`** — `ColorRepresentation`
    Sets the base color of corner indicators.
  - **`opacity`** — `number`
    Sets the opacity of corner indicators.
  - **`scale`** — `number`
    Sets the scale multiplier for corner indicators.
  - **`radius`** — `number`
    Sets the radius of corner indicators.
  - **`smoothness`** — `number`
    Controls the smoothness of corner indicators.
  - **`hover`** — `object`

    - **`color`** — `ColorRepresentation`

      Sets the color of corner indicators when hovered.

    - **`opacity`** — `number`

      Sets the opacity of corner indicators when hovered.

    - **`scale`** — `number`

      Sets the scale of corner indicators when hovered.

- **`edges`** — `object`

  Configures edge indicators.

  - **`enabled`** — `boolean`
    - Enables or disables edge indicators.
  - **`color`** — `ColorRepresentation`
    - Sets the base color of edge indicators.
  - **`opacity`** — `number`
    - Sets the opacity of edge indicators.
  - **`scale`** — `number`
    - Sets the scale multiplier for edge indicators.
  - **`radius`** — `number`
    - Sets the radius of edge indicators.
  - **`smoothness`** — `number`
    - Controls the smoothness of edge indicators.
  - **`hover`** — `object`
    - **`color`** — `ColorRepresentation`
      - Sets the color of edge indicators when hovered.
    - **`opacity`** — `number`
      - Sets the opacity of edge indicators when hovered.
    - **`scale`** — `number`
      - Sets the scale of edge indicators when hovered.

- **Axis Configurations**

  - Configurations for `x`, `y`, `z`, `nx`, `ny`, `nz` axes
  - Alias names for cube mode: `right`, `left`, `top`, `bottom`, `front`, `back`

  Each axis configuration supports:

  - **`enabled`** — `boolean`

    Toggles the axis visibility.

  - **`label`** — `string`

    Custom text label for the axis.

  - **`opacity`** — `number`

    Sets the axis opacity.

  - **`scale`** — `number`

    Sets the scale multiplier for the indicator size.

  - **`line`** — `boolean`

    Toggles the axis line visibility.

  - **`color`** — `ColorRepresentation`

    Sets the axis indicator background color.

  - **`labelColor`** — `ColorRepresentation`

    Sets the axis label color.

  - **`border`** — `object`

    - **`size`** — `number`

      Sets the border size around the axis indicator.

    - **`color`** — `ColorRepresentation`

      Sets the border color around the axis indicator.

  - **`hover`** — `object`

    - **`color`** — `ColorRepresentation`

      Sets the fill color on hover.

    - **`labelColor`** — `ColorRepresentation`

      Sets the label text color on hover.

    - **`opacity`** — `number`

      Sets the opacity when hovered.

    - **`scale`** — `number`

      Sets the indicator scale when hovered.

    - **`border`** — `object`

      - **`size`** — `number`

        Sets the hover border size.

      - **`color`** — `ColorRepresentation`

        Sets the hover border color.

---

### ViewportGizmoEventMap

Defines custom events emitted by `ViewportGizmo`. This extends `Object3DEventMap` with additional events for gizmo interactions.

- **`start`** — Triggered when a view change interaction begins.
- **`change`** — Triggered during view changes.
- **`end`** — Triggered when a view change interaction ends.
