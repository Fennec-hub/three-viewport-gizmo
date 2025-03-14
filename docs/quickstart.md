# Quick Start

## Try it Online

You can try ViewportGizmo directly in your browser on [jsFiddle](https://jsfiddle.net/okycht2b/).

## Installation

You can install ViewportGizmo via npm, or directly import it via CDN.

::: code-group

```sh [npm]
$ npm install three-viewport-gizmo
```

```javascript [CDN module]
import * as THREE from "https://unpkg.com/three@0.173.0/build/three.module.js";
import { ViewportGizmo } from "https://unpkg.com/three-viewport-gizmo@2.2.0/dist/three-viewport-gizmo.js";
```

```html [CDN importsmap]
<script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.173.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.173.0/examples/jsm/",
      "three-viewport-gizmo": "https://unpkg.com/three-viewport-gizmo@2.2.0/dist/three-viewport-gizmo.js"
    }
  }
</script>

<script type="module">
  import * as THREE from "three";
  import { ViewportGizmo } from "three-viewport-gizmo";
</script>
```

:::

## Usage

ViewportGizmo can be integrated with [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) in just a few lines of code

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

## Example

Check the [Examples](./examples/orbit-controls) section for more advance implementations.

<IframeContainer url="orbit-controls.html" />
