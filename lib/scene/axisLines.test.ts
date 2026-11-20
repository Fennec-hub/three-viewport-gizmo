import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { BufferGeometry, MathUtils, Mesh, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { classifyChange } from "../options/changes";
import { resolveOptions } from "../options/resolve";
import { createInternalCamera } from "../render/internalCamera";
import type { GizmoOptions } from "../types";
import { pixelsPerUnit } from "./axisLines";
import { buildScene } from "./build";
import { updateScene } from "./update";

const resolve0 = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });

describe("pixelsPerUnit", () => {
  // A world-unit offset at the origin, projected by the gizmo's own camera onto a `size`-pixel viewport.
  it.each([
    ["sphere", 26],
    ["cube", 26],
    ["cube", 60],
    ["rounded-cube", 10],
  ] as const)("matches the %s camera's projection at %i°", (type, degrees) => {
    const options = resolve0({ type, size: 128, fieldOfView: MathUtils.degToRad(degrees) });
    const camera = createInternalCamera(type === "sphere", options.fieldOfView);
    camera.updateMatrixWorld();
    const ndc = new Vector3(1 / pixelsPerUnit(options), 0, 0).project(camera);
    expect((ndc.x * options.size) / 2).toBeCloseTo(1, 9);
  });
});

describe("axisLines", () => {
  const linesOf = (options: GizmoOptions) => {
    const scene = buildScene(resolve0(options));
    return { scene, mesh: scene.parts.lines.object as Mesh<BufferGeometry> };
  };

  it("draws six lines in one mesh with one material, and owns both", () => {
    const { scene, mesh } = linesOf({ type: "sphere" });
    expect(mesh.isMesh).toBe(true);
    expect(mesh.children).toHaveLength(0);
    expect(scene.owned.has(mesh.geometry)).toBe(true);
    expect(scene.owned.has(mesh.material as never)).toBe(true);
  });

  it("is lineWidth pixels across in the gizmo's own pixels, so a host resize leaves it alone", () => {
    for (const [lineWidth, size] of [[4, 128], [8, 96]]) {
      const { scene, mesh } = linesOf({ type: "sphere", lineWidth, size });
      // The x line is the first sixth; its cross-section spans z in [-radius, radius].
      const { array, count } = mesh.geometry.attributes.position;
      const z = Array.from(array.slice(0, (count / 6) * 3)).filter((_, i) => i % 3 === 2);
      expect((Math.max(...z) - Math.min(...z)) * pixelsPerUnit(scene.options)).toBeCloseTo(lineWidth, 6);
    }
  });

  it("follows lineWidth, size, colours and visibility in place, with the same geometry and material", () => {
    const { scene, mesh } = linesOf({ type: "sphere" });
    const { geometry, material } = mesh;
    const next = resolve0({ type: "sphere", lineWidth: 2, size: 200, x: { color: 0xff0000 }, y: { line: false } });
    expect(classifyChange(scene.options, next)).toBe("cheap");
    updateScene(scene, next);
    expect(mesh.geometry).toBe(geometry);
    expect(mesh.material).toBe(material);
    const block = geometry.attributes.position.count / 6;
    const segment = (i: number) => (geometry.attributes.position.array as Float32Array).slice(i * block * 3, (i + 1) * block * 3);
    expect(segment(1).every((v) => v === 0)).toBe(true); // y hidden
    expect(segment(0).some((v) => v !== 0)).toBe(true);
    expect(Array.from(geometry.attributes.color.array.slice(0, 3))).toEqual([1, 0, 0]);
  });
});

/**
 * Import-graph assertion (R7, P4): no `three/webgpu` and no fat-line module is reachable at run time. Type-only imports
 * are erased by the build and are not followed.
 */
describe("import graph", () => {
  const FORBIDDEN = /^three\/(webgpu|(examples\/jsm|addons)\/lines\/)/;
  const RUNTIME_IMPORT = /^\s*(?:import|export)(?!\s+type\b)[^;]*?from\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/gm;

  /** Every external specifier reachable from `entry` through runtime imports, with the module that imports it. */
  const externals = (entry: string) => {
    const seen = new Set<string>();
    const found: string[] = [];
    const visit = (file: string) => {
      if (seen.has(file)) return;
      seen.add(file);
      for (const match of readFileSync(file, "utf8").matchAll(RUNTIME_IMPORT)) {
        const specifier = match[1] ?? match[2] ?? match[3];
        if (!specifier.startsWith(".")) {
          found.push(`${specifier} <- ${file}`);
          continue;
        }
        const path = resolve(dirname(file), specifier).replace(/\.js$/, "");
        visit([`${path}.ts`, `${path}/index.ts`].find(existsSync)!);
      }
    };
    visit(resolve(__dirname, entry));
    return found;
  };

  // Now: the new scene path. `build.ts` reaches every lib/scene module the 3.0 class will draw with.
  it.each(["build.ts", "axisLines.ts"])("keeps three/webgpu and Line2 out of the new scene path from %s", (entry) => {
    const reached = externals(entry);
    expect(reached.length).toBeGreaterThan(0);
    expect(reached.filter((line) => FORBIDDEN.test(line))).toEqual([]);
  });

  it("keeps three/webgpu and Line2 out of the root entry", () => {
    expect(externals("../index.ts").filter((line) => FORBIDDEN.test(line))).toEqual([]);
  });
});
