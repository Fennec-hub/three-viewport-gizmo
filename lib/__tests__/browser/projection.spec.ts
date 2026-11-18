/**
 * Hit test against the projection a real renderer draws the gizmo with: WebGLRenderer and WebGPURenderer, with and
 * without `reversedDepthBuffer`, across fields of view either side of 26° (where `far < 2 near` flipped the ray under
 * reversed depth before the fix). Chromium's own mouse moves to where each target is drawn.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/projection.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type Projection = { coordinateSystem: number; reversedDepth: boolean; near: number; far: number };
type Point = { name: string; x: number; y: number };

/** three's `WebGPUCoordinateSystem`. */
const WEBGPU = 2001;
const FIELDS_OF_VIEW = [0.1, 5, 20, 25.57, 26.07, 45, 75];
const OBLIQUE = [3, 2.6, 3.4];
const RIGHT = [1, 0, 0];

const open = async (page: Page, backend: string, reversed: boolean) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/projection.html?backend=${backend}&reversed=${reversed ? 1 : 0}`);
  await page.waitForFunction("window.READY === true");
  return errors;
};

const hoverAt = async (page: Page, x: number, y: number) => {
  await page.mouse.move(x, y);
  return page.evaluate<string>("T.hovered()");
};

for (const backend of ["webgl", "webgpu"] as const) {
  for (const reversed of [false, true]) {
    test(`${backend}${reversed ? " reversedDepthBuffer" : ""}: the pointer hits what is drawn at every field of view`, async ({ page }) => {
      test.setTimeout(120_000);
      const errors = await open(page, backend, reversed);
      let projection: Projection | null = null;
      for (const type of ["cube", "rounded-cube", "sphere"] as const) {
        for (const degrees of FIELDS_OF_VIEW) {
          projection = await page.evaluate<Projection>(`T.setUp(${JSON.stringify(type)}, ${degrees}, ${JSON.stringify(OBLIQUE)})`);
          const points = await page.evaluate<Point[]>(`T.points(${JSON.stringify(type)})`);
          expect(points.length, `${type} ${degrees}°`).toBeGreaterThanOrEqual(degrees >= 75 ? 1 : 3);
          for (const { name, x, y } of points) {
            expect({ type, degrees, at: name, hovered: await hoverAt(page, x, y) }).toEqual({ type, degrees, at: name, hovered: name });
          }

          await page.evaluate(`T.setUp(${JSON.stringify(type)}, ${degrees}, ${JSON.stringify(RIGHT)})`);
          const { x, y } = await page.evaluate<{ x: number; y: number }>("T.centre()");
          await page.mouse.move(x + 1, y + 1);
          expect({ type, degrees, view: "right", hovered: await hoverAt(page, x, y) }).toEqual({ type, degrees, view: "right", hovered: "right" });
        }
      }
      // Not vacuous: the renderer did rewrite the gizmo camera's projection as this case names.
      if (backend === "webgpu") expect(projection!.coordinateSystem).toBe(WEBGPU);
      if (reversed && backend === "webgpu") expect(projection!.reversedDepth).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}
