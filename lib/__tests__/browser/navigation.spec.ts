/**
 * I4 browser cases: the built-in navigation buttons with Playwright's real mouse and keyboard on a real WebGLRenderer
 * and WebGPURenderer drawing every frame. Served from source by the G2 browser gate's Vite server at
 * `/lib/__tests__/browser/navigation.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type State = {
  at: string | null;
  sides: Record<"up" | "right" | "down" | "left", string> | null;
  shown: string[];
  right: number[];
  up: number[];
  focused: string | undefined;
  last: { cause: string; status: string } | null;
};
type Rect = { x: number; y: number; width: number; height: number };

const ALL = ["roll-clockwise", "up", "roll-counterclockwise", "left", "right", "down", "home"];

const open = async (page: Page, query: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/navigation.html?${query}`);
  await page.waitForFunction("window.READY === true");
  return errors;
};
const state = (page: Page) => page.evaluate<State>("T.settled()");
const rect = (page: Page, name = "") => page.evaluate<Rect>(`T.rect('${name}')`);
const centre = (r: Rect) => [r.x + r.width / 2, r.y + r.height / 2] as const;
const close = (a: number[], b: number[]) => a.every((v, i) => Math.abs(v - b[i]) < 1e-3);
const neg = (v: number[]) => v.map((c) => -c);

for (const backend of ["webgl", "webgpu"] as const) {
  test(`${backend}: buttons appear after a cube click, hide after a free drag, return after the next click`, async ({ page }) => {
    const errors = await open(page, `backend=${backend}`);
    const g = await rect(page);
    const [cx, cy] = centre(g);
    // Off a target, hovering the gizmo reveals Home only.
    await page.mouse.move(cx + g.width * 0.45, cy - g.height * 0.45);
    expect((await state(page)).shown).toEqual(["home"]);

    await page.mouse.click(cx, cy);
    const clicked = await state(page);
    expect(clicked.at).not.toBeNull();
    expect(clicked.shown).toEqual(expect.arrayContaining(["roll-clockwise", "roll-counterclockwise", "home"]));

    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 17, cy + 9, { steps: 4 });
    await page.mouse.up();
    const dragged = await state(page);
    expect({ at: dragged.at, shown: dragged.shown }).toEqual({ at: null, shown: ["home"] });

    await page.mouse.click(cx, cy);
    expect((await state(page)).shown).toEqual(expect.arrayContaining(["roll-clockwise", "roll-counterclockwise", "home"]));

    // Leaving the gizmo hides them (reveal on hover).
    await page.mouse.move(5, 590);
    expect((await state(page)).shown).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${backend}: each button lands on the expected target and up, with at least 24 px to hit`, async ({ page }) => {
    const errors = await open(page, `backend=${backend}`);
    const press = async (name: string) => {
      const r = await rect(page, name);
      expect({ name, width: r.width >= 24, height: r.height >= 24 }).toEqual({ name, width: true, height: true });
      const [x, y] = centre(r);
      await page.mouse.click(x, y);
      return state(page);
    };

    for (const side of ["up", "right", "down", "left"] as const) {
      await page.evaluate("T.look('front')");
      await page.mouse.move(...centre(await rect(page)));
      const before = await state(page);
      expect(before.shown).toEqual(ALL);
      const after = await press(side);
      // Upright to the face on that side.
      expect({ side, at: after.at, last: after.last }).toEqual({ side, at: before.sides![side], last: { cause: "navigation", status: "reached" } });
      const upright = after.at === "top" || after.at === "bottom" ? null : [0, 1, 0];
      if (upright) expect({ side, upright: close(after.up, upright) }).toEqual({ side, upright: true });
    }

    for (const view of ["front", "top-front", "bottom-back-left"]) {
      const before = await page.evaluate<State>(`T.look('${view}')`);
      await page.mouse.move(...centre(await rect(page)));
      // The scene turns clockwise: what was on the screen's left comes to its top.
      const cw = await press("roll-clockwise");
      expect({ view, at: cw.at, up: close(cw.up, neg(before.right)) }).toEqual({ view, at: view, up: true });
      const ccw = await press("roll-counterclockwise");
      expect({ view, at: ccw.at, up: close(ccw.up, before.up) }).toEqual({ view, at: view, up: true });
    }

    await page.evaluate("T.look('back')");
    await page.mouse.move(...centre(await rect(page)));
    const home = await press("home");
    expect({ at: home.at, last: home.last }).toEqual({ at: "top-front-right", last: { cause: "navigation", status: "reached" } });
    // Upright: the screen up is +Y projected onto the view plane.
    const upright = await page.evaluate<boolean>(`(() => {
      const d = T.target('top-front-right').direction, s = T.state().up;
      const p = [0 - d.x * d.y, 1 - d.y * d.y, 0 - d.z * d.y], n = Math.hypot(...p);
      return p.every((c, i) => Math.abs(c / n - s[i]) < 1e-3);
    })()`);
    expect(upright).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`${backend}: keyboard reaches the buttons; colours follow a cube restyle and the host's properties`, async ({ page }) => {
    const errors = await open(page, `backend=${backend}`);
    await page.evaluate("T.look('front')");
    await page.focus("#before");
    await page.keyboard.press("Tab");
    // Focus within reveals them; Tab walks the grid row by row.
    expect(await state(page)).toMatchObject({ focused: "gizmo", shown: ALL });
    const order: string[] = [];
    for (const _ of ALL) {
      await page.keyboard.press("Tab");
      order.push((await state(page)).focused!);
    }
    expect(order).toEqual(ALL);
    // Home is focused: Enter presses it.
    await page.keyboard.press("Enter");
    expect(await state(page)).toMatchObject({ at: "top-front-right", last: { cause: "navigation", status: "reached" } });

    const before = await page.evaluate<{ ring: string }>("T.paint('home')");
    await page.evaluate("T.restyle({ front: { color: 0xff0000, labelColor: 0x00ff00 }, edges: { color: 0x0000ff, opacity: 1 } })");
    const after = await page.evaluate<{ background: string; ring: string; color: string }>("T.paint('home')");
    expect(after).toEqual({ background: "rgb(0, 0, 255)", ring: expect.stringContaining("rgb(255, 0, 0)"), color: "rgb(0, 255, 0)" });
    expect(after.ring).not.toBe(before.ring);
    await page.evaluate("document.getElementById('wrap').style.setProperty('--viewport-gizmo-button-background', 'rgb(1, 2, 3)')");
    expect((await page.evaluate<{ background: string }>("T.paint('home')")).background).toBe("rgb(1, 2, 3)");
    expect(errors).toEqual([]);
  });
}

for (const [label, query] of [
  ["cube", "type=cube"],
  ["Tau's 96 px cube with the triad", "type=cube&size=96&triad=true"],
  ["rounded-cube", "type=rounded-cube"],
] as const) {
  test(`webgl ${label}: no button covers the cube at any of the 26 views and any roll`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await open(page, `backend=webgl&reveal=always&${query}`);
    const { hits, views } = await page.evaluate<{ hits: string[]; views: number }>("T.overlaps()");
    expect(views).toBe(26);
    expect(hits).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test.describe(() => {
  test.use({ deviceScaleFactor: 3 });
  test("webgpu: no button covers the cube at any of the 26 views and any roll; screenshot", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await open(page, "backend=webgpu&reveal=always&type=cube&size=96&triad=true");
    expect((await page.evaluate<{ hits: string[] }>("T.overlaps()")).hits).toEqual([]);
    // The check is not vacuous: a grid pulled in to 20 px covers the cube.
    await page.evaluate("document.querySelector('#wrap > div').style.setProperty('--viewport-gizmo-anchor', '20px')");
    expect((await page.evaluate<{ hits: string[] }>("T.overlaps()")).hits.length).toBeGreaterThan(0);
    await page.evaluate("T.restyle({ speed: 31 })");
    await page.evaluate("T.look('front')");
    const g = await rect(page);
    await page.screenshot({ path: "test-results/browser/navigation-front.png", clip: { x: g.x - 40, y: g.y - 40, width: g.width + 80, height: g.height + 80 } });
    expect(errors).toEqual([]);
  });
});
