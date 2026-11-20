/**
 * Red baseline: each known 2.3.0 defect as an expected failure. A title starts with the task
 * that owns the fix; that task deletes the `test.fail` line (and flips `expectedFail` in
 * perf/budget.json) in its own pull request. An expected failure that starts passing fails the run.
 * Wave 2 lands modules the class adopts at K5, so the pull request that makes the class pass flips the row.
 */
import { readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import budget from "../../perf/budget.json" with { type: "json" };
import { expect, measured, test } from "./fixtures";

const row = (id: string) => budget.rows.find((r) => r.id === id)!;

test.describe("S1 owns P Finding 1: the sphere survives set() and dispose()", () => {
  for (const step of ["set", "remake"] as const) {
    test(`S1 sphere keeps its lit pixels and logs nothing after ${step === "set" ? "set()" : "dispose() and rebuild"}`, async ({ open }, info) => {
      const { P, page, errors } = await open({ type: "sphere" });
      await P("step('make')");
      const before = await P<number>("render3()");
      expect(before, "precondition: the sphere draws").toBeGreaterThan(1000);
      // The shared Sprite geometry is destroyed on WebGPU only; WebGL re-uploads it.
      await P(`step('${step}')`);
      const after = await P<number>("render3()");
      await page.waitForTimeout(300); // WebGPU validation errors arrive asynchronously
      measured(info, { before, after, errors: errors.length, first: errors[0]?.slice(0, 120) });
      expect({ after, errors }).toEqual({ after: before, errors: [] });
    });
  }
});

test.describe("F1 owns P Finding 2: depth outside the gizmo's rectangle is kept", () => {
  for (const scissor of [false, true]) {
    test(`F1 depth probe, host scissor ${scissor ? "on" : "off"}`, async ({ open }, info) => {
      const { P } = await open({ type: "cube" });
      const probe = await P<{ centreWithoutGizmo: number[]; centreWithGizmo: number[] }>(`depthProbe(${scissor})`);
      measured(info, probe);
      // Precondition, outside the expected failure: without the gizmo the box hides the far quad.
      expect(probe.centreWithoutGizmo, "the probe read back the box colour").toEqual([68, 136, 204]);
      // WebGL clears obey the scissor, so a host with scissor on is already safe; WebGPU clears the attachment.
      expect(probe.centreWithGizmo).toEqual(probe.centreWithoutGizmo);
    });
  }
});

test("S2 WebGPU cube textures after hovering every target stay within budget", async ({ open }, info) => {
  test.skip(info.project.name !== "webgpu", "WebGL has no texture byte accounting");
  const { P } = await open({ type: "cube" });
  await P("mainScene(3)");
  const base = await P<{ textures: number; texturesSize: number }>("memory()");
  await P("gate()");
  await P("hoverAll()");
  const after = await P<{ textures: number; texturesSize: number }>("memory()");
  const added = { textures: after.textures - base.textures, bytes: after.texturesSize - base.texturesSize };
  measured(info, added);
  const { budget: b } = row("webgpu-texture-bytes") as { budget: { textures: number; bytes: number } };
  expect(added.textures).toBeLessThanOrEqual(b.textures);
  expect(added.bytes).toBeLessThanOrEqual(b.bytes);
});

/** External specifiers reachable from lib/index.ts, following relative and `@lib/` imports. */
function externalImports(entry: string) {
  const lib = fileURLToPath(new URL("../../lib", import.meta.url));
  const seen = new Set<string>();
  const external = new Set<string>();
  const file = (p: string) => [p, `${p}.ts`, join(p, "index.ts")].find((c) => statSync(c, { throwIfNoEntry: false })?.isFile())!;
  const walk = (path: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    const source = readFileSync(path, "utf8");
    for (const [, typeOnly, spec] of source.matchAll(/^\s*(?:import|export)\s+(type\s+)?[^;]*?from\s+["']([^"']+)["']/gm)) {
      if (typeOnly) continue;
      if (spec.startsWith(".")) walk(file(resolve(dirname(path), spec)));
      else if (spec.startsWith("@lib/")) walk(file(join(lib, spec.slice(5))));
      else external.add(spec);
    }
  };
  walk(file(join(lib, entry)));
  return [...external].sort();
}

test("S3 root entry imports only three and three/addons/utils/*", async ({}, info) => {
  test.skip(info.project.name !== "webgl", "No browser needed; runs once");
  const imports = externalImports("index");
  measured(info, imports);
  expect(imports.filter((s) => s !== "three" && !s.startsWith("three/addons/utils/"))).toEqual([]);
});
