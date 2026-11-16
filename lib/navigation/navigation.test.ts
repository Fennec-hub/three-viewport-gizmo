// I4: the built-in navigation buttons (OD2). Off by default adds no node; each switch hides only its button; `canRoll`
// false hides the rolls; reveal on hover and focus within; every press is a `navigation` turn; colours from the cube.
import { afterEach, describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import type { GizmoCause, GizmoNavigationOptions, GizmoOptions } from "../index.js";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { createGizmo } from "../__tests__/test-utils.js";
import { createInternalCamera } from "../render/internalCamera";
import { navigationAnchor } from "./navigation";

afterEach(() => document.body.replaceChildren());

const ALL = ["roll-clockwise", "up", "roll-counterclockwise", "left", "right", "down", "home"];
const SIDES = ["up", "left", "right", "down"];
const ROLLS = ["roll-clockwise", "roll-counterclockwise"];

/** A cube gizmo resting on Front, upright. */
const make = (navigation: GizmoNavigationOptions = { enabled: true, reveal: "always" }, options: GizmoOptions = {}) =>
  createGizmo({
    cameraPosition: new Vector3(0, 0, 5),
    gizmoOptions: { type: "cube", animated: false, navigation, ...options },
  });

const buttons = (gizmo: ViewportGizmo) => [...gizmo.domElement.querySelectorAll<HTMLButtonElement>("[data-navigation]")];
const button = (gizmo: ViewportGizmo, name: string) =>
  gizmo.domElement.querySelector<HTMLButtonElement>(`[data-navigation="${name}"]`)!;
const shown = (gizmo: ViewportGizmo) => buttons(gizmo).filter((b) => !b.hidden).map((b) => b.dataset.navigation);
const at = (gizmo: ViewportGizmo) => gizmo.atTarget?.target.name ?? null;
// jsdom has no PointerEvent: a MouseEvent with the pointer fields defined on it.
const pointer = (type: string, pointerType = "mouse") => {
  const event = new MouseEvent(type, { bubbles: type !== "pointerenter" && type !== "pointerleave", button: 0 });
  Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: pointerType }, isPrimary: { value: true } });
  return event as PointerEvent;
};

describe("navigation option", () => {
  it("adds no node when off, the default", () => {
    const plain = createGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    expect(plain.options.navigation.enabled).toBe(false);
    expect(plain.domElement.querySelector("button")).toBeNull();
    expect(plain.domElement.style.getPropertyValue("--viewport-gizmo-anchor")).toBe("");
    plain.dispose();
  });

  it("adds seven real buttons in grid order with accessible names, and removes them when switched off", () => {
    const gizmo = make();
    expect(buttons(gizmo).map((b) => [b.dataset.navigation, b.type, b.getAttribute("aria-label")])).toEqual([
      ["roll-clockwise", "button", "Roll view clockwise"],
      ["up", "button", "Turn to Top"],
      ["roll-counterclockwise", "button", "Roll view counter-clockwise"],
      ["left", "button", "Turn to Left"],
      ["right", "button", "Turn to Right"],
      ["down", "button", "Turn to Bottom"],
      ["home", "button", "Home view"],
    ]);
    expect(shown(gizmo)).toEqual(ALL);
    expect(gizmo.domElement.style.getPropertyValue("--viewport-gizmo-anchor")).toMatch(/^\d+(\.\d+)?px$/);
    gizmo.set({ navigation: { enabled: false } });
    expect(gizmo.domElement.querySelector("button")).toBeNull();
    expect(gizmo.domElement.style.getPropertyValue("--viewport-gizmo-anchor")).toBe("");
    gizmo.set({ navigation: { enabled: true } });
    expect(buttons(gizmo)).toHaveLength(7);
    gizmo.dispose();
    expect(buttons(gizmo)).toHaveLength(0);
  });

  it.each([
    ["sides", SIDES],
    ["roll", ROLLS],
    ["home", ["home"]],
  ] as const)("`%s: false` hides only its buttons", (key, hidden) => {
    const gizmo = make({ enabled: true, reveal: "always", [key]: false });
    expect(shown(gizmo)).toEqual(ALL.filter((name) => !hidden.includes(name)));
    gizmo.set({ navigation: { [key]: true } });
    expect(shown(gizmo)).toEqual(ALL);
  });

  it("hides the rolls while `canRoll` is false", () => {
    const gizmo = make(undefined, { roll: false });
    expect(gizmo.canRoll).toBe(false);
    expect(shown(gizmo)).toEqual(ALL.filter((name) => !ROLLS.includes(name)));
  });

  it("shows side triangles at a face only, rolls at any target, Home at every view", async () => {
    const gizmo = make();
    await gizmo.lookFrom("top-front");
    expect(shown(gizmo)).toEqual([...ROLLS, "home"]);
    await gizmo.lookFrom(new Vector3(1, 2, 3));
    expect(at(gizmo)).toBeNull();
    expect(shown(gizmo)).toEqual(["home"]);
    gizmo.enabled = false;
    expect(shown(gizmo)).toEqual([]);
  });

  it("reveals on hover and on focus within, never on a touch hover", () => {
    const gizmo = make({ enabled: true });
    const element = gizmo.domElement;
    expect(shown(gizmo)).toEqual([]);
    element.dispatchEvent(pointer("pointerenter", "touch"));
    expect(shown(gizmo)).toEqual([]);
    element.dispatchEvent(pointer("pointerenter"));
    expect(shown(gizmo)).toEqual(ALL);
    element.dispatchEvent(pointer("pointerleave"));
    expect(shown(gizmo)).toEqual([]);
    element.focus();
    expect(shown(gizmo)).toEqual(ALL);
    button(gizmo, "home").focus();
    expect(shown(gizmo)).toEqual(ALL);
    element.blur();
    button(gizmo, "home").blur();
    expect(shown(gizmo)).toEqual([]);
  });

  it("turns with cause `navigation` and lands on the expected target", async () => {
    const gizmo = make();
    const causes: GizmoCause[] = [];
    gizmo.addEventListener("end", (e) => causes.push(e.cause));

    button(gizmo, "right").click();
    expect(at(gizmo)).toBe("right");
    expect(button(gizmo, "left").getAttribute("aria-label")).toBe("Turn to Front");

    button(gizmo, "roll-clockwise").click();
    expect(at(gizmo)).toBe("right");
    // The scene turned clockwise: what was on the left of the screen is now on top.
    expect(button(gizmo, "up").getAttribute("aria-label")).toBe("Turn to Front");
    button(gizmo, "roll-counterclockwise").click();
    expect(button(gizmo, "up").getAttribute("aria-label")).toBe("Turn to Top");

    button(gizmo, "home").click();
    expect(at(gizmo)).toBe("top-front-right");
    expect(causes).toEqual(["navigation", "navigation", "navigation", "navigation"]);
  });

  it("does not start a cube press from a button press", () => {
    const gizmo = make();
    let presses = 0;
    gizmo.addEventListener("press", () => presses++);
    button(gizmo, "home").dispatchEvent(pointer("pointerdown"));
    expect(presses).toBe(0);
  });

  it("paints with the cube's colours behind the host's custom properties, and follows a restyle", () => {
    const gizmo = make(undefined, { front: { color: 0x112233, labelColor: 0x445566 }, edges: { color: 0x778899, opacity: 1 } });
    const style = button(gizmo, "home").getAttribute("style")! + button(gizmo, "home").innerHTML;
    expect(style).toContain("var(--viewport-gizmo-button-color, #445566)");
    expect(style).toContain("var(--viewport-gizmo-button-background, #778899)");
    expect(style).toContain("var(--viewport-gizmo-button-ring, #112233)");
    gizmo.set({ front: { color: 0xaabbcc } });
    expect(button(gizmo, "home").innerHTML).toContain("var(--viewport-gizmo-button-ring, #aabbcc)");
    button(gizmo, "home").dispatchEvent(pointer("pointerenter"));
    expect(button(gizmo, "home").hasAttribute("data-hovered")).toBe(true);
    expect(button(gizmo, "home").innerHTML).toContain("--viewport-gizmo-button-ring-hover");
  });
});

describe("navigationAnchor", () => {
  it("puts the G0 grid at 42 px for Tau's 96 px cube with the triad, and clears the silhouette", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    expect(navigationAnchor(camera, 0.7, 96)).toBeCloseTo(42, 0);
    // Default cube: the side chips' hit area clears the face square, the corners' the bounding sphere.
    const a = navigationAnchor(camera, 1, 128);
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const face = 64 / ((camera.position.z - 1) * tan);
    expect(a - 12).toBeGreaterThan(face);
    expect(a * Math.SQRT2 - 12).toBeGreaterThan((64 * Math.tan(Math.asin(Math.sqrt(3) / camera.position.z))) / tan);
  });
});
