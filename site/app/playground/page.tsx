import type { Metadata } from "next";
import { Suspense } from "react";
import { Playground } from "./Playground";

export const metadata: Metadata = { title: "Playground" };

export default function PlaygroundPage() {
  return (
    <>
      <h1>Playground</h1>
      <p className="muted">
        Every combination of renderer, up axis, Front, gizmo type, controller, projection and field of view, with
        the gizmo&apos;s roll mode, limits, pole entry, corner and edge hit sizes, triad and controlled mode. The buttons under the
        viewport call <code>lookFrom</code>, <code>turn</code> and <code>cancel</code>; the readout shows the camera&apos;s
        direction and up, the target the view rests on, the heading and how the last turn ended. The URL holds the
        configuration, so you can share it.
      </p>
      <Suspense fallback={<p className="muted">Loading the playground…</p>}>
        <Playground />
      </Suspense>
    </>
  );
}
