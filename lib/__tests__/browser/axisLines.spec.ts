/**
 * S3 browser cases: the mesh axis lines keep their pixel width across a window resize and at device pixel ratio 2,
 * and add at most the programs or pipelines the budget allows. Served from source by the G2 browser gate's Vite
 * server at `/lib/__tests__/browser/axisLines.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type Counts = { gizmoAdded: number; linesAdded: number };

type Width = { width: number; expected: number; window: [number, number]; dpr: number };

/** Budget row `programs` (perf/budget.json): programs or pipelines one gizmo adds over a host scene. */
const PROGRAMS_BUDGET = 2;

/** A window that changes size around a gizmo; the gizmo's own rectangle stays 128 CSS pixels. */
const WINDOWS = [
  [1280, 800],
  [640, 480],
  [1920, 1080],
] as const;

const open = async (page: Page, backend: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/axisLines.html?backend=${backend}`);
  await page.waitForFunction("window.READY === true");
  expect(await page.evaluate("T.backend()")).toBe(backend);
  return errors;
};

for (const backend of ["webgpu", "webgl"] as const) {
  for (const type of ["sphere", "cube", "rounded-cube"] as const) {
    for (const dpr of [1, 2]) {
      test(`${backend} ${type} at DPR ${dpr}: the line width is constant across a window resize`, async ({ browser }) => {
        const context = await browser.newContext({ deviceScaleFactor: dpr, viewport: { width: 1280, height: 800 } });
        const page = await context.newPage();
        const errors = await open(page, backend);
        const widths: Width[] = [];
        for (const [width, height] of WINDOWS) {
          await page.setViewportSize({ width, height });
          widths.push(await page.evaluate<Width>(`T.measure("${type}")`));
        }
        expect(new Set(widths.map((w) => w.width)).size).toBe(1);
        // Hard-edged rasterisation of a cylinder `lineWidth * dpr` device pixels across: within one pixel.
        expect(Math.abs(widths[0].width - widths[0].expected)).toBeLessThanOrEqual(1);
        expect(errors).toEqual([]);
        await context.close();
      });
    }

    test(`${backend} ${type}: the lines add at most one program or pipeline`, async ({ page }) => {
      const errors = await open(page, backend);
      const { linesAdded } = await page.evaluate<Counts>(`T.count("${type}")`);
      expect(linesAdded).toBeLessThanOrEqual(1);
      expect(errors).toEqual([]);
    });

    test(`${backend} ${type}: the gizmo adds at most ${PROGRAMS_BUDGET} programs or pipelines`, async ({ page }) => {
      const errors = await open(page, backend);
      const { gizmoAdded } = await page.evaluate<Counts>(`T.count("${type}")`);
      test.info().annotations.push({ type: "programs", description: String(gizmoAdded) });
      expect(errors).toEqual([]);
      expect(gizmoAdded).toBeLessThanOrEqual(PROGRAMS_BUDGET);
    });
  }
}
