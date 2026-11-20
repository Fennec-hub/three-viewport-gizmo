import type { Metadata } from "next";
import { Suspense } from "react";
import { Matrix } from "./Matrix";

export const metadata: Metadata = { title: "Matrix" };

export default function MatrixPage() {
  return (
    <>
      <h1>Matrix</h1>
      <p className="muted">
        One gizmo type on all six up axes and both renderers, side by side, each with
        OrbitControls. Click the faces, edges and corners and compare. Add <code>backend</code> or{" "}
        <code>up</code> to the URL to show one row or one viewport.
      </p>
      <Suspense fallback={<p className="muted">Loading the matrix…</p>}>
        <Matrix />
      </Suspense>
    </>
  );
}
