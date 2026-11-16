/**
 * Records `hitTest.v230.json`: what the 2.3.0 raycaster (`intersectedObjects` over the 2.3.0 meshes) hits on a grid of
 * pointer positions, for each of the 26 target views, each type and each up axis. Not part of the suite; run it from
 * the repository root against an extracted 2.3.0 tree:
 *
 * ```sh
 * mkdir tmp-v230 && git archive v2.3.0 lib | tar -x -C tmp-v230
 * # Point the copy's `@lib/...` imports at itself: `@lib/types` becomes `../types` from `lib/<dir>/`.
 * grep -rl '@lib/' tmp-v230/lib | xargs sed -i '' 's|@lib/|../|g'
 * V230=$PWD/tmp-v230/lib npx vitest run --config lib/interaction/__fixtures__/record.config.ts
 * rm -rf tmp-v230
 * ```
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Matrix4, Object3D, OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { it } from "vitest";
import { createStubRenderer } from "../../__tests__/test-utils";

/** Cells per side of the pointer grid over the gizmo's square element. */
export const GRID = 32;

/** The hit as the sign triple of its object's position: `CODES[(sx + 1) * 9 + (sy + 1) * 3 + (sz + 1)]`, `.` for none. */
export const CODES = "abcdefghijklmnopqrstuvwxyz{";

/** The 2.x front of each up axis, so a view along the up axis still has a defined camera up. */
const POLE_UP = { x: new Vector3(0, 1, 0), y: new Vector3(0, 0, 1), z: new Vector3(0, -1, 0) } as const;

const VARIANTS = [
  { name: "cube", options: { type: "cube" } },
  { name: "rounded-cube", options: { type: "rounded-cube" } },
  { name: "sphere", options: { type: "sphere" } },
  // The sphere with every kind on, so its corner-over-face priority is in the fixture too.
  { name: "sphere-all", options: { type: "sphere", corners: { enabled: true }, edges: { enabled: true } } },
] as const;

it("records the 2.3.0 raycast fixture", async () => {
  const root = process.env.V230;
  if (!root) throw new Error("Set V230 to an extracted 2.3.0 `lib` directory.");
  const { optionsFallback } = await import(/* @vite-ignore */ `${root}/options/optionsFallback.ts`);
  const { axesObjects } = await import(/* @vite-ignore */ `${root}/scene/axesObjects.ts`);
  const { intersectedObjects } = await import(/* @vite-ignore */ `${root}/interaction/intersectedObjects.ts`);

  const directions: Vector3[] = [];
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) if (x || y || z) directions.push(new Vector3(x, y, z).normalize());

  const rect = { left: 0, top: 0, width: GRID, height: GRID } as DOMRect;
  const views: { variant: string; up: string; quaternion: number[]; hits: string }[] = [];

  for (const { name, options } of VARIANTS) {
    for (const up of ["y", "z", "x"] as const) {
      const resolved = optionsFallback({ ...options, up });
      const [axes] = axesObjects(resolved, createStubRenderer());
      const gizmo = new Object3D().add(...axes);
      // The 2.3.0 class's own camera, constructed the same way.
      const camera = resolved.isSphere
        ? new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10)
        : new PerspectiveCamera(26, 1, 5, 10);
      camera.position.set(0, 0, 7);
      camera.updateMatrixWorld();

      const upVector = new Vector3().setComponent("xyz".indexOf(up), 1);
      for (const direction of directions) {
        const cameraUp = Math.abs(direction.dot(upVector)) > 0.999 ? POLE_UP[up] : upVector;
        const quaternion = new Quaternion().setFromRotationMatrix(
          new Matrix4().lookAt(direction, new Vector3(), cameraUp)
        );
        // 2.3.0 `_updateOrientation`: the gizmo turns by the inverse of the host camera's rotation.
        gizmo.quaternion.copy(quaternion).invert();
        gizmo.updateMatrixWorld();

        let hits = "";
        for (let row = 0; row < GRID; row++) {
          for (let column = 0; column < GRID; column++) {
            const event = { clientX: column + 0.5, clientY: row + 0.5 } as PointerEvent;
            const hit = intersectedObjects(event, rect, camera, axes);
            if (!hit) {
              hits += ".";
              continue;
            }
            const { x, y, z } = hit.object.position;
            hits += CODES[(Math.sign(x) + 1) * 9 + (Math.sign(y) + 1) * 3 + (Math.sign(z) + 1)];
          }
        }
        views.push({ variant: name, up, quaternion: quaternion.toArray(), hits });
      }
    }
  }

  writeFileSync(resolve(__dirname, "hitTest.v230.json"), JSON.stringify({ grid: GRID, views }, null, 0) + "\n");
}, 600_000);
