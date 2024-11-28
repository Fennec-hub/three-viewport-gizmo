<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# OrbitControls Events

<IframeContainer :url="`orbit-controls-events.html?type=${type}`" />

This example demonstrates using event listeners for finer control over ViewportGizmo integration with OrbitControls. The gizmo and controls share a target, and event listeners toggle control states and update the gizmo when the controls change, ensuring smooth interaction.

<div v-if="type === 'cube'">

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

//... Scene's initialization

// Initialize The Gizmo
const gizmo = new ViewportGizmo(camera, renderer);
const controls = new OrbitControls(camera, renderer.domElement);

// The Gizmo  and the OrbitControls must share the same target
gizmo.target = controls.target.set(0, 3, 0);
camera.lookAt(controls.target);

// Set the events listeners
gizmo.addEventListener("start", () => (controls.enabled = false));
gizmo.addEventListener("end", () => (controls.enabled = true));
controls.addEventListener("change", () => gizmo.update(false));

// Render
function animation(time) {
  //... Scene's animations and render

  gizmo.render();
}

// Resize
window.onresize = () => {
  //... Scene's resize logic

  controls.update();
};
```

</div>

<div v-else>

```js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "three-viewport-gizmo";

//... Scene's initialization

// Initialize The Gizmo
const gizmo = new ViewportGizmo(camera, renderer);
const controls = new OrbitControls(camera, renderer.domElement, {
  type: "cube",
});

// The Gizmo  and the OrbitControls must share the same target
gizmo.target = controls.target.set(0, 3, 0);
camera.lookAt(controls.target);

// Set the events listeners
gizmo.addEventListener("start", () => (controls.enabled = false));
gizmo.addEventListener("end", () => (controls.enabled = true));
controls.addEventListener("change", () => gizmo.update(false));

// Render
function animation(time) {
  //... Scene's animations and render

  gizmo.render();
}

// Resize
window.onresize = () => {
  //... Scene's resize logic

  controls.update();
};
```

</div>

### Source

[...samples/orbit-controls-events.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/orbit-controls-events.html)
