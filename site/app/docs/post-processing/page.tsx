import type { Metadata } from "next";
import Link from "next/link";
import { Sample } from "@site/components/Sample";
import { PostProcessingExample } from "@site/components/examples";

export const metadata: Metadata = {
  title: "Post-processing",
  description: "Draw the gizmo after an EffectComposer chain so effects never touch it.",
};

export default function PostProcessingGuide() {
  return (
    <>
      <h1>Post-processing</h1>
      <p>
        Render the composer, then the gizmo: it draws straight to the canvas after the effect chain,
        so effects never touch it.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>, with a <code>WebGLRenderer</code>.
      </p>

      <h2>Steps</h2>
      <h3>1. Render the gizmo after the composer</h3>
      <Sample file="post-processing.ts" />
      <figure>
        <PostProcessingExample />
        <figcaption>
          <code>EffectComposer</code> is the WebGL post-processing pipeline; this example uses{" "}
          <code>WebGLRenderer</code>.
        </figcaption>
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          The gizmo&apos;s materials are not tone mapped: its colours are display colours whatever
          the renderer&apos;s <code>toneMapping</code>.
        </li>
        <li>
          Drawing into your own render target works too: the gizmo writes only its rectangle of the
          bound target and keeps its depth outside it.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/render-on-demand/">Render on demand and warm-up</Link>
        </li>
      </ul>
    </>
  );
}
