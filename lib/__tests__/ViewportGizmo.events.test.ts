// K5: the class wired onto the 3.0 modules. Event sequences per the API guide (`press`, `start`, `change`, `end`,
// `hoverchange`, `attargetchange`, `invalidate`), the single pose write and the controls wiring.
import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { ViewportGizmoError } from "../errors.js";
import type { GizmoTargetName, ViewportGizmoEventMap } from "../index.js";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { createGizmo, fire, mountGizmo, ORBIT_TAKES_UP, runFlight } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

type Logged = { type: keyof ViewportGizmoEventMap; detail: string };

/** Records the turn events as `type:detail`, and counts `invalidate`. */
function record(gizmo: ViewportGizmo) {
  const log: Logged[] = [];
  const add = (type: keyof ViewportGizmoEventMap, detail: string) => log.push({ type, detail });
  gizmo.addEventListener("press", (e) => add("press", e.pressed?.name ?? "none"));
  gizmo.addEventListener("start", (e) => add("start", `${e.cause}>${e.heading?.target?.name ?? "-"}`));
  gizmo.addEventListener("change", (e) => add("change", e.cause));
  gizmo.addEventListener("end", (e) =>
    add("end", `${e.cause}:${e.outcome.status}${"reason" in e.outcome ? `/${e.outcome.reason}` : ""}${"by" in e.outcome ? `/${e.outcome.by}` : ""}`)
  );
  gizmo.addEventListener("hoverchange", (e) => add("hoverchange", e.hovered?.name ?? "none"));
  gizmo.addEventListener("attargetchange", (e) => add("attargetchange", e.atTarget?.target.name ?? "none"));
  let invalidations = 0;
  gizmo.addEventListener("invalidate", () => invalidations++);
  /** The turn events, with consecutive `change`s collapsed to one `change*`. */
  const turns = () =>
    log
      .filter(({ type }) => type === "press" || type === "start" || type === "change" || type === "end")
      .map(({ type, detail }) => (type === "change" ? `change*` : `${type}:${detail}`))
      .filter((entry, i, all) => entry !== "change*" || all[i - 1] !== "change*");
  const of = (type: keyof ViewportGizmoEventMap) => log.filter((entry) => entry.type === type).map((e) => e.detail);
  return { log, turns, of, invalidations: () => invalidations, clear: () => log.splice(0) };
}

/** Lands the view on a target at once. */
const land = (gizmo: ViewportGizmo, view: GizmoTargetName) => void gizmo.lookFrom(view, { animated: false });

/** Scans the element for a pixel over `name`, by hovering. */
function pixelOf(gizmo: ViewportGizmo, element: HTMLElement, name: GizmoTargetName) {
  for (let y = 4; y < 128; y += 4) {
    for (let x = 4; x < 128; x += 4) {
      fire(element, "pointermove", { x, y });
      if (gizmo.hovered?.name === name) {
        fire(element, "pointerleave", { x, y });
        return { x, y };
      }
    }
  }
  throw new Error(`no pixel over ${name}`);
}

const click = (element: HTMLElement, at: { x: number; y: number }, timeStamp?: number) => {
  fire(element, "pointerdown", { ...at, timeStamp });
  fire(element, "pointerup", { ...at, timeStamp });
};

const direction = (gizmo: ViewportGizmo) => new Vector3(0, 0, 1).applyQuaternion(gizmo.camera.quaternion);
const named = (gizmo: ViewportGizmo, name: GizmoTargetName) => gizmo.targets.find((t) => t.name === name)!.direction;

describe("event sequences (S probes P6 to P10 inverted)", () => {
  it("click: press, start with the heading, a change per frame, end reached", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    land(gizmo, "front-right");
    const at = pixelOf(gizmo, element, "right");
    const events = record(gizmo);

    click(element, at);
    expect(gizmo.animating).toBe(true);
    expect(gizmo.heading?.target?.name).toBe("right");
    runFlight(gizmo);

    expect(events.turns()).toEqual(["press:right", "start:click>right", "change*", "end:click:reached"]);
    expect(direction(gizmo).distanceTo(named(gizmo, "right"))).toBeLessThan(1e-9);
    expect(gizmo.atTarget?.target.name).toBe("right");
    expect(events.of("attargetchange")).toEqual(["none", "right"]);
    gizmo.dispose();
  });

  it("empty press: press with no target and nothing else", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    land(gizmo, "front");
    const events = record(gizmo);
    click(element, { x: 2, y: 2 });
    expect(events.turns()).toEqual(["press:none"]);
    expect(gizmo.animating).toBe(false);
    gizmo.dispose();
  });

  it("drag: press, start without a heading, change per step, end reached; data-dragging while held", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    land(gizmo, "front");
    const before = gizmo.camera.quaternion.clone();
    const events = record(gizmo);

    fire(element, "pointerdown", { x: 64, y: 64 });
    fire(element, "pointermove", { x: 80, y: 64 });
    fire(element, "pointermove", { x: 96, y: 70 });
    expect(element.hasAttribute("data-dragging")).toBe(true);
    expect(gizmo.dragging).toBe(true);
    fire(element, "pointerup", { x: 96, y: 70 });

    expect(events.turns()).toEqual(["press:front", "start:drag>-", "change*", "end:drag:reached"]);
    expect(element.hasAttribute("data-dragging")).toBe(false);
    expect(gizmo.camera.quaternion.angleTo(before)).toBeGreaterThan(0.1);
    // Upright about the label up on every drag (roll on, no roll to remove).
    expect(Math.abs(new Vector3(1, 0, 0).applyQuaternion(gizmo.camera.quaternion).y)).toBeLessThan(1e-9);
    gizmo.dispose();
  });

  it("API turn: start with cause api, a change per frame, end reached; the promise resolves with the end payload", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const events = record(gizmo);
    const ends: unknown[] = [];
    gizmo.addEventListener("end", ({ cause, pose, outcome }) => ends.push({ cause, pose, outcome }));

    const turn = gizmo.lookFrom("top");
    const frames = runFlight(gizmo);
    const end = await turn;

    expect(frames).toBeGreaterThan(2);
    expect(events.turns()).toEqual(["start:api>top", "change*", "end:api:reached"]);
    expect(end).toEqual(ends[0]);
    // A pole view stays POLE_EPSILON off the pole, so position-based controls keep the azimuth.
    expect(end.pose.direction.angleTo(named(gizmo, "top"))).toBeLessThan(1.1e-4);
    gizmo.dispose();
  });

  it("a newer turn interrupts the running one: end interrupted by the new cause, then its own start", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const events = record(gizmo);
    const first = gizmo.lookFrom("top");
    gizmo.render();
    const second = gizmo.lookFrom("front", { animated: false });
    expect((await first).outcome).toEqual({ status: "interrupted", by: "api" });
    expect((await second).outcome).toEqual({ status: "reached" });
    expect(events.turns()).toEqual([
      "start:api>top",
      "change*",
      "end:api:interrupted/api",
      "start:api>front",
      "change*",
      "end:api:reached",
    ]);
    gizmo.dispose();
  });

  it("cancel: end cancelled where the view is, promise resolved, no further change", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const events = record(gizmo);
    const turn = gizmo.lookFrom("top");
    gizmo.render();
    const stopped = gizmo.camera.quaternion.clone();
    gizmo.cancel();
    gizmo.render();

    expect((await turn).outcome).toEqual({ status: "cancelled", reason: "cancel" });
    expect(events.turns()).toEqual(["start:api>top", "change*", "end:api:cancelled/cancel"]);
    expect(gizmo.camera.quaternion.angleTo(stopped)).toBe(0);
    expect(gizmo.animating).toBe(false);
    gizmo.dispose();
  });

  it("pointercancel during a drag: end cancelled with reason pointercancel", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    const events = record(gizmo);
    fire(element, "pointerdown");
    fire(element, "pointermove", { x: 90 });
    fire(element, "pointercancel", { x: 90 });
    expect(events.turns()).toEqual(["press:front", "start:drag>-", "change*", "end:drag:cancelled/pointercancel"]);
    gizmo.dispose();
  });

  it("dispose: ends a turn as cancelled while listeners still hear it; every later call throws DISPOSED", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const events = record(gizmo);
    const turn = gizmo.lookFrom("top");
    gizmo.render();
    gizmo.dispose();
    gizmo.dispose();

    expect((await turn).outcome).toEqual({ status: "cancelled", reason: "dispose" });
    expect(events.turns().at(-1)).toBe("end:api:cancelled/dispose");
    expect(gizmo.domElement.isConnected).toBe(false);
    expect(gizmo.root.children).toEqual([]);
    for (const call of [() => gizmo.render(), () => gizmo.update(), () => gizmo.set({}), () => gizmo.cancel()]) {
      expect(call).toThrow(expect.objectContaining({ code: "DISPOSED" }));
    }
    await expect(gizmo.lookFrom("top")).rejects.toMatchObject({ code: "DISPOSED" });
  });

  it("set(): a structural change cancels a turn with reason set; a cheap one lets it run", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const events = record(gizmo);
    const first = gizmo.lookFrom("top");
    gizmo.render();
    gizmo.set({ size: 96 });
    expect(gizmo.animating).toBe(true);
    gizmo.set({ type: "rounded-cube" });
    expect((await first).outcome).toEqual({ status: "cancelled", reason: "set" });
    expect(events.turns()).toEqual(["start:api>top", "change*", "end:api:cancelled/set"]);
    gizmo.dispose();
  });

  it("enabled = false mid-hover ends the hover, refuses presses and cancels a drag", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    const events = record(gizmo);
    fire(element, "pointermove");
    expect(gizmo.hovered?.name).toBe("front");
    expect(element.getAttribute("data-hovered")).toBe("face");

    fire(element, "pointerdown");
    fire(element, "pointermove", { x: 90 });
    gizmo.enabled = false;
    expect(events.of("hoverchange")).toEqual(["front", "none"]);
    expect(events.turns()).toEqual(["press:front", "start:drag>-", "change*", "end:drag:cancelled/disabled"]);
    expect(element.hasAttribute("data-disabled")).toBe(true);
    expect(element.hasAttribute("data-hovered")).toBe(false);

    events.clear();
    fire(element, "pointermove", { x: 95 });
    click(element, { x: 64, y: 64 });
    expect(events.log).toEqual([]);
    gizmo.enabled = true;
    expect(element.hasAttribute("data-disabled")).toBe(false);
    gizmo.dispose();
  });

  it("a press grabs a flight: it holds where it is, then ends interrupted by the drag that follows", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    const events = record(gizmo);
    void gizmo.lookFrom("top");
    gizmo.render();
    fire(element, "pointerdown");
    const held = gizmo.camera.quaternion.clone();
    gizmo.render();
    expect(gizmo.camera.quaternion.angleTo(held)).toBe(0);
    fire(element, "pointermove", { x: 90 });
    fire(element, "pointerup", { x: 90 });
    expect(events.turns()).toEqual([
      "start:api>top",
      "change*",
      expect.stringMatching(/^press:/),
      "end:api:interrupted/drag",
      "start:drag>-",
      "change*",
      "end:drag:reached",
    ]);
    gizmo.dispose();
  });
});

describe("hover and at-target", () => {
  it("re-hovers when a turn moves a different target under a still pointer", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    land(gizmo, "front");
    fire(element, "pointermove");
    const events = record(gizmo);
    void gizmo.lookFrom("right");
    runFlight(gizmo);
    expect(gizmo.hovered?.name).toBe("right");
    expect(events.of("hoverchange").at(-1)).toBe("right");
    gizmo.dispose();
  });

  it("never hovers for touch", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    const events = record(gizmo);
    fire(element, "pointermove", { pointerType: "touch" });
    expect(events.of("hoverchange")).toEqual([]);
    gizmo.dispose();
  });

  it("clears the at-target state when the host moves the camera, and sets it again on a target", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    land(gizmo, "front");
    expect(gizmo.atTarget?.target.name).toBe("front");
    expect(gizmo.atTarget?.sides).toMatchObject({ up: { name: "top" }, right: { name: "right" }, left: { name: "left" } });
    const events = record(gizmo);
    gizmo.camera.position.set(1, 2, 5);
    gizmo.camera.lookAt(0, 0, 0);
    gizmo.update();
    expect(gizmo.atTarget).toBeNull();
    gizmo.camera.position.set(0, 0, 5);
    gizmo.camera.lookAt(0, 0, 0);
    gizmo.update();
    expect(events.of("attargetchange")).toEqual(["none", "front"]);
    expect(events.invalidations()).toBe(2);
    gizmo.update();
    expect(events.invalidations()).toBe(2);
    gizmo.dispose();
  });
});

describe("hit test", () => {
  it("follows the scene's scale while the triad shows (S6)", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: new Vector3(0, 0, 5) });
    land(gizmo, "front");
    const hitAt = (x: number) => {
      fire(element, "pointermove", { x, y: 64 });
      return gizmo.hovered?.name ?? null;
    };
    let rim = 64;
    while (hitAt(rim + 1)) rim++;
    expect(hitAt(rim)).toBe("front-right");
    gizmo.set({ triad: { enabled: true } });
    expect(hitAt(rim)).toBeNull();
    expect(hitAt(64)).toBe("front");
    gizmo.dispose();
  });
});

describe("render on demand", () => {
  it("completes a turn driven only by invalidate", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    let pending = false;
    gizmo.addEventListener("invalidate", () => (pending = true));
    const turn = gizmo.lookFrom("bottom-back-left");
    let frames = 0;
    while (pending && frames < 600) {
      pending = false;
      gizmo.render();
      now += 16;
      frames++;
    }
    expect((await turn).outcome.status).toBe("reached");
    expect(frames).toBeGreaterThan(2);
    expect(pending).toBe(false);
    gizmo.dispose();
  });
});

describe("controls", () => {
  it("leaves TrackballControls upright after a turn (T #37)", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const controls = new TrackballControls(gizmo.camera, gizmo.renderer.domElement);
    // A tumble rolled the camera.
    gizmo.camera.up.set(1, 1, 0).normalize();
    gizmo.camera.lookAt(0, 0, 0);
    gizmo.attachControls(controls);
    expect(gizmo.canRoll).toBe(false);

    void gizmo.lookFrom("right");
    runFlight(gizmo, () => controls.update());
    controls.update();

    expect(gizmo.camera.up.toArray()).toEqual([0, 1, 0]);
    expect(Math.abs(new Vector3(1, 0, 0).applyQuaternion(gizmo.camera.quaternion).y)).toBeLessThan(1e-9);
    expect(direction(gizmo).distanceTo(named(gizmo, "right"))).toBeLessThan(1e-6);
    controls.dispose();
    gizmo.dispose();
  });

  it("does not recurse when update() runs inside a controls change (T #22), and update() steps no controls", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const controls = new OrbitControls(gizmo.camera, gizmo.renderer.domElement);
    gizmo.attachControls(controls);
    const step = vi.spyOn(controls, "update");
    const update = vi.spyOn(gizmo, "update");
    controls.addEventListener("change", () => gizmo.update());
    gizmo.update();
    expect(step).not.toHaveBeenCalled();

    gizmo.camera.position.set(4, 1, 3);
    step.mockRestore();
    controls.update();
    // The gizmo's own listener and the host's: once each, no loop.
    expect(update).toHaveBeenCalledTimes(3);
    controls.dispose();
    gizmo.dispose();
  });

  it("copies the target, holds the controls during a turn and restores their own enabled after", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const controls = new OrbitControls(gizmo.camera, gizmo.renderer.domElement);
    controls.target.set(0, 0.5, 0);
    controls.enabled = false;
    gizmo.attachControls(controls);
    expect(gizmo.target).not.toBe(controls.target);
    expect(gizmo.target.toArray()).toEqual([0, 0.5, 0]);
    expect(gizmo.canRoll).toBe(ORBIT_TAKES_UP);

    controls.enabled = true;
    void gizmo.lookFrom("top");
    expect(controls.enabled).toBe(false);
    runFlight(gizmo);
    expect(controls.enabled).toBe(true);

    gizmo.detachControls();
    controls.target.set(9, 9, 9);
    expect(gizmo.target.toArray()).toEqual([0, 0.5, 0]);
    controls.dispose();
    gizmo.dispose();
  });

  it("takes roll with OrbitControls (C1, ruling A) and refuses roll: true with TrackballControls", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4), gizmoOptions: { type: "cube", roll: true } });
    const orbit = new OrbitControls(gizmo.camera, gizmo.renderer.domElement);
    if (ORBIT_TAKES_UP) expect(() => gizmo.attachControls(orbit)).not.toThrow();
    // Below three 0.168 (R16): the coded error, naming the installed revision.
    else expect(() => gizmo.attachControls(orbit)).toThrow(expect.objectContaining({ code: "ROLL_UNSUPPORTED", message: expect.stringMatching(/three r1\d\d .*roll needs three 0\.168/) }));
    const trackball = new TrackballControls(gizmo.camera, gizmo.renderer.domElement);
    expect(() => gizmo.attachControls(trackball)).toThrow(expect.objectContaining({ code: "ROLL_UNSUPPORTED" }));
    gizmo.dispose();
  });
});

describe("options and members", () => {
  it("set() merges, assigns only on success and keeps the element", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const element = gizmo.domElement;
    element.classList.add("host");
    gizmo.set({ size: 96, className: "mine" });
    expect(gizmo.options.size).toBe(96);
    expect(() => gizmo.set({ size: -1 })).toThrow(expect.objectContaining({ code: "INVALID_OPTION" }));
    expect(gizmo.options.size).toBe(96);
    gizmo.set({ type: "sphere" });
    expect(gizmo.domElement).toBe(element);
    expect([...element.classList]).toEqual(["host", "mine"]);
    expect(gizmo.options.size).toBe(96);
    gizmo.set({ size: undefined });
    expect(gizmo.options.size).toBe(128);
    gizmo.dispose();
  });

  it("takes the label up from camera.up at construction (R12) and lists all 26 targets for every type", () => {
    for (const type of ["sphere", "cube", "rounded-cube"] as const) {
      const gizmo = createGizmo({ up: new Vector3(0, 0, -1), cameraPosition: new Vector3(3, 2, 4), gizmoOptions: { type } });
      expect(gizmo.options.up.toArray()).toEqual([0, 0, -1]);
      expect(gizmo.up.toArray()).toEqual([0, 0, -1]);
      expect(gizmo.targets).toHaveLength(26);
      expect(named(gizmo, "top").toArray()).toEqual([0, 0, -1]);
      gizmo.dispose();
    }
  });

  it("refuses removed 2.x members with REMOVED_MEMBER, naming the replacement", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) }) as unknown as Record<string, () => void>;
    for (const [name, replacement] of [
      ["domUpdate", "render()"],
      ["cameraUpdate", "update()"],
      ["placement", "set({ placement })"],
      ["animated", "set({ animated })"],
      ["speed", "set({ speed })"],
    ]) {
      expect(() => gizmo[name]).toThrow(expect.objectContaining({ code: "REMOVED_MEMBER" }));
      expect(() => gizmo[name]).toThrow(replacement);
    }
    expect(() => {
      gizmo.speed = () => {};
    }).toThrow(ViewportGizmoError);
  });

  it("rejects caller mistakes and resolves a refused roll as unavailable without events", async () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4), gizmoOptions: { type: "cube", roll: false } });
    const events = record(gizmo);
    await expect(gizmo.lookFrom("nowhere" as GizmoTargetName)).rejects.toMatchObject({ code: "UNKNOWN_VIEW" });
    await expect(gizmo.lookFrom({ x: 0, y: 0, z: 0 })).rejects.toMatchObject({ code: "UNKNOWN_VIEW" });
    // @ts-expect-error -- the 2.x boolean
    await expect(gizmo.lookFrom("top", false)).rejects.toMatchObject({ code: "REMOVED_OPTION" });
    await expect(gizmo.turn({})).rejects.toMatchObject({ code: "INVALID_TURN" });
    await expect(gizmo.turn({ azimuth: Number.NaN })).rejects.toMatchObject({ code: "INVALID_TURN" });
    expect((await gizmo.turn({ roll: Math.PI / 2 })).outcome).toEqual({ status: "unavailable", reason: "roll-off" });
    expect(events.turns()).toEqual([]);
    gizmo.dispose();
  });

  it("throws DOCUMENT_MISSING without a document", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(3, 2, 4) });
    const Gizmo = gizmo.constructor as typeof ViewportGizmo;
    vi.stubGlobal("document", undefined);
    expect(() => new Gizmo(gizmo.camera, gizmo.renderer)).toThrow(expect.objectContaining({ code: "DOCUMENT_MISSING" }));
  });
});
