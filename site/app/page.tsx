import Link from "next/link";
import { Code } from "@site/components/Code";
import { Stage } from "@site/components/Stage";
import { PACKAGE, REPO } from "@site/components/site";

const capabilities = [
  ["Click, drag, animate", "Click a face, edge or corner to turn the camera to it; drag the gizmo to orbit."],
  ["WebGL and WebGPU", "Pass a WebGLRenderer or a WebGPURenderer; the gizmo draws with the renderer you already have."],
  ["Any up axis", "X-up, Y-up and Z-up scenes, per gizmo or from Object3D.DEFAULT_UP."],
  ["Any controller", "Attach OrbitControls in one call, wire camera-controls through events, or run it standalone."],
  ["Three shapes", "Sphere, cube and rounded cube, with colours, labels, sizes and placement all configurable."],
  ["Fits your layout", "Placement, offsets and CSS classes; works with scissored multi-view layouts and post-processing."],
] as const;

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Three Viewport Gizmo</h1>
          <p>
            A view cube and orientation gizmo for three.js cameras. It shows where the camera is
            looking and turns the view when you click or drag it.
          </p>
          <Code label="Install">{`npm install ${PACKAGE}`}</Code>
          <div className="actions">
            <Link className="button primary" href="/docs/quickstart/">
              Quickstart
            </Link>
            <Link className="button" href="/playground/">
              Playground
            </Link>
            <Link className="button" href="/matrix/">
              Matrix
            </Link>
            <Link className="button" href="/docs/api/">
              API
            </Link>
          </div>
        </div>
        <Stage
          label="Live scene with a rounded-cube gizmo in the top-right corner"
          config={{ controller: "orbit", gizmo: { type: "rounded-cube" } }}
        />
      </section>

      <h2>Capabilities</h2>
      <ul className="cards">
        {capabilities.map(([title, text]) => (
          <li key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>

      <h2>Usage</h2>
      <Code>{`
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ViewportGizmo } from "${PACKAGE}";

const controls = new OrbitControls(camera, renderer.domElement);
const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
  gizmo.render();
});
`}</Code>
      <p>
        Next: the <Link href="/docs/quickstart/">Quickstart</Link>, every option in the{" "}
        <Link href="/playground/">Playground</Link>, every up axis on both renderers in the{" "}
        <Link href="/matrix/">Matrix</Link>, the <Link href="/docs/">guides</Link> and the{" "}
        <Link href="/docs/api/">API reference</Link>. Source on <a href={REPO}>GitHub</a>.
      </p>
    </>
  );
}
