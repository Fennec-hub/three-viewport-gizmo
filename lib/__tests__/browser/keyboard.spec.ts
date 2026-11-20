/**
 * I3 browser cases: keyboard operation per the K2 guide, with Playwright's real keyboard on a real WebGLRenderer and
 * WebGPURenderer drawing every frame, on all six up axes. Served from source by the G2 browser gate's Vite server at
 * `/lib/__tests__/browser/keyboard.html`.
 */
import { expect, test, type Page } from "@playwright/test";

type State = {
  at: string | null;
  name: string | null;
  role: string | null;
  tabIndex: number;
  focused: string | undefined;
  status: string | null;
  ends: number;
  last: { cause: string; status: string } | null;
};

const open = async (page: Page, query: string) => {
  const errors: string[] = [];
  page.on("console", (message) => (message.type() === "error" || message.type() === "warning") && !message.text().includes("GL Driver Message") && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/lib/__tests__/browser/keyboard.html?${query}`);
  await page.waitForFunction("window.READY === true");
  return errors;
};
const key = async (page: Page, k: string) => {
  await page.keyboard.press(k);
  return page.evaluate<State>("T.settled()");
};

const UPS = ["+x", "-x", "+y", "-y", "+z", "-z"] as const;
const DIGITS = ["front", "back", "left", "right", "top", "bottom"];
const ARROWS = { ArrowLeft: [-1, "x"], ArrowRight: [1, "x"], ArrowUp: [1, "y"], ArrowDown: [-1, "y"] } as const;

for (const backend of ["webgl", "webgpu"] as const) {
  for (const up of UPS) {
    test(`${backend} ${up} up: every key in the map reaches its view, named by view and roll`, async ({ page }) => {
      test.setTimeout(180_000);
      const errors = await open(page, `backend=${backend}&up=${encodeURIComponent(up)}`);
      const targets = await page.evaluate<{ name: string; label: string }[]>("T.targets");
      const label = (n: string) => targets.find((t) => t.name === n)!.label;

      // Tab reaches the element; the canvas is not a tab stop.
      await page.focus("#before");
      await page.keyboard.press("Tab");
      expect(await page.evaluate<State>("T.state()")).toMatchObject({ focused: "gizmo", role: "application", tabIndex: 0 });

      for (const [i, face] of DIGITS.entries()) {
        // Playwright's Numpad keys send NumLock-off keys (Numpad2 is ArrowDown), so the keypad digits are unit cases.
        const k = `Digit${i + 1}`;
        await page.evaluate("T.look('top-front-right')");
        const s = await key(page, k);
        expect({ k, at: s.at, name: s.name, last: s.last }).toEqual({
          k,
          at: face,
          name: label(face),
          last: { cause: "key", status: "reached" },
        });
      }
      await page.evaluate("T.look('front')");
      expect(await key(page, "Home")).toMatchObject({ at: "top-front-right", name: label("top-front-right") });

      // Shift with Right or Left rolls on the target; the name reads the roll; the status child announces it.
      await page.evaluate("T.look('front')");
      const rolls = ["rolled 90° clockwise", "rolled 180°", "rolled 90° counter-clockwise"];
      for (const r of rolls) expect(await key(page, "Shift+ArrowRight")).toMatchObject({ at: "front", name: `${label("front")}, ${r}` });
      expect(await key(page, "Shift+ArrowRight")).toMatchObject({ at: "front", name: label("front") });
      expect(await key(page, "Shift+ArrowLeft")).toMatchObject({ at: "front", name: `${label("front")}, ${rolls[2]}` });
      await expect.poll(async () => (await page.evaluate<State>("T.state()")).status).toBe(`${label("front")}, ${rolls[2]}`);

      // Arrows from all 26 views: a different target on that side of the screen, within 90°.
      for (const { name } of targets) {
        for (const [k, [sign, along]] of Object.entries(ARROWS)) {
          await page.evaluate(`T.look('${name}')`);
          await page.evaluate("T.mark()");
          const s = await key(page, k);
          const where = `${name} ${k}`;
          expect({ where, moved: s.at !== null && s.at !== name, cause: s.last?.cause }).toEqual({ where, moved: true, cause: "key" });
          const o = await page.evaluate<{ x: number; y: number; dot: number }>(`T.offset('${name}', '${s.at}')`);
          expect({ where, onSide: sign * o[along] > 1e-6, near: o.dot > 1e-6 }).toEqual({ where, onSide: true, near: true });
          expect(s.name).toBe(label(s.at!));
        }
      }
      expect(errors).toEqual([]);
    });
  }

  test(`${backend}: enabled = false leaves the tab order; a pointer press takes no focus`, async ({ page }) => {
    const errors = await open(page, `backend=${backend}`);
    await page.focus("#before");
    await page.keyboard.press("Tab");
    expect((await page.evaluate<State>("T.state()")).focused).toBe("gizmo");

    await page.evaluate("T.disable(true)");
    expect((await page.evaluate<State>("T.state()")).tabIndex).toBe(-1);
    await page.focus("#before");
    await page.keyboard.press("Tab");
    expect((await page.evaluate<State>("T.state()")).focused).toBe("after");
    // Focused while disabled: the keys do nothing and keep their page default.
    await page.evaluate("T.focus()");
    const before = await page.evaluate<State>("T.state()");
    expect(await key(page, "Digit2")).toMatchObject({ ends: before.ends, at: before.at });

    await page.evaluate("T.disable(false)");
    await page.focus("#before");
    await page.keyboard.press("Tab");
    expect((await page.evaluate<State>("T.state()")).focused).toBe("gizmo");

    // A click on the cube turns the view and leaves focus where it was.
    await page.focus("#before");
    const r = await page.evaluate<{ x: number; y: number; width: number; height: number }>("T.rect()");
    await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
    const clicked = await page.evaluate<State>("T.settled()");
    expect(clicked.last?.cause).toBe("click");
    expect(clicked.focused).toBe("before");
    // Nothing is announced for a pointer turn.
    expect(clicked.status).toBe("");
    expect(errors).toEqual([]);
  });

  test(`${backend}: with roll off, Shift+Right and Shift+Left are not bound`, async ({ page }) => {
    const errors = await open(page, `backend=${backend}&roll=false`);
    await page.evaluate("T.look('front')");
    const before = await page.evaluate<State>("T.state()");
    for (const k of ["Shift+ArrowRight", "Shift+ArrowLeft"]) {
      expect(await key(page, k)).toMatchObject({ ends: before.ends, at: "front", name: before.name });
    }
    expect(await key(page, "ArrowRight")).toMatchObject({ at: "front-right" });
    expect(errors).toEqual([]);
  });

  test(`${backend}: the sphere names itself a view sphere`, async ({ page }) => {
    await open(page, `backend=${backend}&type=sphere`);
    const role = await page.evaluate("document.querySelector('[role=application]').getAttribute('aria-roledescription')");
    expect(role).toBe("view sphere");
    await page.evaluate("T.focus()");
    // The sphere's targets carry its drawn labels (axis letters by default), so the name reads them.
    const top = await page.evaluate<string>("T.targets.find((t) => t.name === 'top').label");
    expect(await key(page, "Digit5")).toMatchObject({ at: "top", name: top });
  });
}
