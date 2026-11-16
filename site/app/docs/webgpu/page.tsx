import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = {
  title: "WebGPU",
  description: "Draw the gizmo with three.js's WebGPURenderer, initialised before the first frame.",
};

export default function WebGPU() {
  return (
    <>
      <h1>WebGPU</h1>
      <p>
        <code>ViewportGizmo</code> takes a <code>WebGPURenderer</code> from <code>three/webgpu</code>{" "}
        in the same place as a <code>WebGLRenderer</code>; there is nothing to configure.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>. A browser with WebGPU; without an
        adapter three.js runs <code>WebGPURenderer</code> on its WebGL 2 backend.
      </p>

      <h2>Steps</h2>
      <h3>1. Initialise the renderer, then create the gizmo</h3>
      <p>
        Await <code>renderer.init()</code> before anything renders or clears, including{" "}
        <code>gizmo.render()</code>.
      </p>
      <Sample file="webgpu.ts" />
      <figure>
        <Stage
          label="Cube gizmo drawn by WebGPURenderer"
          config={{ renderer: "webgpu", controller: "orbit", gizmo: { type: "cube" } }}
        />
        <figcaption>
          This viewport uses <code>WebGPURenderer</code>; without a WebGPU adapter it says so.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          <strong>Viewport origin.</strong> <code>setViewport</code> has a bottom-left origin on{" "}
          <code>WebGLRenderer</code> and a top-left origin on <code>WebGPURenderer</code>; the gizmo
          places itself on both, and <code>gizmo.viewport</code> reports its rectangle in the
          renderer&apos;s own convention.
        </li>
        <li>
          <strong>Bundling.</strong> The gizmo draws its axis lines as ordinary meshes, so the main
          entry never imports <code>three/webgpu</code>. It imports <code>three</code> as an external:
          your bundle must resolve one copy of three.js, or <code>instanceof</code> checks and
          WebGPU materials break.
        </li>
        <li>
          <strong>First frame.</strong> Call <code>await gizmo.compile()</code> to build its
          pipelines before the first frame; see{" "}
          <Link href="/docs/render-on-demand/">Render on demand and warm-up</Link>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          Both renderers on every up axis in the <Link href="/matrix/">Matrix</Link>.
        </li>
        <li>
          <Link href="/docs/api/">API reference</Link>
        </li>
      </ul>
    </>
  );
}
