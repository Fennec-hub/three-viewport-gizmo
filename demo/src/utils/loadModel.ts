import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export const loadModel = async (path: string) =>
  new GLTFLoader()
    .loadAsync(`../three-viewport-gizmo/models/${path}`)
    .then((gltf) => gltf.scene)
    .catch((error) => {
      console.error(error);
      return null;
    });
