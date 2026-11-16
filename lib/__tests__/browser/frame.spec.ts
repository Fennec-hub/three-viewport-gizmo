/**
 * F1 browser cases for lib/render/frame.ts and rect.ts: F0's depth probe on `renderInRect` (WebGL and WebGPU ×
 * standard, reversed and logarithmic depth × cube and sphere × host scissor off and on), the host's live viewport
 * restored (S probe P12), a draw into a host render target, and the draw, program and allocation rows. Served from
 * source by the G2 browser gate's Vite server at `/lib/__tests__/browser/frame.html`.
 *
 * The reversed-depth cases cover three's `ReversedDepthFuncs` mapping on both sides of its r187 fix (Always→Never
 * before, Always→Always from r187), which `placeDepthReset` spells around by revision; CI runs them on the latest three
 * and the peer matrix on the floor.
 */
import { expect, test, type Page } from "@playwright/test";

type Probe = { outsideChanged: number; insideWrong: number; covered: number; restored: boolean };
type Env = { depthActive: boolean; webgpuBackend: boolean };
type Rect = { viewport: number[]; scissor: number[]; scissorTest: boolean; autoClear: boolean };
type Cost = {
  without: { draws: number; programs: number };
  withReset: { draws: number; programs: number };
  addedDraws: number;
  addedPrograms: number;
  gizmoPrograms: number;
};

const backends = ["webgl", "webgpu"] as const;

const open = async (page: Page, params: Record<string, string>) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`/lib/__tests__/browser/frame.html?${new URLSearchParams(params)}`);
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const F = <T>(expression: string) => page.evaluate<T>(`F.${expression}`);
  const env = await F<Env>("env()");
  expect(env.webgpuBackend, "WebGPURenderer fell back to WebGL").toBe(params.backend === "webgpu");
  return { F, env, errors };
};

const annotate = (type: string, value: unknown) => {
  test.info().annotations.push({ type, description: JSON.stringify(value) });
  console.log(`${test.info().title}: ${type} ${JSON.stringify(value)}`);
};

for (const backend of backends) {
  for (const type of ["cube", "sphere"] as const) {
    for (const depth of ["default", "reversed", "log"] as const) {
      test(`${backend} ${type} ${depth} depth: depth outside the rectangle is the host's, the gizmo draws over it inside`, async ({ page }) => {
        test.setTimeout(180_000); // software WebGPU reads back eight full frames slowly
        const { F, env, errors } = await open(page, { backend, type, depth });
        test.skip(!env.depthActive, "WebGLRenderer has no EXT_clip_control here, so no reversed depth");
        const rows: Record<string, Probe> = {};
        for (const scissor of [false, true]) rows[`scissor ${scissor ? "on" : "off"}`] = await F<Probe>(`probe(${scissor})`);
        // The reset quad follows the internal camera (F2): a moved far plane still resets depth.
        const widened = await page.evaluate("F.widen()");
        rows["scissor off, far plane moved"] = await F<Probe>("probe(false)");
        annotate("probe", { widened, rows });
        for (const [name, p] of Object.entries(rows)) {
          expect(p.covered, `${name}: the gizmo covers pixels to compare`).toBeGreaterThan(500);
          expect({ name, outsideChanged: p.outsideChanged, insideWrong: p.insideWrong, restored: p.restored }).toEqual({
            name,
            outsideChanged: 0,
            insideWrong: 0,
            restored: true,
          });
        }
        expect(errors).toEqual([]);
      });
    }
  }

  test(`${backend}: render() restores the host's live viewport, scissor, scissor test and autoClear (P12)`, async ({ page }) => {
    const { F } = await open(page, { backend, type: "cube" });
    for (const { before, after } of await F<{ before: Rect; after: Rect }[]>("restoresLive()")) expect(after).toEqual(before);
  });

  test(`${backend}: a draw into a host render target lands in the gizmo's rectangle with no host code`, async ({ page }) => {
    const { F, errors } = await open(page, { backend, type: "cube" });
    const result = await F<{ litInside: number; litOutside: number; area: number; restored: boolean }>("renderTarget()");
    annotate("render-target", result);
    expect(result.litInside, "the gizmo draws inside its rectangle on the target").toBeGreaterThan(result.area / 4);
    expect(result.litOutside).toBe(0);
    expect(result.restored, "the target's viewport, scissor and scissor test come back").toBe(true);
    expect(errors).toEqual([]);
  });

  for (const type of ["cube", "sphere"] as const) {
    test(`${backend} ${type}: the depth reset costs one draw, no WebGL program and at most one WebGPU pipeline`, async ({ page }) => {
      const { F } = await open(page, { backend, type });
      const cost = await F<Cost>("cost()");
      annotate("cost", cost);
      expect(cost.addedDraws).toBe(1);
      expect(cost.addedPrograms).toBe(backend === "webgl" ? 0 : 1);
    });
  }

  test(`${backend}: a gizmo frame (measure and draw) stays within the library allocation budget`, async ({ page }) => {
    test.setTimeout(240_000); // software WebGPU queues every frame's work
    const { F } = await open(page, { backend, type: "cube" });
    await F("loop(1500)"); // compiled, and optimised past the interpreter's boxed numbers
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("HeapProfiler.enable");
    await cdp.send("HeapProfiler.startSampling", {
      samplingInterval: 64,
      includeObjectsCollectedByMajorGC: true,
      includeObjectsCollectedByMinorGC: true,
    });
    const n = 1000;
    await F(`loop(${n})`);
    const { profile } = await cdp.send("HeapProfiler.stopSampling");
    const byFunction: Record<string, number> = {};
    type Node = { callFrame: { url: string; functionName: string; lineNumber: number }; selfSize: number; children: Node[] };
    const walk = (node: Node) => {
      const { url, functionName, lineNumber } = node.callFrame;
      if (node.selfSize && url.includes("/lib/") && !url.includes("/__tests__/")) {
        const key = `${url.slice(url.indexOf("/lib/"))}:${functionName}:${lineNumber + 1}`;
        byFunction[key] = (byFunction[key] ?? 0) + node.selfSize;
      }
      node.children.forEach(walk);
    };
    walk(profile.head as Node);
    const bytesPerFrame = Math.round(Object.values(byFunction).reduce((a, b) => a + b, 0) / n);
    annotate("alloc", { bytesPerFrame, byFunction });
    // perf/budget.json `alloc` idle row: at most 64 B per idle frame for the whole library.
    expect(bytesPerFrame).toBeLessThanOrEqual(64);
  });
}
