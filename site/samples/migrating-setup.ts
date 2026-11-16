import { AxesHelper, Vector3 } from "three";
import { ViewportGizmo, ViewportGizmoError } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer, viewport } from "./host"; // @hide

// 1. The default container is the canvas's parent (2.x: document.body). Add the canvas first.
viewport.appendChild(renderer.domElement);

// 2. Up comes from camera.up at construction (2.x: Object3D.DEFAULT_UP, followed live).
camera.up.set(0, 0, 1);

const gizmo = new ViewportGizmo(camera, renderer, {
  className: "viewport-gizmo", // 3. style the element with CSS: see the stylesheet below
  animated: true, // 4. unset, it now follows prefers-reduced-motion
});

// 5. attachControls copies the controls' target; it no longer shares the vector.
gizmo.attachControls(controls);

// 6. placement, animated and speed are options; set() merges instead of resetting the rest.
gizmo.set({ placement: "bottom-right", speed: 2 });

// 7. Object3D members moved to the root object: gizmo.add(x) is gizmo.root.add(x).
gizmo.root.add(new AxesHelper(0.5));

// 8. Bad options throw a coded error, and set() changes nothing when it throws.
try {
  gizmo.set({ up: new Vector3(1, 1, 0) });
} catch (error) {
  if (error instanceof ViewportGizmoError) console.warn(error.code, error.message); // INVALID_FRAME
}
