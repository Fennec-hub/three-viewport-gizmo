// K6: controlled mode (U4). The gizmo reports the pose in `change` and writes no camera; a host applying
// `{ direction, up }` with `lookAt` reproduces write mode frame for frame.
import { afterEach, describe, expect, it, vi } from "vitest";
import { Quaternion, Vector3, type PerspectiveCamera } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { GizmoOptions, GizmoPose } from "../index.js";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { fire, mountGizmo, runFlight } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const QUARTER = Math.PI / 2;
const axis = (x: number, y: number, z: number) => new Vector3(x, y, z);
const snapshot = (camera: PerspectiveCamera) => [...camera.position.toArray(), ...camera.quaternion.toArray(), ...camera.up.toArray()];

/** What a controlled-mode host does with a reported pose: the site's `applyPose`. */
function applyPose(camera: PerspectiveCamera, focus: Vector3, pose: GizmoPose) {
  const distance = camera.position.distanceTo(focus);
  camera.position.copy(pose.direction).multiplyScalar(distance).add(focus);
  camera.up.copy(pose.up);
  camera.lookAt(focus);
}

/** Runs the same gestures and turns on `gizmo`; `onChange` sees every `change`. */
async function script(gizmo: ViewportGizmo, element: HTMLElement) {
  let t = 0;
  const step = () => runFlight(gizmo, undefined, (t += 10_000));
  fire(element, "pointerdown");
  fire(element, "pointerup"); // a click on the face under the centre
  step();
  fire(element, "pointerdown", { x: 64 });
  for (let x = 70; x <= 110; x += 8) fire(element, "pointermove", { x, y: 64 + (x - 64) / 2 });
  fire(element, "pointerup", { x: 110, y: 87 });
  for (const turn of [
    () => gizmo.lookFrom("top"),
    () => gizmo.turn({ toward: "down" }),
    () => gizmo.lookFrom("bottom-back-left"),
    () => gizmo.turn({ azimuth: QUARTER, polar: 0.3 }),
    () => gizmo.turn({ roll: QUARTER }),
    () => gizmo.lookFrom("top-front", { up: "reset" }),
    () => gizmo.lookFrom("home"),
  ]) {
    const end = turn();
    step();
    await end;
  }
}

const OPTIONS: Record<string, GizmoOptions> = {
  "roll off": { type: "cube", roll: false },
  "roll on": { type: "cube", roll: true },
  "roll free": { type: "cube", roll: "free" },
};

describe("controlled mode (U4)", () => {
  it("writes no camera through a click, a drag, flights and an interrupted flight; the poses still go out", async () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(1, 0.5, 5), gizmoOptions: { type: "cube", controlled: true } });
    const controls = new OrbitControls(gizmo.camera, gizmo.renderer.domElement);
    gizmo.attachControls(controls);
    const update = vi.spyOn(controls, "update");
    const before = snapshot(gizmo.camera);
    const directions: Vector3[] = [];
    gizmo.addEventListener("change", ({ pose }) => directions.push(pose.direction.clone()));
    await script(gizmo, element);
    const interrupted = gizmo.lookFrom("left");
    gizmo.render();
    void gizmo.lookFrom("right");
    expect((await interrupted).outcome).toEqual({ status: "interrupted", by: "api" });
    runFlight(gizmo, undefined, 1e6);
    expect(snapshot(gizmo.camera)).toEqual(before);
    expect(update).not.toHaveBeenCalled();
    expect(directions.length).toBeGreaterThan(20);
    expect(directions.at(-1)!.distanceTo(gizmo.targets.find((t) => t.name === "right")!.direction)).toBeLessThan(1e-9);
    controls.dispose();
    gizmo.dispose();
  });

  it("a host that never applies the pose still gets each turn to its heading, continuing without a jump", async () => {
    const { gizmo } = mountGizmo({ cameraPosition: axis(1, 0.5, 5), gizmoOptions: { type: "cube", controlled: true } });
    const first = gizmo.lookFrom("top");
    let last: Vector3 | null = null;
    let jump = 0;
    gizmo.addEventListener("change", ({ pose }) => {
      if (last) jump = Math.max(jump, last.angleTo(pose.direction));
      last = pose.direction.clone();
    });
    runFlight(gizmo, (frame) => frame === 3 && void gizmo.lookFrom("right"));
    expect((await first).outcome.status).toBe("interrupted");
    expect(last!.distanceTo(axis(1, 0, 0))).toBeLessThan(1e-9);
    expect(jump).toBeLessThan(0.3); // one frame's travel, not a restart from the camera
    gizmo.dispose();
  });

  for (const [name, options] of Object.entries(OPTIONS)) {
    it(`${name}: a host applying { direction, up } matches write mode frame for frame`, async () => {
      const frames = async (controlled: boolean) => {
        const { gizmo, element } = mountGizmo({ cameraPosition: axis(1, 0.5, 5), gizmoOptions: { ...options, controlled } });
        const out: Quaternion[] = [];
        gizmo.addEventListener("change", ({ pose }) => {
          if (controlled) {
            applyPose(gizmo.camera, gizmo.target, pose);
            gizmo.update();
          }
          out.push(gizmo.camera.quaternion.clone());
        });
        await script(gizmo, element);
        gizmo.dispose();
        return out;
      };
      const written = await frames(false);
      const reported = await frames(true);
      expect(reported).toHaveLength(written.length);
      const worst = Math.max(...written.map((q, i) => q.angleTo(reported[i])));
      expect(worst).toBeLessThan(1e-6);
    });
  }
});
