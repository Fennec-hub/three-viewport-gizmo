/**
 * K7 browser cases: both turn kinds (`turn({ toward })` and `turn({ azimuth | polar | roll })`) from all 26 views, and
 * a real double-click, on a real WebGLRenderer and WebGPURenderer drawing every frame.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/turns.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type Row = {
  view: string;
  turn: string;
  status: string;
  reason: string | null;
  ended: boolean;
  tilt: number;
  at: string | null;
  atKind: string | null;
};
type State = { at: string | null; up: number[]; screenUp: number[]; animating: boolean };

const open = async (page: Page, backend: string, roll: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/turns.html?backend=${backend}&roll=${roll}`);
  await page.waitForFunction("window.READY === true");
  return errors;
};

for (const backend of ["webgl", "webgpu"] as const) {
  for (const roll of ["true", "false", "free"] as const) {
    test(`${backend} roll ${roll}: both turn kinds from all 26 views`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = await open(page, backend, roll);
      const rows = await page.evaluate<Row[]>("T.run()");
      expect(new Set(rows.map((r) => r.view)).size).toBe(26);
      expect(rows).toHaveLength(26 * 7);

      for (const row of rows) {
        const where = `${row.view} ${row.turn}`;
        const isRoll = row.turn.includes("roll");
        if (isRoll && roll === "false") {
          expect({ where, status: row.status, reason: row.reason }).toEqual({ where, status: "unavailable", reason: "roll-off" });
          continue;
        }
        expect({ where, status: row.status, ended: row.ended }).toEqual({ where, status: "reached", ended: true });
        // A side triangle always lands on a face; a roll stays on its target (rolled corner: as the demo).
        if (row.turn.includes("toward")) expect({ where, kind: row.atKind }).toEqual({ where, kind: "face" });
        if (isRoll) expect({ where, at: row.at }).toEqual({ where, at: row.view });
        // An orbit azimuth quarter turn from a target lands on a target; `'free'` turns about the screen up instead.
        if (row.turn.includes("azimuth") && roll !== "free") expect({ where, at: row.at }).not.toEqual({ where, at: null });
        // I1: upright on every frame of every turn that removes no roll.
        if (roll !== "free" && !isRoll) expect({ where, tilt: row.tilt }).toEqual({ where, tilt: expect.closeTo(0, 6) });
      }
      // Not vacuous: the frames were sampled, and a roll off a pole tilts the screen right off the plane.
      if (roll === "true") expect(rows.some((r) => r.turn.includes("roll") && r.tilt > 0.9)).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test(`${backend}: a real double-click on a rolled face ends upright on it`, async ({ page }) => {
    const errors = await open(page, backend, "true");
    await page.evaluate("T.rolled('front')");
    const before = await page.evaluate<State>("T.state()");
    expect(before.at).toBe("front");
    expect(before.screenUp[1]).toBeCloseTo(0, 6);
    const rect = await page.evaluate<{ x: number; y: number; width: number; height: number }>("T.rect()");
    await page.mouse.dblclick(rect.x + rect.width / 2, rect.y + rect.height / 2);
    const round = (v: number[]) => v.map((x) => Math.round(x * 1e6) / 1e6 + 0);
    await expect.poll(async () => round((await page.evaluate<State>("T.state()")).screenUp), { timeout: 5_000 }).toEqual([0, 1, 0]);
    await expect.poll(() => page.evaluate<State>("T.state()")).toMatchObject({ animating: false, at: "front" });
    expect(round((await page.evaluate<State>("T.state()")).up)).toEqual([0, 1, 0]);
    expect(errors).toEqual([]);
  });
}
