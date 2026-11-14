import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "WebGPU" };

export default function WebGPU() {
  return (
    <>
      <h1>WebGPU</h1>
      <p>
        <code>ViewportGizmo</code> accepts a <code>WebGPURenderer</code> from{" "}
        <code>three/webgpu</code> in the same place as a <code>WebGLRenderer</code>. It detects the
        renderer from three.js&apos;s own <code>isWebGPURenderer</code> flag; there is nothing to
        configure.
      </p>
      <Code>{`
import { WebGPURenderer } from "three/webgpu";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

const renderer = new WebGPURenderer({ antialias: true });
await renderer.init(); // before the first render or clear
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(new OrbitControls(camera, renderer.domElement));

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
`}</Code>
      <figure>
        <Stage
          label="Cube gizmo drawn by WebGPURenderer"
          config={{ renderer: "webgpu", controller: "orbit", gizmo: { type: "cube" } }}
        />
        <figcaption>
          This viewport uses <code>WebGPURenderer</code>. Without a WebGPU adapter, three.js runs it
          on its WebGL 2 backend and the viewport says so.
        </figcaption>
      </figure>

      <h2>Initialise first</h2>
      <p>
        Await <code>renderer.init()</code> before anything renders or clears, including{" "}
        <code>gizmo.render()</code>. Rendering before it resolves can blank the first frames or race
        the backend start-up.
      </p>

      <h2>Viewport origin</h2>
      <p>
        <code>setViewport(x, y, width, height)</code> has a bottom-left origin on{" "}
        <code>WebGLRenderer</code> and a top-left origin on <code>WebGPURenderer</code>. The gizmo
        places itself correctly on both.
      </p>

      <h2>Lines and bundling</h2>
      <p>
        On WebGPU the sphere gizmo&apos;s axis lines use <code>Line2NodeMaterial</code>; on WebGL
        they use <code>LineMaterial</code>. The library imports <code>three</code> and its
        subpaths as externals, so your bundle must resolve a single copy of three.js: two copies
        break <code>instanceof</code> checks and WebGPU materials.
      </p>
      <p>
        Compare both renderers on every up axis in the <Link href="/matrix/">Matrix</Link>.
      </p>
    </>
  );
}
