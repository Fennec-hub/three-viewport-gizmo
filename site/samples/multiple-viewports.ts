import { PerspectiveCamera, type Scene } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { renderer } from "./host"; // @hide
declare const elements: HTMLElement[]; // @hide
declare function createScene(): Scene; // @hide

const views = elements.map((element) => {
  const camera = new PerspectiveCamera(50, 1, 0.1, 20);
  const gizmo = new ViewportGizmo(camera, renderer, { container: element, size: 80 });
  gizmo.attachControls(new OrbitControls(camera, element));
  return { element, scene: createScene(), camera, gizmo };
});

renderer.setAnimationLoop(() => {
  const canvas = renderer.domElement.getBoundingClientRect();
  renderer.setScissorTest(true);
  for (const { element, scene, camera, gizmo } of views) {
    const rect = element.getBoundingClientRect();
    const left = rect.left - canvas.left;
    const bottom = canvas.height - (rect.bottom - canvas.top); // WebGL: bottom-left origin
    renderer.setViewport(left, bottom, rect.width, rect.height);
    renderer.setScissor(left, bottom, rect.width, rect.height);
    renderer.render(scene, camera);
    gizmo.render(); // draws in its own rectangle and puts the viewport and scissor back
  }
  renderer.setScissorTest(false);
});
