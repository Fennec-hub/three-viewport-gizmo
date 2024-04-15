<h1 align="center">Three Viewport Gizmo</h1>

<p align="center">
  <img src="./demo/public/three-viewport-gizmo.png" width="524"/>
</p>

**Three Viewport Gizmo** is a highly customizable standalone interactive version of the official [three.js viewport helper](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/helpers/ViewHelper.js), it can be used alone or in conjuncture with [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls), [TrackballControls](https://threejs.org/docs/?q=track#examples/en/controls/TrackballControls) or custom camera controllers like [@yomotsu/camera-controls](https://github.com/yomotsu/camera-controls).

## Examples

- [Configuration](https://fennec-hub.github.io/three-viewport-gizmo/#/config)
- [Standalone](https://fennec-hub.github.io/three-viewport-gizmo)
- [OrbitControls](https://fennec-hub.github.io/three-viewport-gizmo/#/orbit)
- [TrackBallControls](https://fennec-hub.github.io/three-viewport-gizmo/#/trackball)
- [@yomotsu/camera-controls](https://fennec-hub.github.io/three-viewport-gizmo/#/controls)

## Installation

You can install **Three Viewport Gizmo** via npm:

```bash
npm install three-viewport-gizmo
```

## Usage

### Standalone

Use it with your `camera` and `renderer` instances, the `container` is the `HTMLElement` containing the canvas.

```javascript
import { ViewportGizmo } from "three-viewport-gizmo";

const container = document.body;
const viewportGizmo = new ViewportGizmo(camera, renderer, options);

// Animation loop
function animate() {
  viewportGizmo.render();

  // ... Your animation logic
  renderer.render(scene, camera);
}
```

### With OrbitControls or TrackBallControls

To properly work with `OrbitControls` or `TrackballControls`, you need to set the events listeners and animation loop as follow.

```javascript
import { ViewportGizmo } from "three-viewport-gizmo";

const container = document.body;
const viewportGizmo = new ViewportGizmo(camera, renderer, options);
const controls = new OrbitControls(camera, container);

viewportGizmo.target = controls.target;

// listeners
viewportGizmo.addEventListener("start", () => (controls.enabled = false));
viewportGizmo.addEventListener("end", () => (controls.enabled = true));

controls.addEventListener("change", () => {
  viewportGizmo.update();
});

// Animation loop
function animate() {
  viewportGizmo.render();

  // ... Your animation logic
  renderer.render(scene, camera);

  // Update the OrbitControls
  if (controls.enabled) controls.update();
}
```

### With [@yomotsu/camera-controls](https://github.com/yomotsu/camera-controls)

To set **Three Viewport Gizmo** with `camera-controls`, set the events listeners and the animation loop as the example below.

```javascript
import * as THREE from "three";
import { ViewportGizmo } from "three-viewport-gizmo";
import CameraControls from "camera-controls";

CameraControls.install({ THREE });

// init
const container = document.body;
const viewportGizmo = new ViewportGizmo(camera, renderer, options);
const controls = new CameraControls(camera, container);

// listeners
viewportGizmo.addEventListener("start", () => {
  // Disable controls on change start
  controls.enabled = false;
});

viewportGizmo.addEventListener("end", () => {
  // Enable controls on change end
  controls.enabled = true;
});

viewportGizmo.addEventListener("change", () => {
  // Set the camera new position
  controls.setPosition(...camera.position.toArray());
});

controls.addEventListener("update", () => {
  // Update the the gizmo on controls update
  controls.getTarget(viewportGizmo.target);
  viewportGizmo.update();
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  viewportGizmo.render();

  // ... Your animation logic
  renderer.render(scene, camera);

  // Update the CameraControls
  if (controls.enabled && !viewportGizmo.animating)
    controls.update(clock.getDelta());
}
```

## Configuration

You can customize the appearance and behavior of the gizmo by passing options during initialization:

```typescript
const options = {
  container: HTMLElement;
  size: number;
  placement:
    | "top-left"
    | "top-right"
    | "top-center"
    | "center-right"
    | "center-left"
    | "center-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  lineWidth: number;
  offset: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  backgroundSphere: {
    enabled: boolean;
    color: ColorRepresentation;
    opacity: number;
  };
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
};

type GizmoAxisOptions = {
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

const viewportGizmo = new ViewportGizmo(camera, renderer, options);
```

## Acknowledgments

- Thanks to the [Three.js](https://threejs.org/) community for their amazing work.
- This library was inspired from the official [Three.js Viewport Helper](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/helpers/ViewHelper.js).

## License

This project is licensed under the MIT License

## Contribution and Support

If you have any questions or need support, feel free to [open an issue](https://github.com/Fennec-hub//three-viewport-gizmo/issues).

Contributions are welcome! Fork the repository, make your changes, and submit a pull request.

---

Feel free to use, modify, and enhance Three Viewport Gizmo to suit your needs. Happy coding!
