<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# OrbitControls

<IframeContainer :url="`orbit-controls.html?type=${type}`" />

This example shows how to integrate ViewportGizmo with OrbitControls in a Three.js scene. The gizmo provides an interactive orientation guide linked to the camera, helping with navigation. It updates automatically with window resizing to keep the view responsive.

<div v-if="type === `sphere`">

```js {9,10,16,23}
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

</div>
<div v-else-if="type === `cube`">

```js {9,10,16,23}
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

//... Initialize your Scene

const controls = new OrbitControls(camera, renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
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

</div>
<div v-else-if="type === `rounded-cube`">

```js {9,10,16,23}
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

//... Initialize your Scene

const controls = new OrbitControls(camera, renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "rounded-cube" });
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

</div>

### Source

[...samples/orbit-controls.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/orbit-controls.html)
