import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { MultipleViewportsExample } from "@site/components/examples";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Multiple viewports" };

export default function MultipleViewportsGuide() {
  return (
    <>
      <h1>Multiple viewports</h1>
      <p>
        One renderer can draw several views with the scissor test. Give each view its own element,
        camera, controls and gizmo (with the element as the gizmo&apos;s <code>container</code>),
        then render each view and its gizmo inside the view&apos;s rectangle. The gizmo keeps the
        scissor state it finds.
      </p>
      <Code>{`
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

const views = elements.map((element) => {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 20);
  const gizmo = new ViewportGizmo(camera, renderer, { container: element, size: 80 });
  gizmo.attachControls(new OrbitControls(camera, element));
  return { element, scene: createScene(), camera, gizmo };
});

renderer.setAnimationLoop(() => {
  const canvas = renderer.domElement.getBoundingClientRect();
  renderer.setScissorTest(true);
  for (const { element, scene, camera, gizmo } of views) {
    const rect = element.getBoundingClientRect();
    const left = rect.left - canvas.left;
    const bottom = canvas.height - (rect.bottom - canvas.top); // WebGL: bottom-left origin
    renderer.setViewport(left, bottom, rect.width, rect.height);
    renderer.setScissor(left, bottom, rect.width, rect.height);
    renderer.render(scene, camera);
    gizmo.render();
  }
  renderer.setScissorTest(false);
});
`}</Code>
      <figure>
        <MultipleViewportsExample />
        <figcaption>Four views, one WebGL renderer. Each view orbits on its own.</figcaption>
      </figure>
    </>
  );
}
