import { Euler, Mesh, Object3D, OrthographicCamera, Quaternion, Scene, Vector3, type WebGLRenderer } from "three";
import { describe, expect, it } from "vitest";
import { resolveOptions } from "../options/resolve";
import { BACKGROUND_RADIUS } from "./background";
import { buildScene } from "./build";

const sphere = () => buildScene(resolveOptions({ type: "sphere" }, { up: new Vector3(0, 1, 0) }));

/** A spread of host camera orientations, including the poles and a roll. */
const ORIENTATIONS = [
  [0, 0, 0],
  [Math.PI / 2, 0, 0],
  [-Math.PI / 2, 0, 0],
  [0.5, -0.7, 0],
  [2.1, 0.4, 1.3],
  [-1, 3, -2.5],
  [Math.PI, 0, 0],
].map(([x, y, z]) => new Quaternion().setFromEuler(new Euler(x, y, z)));

describe("sphere background", () => {
  it("draws at most 300 triangles (P10)", () => {
    const { geometry } = sphere().parts.background.object as Mesh;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    expect(count / 3).toBeLessThanOrEqual(300);
  });

  it.each(ORIENTATIONS.map((q, i) => [i, q] as const))("faces the gizmo camera at orientation %i", (_, q) => {
    const scene = sphere();
    const root = new Object3D();
    const world = new Scene().add(root);
    root.add(scene.group);
    root.quaternion.copy(q).invert();
    const camera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10);
    camera.position.set(0, 0, 7);
    world.updateMatrixWorld();
    const disc = scene.parts.background.object as Mesh;
    disc.onBeforeRender({} as WebGLRenderer, world, camera, disc.geometry, disc.material as never, null as never);

    const normal = new Vector3(0, 0, 1).transformDirection(disc.matrixWorld);
    const toCamera = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
    expect(normal.distanceTo(toCamera)).toBeLessThan(1e-6);
    // Behind the origin, where 2.3.0's back-facing sphere drew.
    expect(new Vector3().setFromMatrixPosition(disc.matrixWorld).distanceTo(new Vector3(0, 0, -BACKGROUND_RADIUS))).toBeLessThan(1e-6);
  });
});
