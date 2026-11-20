import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, renderer } from "./host"; // @hide

// Set the camera's up before creating the controls and the gizmo: both read it then.
camera.up.set(0, 0, 1);
const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

// Or pass the label frame explicitly: any signed axis as up, and a perpendicular one for Front.
gizmo.set({ up: new Vector3(0, 0, 1), frontDirection: new Vector3(1, 0, 0) });
