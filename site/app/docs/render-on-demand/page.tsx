import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";

export const metadata: Metadata = {
  title: "Render on demand and warm-up",
  description: "Render only when the gizmo or the scene asks for a frame, and compile the gizmo before its first frame.",
};

export default function RenderOnDemandGuide() {
  return (
    <>
      <h1>Render on demand and warm-up</h1>
      <p>
        A still scene needs no frames. The gizmo fires <code>invalidate</code> whenever it needs one,
        so a host can render only then, and <code>compile()</code> builds its programs before the first
        frame so that frame does not stall.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>, without <code>setAnimationLoop</code>.
      </p>

      <h2>Steps</h2>
      <h3>1. Render when asked, and warm up first</h3>
      <p>
        <code>invalidate</code> fires for each step of a turn, a hover change, a new pose and a
        changed option. A turn advances when <code>render()</code> runs and asks for the next frame
        until it ends.
      </p>
      <Sample file="render-on-demand.ts" />

      <h2>Variations</h2>
      <ul>
        <li>
          <code>compile()</code> compiles for the renderer&apos;s current render target: call it with the
          target you draw the gizmo into bound.
        </li>
        <li>
          <code>update()</code> asks for a frame only when the camera turned, so calling it from a
          controls <code>change</code> listener costs nothing on a still view.
        </li>
        <li>
          In <Link href="/docs/controlled-mode/">controlled mode</Link>, render after applying each
          pose from <code>change</code>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/api/#events">API reference: invalidate</Link>
        </li>
        <li>
          <Link href="/docs/webgpu/">WebGPU</Link>
        </li>
      </ul>
    </>
  );
}
