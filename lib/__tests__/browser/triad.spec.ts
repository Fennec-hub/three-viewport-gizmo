/**
 * S6 browser cases: the axis triad toggles at run time adding only its own draws, and draws its X, Y and Z labels in
 * the axis colours on all six ups. Served from source by the G2 browser gate's Vite server at
 * `/lib/__tests__/browser/triad.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type Toggle = {
  draws: { off: number; on: number; offAgain: number };
  programs: { off: number; on: number; added: number };
  sameObjects: boolean;
  triadPixels: number;
  offAgainDiffers: number;
};

type Label = { axis: string; at: [number, number]; lit: number; mean: number[] | null; expected: number[] };

/** Draws the triad adds while shown: one line mesh and three label sprites. */
const TRIAD_DRAWS = 4;

const open = async (page: Page, backend: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/triad.html?backend=${backend}`);
  await page.waitForFunction("window.READY === true");
  expect(await page.evaluate("T.backend()")).toBe(backend);
  return errors;
};

for (const backend of ["webgpu", "webgl"] as const) {
  for (const type of ["cube", "rounded-cube"] as const) {
    test(`${backend} ${type}: toggling the triad at run time changes only its own draws`, async ({ page }) => {
      const errors = await open(page, backend);
      const result = await page.evaluate<Toggle>(`T.toggle("${type}")`);
      test.info().annotations.push({ type: "draws", description: JSON.stringify(result.draws) });
      test.info().annotations.push({ type: "programs", description: JSON.stringify(result.programs) });
      expect(result.sameObjects).toBe(true);
      expect(result.draws.on - result.draws.off).toBe(TRIAD_DRAWS);
      expect(result.draws.offAgain).toBe(result.draws.off);
      // Turned off again, the frame is the triad-off frame to the bit.
      expect(result.offAgainDiffers).toBe(0);
      expect(result.triadPixels).toBeGreaterThan(0);
      // At most the sprite program: the lines share the axis lines' flags.
      expect(result.programs.added).toBeLessThanOrEqual(2);
      expect(errors).toEqual([]);
    });

    for (const up of ["x", "y", "z", "nx", "ny", "nz"] as const) {
      test(`${backend} ${type} up ${up}: X, Y and Z labels in their axis colours`, async ({ page }) => {
        const errors = await open(page, backend);
        const labels = await page.evaluate<Label[]>(`T.labels("${type}", "${up}")`);
        for (const label of labels) {
          expect(label.lit, `${label.axis} label lit pixels at ${label.at}`).toBeGreaterThan(10);
          label.mean!.forEach((channel, c) => expect(Math.abs(channel - label.expected[c])).toBeLessThanOrEqual(3));
        }
        if (type === "rounded-cube") {
          await page.evaluate(`T.show("${type}", "${up}")`);
          await page.locator("canvas").screenshot({ path: test.info().outputPath(`triad-${backend}-${up}.png`) });
        }
        expect(errors).toEqual([]);
      });
    }
  }
}
