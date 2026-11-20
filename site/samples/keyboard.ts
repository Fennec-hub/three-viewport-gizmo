import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

// The gizmo calls preventDefault() on the keys it takes and lets them bubble.
window.addEventListener("keydown", (event) => {
  if (event.defaultPrevented) return;
  if (event.key === "ArrowLeft") console.log("your own shortcut");
});

// A capture-phase handler runs first: leave keys aimed at the gizmo alone.
window.addEventListener(
  "keydown",
  (event) => {
    if (event.target instanceof Node && gizmo.domElement.contains(event.target)) return;
    console.log("your own capture-phase shortcut", event.key);
  },
  { capture: true }
);

// Out of the tab order, with aria-disabled, while the gizmo is display only.
gizmo.enabled = false;
