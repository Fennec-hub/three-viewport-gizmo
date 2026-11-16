import { ViewportGizmo, ViewportGizmoError, type GizmoOptions } from "@taulabs/three-viewport-gizmo";
import { cameraControls } from "@taulabs/three-viewport-gizmo/camera-controls";
import { camera, renderer } from "./host"; // @hide

const options: GizmoOptions = { type: "cube" };
const gizmo = new ViewportGizmo(camera, renderer, options);
