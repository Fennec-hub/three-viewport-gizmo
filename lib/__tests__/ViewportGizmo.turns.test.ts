// K7: the turn API and roll state on the class. Outcomes per the API guide's cases, at-target after a click, a quarter
// turn and a roll, the double-click reset, heading, cancel, home, the inferred `roll` default and the controls'
// azimuth limits (U9, R15, L3, L4, L6, roll rulings 2, 3, A, B).
import { afterEach, describe, expect, it, vi } from "vitest";
import { Quaternion, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import type { GizmoOptions, GizmoTargetName, GizmoTurnEnd } from "../index.js";
import type { ViewportGizmo } from "../ViewportGizmo.js";
import { createGizmo, fire, mountGizmo, ORBIT_TAKES_UP, runFlight } from "./test-utils.js";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

const QUARTER = Math.PI / 2;
const DEGREE = Math.PI / 180;
const axis = (x: number, y: number, z: number) => new Vector3(x, y, z);
/** The six label ups with their default fronts (O1). */
const UPS: readonly (readonly [string, Vector3, Vector3])[] = [
  ["+x", axis(1, 0, 0), axis(0, 1, 0)],
  ["-x", axis(-1, 0, 0), axis(0, 1, 0)],
  ["+y", axis(0, 1, 0), axis(0, 0, 1)],
  ["-y", axis(0, -1, 0), axis(0, 0, 1)],
  ["+z", axis(0, 0, 1), axis(0, -1, 0)],
  ["-z", axis(0, 0, -1), axis(0, -1, 0)],
];

const back = (q: Readonly<Quaternion>) => axis(0, 0, 1).applyQuaternion(q);
const screenUp = (q: Readonly<Quaternion>) => axis(0, 1, 0).applyQuaternion(q);
const screenRight = (q: Readonly<Quaternion>) => axis(1, 0, 0).applyQuaternion(q);
const named = (gizmo: ViewportGizmo, name: GizmoTargetName) => gizmo.targets.find((t) => t.name === name)!.direction;
const land = (gizmo: ViewportGizmo, view: GizmoTargetName) => void gizmo.lookFrom(view, { animated: false });
const status = (end: GizmoTurnEnd) => {
  const o = end.outcome;
  return o.status === "interrupted" ? `interrupted/${o.by}` : "reason" in o ? `${o.status}/${o.reason}` : o.status;
};
const CENTRE = { x: 64, y: 64 };
const click = (element: HTMLElement, timeStamp: number, at = CENTRE) => {
  fire(element, "pointerdown", { ...at, timeStamp });
  fire(element, "pointerup", { ...at, timeStamp });
};
const drag = (element: HTMLElement, to: number) => {
  fire(element, "pointerdown");
  for (let x = 64 + 10; x <= to; x += 10) fire(element, "pointermove", { x });
  fire(element, "pointerup", { x: to });
};

describe("outcome per guide case (U9, I8)", () => {
  const front = () => mountGizmo({ cameraPosition: axis(0, 0, 5) });

  it("reached: lookFrom, home, both turn kinds, click and drag; an instant turn ends in the call", async () => {
    const { gizmo, element } = front();
    const ends: string[] = [];
    gizmo.addEventListener("end", (e) => ends.push(`${e.cause}:${status(e)}`));
    for (const turn of [
      () => gizmo.lookFrom("top"),
      () => gizmo.lookFrom({ x: 1, y: 1, z: 1 }),
      () => gizmo.lookFrom("home"),
      () => gizmo.turn({ toward: "left" }),
      () => gizmo.turn({ azimuth: QUARTER, polar: -0.2 }),
      () => gizmo.turn({ roll: QUARTER }),
    ]) {
      const promise = turn();
      runFlight(gizmo);
      expect(status(await promise)).toBe("reached");
    }
    let instant: GizmoTurnEnd | null = null;
    void gizmo.lookFrom("front", { animated: false }).then((end) => (instant = end));
    expect(gizmo.animating).toBe(false);
    await Promise.resolve();
    expect(instant && status(instant)).toBe("reached");
    click(element, 0);
    runFlight(gizmo);
    drag(element, 104);
    expect(ends.slice(-2)).toEqual(["click:reached", "drag:reached"]);
    gizmo.dispose();
  });

  it("interrupted: by a newer turn, by a click or an empty press that grabs it, and by a drag", async () => {
    const { gizmo, element } = front();
    const first = gizmo.lookFrom("top");
    gizmo.render();
    const second = gizmo.lookFrom("right");
    expect(status(await first)).toBe("interrupted/api");
    gizmo.render();
    click(element, 0);
    expect(status(await second)).toBe("interrupted/click");
    runFlight(gizmo);

    const third = gizmo.lookFrom("bottom");
    gizmo.render();
    click(element, 1000, { x: 1, y: 1 }); // a corner of the element, off the cube
    expect(status(await third)).toBe("interrupted/click");
    expect(gizmo.animating).toBe(false);

    const fourth = gizmo.lookFrom("left");
    gizmo.render();
    drag(element, 104);
    expect(status(await fourth)).toBe("interrupted/drag");

    // A turn takes over a drag; the drag's `end` says so.
    const ends: string[] = [];
    gizmo.addEventListener("end", (e) => ends.push(`${e.cause}:${status(e)}`));
    fire(element, "pointerdown");
    fire(element, "pointermove", { x: 90 });
    void gizmo.lookFrom("front");
    expect(ends).toEqual(["drag:interrupted/api"]);
    expect(gizmo.dragging).toBe(false);
    gizmo.dispose();
  });

  it("cancelled: cancel, pointercancel, enabled = false, a structural set() and dispose", async () => {
    const { gizmo, element } = front();
    const reasons: string[] = [];
    for (const stop of [
      () => gizmo.cancel(),
      () => {
        fire(element, "pointerdown");
        fire(element, "pointercancel");
      },
      () => {
        gizmo.enabled = false;
        gizmo.enabled = true;
      },
      () => gizmo.set({ type: "sphere" }),
      () => gizmo.dispose(),
    ]) {
      const promise = gizmo.lookFrom("top-front-right");
      gizmo.render();
      const before = gizmo.camera.quaternion.clone();
      stop();
      const end = await promise;
      reasons.push(status(end));
      // Stopped where it was: the pose in the payload is the camera's, and no frame moves it after.
      expect(back(gizmo.camera.quaternion).distanceTo(end.pose.direction)).toBeLessThan(1e-9);
      expect(gizmo.camera.quaternion.angleTo(before)).toBe(0);
    }
    expect(reasons).toEqual([
      "cancelled/cancel",
      "cancelled/pointercancel",
      "cancelled/disabled",
      "cancelled/set",
      "cancelled/dispose",
    ]);
  });

  it("unavailable: a roll while canRoll is false, with no event, leaving a running turn alone", async () => {
    for (const options of [{ roll: false }, { controlled: true }] as GizmoOptions[]) {
      const gizmo = createGizmo({ cameraPosition: axis(0, 0, 5), gizmoOptions: { type: "cube", ...options } });
      expect(gizmo.canRoll).toBe(false);
      const running = gizmo.lookFrom("top");
      gizmo.render();
      const events: string[] = [];
      for (const type of ["start", "change", "end"] as const) gizmo.addEventListener(type, () => events.push(type));
      const refused = await gizmo.turn({ roll: QUARTER, azimuth: 0.1 });
      expect(refused).toMatchObject({ cause: "api", outcome: { status: "unavailable", reason: "roll-off" } });
      expect(events).toEqual([]);
      expect(gizmo.animating).toBe(true);
      runFlight(gizmo);
      expect(status(await running)).toBe("reached");
      gizmo.dispose();
    }
  });
});

describe("at-target state (roll rulings 2 and B)", () => {
  it("is set after a click, a quarter turn and a roll, null while turning, cleared by a drag", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(1, 0.5, 5) });
    const changes: string[] = [];
    gizmo.addEventListener("attargetchange", (e) => changes.push(e.atTarget?.target.name ?? "none"));
    expect(gizmo.atTarget).toBeNull();

    click(element, 0);
    expect(gizmo.atTarget).toBeNull();
    runFlight(gizmo, () => expect(gizmo.animating ? gizmo.atTarget : null).toBeNull());
    expect(gizmo.atTarget?.target.name).toBe("front");

    void gizmo.turn({ azimuth: QUARTER });
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("right");
    void gizmo.turn({ toward: "up" });
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("top");
    void gizmo.turn({ polar: QUARTER });
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("right");

    const sides = gizmo.atTarget!.sides!;
    void gizmo.turn({ roll: QUARTER });
    runFlight(gizmo);
    // Still on the face, a quarter turn round: what was on the left of the screen is now above.
    expect(gizmo.atTarget?.target.name).toBe("right");
    expect(gizmo.atTarget?.sides).toMatchObject({ up: sides.left, right: sides.up, down: sides.right, left: sides.down });

    drag(element, 100);
    expect(gizmo.atTarget).toBeNull();
    expect(changes).toEqual(["front", "none", "right", "none", "top", "none", "right", "none", "right", "none"]);
    gizmo.dispose();
  });

  it("stays at a rolled edge or corner, and a host camera move clears and sets it", () => {
    for (const [, up, front] of UPS) {
      const gizmo = createGizmo({ up, cameraPosition: front.clone().multiplyScalar(5), gizmoOptions: { type: "cube", frontDirection: front } });
      for (const name of ["top-front", "bottom-back-left"] as const) {
        land(gizmo, name);
        void gizmo.turn({ roll: QUARTER, animated: false });
        expect(gizmo.atTarget).toMatchObject({ target: { name }, sides: null });
      }
      const position = gizmo.camera.position.clone();
      gizmo.camera.position.add(up.clone().multiplyScalar(0.5));
      gizmo.camera.lookAt(0, 0, 0);
      gizmo.update();
      expect(gizmo.atTarget).toBeNull();
      // Back within 1° of the corner, rolled: at the target again.
      gizmo.camera.position.copy(position).applyAxisAngle(up, 0.5 * DEGREE);
      gizmo.camera.lookAt(0, 0, 0);
      gizmo.update();
      expect(gizmo.atTarget?.target.name).toBe("bottom-back-left");
      gizmo.dispose();
    }
  });
});

describe("double-click on the cube (roll ruling 3)", () => {
  /** The pose a fresh, unrolled gizmo lands on for `name` with the up reset. */
  const upright = (up: Vector3, front: Vector3, name: GizmoTargetName) => {
    const fresh = createGizmo({ up, cameraPosition: front.clone().multiplyScalar(5), gizmoOptions: { type: "cube", frontDirection: front } });
    land(fresh, name);
    const q = fresh.camera.quaternion.clone();
    fresh.dispose();
    return q;
  };

  for (const roll of [true, "free"] as const) {
    it(`roll: ${roll}: ends on the label up at the clicked target and never leaves its direction, on six ups`, () => {
      for (const [, up, front] of UPS) {
        for (const [name, angle] of [
          ["front", QUARTER],
          ["front", Math.PI],
          ["top", QUARTER],
          ["bottom", -QUARTER],
          ["top-front-right", QUARTER],
        ] as const) {
          const { gizmo, element } = mountGizmo({ up, cameraPosition: front.clone().multiplyScalar(5), gizmoOptions: { type: "cube", frontDirection: front, roll } });
          land(gizmo, name);
          void gizmo.turn({ roll: angle, animated: false });
          expect(gizmo.atTarget?.target.name).toBe(name);
          const direction = named(gizmo, name);
          click(element, 1000);
          click(element, 1200);
          runFlight(gizmo, () => expect(back(gizmo.camera.quaternion).angleTo(direction)).toBeLessThan(DEGREE));
          expect(gizmo.camera.quaternion.angleTo(upright(up, front, name))).toBeLessThan(1e-6);
          // `'free'` keeps the orbit up on the screen up (K5), which at a pole or corner is not the label up.
          const orbitUp = roll === "free" ? screenUp(gizmo.camera.quaternion) : up;
          expect(gizmo.camera.up.distanceTo(orbitUp)).toBeLessThan(1e-9);
          expect(gizmo.up.distanceTo(orbitUp)).toBeLessThan(1e-9);
          expect(gizmo.atTarget?.target.name).toBe(name);
          gizmo.dispose();
        }
      }
    });
  }

  it("resets on the first click's view, and the second click never turns to the opposite (U6)", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(0, 0, 5), gizmoOptions: { type: "cube", oppositeOnRepeat: true } });
    land(gizmo, "front");
    void gizmo.turn({ roll: QUARTER, animated: false });
    // A single click on the face the view rests on turns to the opposite (U6) ...
    click(element, 0);
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("back");
    // ... a double-click's second press grabs the first click's turn and lands upright on it, no flip back.
    land(gizmo, "front");
    void gizmo.turn({ roll: QUARTER, animated: false });
    click(element, 5000);
    gizmo.render();
    click(element, 5100);
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("back");
    expect(screenUp(gizmo.camera.quaternion).distanceTo(axis(0, 1, 0))).toBeLessThan(1e-6);
    gizmo.dispose();
  });

  it("roll: false: a double-click is two clicks on the target and still never turns to the opposite", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(0, 0, 5), gizmoOptions: { type: "cube", roll: false, oppositeOnRepeat: true } });
    land(gizmo, "top");
    click(element, 0);
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("bottom");
    click(element, 2000);
    click(element, 2100);
    runFlight(gizmo);
    expect(gizmo.atTarget?.target.name).toBe("top");
    gizmo.dispose();
  });
});

describe("heading, cancel and home", () => {
  it("heading names where a flight goes; null for an angle turn off the targets, for a drag and at rest", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(0, 0, 5) });
    expect(gizmo.heading).toBeNull();
    const headings: (string | null)[] = [];
    gizmo.addEventListener("start", (e) => headings.push(e.heading?.target?.name ?? null));
    void gizmo.lookFrom("top-back");
    expect(gizmo.heading?.target?.name).toBe("top-back");
    expect(gizmo.heading?.pose.direction.distanceTo(named(gizmo, "top-back"))).toBeLessThan(1e-9);
    runFlight(gizmo, () => gizmo.animating && expect(gizmo.heading?.target?.name).toBe("top-back"));
    expect(gizmo.heading).toBeNull();
    void gizmo.turn({ azimuth: 0.3 });
    expect(gizmo.heading).toMatchObject({ target: null });
    gizmo.cancel();
    fire(element, "pointerdown");
    fire(element, "pointermove", { x: 90 });
    expect(gizmo.heading).toBeNull();
    fire(element, "pointerup", { x: 90 });
    expect(headings).toEqual(["top-back", null, null]);
    gizmo.dispose();
  });

  it("cancel with nothing running does nothing", () => {
    const gizmo = createGizmo({ cameraPosition: axis(3, 2, 4) });
    const events: string[] = [];
    for (const type of ["start", "change", "end", "invalidate"] as const) gizmo.addEventListener(type, () => events.push(type));
    gizmo.cancel();
    expect(events).toEqual([]);
    gizmo.dispose();
  });

  it("home is Top Front Right, upright in the label frame, from a rolled view on six ups", async () => {
    for (const [, up, front] of UPS) {
      for (const roll of [true, false, "free"] as const) {
        const gizmo = createGizmo({ up, cameraPosition: front.clone().multiplyScalar(5), gizmoOptions: { type: "cube", frontDirection: front, roll } });
        if (roll) void gizmo.turn({ roll: QUARTER, animated: false });
        void gizmo.turn({ azimuth: 0.4, polar: 0.3, animated: false });
        const end = gizmo.lookFrom("home");
        runFlight(gizmo);
        expect(status(await end)).toBe("reached");
        const q = gizmo.camera.quaternion;
        const right = up.clone().cross(front);
        expect(back(q).distanceTo(right.add(up).add(front).normalize())).toBeLessThan(1e-9);
        expect(Math.abs(screenRight(q).dot(up))).toBeLessThan(1e-9);
        expect(screenUp(q).dot(up)).toBeGreaterThan(0);
        expect(gizmo.camera.up.distanceTo(roll === "free" ? screenUp(q) : up)).toBeLessThan(1e-9);
        expect(gizmo.atTarget?.target.name).toBe("top-front-right");
        gizmo.dispose();
      }
    }
  });
});

describe("roll option and orbit up (L4, ruling A)", () => {
  // Below three 0.168 OrbitControls cannot take a new up, so the matrix differs; the events test covers the refusal.
  it.runIf(ORBIT_TAKES_UP)("infers the default from the controls and controlled mode, and re-infers on attach and detach", () => {
    const gizmo = createGizmo({ cameraPosition: axis(3, 2, 4) });
    const canvas = gizmo.renderer.domElement;
    const matrix: [string, boolean | "free"][] = [];
    const row = (name: string) => matrix.push([name, gizmo.options.roll]);
    row("no controls");
    const orbit = new OrbitControls(gizmo.camera, canvas);
    gizmo.attachControls(orbit);
    row("OrbitControls");
    const trackball = new TrackballControls(gizmo.camera, canvas);
    gizmo.attachControls(trackball);
    row("TrackballControls");
    gizmo.detachControls();
    row("detached");
    gizmo.set({ controlled: true });
    row("controlled");
    gizmo.set({ controlled: undefined, roll: false });
    row("roll: false");
    gizmo.set({ roll: "free" });
    gizmo.attachControls(orbit);
    row("roll: free, OrbitControls");
    expect(() => gizmo.attachControls(trackball)).toThrow(expect.objectContaining({ code: "ROLL_UNSUPPORTED" }));
    expect(gizmo.options.roll).toBe("free");
    expect(matrix).toEqual([
      ["no controls", true],
      ["OrbitControls", true],
      ["TrackballControls", false],
      ["detached", true],
      ["controlled", false],
      ["roll: false", false],
      ["roll: free, OrbitControls", "free"],
    ]);
    expect(gizmo.canRoll).toBe(true);
    orbit.dispose();
    trackball.dispose();
    gizmo.dispose();
  });

  it("the orbit up turns with a roll and returns on a reset; with roll off it is the label up", () => {
    for (const roll of [true, false] as const) {
      const gizmo = createGizmo({ cameraPosition: axis(0, 0, 5), gizmoOptions: { type: "cube", roll } });
      void gizmo.turn({ roll: QUARTER, animated: false });
      expect(gizmo.up.toArray().map((v) => Math.round(v) + 0)).toEqual(roll ? [-1, 0, 0] : [0, 1, 0]);
      expect(gizmo.camera.up.distanceTo(gizmo.up)).toBeLessThan(1e-9);
      void gizmo.lookFrom("front", { up: "reset", animated: false });
      expect(gizmo.up.toArray()).toEqual([0, 1, 0]);
      gizmo.dispose();
    }
  });

  it("roll: 'free' drags a trackball about the screen axes: the orbit up follows the screen up, no clamp", () => {
    const { gizmo, element } = mountGizmo({ cameraPosition: axis(0, 0, 5), gizmoOptions: { type: "cube", roll: "free", limits: { maxPolarAngle: QUARTER } } });
    const start = gizmo.camera.quaternion.clone();
    fire(element, "pointerdown");
    // Half a turn per element width: three quarters down go over the top to the bottom, through the polar limit.
    fire(element, "pointermove", { y: 64 + 192 });
    expect(back(gizmo.camera.quaternion).distanceTo(axis(0, -1, 0))).toBeLessThan(1e-9);
    expect(screenUp(gizmo.camera.quaternion).distanceTo(axis(0, 0, 1))).toBeLessThan(1e-9);
    fire(element, "pointermove", { x: 64 + 64, y: 64 + 192 }); // then a quarter turn about the screen up
    expect(gizmo.camera.up.distanceTo(screenUp(gizmo.camera.quaternion))).toBeLessThan(1e-9);
    expect(gizmo.up.distanceTo(gizmo.camera.up)).toBeLessThan(1e-9);
    // Back up, then back left: the same travel in another order is not the way back (a trackball, not an orbit).
    fire(element, "pointermove", { x: 64 + 64, y: 64 });
    fire(element, "pointermove", { x: 64, y: 64 });
    expect(gizmo.camera.quaternion.angleTo(start)).toBeGreaterThan(0.1);
    fire(element, "pointerup", { x: 64, y: 64 });
    gizmo.dispose();
  });
});

describe("controls' azimuth limits (U5)", () => {
  // The mapping into the orbit frame is exact while the controls' up is the orbit up: with roll off, always.
  for (const [name, up, front] of UPS.filter(([n]) => n === "+y" || n === "+z" || n === "-x")) {
    it(`${name} up, roll off: a drag and a click stop where OrbitControls would, so its update() moves nothing`, () => {
      const { gizmo, element } = mountGizmo({ up, cameraPosition: front.clone().multiplyScalar(5), gizmoOptions: { type: "cube", frontDirection: front, roll: false } });
      const controls = new OrbitControls(gizmo.camera, gizmo.renderer.domElement);
      controls.minAzimuthAngle = -Math.PI / 4;
      controls.maxAzimuthAngle = Math.PI / 3;
      controls.update();
      gizmo.attachControls(controls);
      const settled = () => {
        const before = gizmo.camera.position.clone();
        controls.update();
        return gizmo.camera.position.distanceTo(before);
      };
      for (const to of [64 + 120, 64 - 120]) {
        fire(element, "pointerdown");
        fire(element, "pointermove", { x: to });
        fire(element, "pointerup", { x: to });
        expect(settled()).toBeLessThan(1e-9);
      }
      void gizmo.lookFrom("back", { animated: false });
      expect(settled()).toBeLessThan(1e-9);
      controls.dispose();
      gizmo.dispose();
    });
  }
});
