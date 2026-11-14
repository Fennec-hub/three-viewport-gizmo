import type { Metadata } from "next";
import { Stage } from "@site/components/Stage";

export const metadata: Metadata = { title: "Matrix" };

const RENDERERS = [
  ["webgl", "WebGL"],
  ["webgpu", "WebGPU"],
] as const;
const UPS = ["x", "y", "z"] as const;

export default function MatrixPage() {
  return (
    <>
      <h1>Matrix</h1>
      <p className="muted">
        Each up axis on each renderer, side by side: a cube gizmo with OrbitControls in every
        viewport. Click the faces, edges and corners and compare.
      </p>
      <div className="matrix">
        {RENDERERS.flatMap(([renderer, rendererLabel]) =>
          UPS.map((up) => {
            const title = `${rendererLabel}, ${up.toUpperCase()}-up`;
            return (
              <section key={`${renderer}-${up}`} aria-label={title}>
                <h2>{title}</h2>
                <Stage
                  label={`${title} viewport with a cube gizmo`}
                  config={{ renderer, up, controller: "orbit", gizmo: { type: "cube", size: 96 } }}
                />
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
