<script setup lang="ts">
const type = typeof window === "undefined" ? "sphere" : new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# WebGPU vs WebGL sample

Use the **WebGL | WebGPU** control in the header to set the parent page `?renderer=` query. Only this sample iframe reads that value; other examples stay on WebGL-only HTML.

<IframeContainer :url="`webgpu.html?type=${type}`" />

## What changes

The iframe loads [`webgpu.html`](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/webgpu.html): a minimal scene (grid + `MeshNormalMaterial` cube). It dynamically imports either **`three`** (**WebGL**) or **`three/webgpu`** (**WebGPU**) plus `await renderer.init()` on WebGPU before the first render.

```js
// WebGL (default)
import * as THREE from "three";

// WebGPU
import * as THREE from "three/webgpu";

const renderer = new THREE.WebGPURenderer({ antialias: true });
await renderer.init();
```

The `ViewportGizmo` constructor is unchanged in both paths.

### Source

[...samples/webgpu.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/webgpu.html)
