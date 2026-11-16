/**
 * H1 cases on `tests/browser/views.html`, public API only: the 26 targets by real mouse on every type (I1), both turn
 * kinds from all 26 views on every type and with the four real controllers (K7, L7), the controllers after a roll and
 * a rolled start (L7), host-CSS cursors and a touch drag that does not scroll (E1). The backend is the project.
 */
import type { CDPSession, Page } from "@playwright/test";
import { expect, test } from "./fixtures";

type Row = { view: string; turn: string; status: string; reason: string | null; ended: boolean; kept: number; tilt: number; at: string | null; atKind: string | null };
type State = { position: number[]; up: number[]; screenUp: number[]; back: number[] };
type Rect = { x: number; y: number; width: number; height: number };

const open = async (page: Page, backend: string, params: Record<string, string>) => {
  const errors: string[] = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(`/tests/browser/views.html?${new URLSearchParams({ backend, ...params })}`);
  await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
  const T = <R = unknown>(expression: string) => page.evaluate<R>(`T.${expression}`);
  return { errors, T };
};

const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);
const types = ["sphere", "cube", "rounded-cube"] as const;
const controllers = ["orbit", "trackball", "arcball", "camera-controls"] as const;

test.describe("I1: each of the 26 targets by real mouse", () => {
  for (const type of types) {
    test(`${type}: hover shows each target and a click turns to it`, async ({ page }, info) => {
      test.setTimeout(120_000);
      const { errors, T } = await open(page, info.project.name, { type, controls: "orbit" });
      const names = await T<string[]>("names()");
      expect(names).toHaveLength(26);
      for (const name of names) {
        // Apart from the last click by more than the double-click interval: a second click there resets the up.
        await page.waitForTimeout(600);
        const centre = await T<{ x: number; y: number }>(`aim(${JSON.stringify(name)})`);
        // Arrive from outside the element, so the hover is a real enter.
        await page.mouse.move(centre.x - 200, centre.y);
        await page.mouse.move(centre.x, centre.y, { steps: 4 });
        await expect.poll(() => T("hovered()"), { message: `hover ${name}` }).toBe(name);
        await page.mouse.down();
        await page.mouse.up();
        await expect.poll(async () => ({ animating: await T("animating()"), at: await T("at()") }), { message: `click ${name}`, timeout: 5_000 }).toEqual({ animating: false, at: name });
      }
      expect(errors).toEqual([]);
    });
  }
});

/** One row's expectations: K7's for no controls, plus the host's controls keeping the end pose. */
const checkTurns = (rows: Row[], canRoll: boolean) => {
  expect(new Set(rows.map((r) => r.view)).size).toBe(26);
  expect(rows).toHaveLength(26 * 7);
  for (const row of rows) {
    const where = `${row.view} ${row.turn}`;
    const isRoll = row.turn.includes("roll");
    if (isRoll && !canRoll) {
      expect({ where, status: row.status, reason: row.reason }).toEqual({ where, status: "unavailable", reason: "roll-off" });
      continue;
    }
    expect({ where, status: row.status, ended: row.ended }).toEqual({ where, status: "reached", ended: true });
    expect({ where, kept: row.kept }).toEqual({ where, kept: expect.closeTo(0, 3) });
    if (row.turn.includes("toward")) expect({ where, kind: row.atKind }).toEqual({ where, kind: "face" });
    if (isRoll) expect({ where, at: row.at }).toEqual({ where, at: row.view });
    if (row.turn.includes("azimuth")) expect({ where, at: row.at }).not.toEqual({ where, at: null });
    if (!isRoll) expect({ where, tilt: row.tilt }).toEqual({ where, tilt: expect.closeTo(0, 6) });
  }
};

test.describe("K7/L7: both turn kinds from all 26 views", () => {
  const cases = [
    ...types.filter((t) => t !== "cube").map((type) => ({ type, controls: "none" })),
    ...controllers.map((controls) => ({ type: "cube", controls })),
  ];
  for (const { type, controls } of cases) {
    test(`${type}, controls ${controls}`, async ({ page }, info) => {
      test.setTimeout(240_000);
      const { errors, T } = await open(page, info.project.name, { type, controls });
      const canRoll = await T<boolean>("canRoll()");
      // ruling A and C1: the turntables roll through their up; the free-tumble controllers roll themselves.
      expect(canRoll).toBe(controls === "none" || controls === "orbit" || controls === "camera-controls");
      checkTurns(await T<Row[]>("turns()"), canRoll);
      expect(errors).toEqual([]);
    });
  }
});

test.describe("L7: the four real controllers after a roll", () => {
  for (const controls of controllers) {
    test(`${controls}: a real drag after a roll keeps working from the rolled view`, async ({ page }, info) => {
      const { errors, T } = await open(page, info.project.name, { type: "cube", controls });
      expect(await T("lookFrom('front', { animated: false, up: 'reset' })")).toBe("reached");
      const canRoll = await T<boolean>("canRoll()");
      if (canRoll) expect(await T("turn({ roll: Math.PI / 2 })")).toBe("reached");
      else await T("hostRoll()");
      await T("frames(5)");
      const rolled = await T<State>("state()");
      // Rolled a quarter: the screen up is now across the label up.
      expect(Math.abs(rolled.screenUp[1])).toBeLessThan(1e-3);

      // A horizontal drag on the host canvas, away from the gizmo.
      await page.mouse.move(250, 300);
      await page.mouse.down();
      await page.mouse.move(330, 300, { steps: 10 });
      await page.mouse.up();
      await T("frames(30)");
      const dragged = await T<State>("state()");
      expect(Math.abs(dot(dragged.back, rolled.back)), "the drag turned the view").toBeLessThan(0.999);
      if (controls === "orbit" || controls === "camera-controls") {
        // A turntable orbits the rolled up: the camera's height along it and the up itself are kept.
        expect(dot(dragged.position, rolled.up)).toBeCloseTo(dot(rolled.position, rolled.up), 2);
        expect(dot(dragged.up, rolled.up)).toBeCloseTo(1, 6);
      }
      // Every controller, rolled or not, then hands back to a gizmo click: front, upright, and kept by the controls.
      const near = await T<{ x: number; y: number }>("aim('front', 'keep')");
      await page.mouse.click(near.x, near.y);
      await expect.poll(async () => ({ animating: await T("animating()"), at: await T("at()") }), { timeout: 5_000 }).toEqual({ animating: false, at: "front" });
      await T("frames(10)");
      const front = await T<State>("state()");
      expect(front.back.map((x) => Math.round(x * 1e4) / 1e4 + 0)).toEqual([0, 0, 1]);
      // Roll off ends on the label up; roll on keeps the nearest cardinal up (K7).
      if (!canRoll) expect(front.screenUp[1]).toBeGreaterThan(0.999);
      else expect(Math.max(...front.screenUp.map(Math.abs))).toBeGreaterThan(0.999);
      expect(errors).toEqual([]);
    });
  }

  test("orbit: a turn from a host-rolled camera has no first-frame jump", async ({ page }, info) => {
    const { errors, T } = await open(page, info.project.name, { type: "cube", controls: "orbit" });
    await T("lookFrom('top-front-right', { animated: false, up: 'reset' })");
    await T("hostRoll()");
    await T("frames(2)");
    expect(await T("turn({ toward: 'up' })")).toBe("reached");
    // 2.3.0 jumped by the whole roll (90°) on frame one; an eased frame steps a few degrees (roll audit Finding 4: ≤ 19°).
    expect(await T<number>("firstStep()")).toBeLessThan(20);
    expect(errors).toEqual([]);
  });
});

/** One CDP touch frame; `points` are the fingers down after this event. */
const touch = (cdp: CDPSession, type: "touchStart" | "touchMove" | "touchEnd", points: { x: number; y: number; id: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

test.describe("E1: the host's CSS and the page", () => {
  test("the host's cursor rules follow the state attributes", async ({ page }, info) => {
    const { errors, T } = await open(page, info.project.name, { type: "cube", controls: "orbit" });
    const centre = await T<{ x: number; y: number }>("aim('front')");
    await page.mouse.move(centre.x - 300, centre.y);
    expect(await T("cursor()")).toBe("auto");
    await page.mouse.move(centre.x, centre.y, { steps: 4 });
    await expect.poll(() => T("cursor()")).toBe("pointer");
    await page.mouse.down();
    await page.mouse.move(centre.x + 30, centre.y, { steps: 6 });
    await expect.poll(() => T("cursor()")).toBe("grabbing");
    await page.mouse.up();
    await expect.poll(() => T("cursor()")).toBe("auto");
    // ponytail: the hover returns on the next move, not under a still pointer after a drag (reported to the coordinator).
    await page.mouse.move(centre.x + 31, centre.y);
    await expect.poll(() => T("cursor()")).toBe("pointer");
    await T("setEnabled(false)");
    await expect.poll(() => T("cursor()")).toBe("not-allowed");
    await T("setEnabled(true)");
    await page.mouse.move(centre.x - 300, centre.y, { steps: 4 });
    await expect.poll(() => T("cursor()")).toBe("auto");
    expect(errors).toEqual([]);
  });

  test.describe(() => {
    test.use({ hasTouch: true });
    test("a touch drag on the gizmo turns the view and does not scroll the page", async ({ page }, info) => {
      const { errors, T } = await open(page, info.project.name, { type: "cube", controls: "orbit", tall: "1" });
      const rect = await T<Rect>("rect()");
      const centre = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      const before = await T<State>("state()");
      const cdp = await page.context().newCDPSession(page);
      await touch(cdp, "touchStart", [{ ...centre, id: 1 }]);
      for (let i = 1; i <= 10; i++) await touch(cdp, "touchMove", [{ x: centre.x, y: centre.y - 8 * i, id: 1 }]);
      await touch(cdp, "touchEnd", []);
      await T("frames(5)");
      expect(dot((await T<State>("state()")).back, before.back)).toBeLessThan(0.999);
      expect(await page.evaluate("scrollY")).toBe(0);
      expect(errors).toEqual([]);
    });
  });
});
