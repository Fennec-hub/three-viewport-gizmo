import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer, resize, viewport } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "rounded-cube",
  container: viewport,
  className: "responsive-gizmo",
});

// render() measures the gizmo's box every frame: resize only your camera and renderer.
new ResizeObserver(resize).observe(viewport);
