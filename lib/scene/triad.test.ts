import { Color, Mesh, PerspectiveCamera, Vector3, type BufferGeometry, type DataTexture, type MeshBasicMaterial, type Object3D } from "three";
import { describe, expect, it, vi } from "vitest";
import { classifyChange } from "../options/changes";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { pixelsPerUnit } from "./axisLines";
import { buildScene, disposeScene } from "./build";
import { TRIAD_COLORS, TRIAD_SCENE_SCALE } from "./triad";
import { updateScene } from "./update";

const resolve = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });

/** What the scene draws, as objects with their materials: hidden subtrees are skipped. */
const drawn = (root: Object3D) => {
  const found: Object3D[] = [];
  root.traverseVisible((object) => (object as Mesh).material && found.push(object));
  return found;
};

describe("triad", () => {
  it.each(["cube", "rounded-cube"] as const)("is off by default on %s and builds nothing", (type) => {
    const scene = buildScene(resolve({ type }));
    expect(scene.parts.triad.object.visible).toBe(false);
    expect(scene.parts.triad.object.children).toHaveLength(0);
    expect(scene.group.scale.x).toBe(1);
  });

  it("never shows on the sphere", () => {
    const scene = buildScene(resolve({ type: "sphere", triad: { enabled: true } }));
    expect(scene.parts.triad.object.visible).toBe(false);
    expect(scene.parts.triad.object.children).toHaveLength(0);
  });

  it("draws X, Y and Z from the cube's corner as three feathered ribbons and three labels, all owned", () => {
    const scene = buildScene(resolve({ type: "cube", triad: { enabled: true } }));
    const { object } = scene.parts.triad;
    expect(object.visible).toBe(true);
    expect(object.position.toArray()).toEqual([-1.05, -1.05, -1.05]);
    const children = object.children as Mesh<BufferGeometry, MeshBasicMaterial>[];
    const lines = children.slice(0, 3);
    const labels = children.slice(3);
    expect(labels).toHaveLength(3);
    // Each label sits past its own world axis's tip.
    labels.forEach((label, i) => {
      expect(label.position.getComponent(i)).toBeCloseTo(2.3, 9);
      expect(label.position.toArray().filter((_, k) => k !== i)).toEqual([0, 0]);
    });
    const owned = [...lines, ...labels].flatMap((l) => [l.geometry, l.material, l.material.map!]);
    for (const resource of owned) expect(scene.owned.has(resource as never)).toBe(true);
    // Each line is 2.1 long, in its axis colour, 1.5 px across plus a 1 device pixel feather each side (DPR 1).
    lines.forEach((line, i) => {
      const axis = (["x", "y", "z"] as const)[i];
      expect(line.scale.y).toBeCloseTo(2.1, 9);
      expect(line.scale.x * pixelsPerUnit(scene.options) * TRIAD_SCENE_SCALE).toBeCloseTo(3.5, 6);
      expect(line.material.color.getHex()).toBe(new Color(TRIAD_COLORS[axis]).getHex());
    });
    // The cross-section: clear at the ribbon's edges; inside, each texel's coverage by the 1.5 px line (0.81 at 0.44 px
    // off its centre).
    const { data, width } = (lines[0].material.map as DataTexture).image as { data: Uint8Array; width: number };
    const alpha = Array.from({ length: width }, (_, i) => data[i * 4 + 3]);
    expect(alpha).toEqual([0, 207, 207, 0]);
    disposeScene(scene);
    expect(scene.owned.size).toBe(0);
  });

  it("turns each line about its own axis to face the camera", () => {
    const scene = buildScene(resolve({ type: "cube", triad: { enabled: true } }));
    const { object } = scene.parts.triad;
    const camera = new PerspectiveCamera();
    camera.position.set(3, 4, 5);
    scene.group.updateMatrixWorld(true);
    (object.children.slice(0, 3) as Mesh[]).forEach((line, i) => {
      line.onBeforeRender(undefined as never, undefined as never, camera, line.geometry, line.material as never, null as never);
      const axis = new Vector3().setComponent(i, 1);
      // Still along its axis, and its face's normal (local +Z) is the camera's direction off that axis.
      expect(new Vector3(0, 1, 0).applyQuaternion(line.quaternion).distanceTo(axis)).toBeLessThan(1e-9);
      const toCamera = object.worldToLocal(camera.position.clone()).addScaledVector(axis, -1.05);
      toCamera.addScaledVector(axis, -toCamera.dot(axis)).normalize();
      expect(new Vector3(0, 0, 1).applyQuaternion(line.quaternion).distanceTo(toCamera)).toBeLessThan(1e-9);
    });
  });

  it("toggles at run time as a cheap change, changing only the triad's draws and the scene's scale", () => {
    const off = resolve({ type: "rounded-cube" });
    const on = resolve({ type: "rounded-cube", triad: { enabled: true } });
    expect(classifyChange(off, on)).toBe("cheap");
    const scene = buildScene(off);
    const { group } = scene;
    const before = drawn(group).map((o) => [o, (o as Mesh).material] as const);
    const ownedBefore = new Set(scene.owned);

    updateScene(scene, on);
    const triadDraws = drawn(scene.parts.triad.object);
    expect(triadDraws).toHaveLength(6);
    expect(drawn(group).filter((o) => !triadDraws.includes(o)).map((o) => [o, (o as Mesh).material])).toEqual(before);
    expect([...ownedBefore].every((r) => scene.owned.has(r))).toBe(true);
    expect(group.scale.x).toBe(TRIAD_SCENE_SCALE);

    // Off again and back on: no rebuild, the same objects and materials.
    const built = [...scene.parts.triad.object.children];
    updateScene(scene, off);
    expect(drawn(group).map((o) => [o, (o as Mesh).material])).toEqual(before);
    expect(group.scale.x).toBe(1);
    updateScene(scene, on);
    expect(scene.parts.triad.object.children).toEqual(built);
  });

  it("labels X, Y and Z in the axis colours with the gizmo's font", () => {
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext);
    getContext.mockClear();
    buildScene(resolve({ type: "cube", triad: { enabled: true }, font: { family: "serif", weight: 500 } }));
    const contexts = getContext.mock.results.map((r) => r.value as CanvasRenderingContext2D).slice(-3);
    contexts.forEach((ctx, i) => {
      const axis = (["x", "y", "z"] as const)[i];
      expect(ctx.fillStyle).toBe(new Color(TRIAD_COLORS[axis]).getStyle());
      expect(ctx.font).toMatch(/^500 \d+px serif$/);
      expect(ctx.fillText).toHaveBeenCalledWith(axis.toUpperCase(), expect.any(Number), expect.any(Number));
    });
  });
});
