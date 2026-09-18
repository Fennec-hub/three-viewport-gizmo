# WebGPU

[`WebGPURenderer`](https://threejs.org/docs/#WebGPURenderer) (`three/webgpu`) is supported alongside the legacy **`WebGLRenderer`**. Pass whichever renderer wraps the canvas where the gizmo should draw:

```js
import * as THREE from "three/webgpu";
import WebGPURenderer from "three/webgpu"; // equivalent entry for the class in many setups

const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
```

## Async initialization

Never call **`renderer.clear()`** (directly or transitively via `ViewportGizmo.render()`’s internals) until **`await renderer.init()`** has resolved. Omitting init can blank the first frames or race the backend bootstrap.

## Viewport semantics

Different three.js backends interpret **`setViewport(x, y, width, height)`** differently: legacy WebGL treats `y` as **bottom-origin**; **`WebGPURenderer`** treats `y` as **top-origin** (matching native WebGPU). Viewport dom layout is corrected automatically ([issue discussion](https://github.com/Fennec-hub/three-viewport-gizmo/issues/48)).

## Shared renderer vs standalone gizmo canvas

Combining scene rendering with a **`ViewportGizmo` render pass** inside the **same** `WebGPURenderer` remains possible for prototyping, but the unified renderer’s internal offscreen framebuffer and composite quad can distort or clip sub-rect overlays. For robust production UI, dedicate a separate small canvas/renderer to the gizmo (see [examples/webgpu](./examples/webgpu.md)).

Further reading:

- Sphere axis lines branch to **`Line2NodeMaterial`** fat lines automatically on **`WebGPURenderer`**; WebGL continues to use **`LineMaterial`**.

## Live sample

Open **[WebGPU example](./examples/webgpu)** and use the **WebGL / WebGPU** control in the site header to swap the sample iframe’s `?renderer=` query (URL-only, no persistence).
