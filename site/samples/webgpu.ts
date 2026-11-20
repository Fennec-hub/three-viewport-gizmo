import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, scene, viewport } from "./host"; // @hide

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init(); // before the first render or clear
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
viewport.appendChild(renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(new OrbitControls(camera, renderer.domElement));

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
