import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ViewportGizmo } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer, scene } from "./host"; // @hide

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPixelatedPass(5, scene, camera));
composer.addPass(new OutputPass());

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

renderer.setAnimationLoop(() => {
  composer.render();
  gizmo.render();
});
