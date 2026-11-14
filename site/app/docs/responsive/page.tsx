import type { Metadata } from "next";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = { title: "Responsive" };

export default function ResponsiveGuide() {
  return (
    <>
      <h1>Responsive</h1>
      <p>
        The gizmo is an ordinary element inside its <code>container</code>. Give it a class name
        or id and size it with CSS; call <code>gizmo.update()</code> when the layout changes so it
        re-reads its box.
      </p>
      <Code>{`
import { ViewportGizmo } from "${PACKAGE}";

const gizmo = new ViewportGizmo(camera, renderer, {
  type: "rounded-cube",
  container: viewportElement,
  className: "responsive-gizmo",
});

new ResizeObserver(() => {
  // ... resize the camera and renderer
  gizmo.update();
}).observe(viewportElement);
`}</Code>
      <p>
        The gizmo sets its size inline, so the stylesheet needs <code>!important</code> to override
        it:
      </p>
      <Code>{`
.responsive-gizmo {
  width: auto !important;
  height: 40% !important;
  aspect-ratio: 1;
}
`}</Code>
      <figure>
        <Stage
          className="resizable"
          label="Resizable viewport whose gizmo is sized with CSS"
          config={{ controller: "orbit", gizmo: { type: "rounded-cube", className: "responsive-gizmo" } }}
        />
        <figcaption>Drag the bottom-right corner of the viewport to resize it.</figcaption>
      </figure>
    </>
  );
}
