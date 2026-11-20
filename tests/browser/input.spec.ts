/**
 * Real input: Chromium's own mouse, wheel and touch pipeline (Playwright mouse and CDP
 * Input.dispatchTouchEvent), never synthetic DOM events. A host OrbitControls owns the canvas.
 * Titles starting with a task id are expected failures against 2.3.0 that the task flips.
 */
import type { CDPSession, Page } from "@playwright/test";
import { expect, test, type Harness } from "./fixtures";

type Rect = { x: number; y: number; width: number; height: number };
type Pose = { position: number[]; quaternion: number[]; distance: number };
type Events = { start: number; change: number; end: number };

/** `from` places the camera first; the default (3, 2, 4) puts a gap between 2.3.0's targets under the centre. */
const setup = async (open: (p?: Record<string, string>) => Promise<Harness>, from?: number[]) => {
  const h = await open({ type: "cube" });
  await h.P(`gate(${from ? JSON.stringify(from) : ""})`);
  const rect = await h.P<Rect>("rect()");
  const centre = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  return { ...h, rect, centre, pose: () => h.P<Pose>("pose()"), events: () => h.P<Events>("events()") };
};

const turned = (a: Pose, b: Pose) => a.quaternion.some((q, i) => Math.abs(q - b.quaternion[i]) > 1e-4);

/** One CDP touch frame; `points` are the fingers down after this event. */
const touch = (cdp: CDPSession, type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel", points: { x: number; y: number; id: number }[]) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

const settle = (page: Page) => page.waitForTimeout(100);

test.describe("mouse", () => {
  test("a drag on the gizmo orbits the camera and balances start and end", async ({ open }) => {
    const { page, centre, pose, events } = await setup(open);
    const before = await pose();
    await page.mouse.move(centre.x, centre.y);
    await page.mouse.down();
    await page.mouse.move(centre.x + 40, centre.y + 10, { steps: 8 });
    await page.mouse.up();
    await settle(page);
    expect(turned(before, await pose())).toBe(true);
    expect(await events()).toMatchObject({ start: 1, end: 1 });
  });

  test("a click on the front face turns the view to it", async ({ open }) => {
    const { page, centre, pose, events } = await setup(open, [1, 0.5, 5]);
    await page.mouse.click(centre.x, centre.y);
    await expect.poll(async () => (await events()).end, { timeout: 5_000 }).toBe(1);
    const { position } = await pose();
    expect(position[0]).toBeCloseTo(0, 3);
    expect(position[1]).toBeCloseTo(0, 3);
    expect(position[2]).toBeGreaterThan(0);
  });

  test("I2 a right-button drag does nothing", async ({ open }) => {
    const { page, centre, pose, events } = await setup(open);
    const before = await pose();
    await page.mouse.move(centre.x, centre.y);
    await page.mouse.down({ button: "right" });
    await page.mouse.move(centre.x + 40, centre.y, { steps: 8 });
    await page.mouse.up({ button: "right" });
    await settle(page);
    expect({ turned: turned(before, await pose()), events: await events() }).toEqual({ turned: false, events: { start: 0, change: 0, end: 0 } });
  });
});

test.describe("wheel (S R27 reproduction)", () => {
  test("a wheel over the canvas zooms through the host's controls", async ({ open }) => {
    const { page, rect, pose } = await setup(open);
    const before = (await pose()).distance;
    await page.mouse.move(rect.x - 200, rect.y + 300);
    await page.mouse.wheel(0, 200);
    await settle(page);
    expect((await pose()).distance).toBeGreaterThan(before);
  });

  test("I2 a wheel over the gizmo reaches the host's controls", async ({ open }) => {
    const { page, centre, pose } = await setup(open);
    const before = (await pose()).distance;
    await page.mouse.move(centre.x, centre.y);
    await page.mouse.wheel(0, 200);
    await settle(page);
    expect((await pose()).distance).toBeGreaterThan(before);
  });
});

test.describe("touch", () => {
  test.use({ hasTouch: true });

  test("E1 a one-finger drag orbits the camera and balances start and end", async ({ open }) => {
    const { page, centre, pose, events } = await setup(open);
    const cdp = await page.context().newCDPSession(page);
    const before = await pose();
    await touch(cdp, "touchStart", [{ ...centre, id: 1 }]);
    for (let i = 1; i <= 8; i++) await touch(cdp, "touchMove", [{ x: centre.x + 5 * i, y: centre.y, id: 1 }]);
    await touch(cdp, "touchEnd", []);
    await settle(page);
    expect(turned(before, await pose())).toBe(true);
    expect(await events()).toMatchObject({ start: 1, end: 1 });
  });

  test("I2 a second finger does not turn the view", async ({ open }) => {
    const { page, centre, rect, pose } = await setup(open);
    const cdp = await page.context().newCDPSession(page);
    const first = { ...centre, id: 1 };
    const elsewhere = { x: rect.x - 300, y: rect.y + 300 };
    await touch(cdp, "touchStart", [first]);
    await touch(cdp, "touchStart", [first, { ...elsewhere, id: 2 }]);
    const before = await pose();
    for (let i = 1; i <= 8; i++) await touch(cdp, "touchMove", [first, { x: elsewhere.x + 20 * i, y: elsewhere.y, id: 2 }]);
    await settle(page);
    expect(turned(before, await pose())).toBe(false);
    await touch(cdp, "touchEnd", []);
  });

  test("I2 a cancelled touch ends the gesture", async ({ open }) => {
    const { page, centre, pose, events } = await setup(open);
    const cdp = await page.context().newCDPSession(page);
    await touch(cdp, "touchStart", [{ ...centre, id: 1 }]);
    for (let i = 1; i <= 4; i++) await touch(cdp, "touchMove", [{ x: centre.x + 5 * i, y: centre.y, id: 1 }]);
    await touch(cdp, "touchCancel", []);
    await settle(page);
    const after = await pose();
    // A mouse moving over the page afterwards, with no button down, must not turn the view.
    await page.mouse.move(centre.x - 300, centre.y + 100, { steps: 6 });
    await settle(page);
    const { start, end } = await events();
    expect({ end, turnedLater: turned(after, await pose()) }).toEqual({ end: start, turnedLater: false });
  });
});

test.describe("render on demand (K5, P11)", () => {
  test("a host that renders only on invalidate completes a click's turn and then stops drawing", async ({ open }) => {
    const { page, P } = await open({ type: "cube" });
    await P("demand([1, 0.5, 5])");
    const rect = await P<Rect>("rect()");
    await page.mouse.click(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await expect.poll(async () => (await P<Events>("events()")).end, { timeout: 5_000 }).toBe(1);
    const { position } = await P<Pose>("pose()");
    expect(position[0]).toBeCloseTo(0, 3);
    expect(position[1]).toBeCloseTo(0, 3);
    // `end` fires in the frame whose render() writes the last pose, after the host drew its scene, so the host owes
    // exactly one more frame to show it; then nothing asks for a frame. Reading the count as soon as `end` is seen
    // raced that trailing frame (6 vs 5 on SwiftShader, K7).
    const endFrame = await P<number>("demandEndFrame()");
    expect(endFrame).toBeGreaterThan(2);
    await settle(page);
    expect(await P<number>("demandFrames()")).toBe(endFrame + 1);
    await settle(page);
    expect(await P<number>("demandFrames()")).toBe(endFrame + 1);
  });
});
