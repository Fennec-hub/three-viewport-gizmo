// R16 consumer check: a WebGL host typed against the installed `three` and `@types/three`, through the built package.
import { PerspectiveCamera, WebGLRenderer } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo, type GizmoTurnEnd } from "@taulabs/three-viewport-gizmo";

const renderer = new WebGLRenderer();
const camera = new PerspectiveCamera();
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube", roll: false });
gizmo.attachControls(new OrbitControls(camera, renderer.domElement));
const end: Promise<GizmoTurnEnd> = gizmo.lookFrom("front");
void end;
gizmo.render();
