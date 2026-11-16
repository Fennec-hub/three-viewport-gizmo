import { Color, Mesh, MeshBasicMaterial, Vector3, type BufferGeometry, type Object3D } from "three";
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

  it("draws X, Y and Z from the cube's corner in one line mesh and three labels, all owned", () => {
    const scene = buildScene(resolve({ type: "cube", triad: { enabled: true } }));
    const { object } = scene.parts.triad;
    expect(object.visible).toBe(true);
    expect(object.position.toArray()).toEqual([-1.05, -1.05, -1.05]);
    const [lines, ...labels] = object.children as [Mesh<BufferGeometry>, ...Mesh<BufferGeometry>[]];
    expect(lines.isMesh).toBe(true);
    expect(labels).toHaveLength(3);
    // Each label sits past its own world axis's tip.
    labels.forEach((label, i) => {
      expect(label.position.getComponent(i)).toBeCloseTo(2.3, 9);
      expect(label.position.toArray().filter((_, k) => k !== i)).toEqual([0, 0]);
    });
    const owned = [lines.geometry, lines.material, ...labels.flatMap((l) => [l.geometry, l.material, (l.material as MeshBasicMaterial).map!])];
    for (const resource of owned) expect(scene.owned.has(resource as never)).toBe(true);
    // The x line's vertices are coloured with Tau's X colour and lie along +X, 1.5 px across.
    const { position, color } = lines.geometry.attributes;
    const block = position.count / 3;
    const xs = Array.from({ length: block }, (_, k) => position.getX(k));
    expect(Math.max(...xs)).toBeCloseTo(2.1, 6);
    const zs = Array.from({ length: block }, (_, k) => position.getZ(k));
    const width = (Math.max(...zs) - Math.min(...zs)) * pixelsPerUnit(scene.options) * TRIAD_SCENE_SCALE;
    expect(width).toBeCloseTo(1.5, 6);
    const expected = new Mesh().material.color.set(TRIAD_COLORS.x);
    expect([color.getX(0), color.getY(0), color.getZ(0)].map((c) => c.toFixed(6))).toEqual(
      [expected.r, expected.g, expected.b].map((c) => c.toFixed(6))
    );
    disposeScene(scene);
    expect(scene.owned.size).toBe(0);
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
    expect(triadDraws).toHaveLength(4);
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
