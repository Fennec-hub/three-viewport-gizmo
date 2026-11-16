/**
 * S2 browser cases: lib/scene/labels.ts on a real GPU, read back from a render target. Served from source by the G2
 * browser gate's Vite server at `/lib/__tests__/browser/labels.html`.
 */
import { expect, test } from "@playwright/test";

type Memory = {
  backend: string;
  textures: number;
  sides: number[];
  bytes: number;
  white: { width: number; height: number; bytes: number; users: number }[];
};
type Sharp = { toReference: number; blurryToReference: number };

test.use({ deviceScaleFactor: 2 });

for (const backend of ["webgpu", "webgl"] as const) {
  test.describe(backend, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/lib/__tests__/browser/labels.html?backend=${backend}`);
      await page.waitForFunction("window.READY === true");
    });

    // Budget row `textures`: at most 13, that is 12 label textures plus one shared 1×1 white texture (S7); bytes unchanged.
    test("the cube holds at most 12 label textures, 1.5 MB, and one shared white texel after hovering every target", async ({ page }) => {
      for (const dpr of [1, 2]) {
        const result = await page.evaluate<Memory>(`T.memory("cube", ${dpr})`);
        expect(result.backend).toBe(backend);
        expect(result.textures).toBeLessThanOrEqual(12);
        expect(result.bytes).toBeLessThanOrEqual(1.5 * 2 ** 20);
        expect(result.white).toHaveLength(1);
        const [white] = result.white;
        expect([white.width, white.height, white.bytes]).toEqual([1, 1, 4]);
        // Shared by the plain targets' materials, the lines and the background, never one texture each.
        expect(white.users).toBeGreaterThan(1);
      }
    });

    for (const type of ["cube", "sphere"] as const) {
      test(`${type} labels at device pixel ratio 2 are sharp against a 1024-texel reference`, async ({ page }) => {
        const { toReference, blurryToReference } = await page.evaluate<Sharp>(`T.sharp("${type}")`);
        // Measured 1.4 (cube) and 1.8 (sphere) against 9.7 and 7.5 for 16-texel labels, on Apple M-series Metal.
        expect(toReference).toBeLessThan(2.5);
        expect(toReference).toBeLessThan(blurryToReference / 3);
      });
    }

    test("rounded-cube face labels bleed to their edges: no slivers in the notches, no lines on the boundaries", async ({
      page,
    }) => {
      const { lit, off } = await page.evaluate<{ lit: number; off: number }>("T.seams()");
      expect(lit).toBeGreaterThan(0);
      expect(off).toBe(0);
    });

    test("a font loaded after construction appears with no set()", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const { changed, frames } = await page.evaluate<{ changed: boolean; frames: number }>("T.lateFont()");
      expect(changed).toBe(true);
      expect(frames).toBe(1);
      expect(errors).toEqual([]);
    });
  });
}
