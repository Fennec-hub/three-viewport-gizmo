import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer, scene } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

let queued = false;
function requestRender() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => {
    queued = false;
    renderer.render(scene, camera);
    gizmo.render(); // a running turn takes its next step here and asks for the next frame
  });
}

// A turn step, a hover change, a new pose or a changed option.
gizmo.addEventListener("invalidate", requestRender);
controls.addEventListener("change", requestRender);
window.addEventListener("resize", requestRender);

// Build the gizmo's programs (WebGL) or pipelines (WebGPU) before the first frame.
await gizmo.compile();
requestRender();
