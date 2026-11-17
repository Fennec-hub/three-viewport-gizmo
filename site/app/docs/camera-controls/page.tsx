import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@site/components/Code";
import { Sample } from "@site/components/Sample";
import { Stage } from "@site/components/Stage";
import { PACKAGE } from "@site/components/site";

export const metadata: Metadata = {
  title: "camera-controls",
  description: "Attach yomotsu's camera-controls to the gizmo through the shipped cameraControls adapter.",
};

export default function CameraControlsGuide() {
  return (
    <>
      <h1>camera-controls</h1>
      <p>
        <a href="https://github.com/yomotsu/camera-controls">camera-controls</a> keeps its own orbit
        state, so it attaches through an adapter: <code>cameraControls(controls)</code> from the{" "}
        <code>/camera-controls</code> subpath hands it every camera pose the gizmo writes and reads
        its target back on every update.
      </p>

      <h2>Prerequisites</h2>
      <p>
        The <Link href="/docs/quickstart/">Quickstart</Link>, and camera-controls 3 (an optional peer
        dependency):
      </p>
      <Code lang="bash">{`npm install ${PACKAGE} three camera-controls`}</Code>

      <h2>Steps</h2>
      <h3>1. Attach through the adapter</h3>
      <p>
        Keep calling <code>controls.update(delta)</code> in the render loop, but only while{" "}
        <code>controls.enabled</code>: the gizmo disables the controls while it turns the camera.
      </p>
      <Sample file="camera-controls.ts" />
      <figure>
        <Stage
          label="Sphere gizmo wired to camera-controls"
          config={{ controller: "camera-controls", gizmo: {} }}
        />
      </figure>

      <h2>Variations</h2>
      <ul>
        <li>
          The adapter calls camera-controls&apos; <code>updateCameraUp()</code> after each new{" "}
          <code>camera.up</code>, so roll is on by default.
        </li>
        <li>
          In <Link href="/docs/controlled-mode/">controlled mode</Link> the gizmo writes no camera and
          syncs no controls: after <code>end</code>, call the adapter&apos;s <code>update()</code>,
          and <code>updateCameraUp()</code> if you use roll.
        </li>
        <li>
          The camera-controls polar and azimuth limits bound the gizmo&apos;s turns too; see{" "}
          <Link href="/docs/limits/">Limits</Link>.
        </li>
      </ul>

      <h2>Related</h2>
      <ul>
        <li>
          <Link href="/docs/orbit-controls/">OrbitControls</Link>
        </li>
        <li>
          <Link href="/docs/api/#camera-controls">API reference: cameraControls</Link>
        </li>
      </ul>
    </>
  );
}
