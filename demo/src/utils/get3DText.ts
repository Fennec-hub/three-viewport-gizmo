import { Material, Mesh } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

export const get3DText = (text: string, material?: Material) =>
  new FontLoader()
    .loadAsync("../three-viewport-gizmo/fonts/Roboto_Regular.json")
    .then((font) => {
      const geometry = new TextGeometry(text, {
        font: font,
        size: 80,
        height: 30,
        curveSegments: 12,
        bevelEnabled: false,
        bevelThickness: 10,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      }).center();

      return new Mesh(geometry, material);
    })
    .catch((error) => {
      console.error(error);
      return null;
    });
