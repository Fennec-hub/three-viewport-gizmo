<h1 align="center">Three Viewport Gizmo</h1>

<p align="center">
  <a href="https://fennec-hub.github.io/three-viewport-gizmo/">
  <img src="./live/public/three-viewport-gizmo.png" width="524"/>
  </a>
</p>

<a href="https://fennec-hub.github.io/three-viewport-gizmo/">**Three Viewport Gizmo**</a> is a highly customizable standalone interactive version of the official [three.js viewport helper](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/helpers/ViewHelper.js), it can be used alone or in conjuncture with [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) or custom camera controllers like [@yomotsu/camera-controls](https://github.com/yomotsu/camera-controls).

<h3 align="center">
  📚 <a href="https://fennec-hub.github.io/three-viewport-gizmo/">Documentation</a> -
  🚀 <a href="https://fennec-hub.github.io/three-viewport-gizmo/quickstart">Quickstart</a> -
  🛠️ <a href="https://fennec-hub.github.io/three-viewport-gizmo/api ">API</a> -
  ⚡️ <a href="https://fennec-hub.github.io/three-viewport-gizmo/examples/orbit-controls">Examples</a>
</h3>

---

## Quick Start

### Try it Online

You can try ViewportGizmo directly in your browser on [jsFiddle](https://jsfiddle.net/okycht2b/).

### Installation

```sh
npm install three-viewport-gizmo
```

### Usage

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

//... Initialize your Scene

const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer);

gizmo.attachControls(controls);

// Render
function animation(time) {
  //... Scene's animations and render

  gizmo.render();
}

// Resize
window.onresize = () => {
  //... Scene's resize logic

  gizmo.update();
};
```

## WebGPU (`WebGPURenderer`)

`ViewportGizmo` accepts the same `renderer` argument you already pass everywhere: either the legacy **`WebGLRenderer`** or **`WebGPURenderer`** (`import * as THREE from "three/webgpu"`). Detection uses the renderer’s `isWebGPURenderer` flag from three.js itself (no caller configuration).

Important details:

1. **`WebGPURenderer` must finish async init** before clearing or relying on pixels; call **`await renderer.init()`** once after constructing the renderer. See [`live/src/WebGPU.ts`](./live/src/WebGPU.ts).

2. **Viewport layout** uses the correct `setViewport` y-origin for WebGPU versus WebGL internally (see [#48](https://github.com/Fennec-hub/three-viewport-gizmo/issues/48)).

3. **Shared renderer caveat** — using the same `WebGPURenderer` instance for both the main scene and a sub-rect gizmo pass can interact badly with three.js’s internal offscreen framebuffer + composite quad in some setups. Prefer a **dedicated smaller canvas/renderer** only for the gizmo (the pattern documented on the deployed docs site).

For a minimal WebGL/WebGPU playground, see the **[WebGPU example](https://fennec-hub.github.io/three-viewport-gizmo/examples/webgpu)** (header toggle adjusts the sample iframe query string).

## Acknowledgments

- Thanks to the [Three.js](https://threejs.org/) community for their amazing work.
- This library was inspired from the official [Three.js Viewport Helper](https://github.com/mrdoob/three.js/blob/dev/examples/jsm/helpers/ViewHelper.js).

## License

This project is licensed under the MIT License

### Contribution and Support

If you have any questions or need support, feel free to [open an issue](https://github.com/Fennec-hub//three-viewport-gizmo/issues).

Contributions are welcome! Fork the repository, make your changes, and submit a pull request.
