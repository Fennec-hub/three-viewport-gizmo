import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "cube",
  // Radians in the orbit frame, with the OrbitControls names: never below the horizon.
  limits: { maxPolarAngle: Math.PI / 2 },
  // Top and Bottom keep the current heading instead of turning to face Front.
  poleEntry: "nearest",
  // A click on the face the view rests on turns to the opposite face.
  oppositeOnRepeat: true,
});

// Limits on attached controls apply too, narrowed with the gizmo's own.
controls.minPolarAngle = Math.PI / 8;
gizmo.attachControls(controls);
