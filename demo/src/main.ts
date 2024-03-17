import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
import { initOrbitOrTrackballControls } from "./initOrbitOrTrackballControls";
import { initScene } from "./initScene";
import { initYomotsuCameraControls } from "./initYomotsuCameraControls";

const hashtag: "" | "orbit" | "trackball" | "controls" =
  window.location.hash.substring(2) as any;

switch (hashtag) {
  case "orbit":
    initOrbitOrTrackballControls(OrbitControls);
    break;

  case "trackball":
    initOrbitOrTrackballControls(TrackballControls);
    break;

  case "controls":
    initYomotsuCameraControls();
    break;

  default:
    initScene();
    break;
}
