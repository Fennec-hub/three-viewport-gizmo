import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "cube",
  className: "view-cube", // or `id`; host classes added later survive every set()
  background: { color: 0xdde3ea },
  front: { color: 0x3d8be8, labelColor: "white", hover: { color: 0x5aa0f0 } },
});
gizmo.attachControls(controls);

// One element for the gizmo's whole life: style it, measure it, append children to it.
console.log(gizmo.domElement.dataset.hovered); // "face", "edge", "corner" or undefined

// Read-only state, with an event when it changes.
gizmo.addEventListener("hoverchange", () => console.log(gizmo.hovered?.label));
gizmo.addEventListener("attargetchange", ({ atTarget }) => console.log(atTarget?.target.label ?? "between"));
console.log(gizmo.dragging, gizmo.animating, gizmo.heading, gizmo.canRoll);

// Turn off dragging, or one target, in place.
gizmo.set({ drag: false, bottom: { enabled: false } });

// Display only: no hover, press or keys, and data-disabled on the element.
gizmo.enabled = false;
