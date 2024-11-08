# OrbitControls

<IframeContainer url="orbit-controls.html" />

This example shows how to integrate ViewportGizmo with OrbitControls in a Three.js scene. The gizmo provides an interactive orientation guide linked to the camera, helping with navigation. It updates automatically with window resizing to keep the view responsive.

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

### Source

[...samples/orbit-controls.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/orbit-controls.html)
