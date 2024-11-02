import { PMREMGenerator, Scene, ToneMapping, WebGLRenderer } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export const loadEnvMap = ({
  renderer,
  scene,
  path,
  background = false,
  toneMapping,
  exposure,
}: {
  renderer: WebGLRenderer;
  scene: Scene;
  path: string;
  background?: boolean;
  toneMapping?: ToneMapping;
  exposure?: number;
}) => {
  const pmremGenerator = new PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const loader = new RGBELoader();

  loader.load(`../three-viewport-gizmo/HDR/${path}`, (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;

    scene.environment = envMap;

    if (background) scene.background = envMap;

    if (toneMapping) renderer.toneMapping = toneMapping;

    if (exposure != null) renderer.toneMappingExposure = exposure;

    texture.dispose();
    pmremGenerator.dispose();
  });
};
