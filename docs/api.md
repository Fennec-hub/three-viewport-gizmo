# ViewportGizmo

A 3D camera orientation controller that provides a visual interface for manipulating the camera's viewing angle. The widget displays the current camera orientation and allows users to adjust the view directly by clicking or dragging.

## Constructor

`constructor( camera: PerspectiveCamera | OrthographicCamera, renderer: WebGLRenderer, options?: GizmoOptions )`

- **`camera`** — `PerspectiveCamera | OrthographicCamera`
  - The camera to be controlled by the gizmo.
- **`renderer`** — `WebGLRenderer`
  - The renderer used to render the scene.
- **`options`** — [GizmoOptions](#gizmooptions) (optional)

  - Configuration options for the gizmo.

## Events

- **`start`** — Triggered when a view change interaction begins.

  - This event occurs when:
    - Dragging starts
    - Clicking an axis initiates a view transition

- **`change`** — Triggered during view changes.

  - This event occurs when:
    - Dragging updates the view
    - View transition animations are in progress
    - Any camera orientation updates happen

- **`end`** — Triggered when a view change interaction ends.
  - This event occurs when:
    - Dragging stops
    - View transition animation completes

## Properties

- **`enabled`** — `boolean`

  - Specifies if the gizmo is active and responsive to user input.

- **`camera`** — `OrthographicCamera | PerspectiveCamera`

  - The camera controlled by this gizmo.

- **`target`** — `Vector3`

  - The point around which the camera rotates.

- **`animated`** — `boolean`

  - Specifies if view changes should be animated.

- **`speed`** — `number`

  - Controls animation speed, where higher values result in faster animations.

- **`animating`** — `boolean` (readonly)
  - `True` if the gizmo is currently animating view changes.

## Methods

- **`render`** — `(): ViewportGizmo`

  - Renders the gizmo within the viewport.

- **`domUpdate`** — `(): ViewportGizmo`

  - Updates the gizmo’s DOM properties based on position and size in the document.

- **`cameraUpdate`** — `(): ViewportGizmo`

  - Updates the gizmo’s orientation to match the current camera orientation.

- **`update`** — `( controls?: boolean ): ViewportGizmo`

  - Performs a full update of the gizmo, including DOM and camera-related updates.

- **`attachControls`** — `( controls: OrbitControls ): void`

  - Links `OrbitControls` with the gizmo, managing interaction states and updates.

- **`detachControls`** — `(): void`

  - Removes all event listeners and detaches controls if previously attached.

- **`dispose`** — `(): void`
  - Cleans up all resources, including geometries, materials, textures, and event listeners.

---

## Interfaces

### GizmoOptions

```typescript
type GizmoOptions = Partial<{
  container: HTMLElement | string;
  size: number;
  placement: GizmoDomPlacement;
  animated: boolean;
  speed: number;
  lineWidth: number;
  offset: Partial<{
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }>;

  sphere: Partial<{
    enabled: boolean;
    color: ColorRepresentation;
    opacity: number;
    hoverColor: ColorRepresentation;
    hoverOpacity: number;
  }>;

  id: string;
  className: string;
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

type GizmoDomPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center-center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

type GizmoAxisOptions = {
  text?: string;
  circle?: boolean;
  line?: boolean;
  border?: boolean;
  colors: {
    main?: ColorRepresentation | [ColorRepresentation, ColorRepresentation];
    hover?: ColorRepresentation;
    text?: ColorRepresentation;
    hoverText?: ColorRepresentation;
  };
};
```

Defines configuration options for the `ViewportGizmo`. Each option customizes the appearance or behavior of the gizmo in the viewport.

- **`container`** — `HTMLElement | string`

  - Specifies the parent container for the gizmo. Can be an HTML element or a CSS selector string. If omitted, the gizmo will be added to `document.body`.

- **`size`** — `number`

  - Sets the size of the gizmo widget in pixels.

- **`placement`** — `GizmoDomPlacement`

  - Determines the position of the gizmo in the viewport. Valid values include:
    - `"top-left"`
    - `"top-center"`
    - `"top-right"`
    - `"center-left"`
    - `"center-center"`
    - `"center-right"`
    - `"bottom-left"`
    - `"bottom-center"`
    - `"bottom-right"`

- **`animated`** — `boolean`

  - Enables or disables animations for view changes. Set to `true` to animate transitions.

- **`speed`** — `number`

  - Adjusts the animation speed for view transitions, with higher values leading to faster animations.

- **`sphere`** — `object`

  - Defines configuration for the background sphere displayed behind the gizmo axes.
  - **`sphere.enabled`** — `boolean`
    - Enables or disables the background sphere.
  - **`sphere.color`** — `ColorRepresentation`
    - Specifies the color of the sphere.
  - **`sphere.opacity`** — `number`
    - Sets the opacity of the sphere, where `1` is fully opaque and `0` is fully transparent.

- **`id`** — `string`

  - Sets the HTML `id` attribute for the gizmo container element.

- **`className`** — `string`

  - Sets the HTML `class` attribute for the gizmo container element.

- **`font`** — `object`

  - Configuration for the font used in axis labels.
  - **`font.family`** — `string`
    - Specifies the font family for the axis labels.
  - **`font.weight`** — `string`
    - Sets the font weight for axis labels.

- **`resolution`** — `number`

  - Adjusts the resolution at which the gizmo is rendered.

- **Axis Configurations** (sub-properties for each axis)
  - **`options.[x | y | z | nx | ny | nz]`**
    - **`text`** — `string`
      - Custom text label for the axis.
    - **`circle`** — `boolean`
      - Toggles a circular indicator for the axis.
    - **`line`** — `boolean`
      - Toggles the axis line visibility.
    - **`border`** — `boolean`
      - Toggles a border around the axis indicator.
    - **`colors`** — `object`
      - **`main`** — `ColorRepresentation | [ColorRepresentation, ColorRepresentation]`
        - Main color(s) for the axis; can be a single color or an array specifying `[normal, hover]` colors.
      - **`hover`** — `ColorRepresentation`
        - Specifies the color when the axis is hovered.
      - **`text`** — `ColorRepresentation`
        - Sets the color for the axis label.
      - **`hoverText`** — `ColorRepresentation`
        - Sets the color for the axis label when hovered.

---

### ViewportGizmoEventMap

Defines custom events emitted by `ViewportGizmo`. This extends `Object3DEventMap` with additional events for gizmo interactions.

```typescript
interface ViewportGizmoEventMap extends Object3DEventMap {
  start: {};
  end: {};
  change: {};
}
```

- **`start`** — Triggered when a view change interaction begins.
- **`change`** — Triggered during view changes.
- **`end`** — Triggered when a view change interaction ends.
