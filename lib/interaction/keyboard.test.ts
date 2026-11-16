// I3: keyboard operation per the K2 guide. Element role, name and tab stop; the key map through `lookFrom` and `turn`
// (cause `key`) on six ups; the neighbour rule at all 26 views; roll keys only when `canRoll`; reserved chords pass.
import { afterEach, describe, expect, it, vi } from "vitest";
import { Quaternion, Vector3 } from "three";
import type { GizmoOptions, GizmoTargetName } from "../index.js";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { createGizmo } from "../__tests__/test-utils.js";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

const axis = (x: number, y: number, z: number) => new Vector3(x, y, z);
/** The six label ups. */
const UPS: readonly (readonly [string, Vector3])[] = [
  ["+x", axis(1, 0, 0)],
  ["-x", axis(-1, 0, 0)],
  ["+y", axis(0, 1, 0)],
  ["-y", axis(0, -1, 0)],
  ["+z", axis(0, 0, 1)],
  ["-z", axis(0, 0, -1)],
];

const make = (up = axis(0, 1, 0), options: GizmoOptions = {}) => {
  const cameraPosition = new Vector3(1, 2, 3).normalize().multiplyScalar(5);
  return createGizmo({ up, cameraPosition, gizmoOptions: { type: "cube", roll: true, animated: false, ...options } });
};

/** Presses a key on the gizmo's element; returns whether the gizmo consumed it. */
const press = (gizmo: ViewportGizmo, init: KeyboardEventInit) =>
  !gizmo.domElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
const at = (gizmo: ViewportGizmo) => gizmo.atTarget?.target.name ?? null;
const name = (gizmo: ViewportGizmo) => gizmo.domElement.getAttribute("aria-label");
const target = (gizmo: ViewportGizmo, n: GizmoTargetName) => gizmo.targets.find((t) => t.name === n)!;
const ARROWS = { left: "ArrowLeft", right: "ArrowRight", up: "ArrowUp", down: "ArrowDown" } as const;
const DIGITS = ["front", "back", "left", "right", "top", "bottom"] as const;

describe("element (K2 DOM contract)", () => {
  it("is a focusable application named by its view, with a hidden status child first", () => {
    const gizmo = make();
    const element = gizmo.domElement;
    expect(element.getAttribute("role")).toBe("application");
    expect(element.getAttribute("aria-roledescription")).toBe("view cube");
    expect(element.tabIndex).toBe(0);
    expect(element.hasAttribute("aria-disabled")).toBe(false);
    expect(element.firstElementChild?.getAttribute("role")).toBe("status");
    expect(element.firstElementChild?.textContent).toBe("");
    expect(name(gizmo)).toMatch(/^Near /);
    void gizmo.lookFrom("front");
    expect(name(gizmo)).toBe("Front");
    gizmo.set({ type: "sphere" });
    expect(element.getAttribute("aria-roledescription")).toBe("view sphere");
    gizmo.dispose();
    expect(element.querySelector("[role=status]")).toBeNull();
  });

  it("enabled = false leaves the tab order and takes no key; true brings both back", () => {
    const gizmo = make();
    void gizmo.lookFrom("front");
    gizmo.enabled = false;
    expect(gizmo.domElement.tabIndex).toBe(-1);
    expect(gizmo.domElement.getAttribute("aria-disabled")).toBe("true");
    expect(press(gizmo, { key: "2", code: "Digit2" })).toBe(false);
    expect(at(gizmo)).toBe("front");
    gizmo.enabled = true;
    expect(gizmo.domElement.tabIndex).toBe(0);
    expect(gizmo.domElement.hasAttribute("aria-disabled")).toBe(false);
    expect(press(gizmo, { key: "2", code: "Digit2" })).toBe(true);
    expect(at(gizmo)).toBe("back");
  });

  it("a pointer press keeps focus where it is", () => {
    const gizmo = make();
    const e = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    gizmo.domElement.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });

  it("announces a reached key turn once, after clearing; an API turn announces nothing", async () => {
    vi.useFakeTimers();
    const gizmo = make();
    const status = gizmo.domElement.querySelector("[role=status]")!;
    void gizmo.lookFrom("front");
    vi.runAllTimers();
    expect(status.textContent).toBe("");
    press(gizmo, { key: "ArrowRight", shiftKey: true });
    expect(status.textContent).toBe("");
    vi.runAllTimers();
    expect(status.textContent).toBe("Front, rolled 90° clockwise");
    void gizmo.lookFrom("top");
    vi.runAllTimers();
    expect(status.textContent).toBe("Front, rolled 90° clockwise");
  });
});

describe("key map (K2)", () => {
  for (const [label, up] of UPS) {
    it(`${label} up: digits name the faces, Home goes home upright, each with cause key`, async () => {
      const gizmo = make(up);
      const causes: string[] = [];
      gizmo.addEventListener("end", (e) => causes.push(e.cause));
      for (const [i, face] of DIGITS.entries()) {
        expect(press(gizmo, { key: String(i + 1), code: `Digit${i + 1}` })).toBe(true);
        expect(at(gizmo)).toBe(face);
        void gizmo.lookFrom("home");
        expect(press(gizmo, { key: String(i + 1), code: `Numpad${i + 1}` })).toBe(true);
        expect(at(gizmo)).toBe(face);
      }
      // AZERTY: the top row gives "&" without Shift; `code` still names the face.
      expect(press(gizmo, { key: "&", code: "Digit1" })).toBe(true);
      expect(at(gizmo)).toBe("front");
      expect(press(gizmo, { key: "Home", code: "Home" })).toBe(true);
      expect(at(gizmo)).toBe("top-front-right");
      expect(name(gizmo)).toBe("Top Front Right");
      expect(causes.filter((c) => c !== "key")).toEqual(["api", "api", "api", "api", "api", "api"]);
    });

    it(`${label} up: Shift+Right and Shift+Left roll a quarter turn, named on the target`, () => {
      const gizmo = make(up);
      void gizmo.lookFrom("front", { up: "reset" });
      expect(name(gizmo)).toBe("Front");
      press(gizmo, { key: "ArrowRight", shiftKey: true });
      expect(name(gizmo)).toBe("Front, rolled 90° clockwise");
      press(gizmo, { key: "ArrowRight", shiftKey: true });
      expect(name(gizmo)).toBe("Front, rolled 180°");
      press(gizmo, { key: "ArrowRight", shiftKey: true });
      expect(name(gizmo)).toBe("Front, rolled 90° counter-clockwise");
      press(gizmo, { key: "ArrowLeft", shiftKey: true });
      press(gizmo, { key: "ArrowLeft", shiftKey: true });
      press(gizmo, { key: "ArrowLeft", shiftKey: true });
      expect(name(gizmo)).toBe("Front");
      expect(at(gizmo)).toBe("front");
    });

    it(`${label} up: every target named upright after up: 'reset', on every type`, () => {
      for (const type of ["cube", "sphere", "rounded-cube"] as const) {
        const gizmo = make(up, { type });
        for (const t of gizmo.targets) {
          void gizmo.lookFrom(t.name, { up: "reset" });
          expect({ type, name: name(gizmo) }).toEqual({ type, name: t.label });
        }
        gizmo.dispose();
      }
    });

    it(`${label} up: arrows step to a neighbour on that side from all 26 views, and reach all 26 from Home`, () => {
      const gizmo = make(up);
      const q = new Quaternion();
      for (const start of gizmo.targets) {
        for (const [side, key] of Object.entries(ARROWS)) {
          void gizmo.lookFrom(start.name, { up: "reset" });
          q.copy(gizmo.camera.quaternion);
          expect(press(gizmo, { key })).toBe(true);
          const end = gizmo.atTarget?.target;
          const where = `${start.name} ${side}`;
          expect({ where, moved: end !== undefined && end.name !== start.name }).toEqual({ where, moved: true });
          // The new view lies on that side of the old one on screen, and within 90°.
          const screen = end!.direction.clone().sub(start.direction).applyQuaternion(q.clone().invert());
          const along = side === "left" || side === "right" ? screen.x : screen.y;
          const sign = side === "left" || side === "down" ? -1 : 1;
          expect({ where, onSide: sign * along > 1e-6 }).toEqual({ where, onSide: true });
          expect(end!.direction.dot(start.direction)).toBeGreaterThan(1e-6);
        }
      }
      // WCAG 2.1.1: every view is reachable by arrows alone, landing as a key press lands (not reset).
      const seen = new Set<GizmoTargetName>();
      const queue: Quaternion[] = [];
      void gizmo.lookFrom("home");
      seen.add("top-front-right");
      queue.push(gizmo.camera.quaternion.clone());
      while (queue.length) {
        const from = queue.shift()!;
        for (const key of Object.values(ARROWS)) {
          gizmo.camera.quaternion.copy(from);
          gizmo.camera.position.set(0, 0, 5).applyQuaternion(from);
          gizmo.camera.up.set(0, 1, 0).applyQuaternion(from);
          gizmo.update();
          press(gizmo, { key });
          const reached = at(gizmo);
          if (reached && !seen.has(reached)) {
            seen.add(reached);
            queue.push(gizmo.camera.quaternion.clone());
          }
        }
      }
      expect(seen.size).toBe(26);
    });
  }

  it("arrows at a face step to the edge on that side, twice to the face (Y up, Front upright)", () => {
    const gizmo = make();
    const expected = { up: "top-front", right: "front-right", down: "bottom-front", left: "front-left" } as const;
    const faces = { up: "top", right: "right", down: "bottom", left: "left" } as const;
    for (const [side, key] of Object.entries(ARROWS) as [keyof typeof ARROWS, string][]) {
      void gizmo.lookFrom("front", { up: "reset" });
      press(gizmo, { key });
      expect(at(gizmo)).toBe(expected[side]);
      press(gizmo, { key });
      expect(at(gizmo)).toBe(faces[side]);
    }
    // Up from an upright corner is its top face.
    void gizmo.lookFrom("home");
    press(gizmo, { key: "ArrowUp" });
    expect(at(gizmo)).toBe("top");
  });

  it("a rolled view steps the way it looks", () => {
    const gizmo = make();
    void gizmo.lookFrom("front", { up: "reset" });
    press(gizmo, { key: "ArrowRight", shiftKey: true });
    const screenUp = axis(0, 1, 0).applyQuaternion(gizmo.camera.quaternion);
    const upward = gizmo.targets.find((t) => t.kind === "face" && t.direction.distanceTo(screenUp) < 1e-6)!;
    press(gizmo, { key: "ArrowUp" });
    press(gizmo, { key: "ArrowUp" });
    expect(at(gizmo)).toBe(upward.name);
    expect(upward.name).not.toBe("top");
  });

  it("quick presses add up: a key during a flight steps from where the flight is going", () => {
    const gizmo = make(undefined, { animated: true });
    void gizmo.lookFrom("front", { animated: false, up: "reset" });
    press(gizmo, { key: "ArrowRight" });
    expect(gizmo.heading?.target?.name).toBe("front-right");
    press(gizmo, { key: "ArrowRight" });
    expect(gizmo.heading?.target?.name).toBe("right");
  });

  it("roll keys are not consumed while canRoll is false", () => {
    const gizmo = make(undefined, { roll: false });
    void gizmo.lookFrom("front");
    const ends = vi.fn();
    gizmo.addEventListener("end", ends);
    expect(press(gizmo, { key: "ArrowRight", shiftKey: true })).toBe(false);
    expect(press(gizmo, { key: "ArrowLeft", shiftKey: true })).toBe(false);
    expect(ends).not.toHaveBeenCalled();
    expect(press(gizmo, { key: "ArrowRight" })).toBe(true);
    expect(at(gizmo)).toBe("front-right");
  });

  it("leaves browser and OS chords, letters, Escape, Enter, Space, Tab and IME input to the page", () => {
    const gizmo = make();
    void gizmo.lookFrom("front");
    const ends = vi.fn();
    gizmo.addEventListener("end", ends);
    for (const init of [
      { key: "1", code: "Digit1", ctrlKey: true },
      { key: "1", code: "Digit1", metaKey: true },
      { key: "1", code: "Digit1", altKey: true },
      { key: "ArrowLeft", altKey: true },
      { key: "ArrowRight", ctrlKey: true },
      { key: "ArrowUp", shiftKey: true },
      { key: "ArrowDown", shiftKey: true },
      { key: "Home", shiftKey: true },
      { key: "1", code: "Digit1", isComposing: true },
      { key: "7", code: "Digit7" },
      { key: "0", code: "Digit0" },
      { key: "f", code: "KeyF" },
      { key: "Escape", code: "Escape" },
      { key: "Enter", code: "Enter" },
      { key: " ", code: "Space" },
      { key: "Tab", code: "Tab" },
    ] satisfies KeyboardEventInit[]) {
      expect({ init, consumed: press(gizmo, init) }).toEqual({ init, consumed: false });
    }
    expect(ends).not.toHaveBeenCalled();
  });

  it("a consumed key still propagates to the host", () => {
    const gizmo = make();
    const heard = vi.fn();
    document.body.addEventListener("keydown", heard);
    press(gizmo, { key: "1", code: "Digit1" });
    expect(heard).toHaveBeenCalledTimes(1);
    document.body.removeEventListener("keydown", heard);
  });

  it("controlled mode: keys go out as the reported pose with cause key; the host writes the camera", () => {
    const gizmo = make(undefined, { controlled: true });
    const camera = gizmo.camera;
    const causes = new Set<string>();
    gizmo.addEventListener("change", ({ cause, pose }) => {
      causes.add(cause);
      // The host: the gizmo writes nothing in controlled mode (U4).
      camera.up.copy(pose.up);
      camera.position.copy(pose.direction).multiplyScalar(5);
      camera.lookAt(0, 0, 0);
    });
    press(gizmo, { key: "1", code: "Digit1" });
    press(gizmo, { key: "ArrowRight" });
    gizmo.update();
    expect([...causes]).toEqual(["key"]);
    expect(at(gizmo)).toBe("front-right");
    expect(name(gizmo)).toBe(target(gizmo, "front-right").label);
  });

  it("off a target the name reads the nearest target", () => {
    const gizmo = make();
    void gizmo.lookFrom({ x: 0.1, y: 0.05, z: 1 });
    expect(gizmo.atTarget).toBeNull();
    expect(name(gizmo)).toBe(`Near ${target(gizmo, "front").label}`);
  });
});
