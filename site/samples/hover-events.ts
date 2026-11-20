import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, { type: "rounded-cube" });
gizmo.attachControls(controls);

// The target under the mouse or pen, or null when it leaves. Never fires for touch.
gizmo.addEventListener("hoverchange", ({ hovered }) => {
  console.log(hovered ? `${hovered.kind} ${hovered.name}` : "nothing hovered");
});

// Every press on the gizmo, whether or not a turn follows.
gizmo.addEventListener("press", ({ pressed }) => console.log("pressed", pressed?.label));

// Each frame of a turn says what caused it and where it is going.
gizmo.addEventListener("change", ({ cause, heading }) => {
  if (cause === "click" && heading?.target) console.log("turning to", heading.target.label);
});
