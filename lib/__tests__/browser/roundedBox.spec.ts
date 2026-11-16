/**
 * S5 browser cases: the seamless rounded cube on a real GPU, looking from each of its 26 targets.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/roundedBox.html`.
 */
import { expect, test } from "@playwright/test";

type View = {
  name: string;
  /** Pixels where the box's red inside shows through its pieces: seams. */
  red: number;
  /** The same red under the one merged mesh: the rasteriser's own pinholes, which no piece boundary causes. */
  redMerged: number;
  /** Bytes that differ from the one merged mesh. */
  differ: number;
  /** Pixels of the hovered piece, and of all pixels that hovering it changed, those outside it. */
  mask: number;
  changed: number;
  outside: number;
  /** Pixels a pixel away from any piece boundary, and those the analytic hit test names differently. */
  interior: number;
  disagree: number;
};

for (const backend of ["webgpu", "webgl"] as const) {
  test(`${backend} rounded-cube: no seam at any of the 26 views; hover lights the piece the hit test names`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/lib/__tests__/browser/roundedBox.html?backend=${backend}`);
    await page.waitForFunction("window.READY === true");
    const result = await page.evaluate<{ backend: string; triangles: number; views: View[] }>("T.run()");

    expect(result.backend).toBe(backend);
    expect(result.triangles).toBeLessThanOrEqual(15_000);
    expect(result.views).toHaveLength(26);
    for (const view of result.views) {
      if (view.red || view.redMerged) console.log(`[${backend}] ${view.name}: ${view.red} red through the pieces, ${view.redMerged} through the merged mesh`);
      // The reference GPU allows no seam. SwiftShader leaves 1 to 4 pinholes at some views in the one merged mesh too,
      // so there a view may show no more red through the pieces than through that mesh: a crack between pieces still fails.
      // The pieces then match the merged mesh except at those pinholes (at most 4 bytes per pinhole pixel).
      if (test.info().project.metadata.gpu === "metal") {
        expect(view.red, view.name).toBe(0);
        expect(view.differ, view.name).toBe(0);
      } else {
        expect(view.red, view.name).toBeLessThanOrEqual(view.redMerged);
        expect(view.differ, view.name).toBeLessThanOrEqual(4 * (view.red + view.redMerged));
      }
      expect(view.mask, view.name).toBeGreaterThan(0);
      expect(view.outside, view.name).toBe(0);
      // Label pixels keep their colour on hover; the rest of the piece changes.
      expect(view.changed, view.name).toBeGreaterThan(view.mask / 2);
      expect(view.disagree, view.name).toBe(0);
    }
    expect(errors).toEqual([]);
  });
}
