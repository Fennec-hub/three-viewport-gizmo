/**
 * I2 browser cases: Chromium's own mouse, wheel and touch pipeline (Playwright mouse and CDP
 * Input.dispatchTouchEvent) against lib/interaction/pointerSession.ts, never synthetic DOM events.
 * Served from source by the G2 browser gate's Vite server at `/lib/__tests__/browser/pointerSession.html`.
 */
import { expect, test, type CDPSession, type Page } from "@playwright/test";

type Entry = { type: string; pointerType?: string | null; local?: [number, number]; grabbed?: boolean; double?: boolean };

const page = "/lib/__tests__/browser/pointerSession.html";
const pad = { x: 950, y: 150 }; // the centre of #pad at scroll 0

const open = async (p: Page, params = "") => {
  await p.goto(`${page}${params}`);
  await p.waitForFunction("window.READY === true");
};
const log = (p: Page) => p.evaluate<Entry[]>("T.log");
const types = async (p: Page) => (await log(p)).map((e) => e.type);
const touch = (cdp: CDPSession, type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel", touchPoints: { x: number; y: number; id: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints });

test.describe("mouse", () => {
  test("a drag reports travel from the press and ends once", async ({ page: p }) => {
    await open(p);
    await p.mouse.move(pad.x, pad.y);
    await p.mouse.down();
    for (let i = 1; i <= 5; i++) await p.mouse.move(pad.x + 6 * i, pad.y);
    await p.mouse.up();
    const entries = await log(p);
    expect(entries.filter((e) => e.type === "dragEnd")).toHaveLength(1);
    expect(entries.findLast((e) => e.type === "drag")).toMatchObject({ dx: 30, dy: 0 });
  });

  test("a right button does nothing", async ({ page: p }) => {
    await open(p);
    await p.mouse.move(pad.x, pad.y);
    await p.mouse.down({ button: "right" });
    await p.mouse.move(pad.x + 40, pad.y);
    await p.mouse.up({ button: "right" });
    expect(await types(p)).not.toContain("press");
    expect(await types(p)).not.toContain("drag");
  });

  test("a scroll before a press does not shift hits", async ({ page: p }) => {
    await open(p);
    await p.mouse.move(pad.x, pad.y);
    await p.mouse.move(100, 700);
    await p.mouse.wheel(0, 60);
    await p.waitForFunction("scrollY > 0");
    await p.waitForTimeout(300); // let a smooth scroll finish
    const scrolled = await p.evaluate<number>("scrollY");
    // The pad moved up with no resize; press 10 px into it.
    await p.mouse.move(910, 100 - scrolled + 10);
    await p.mouse.down();
    await p.mouse.up();
    expect((await log(p)).find((e) => e.type === "press")?.local).toEqual([10, 10]);
  });

  test("a press during a flight grabs the view", async ({ page: p }) => {
    await open(p);
    await p.evaluate("T.fly()");
    expect(await p.evaluate("T.flying()")).toBe(true);
    await p.mouse.move(pad.x, pad.y);
    await p.mouse.down();
    await p.mouse.move(pad.x + 30, pad.y);
    await p.mouse.up();
    expect(await p.evaluate("T.flying()")).toBe(false);
    const entries = await log(p);
    expect(entries.find((e) => e.type === "press")?.grabbed).toBe(true);
    expect(entries.map((e) => e.type)).toContain("dragEnd");
  });

  test.describe("double-click classification", () => {
    const click = async (p: Page, x: number) => {
      await p.mouse.move(x, pad.y);
      await p.mouse.down();
      await p.mouse.up();
    };
    const doubles = async (p: Page) => (await log(p)).filter((e) => e.type === "click").map((e) => e.double);

    test("a second press on the same spot within 400 ms is a double-click, a third starts over", async ({ page: p }) => {
      await open(p);
      await click(p, pad.x);
      await click(p, pad.x + 2);
      await click(p, pad.x + 2);
      expect(await doubles(p)).toEqual([false, true, false]);
    });

    test("a quick second press 20 px away is a new click", async ({ page: p }) => {
      await open(p);
      await click(p, pad.x - 10);
      await click(p, pad.x + 10);
      expect(await doubles(p)).toEqual([false, false]);
    });

    test("a second press after 400 ms is a new click", async ({ page: p }) => {
      await open(p);
      await click(p, pad.x);
      await p.waitForTimeout(450);
      await click(p, pad.x);
      expect(await doubles(p)).toEqual([false, false]);
    });
  });
});

test.describe("touch", () => {
  test.use({ hasTouch: true });

  test("a second finger does nothing", async ({ page: p }) => {
    await open(p);
    const cdp = await p.context().newCDPSession(p);
    const first = { ...pad, id: 1 };
    const second = { x: pad.x + 20, y: pad.y + 20, id: 2 };
    await touch(cdp, "touchStart", [first]);
    await touch(cdp, "touchStart", [first, second]);
    for (let i = 1; i <= 5; i++) await touch(cdp, "touchMove", [first, { ...second, x: second.x + 10 * i }]);
    await touch(cdp, "touchEnd", [first]);
    expect((await log(p)).filter((e) => e.type === "press")).toHaveLength(1);
    expect(await types(p)).not.toContain("drag");
    await touch(cdp, "touchEnd", []);
    expect(await types(p)).toEqual(["press", "click"]);
  });

  test("a cancelled touch ends with cancel, not a drag end or a click", async ({ page: p }) => {
    await open(p);
    const cdp = await p.context().newCDPSession(p);
    await touch(cdp, "touchStart", [{ ...pad, id: 1 }]);
    for (let i = 1; i <= 4; i++) await touch(cdp, "touchMove", [{ x: pad.x + 8 * i, y: pad.y, id: 1 }]);
    await touch(cdp, "touchCancel", []);
    const kinds = await types(p);
    expect(kinds.at(-1)).toBe("cancel");
    expect(kinds).not.toContain("dragEnd");
    expect(kinds).not.toContain("click");
  });

  test("touch never hovers, while a mouse does", async ({ page: p }) => {
    await open(p);
    const cdp = await p.context().newCDPSession(p);
    await touch(cdp, "touchStart", [{ ...pad, id: 1 }]);
    await touch(cdp, "touchMove", [{ x: pad.x + 20, y: pad.y, id: 1 }]);
    await touch(cdp, "touchEnd", []);
    expect(await types(p)).not.toContain("hover");
    await p.mouse.move(pad.x, pad.y);
    expect((await log(p)).filter((e) => e.type === "hover").map((e) => e.pointerType)).toContain("mouse");
  });
});

test.describe("wheel (S R27)", () => {
  const wheelOverGizmo = async (p: Page) => {
    const r = await p.evaluate<{ x: number; y: number; width: number; height: number }>("T.gizmoRect()");
    const before = await p.evaluate<number>("T.distance()");
    await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
    await p.mouse.wheel(0, 200);
    await p.waitForTimeout(100);
    return { before, after: await p.evaluate<number>("T.distance()") };
  };

  // 2.3.0's element swallowed it (reproduced by I2); the class now forwards it with `forwardWheel` (K5).
  test("the gizmo hands a wheel over it to the host's controls", async ({ page: p }) => {
    await open(p, "?gizmo=1");
    const { before, after } = await wheelOverGizmo(p);
    expect(after).toBeGreaterThan(before);
    expect(await p.evaluate("scrollY")).toBe(0);
  });
});
