/**
 * H1 rows on `perf/harness.html`: a second gizmo after the first is disposed (S4), the warmed first frame (F2), the
 * triad's draws (S6), and two source gates: no test or harness reads a private field, and every browser spec counts
 * console warnings. The backend is the project.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import budget from "../../perf/budget.json" with { type: "json" };
import { expect, measured, test } from "./fixtures";

type Snap = { draws: number; programs?: number; pipelines?: number };
type First = { afterCompile: Snap; afterFirst: Snap; steady: Snap; firstRenderCpuMs: number };

const row = (id: string) => budget.rows.find((r) => r.id === id)!;
const programs = (s: Snap) => s.programs ?? s.pipelines;
const types = ["sphere", "cube", "rounded-cube"] as const;

for (const type of types) {
  test(`S4 ${type}: a new gizmo draws after the first is disposed`, async ({ open }, info) => {
    const { P, page, errors } = await open({ type });
    await P("step('make')");
    const before = await P<number>("render3()");
    expect(before, "precondition: the gizmo draws").toBeGreaterThan(1000);
    await P("step('remake')");
    const after = await P<number>("render3()");
    await page.waitForTimeout(300); // WebGPU validation errors arrive asynchronously
    measured(info, { before, after });
    expect({ after, errors }).toEqual({ after: before, errors: [] });
  });

  test(`F2 ${type}: after compile() the first frame builds no program or pipeline`, async ({ open }, info) => {
    const { P, errors } = await open({ type });
    const first = await P<First>("first(true)");
    measured(info, { afterCompile: programs(first.afterCompile), afterFirst: programs(first.afterFirst), firstRenderCpuMs: first.firstRenderCpuMs });
    expect(programs(first.afterFirst)).toBe(programs(first.afterCompile));
    // The time is the perf gate's report row "first-render-warm", measured there one page at a time; parallel workers
    // share the GPU here, so this case only prints it.
    expect(errors).toEqual([]);
  });
}

for (const type of ["cube", "rounded-cube"] as const) {
  test(`S6 ${type}: the triad adds its draws and no program`, async ({ open }, info) => {
    const off = await (await open({ type })).P<First>("first(false)");
    const { P, errors } = await open({ type, triad: "1" });
    const on = await P<First>("first(false)");
    const { budget: draws, triad } = row("draws") as unknown as { budget: Record<string, number>; triad: Record<string, number> };
    measured(info, { off: off.steady.draws, on: on.steady.draws });
    expect(off.steady.draws).toBeLessThanOrEqual(draws[type]);
    expect(on.steady.draws).toBeLessThanOrEqual(triad[type]);
    expect(on.steady.draws - off.steady.draws).toBe(6);
    expect(programs(on.afterFirst)).toBe(programs(off.afterFirst));
    expect(errors).toEqual([]);
  });
}

const root = fileURLToPath(new URL("../..", import.meta.url));
/** Test, spec and harness sources: everything that drives the gizmo from outside `lib/`'s own modules. */
const sources = () => {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) e.name !== "node_modules" && e.name !== "fixtures" && walk(path);
      else if (/\.(test|spec)\.ts$|\.html$|harness\.js$/.test(e.name)) out.push(relative(root, path));
    }
  };
  for (const dir of ["lib", "tests", "perf", "site"]) walk(join(root, dir));
  return out;
};

test("H1 no test, spec or harness reads a private gizmo field", async ({}, info) => {
  test.skip(info.project.name !== "webgl", "No browser needed; runs once");
  // An underscore member read on a gizmo, dotted, cast or bracketed. Fields of three's own objects (OrbitControls'
  // quaternion, the WebGPU pipeline cache) are probes of three, not of the gizmo, and stay allowed.
  const pattern = /\b(?:gizmo|g|g2|viewportGizmo)\s*(?:as\s+\w+\s*\)?\s*)?(?:\.\s*_[a-zA-Z]|\[\s*["'`]_)/;
  const hits = sources().flatMap((file) =>
    readFileSync(join(root, file), "utf8")
      .split("\n")
      .flatMap((line, i) => (pattern.test(line) ? [`${file}:${i + 1}: ${line.trim()}`] : []))
  );
  measured(info, { files: sources().length, hits: hits.length });
  expect(hits).toEqual([]);
});

test("H1 every browser spec counts console warnings, not only errors", async ({}, info) => {
  test.skip(info.project.name !== "webgl", "No browser needed; runs once");
  const specs = sources().filter((f) => f.endsWith(".spec.ts"));
  const errorsOnly = specs.filter((file) => /type\(\) === "error" &&/.test(readFileSync(join(root, file), "utf8")));
  expect(errorsOnly).toEqual([]);
});
