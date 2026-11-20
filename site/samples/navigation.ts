import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer } from "./host"; // @hide

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "cube",
  // The buttons sit outside the element's box: move the gizmo in from the default 10 px.
  offset: { top: 36, right: 36 },
  navigation: { enabled: true },
});
gizmo.attachControls(controls);

// set() merges: each switch hides only its own buttons, without a rebuild.
gizmo.set({ navigation: { roll: false, reveal: "always" } });
