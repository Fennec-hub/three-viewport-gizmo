import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
import { orbitOrTrackballControls } from "./orbitOrTrackballControls";
import { initScene } from "./initScene";
import { yomotsuCameraControls } from "./yomotsuCameraControls";
import { configuration } from "./configuration";
import { initSceneWithComposer } from "./composer";
import { staticRenderScene } from "./static";

const hashtag:
  | ""
  | "static"
  | "composer"
  | "config"
  | "orbit"
  | "trackball"
  | "controls" = window.location.hash.substring(2) as any;

switch (hashtag) {
  case "config":
    configuration();
    break;

  case "static":
    staticRenderScene();
    break;

  case "composer":
    initSceneWithComposer();
    break;

  case "orbit":
    orbitOrTrackballControls(OrbitControls);
    break;

  case "trackball":
    orbitOrTrackballControls(TrackballControls);
    break;

  case "controls":
    yomotsuCameraControls();
    break;

  default:
    initScene();
    break;
}
