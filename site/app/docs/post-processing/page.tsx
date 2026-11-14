import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { PostProcessingExample } from "@site/components/examples";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Post-processing" };

export default function PostProcessingGuide() {
  return (
    <>
      <h1>Post-processing</h1>
      <p>
        Render the composer, then the gizmo. The gizmo draws straight to the canvas after the
        effect chain, so effects never touch it.
      </p>
      <Code>{`
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPixelatedPass } from "three/addons/postprocessing/RenderPixelatedPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { ViewportGizmo } from "${PACKAGE}";

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPixelatedPass(5, scene, camera));
composer.addPass(new OutputPass());

const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

renderer.setAnimationLoop(() => {
  composer.render();
  gizmo.render();
});
`}</Code>
      <figure>
        <PostProcessingExample />
        <figcaption>
          <code>EffectComposer</code> is the WebGL post-processing pipeline; this example uses{" "}
          <code>WebGLRenderer</code>.
        </figcaption>
      </figure>
    </>
  );
}
