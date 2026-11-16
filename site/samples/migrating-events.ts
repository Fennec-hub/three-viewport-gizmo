import { Vector3 } from "three";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer);

// change: { kind, axes, face, direction } → { cause, heading, pose }
gizmo.addEventListener("change", ({ cause, heading, pose }) => {
  if (cause === "click") console.log("to", heading?.target?.name, "now at", pose.direction);
});

// hoverchange: { object, kind, axes, face, direction } → { hovered }
gizmo.addEventListener("hoverchange", ({ hovered }) => console.log(hovered?.name ?? "none"));

// start no longer fires for a press that turns nothing; press does, for every press.
gizmo.addEventListener("press", ({ pressed }) => console.log("pressed", pressed?.name));

// end says how the turn finished.
gizmo.addEventListener("end", ({ outcome }) => console.log(outcome.status));

// lookFrom(direction, false) → lookFrom(view, { animated: false }), resolving with the end payload.
const end = await gizmo.lookFrom(new Vector3(1, 1, 1), { animated: false });
console.log(end.outcome.status); // "reached"

// It also takes a target name or "home".
await gizmo.lookFrom("top-front-right");

// update(false) → update(). It steps no controls; domUpdate() and cameraUpdate() are gone.
gizmo.update();
