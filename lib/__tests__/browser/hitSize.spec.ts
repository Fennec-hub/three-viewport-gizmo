/**
 * `corners.hitSize` and `edges.hitSize` changed live by `set()`, with Chromium's own mouse (P8-G). The docs playground
 * calls `set()` with its whole options object on every change; a sweep across the gizmo's middle row after such a
 * `set()` must read what a gizmo constructed with the same hit sizes reads, on WebGL and WebGPU.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/hitSize.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type HitSizes = { corners?: number; edges?: number };
type Rect = { left: number; top: number; width: number; height: number };

const FRONT = [0, 0, 6];
const OBLIQUE = [6, 5, 9];
const SAMPLES = 40;

const open = async (page: Page, backend: string, eye: number[], initial: HitSizes = {}) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  const query = new URLSearchParams({ backend, eye: JSON.stringify(eye), initial: JSON.stringify(initial) });
  await page.goto(`/lib/__tests__/browser/hitSize.html?${query}`);
  await page.waitForFunction("window.READY === true");
  expect(await page.evaluate("T.backend()")).toBe(backend);
  return errors;
};

/** The kind hovered at each of 41 points across the gizmo's middle row: F, E, C or `.` for nothing. */
const sweep = async (page: Page) => {
  const rect = await page.evaluate<Rect>("T.rect()");
  // Not vacuous: the whole row is inside the viewport, where the real mouse reaches it.
  const viewport = page.viewportSize()!;
  expect(rect.top >= 0 && rect.left >= 0 && rect.left + rect.width <= viewport.width && rect.top + rect.height <= viewport.height).toBe(true);
  let row = "";
  for (let i = 0; i <= SAMPLES; i++) {
    await page.mouse.move(rect.left + (rect.width * i) / SAMPLES, rect.top + rect.height / 2);
    row += { face: "F", edge: "E", corner: "C" }[await page.evaluate<string>("T.hovered()")] ?? ".";
  }
  await page.mouse.move(1, 1);
  return row;
};

const count = (row: string, kind: string) => row.split(kind).length - 1;

for (const backend of ["webgl", "webgpu"] as const) {
  test.describe(backend, () => {
    test("a live edges.hitSize hovers as the same size passed at construction", async ({ page }) => {
      for (const eye of [FRONT, OBLIQUE]) {
        const built = await open(page, backend, eye, { edges: 0.6 });
        const expected = await sweep(page);
        const errors = await open(page, backend, eye);
        const auto = await sweep(page);
        await page.evaluate("T.set({ edges: 0.6 })");
        expect(await page.evaluate("T.resolved().edges")).toBe(0.6);
        const live = await sweep(page);
        expect({ eye, live }).toEqual({ eye, live: expected });
        // The band moved: more of the row is edge than under Auto (0.4 at radius 0.3), and something still hovers.
        expect(count(live, "E"), `${auto} -> ${live}`).toBeGreaterThan(count(auto, "E"));
        expect(count(live, "F")).toBeGreaterThan(0);
        // Back to Auto restores the default band.
        await page.evaluate("T.set({})");
        expect(await sweep(page)).toBe(auto);
        expect([...built, ...errors]).toEqual([]);
      }
    });

    test("a live corners.hitSize hovers as the same size passed at construction", async ({ page }) => {
      await open(page, backend, OBLIQUE, { corners: 0.8 });
      const expected = await sweep(page);
      const errors = await open(page, backend, OBLIQUE);
      const auto = await sweep(page);
      await page.evaluate("T.set({ corners: 0.8 })");
      const live = await sweep(page);
      expect(live).toBe(expected);
      expect(count(live, "C"), `${auto} -> ${live}`).toBeGreaterThan(count(auto, "C"));
      expect(errors).toEqual([]);
    });

    test("a live unrelated cheap option leaves the hover as it was", async ({ page }) => {
      const errors = await open(page, backend, OBLIQUE, { edges: 0.6 });
      const before = await sweep(page);
      await page.evaluate("T.set({ edges: 0.6 }, { speed: 2, poleEntry: 'nearest' })");
      expect(await sweep(page)).toBe(before);
      expect(errors).toEqual([]);
    });
  });
}
