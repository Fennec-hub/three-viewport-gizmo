import { orbitOrTrackballControls } from "./controls";
import { initScene } from "./initScene";
import { yomotsuCameraControls } from "./yomotsuCameraControls";
import { configuration } from "./configuration";
import { initSceneWithComposer } from "./composer";
import { staticRenderScene } from "./static";
import { multiViewport } from "./multiViewport";
import { grid } from "./grid";
import { responsive } from "./responsive";
import { zUp } from "./z_up";

const hashtag:
  | ""
  | "static"
  | "composer"
  | "config"
  | "orbit"
  | "trackball"
  | "multiViewport"
  | "grid"
  | "responsive"
  | "z_up"
  | "controls" = window.location.hash.substring(2) as any;

switch (hashtag) {
  case "responsive":
    responsive();
    break;

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
    orbitOrTrackballControls();
    break;

  case "controls":
    yomotsuCameraControls();
    break;

  case "multiViewport":
    multiViewport();
    break;

  case "grid":
    grid();
    break;

  case "z_up":
    zUp();
    break;

  default:
    initScene();
    break;
}
