import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide
declare const checkbox: HTMLInputElement; // @hide

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "rounded-cube",
  radius: 0.3, // edge and corner radius; the default
  triad: { enabled: true, colors: { x: "#e5484d", y: "#46a758", z: "#3e63dd" } },
});
gizmo.attachControls(controls);

// Switch the triad at runtime: set() merges, and only the triad's draws change.
checkbox.addEventListener("change", () => gizmo.set({ triad: { enabled: checkbox.checked } }));
