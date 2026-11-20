import { Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { orbitFrameAbout } from "./frame";
import { labelFrame, type LabelFrame } from "./labelFrame";
import { POLE_SINE, poseQuaternion } from "./pose";
import { sample, sampleTransition, type Flight } from "./transition";
import { homeDirection, planHome, planTurn, planView, restsOn, type TurnContext } from "./turn";

// The roll research's model (`three-viewport-gizmo-roll/roll-model.mjs`, Brain 78efe2751) replayed on the library: the
// same starts, actions, 60 fps sampling and measures, so its tallies are reproduced here (L7).

const DT = 1 / 60;
const deg = (radians: number) => (radians * 180) / Math.PI;
const QUARTER = Math.PI / 2;

const CARDINALS = [new Vector3(0, 0, 1), new Vector3(1, 0, 0), new Vector3(0, 1, 0)].flatMap((v) => [
  v,
  v.clone().negate(),
]);
const isCardinal = (v: Vector3) => CARDINALS.some((c) => c.distanceTo(v) < 1e-6);
const DIRS: Vector3[] = [];
for (const x of [-1, 0, 1])
  for (const y of [-1, 0, 1])
    for (const z of [-1, 0, 1]) if (x || y || z) DIRS.push(new Vector3(x, y, z).normalize());
const FACES = DIRS.filter(isCardinal);
const LABELS = CARDINALS.map((up) => labelFrame(up));

const backOf = (q: Quaternion) => new Vector3(0, 0, 1).applyQuaternion(q);
const upOf = (q: Quaternion) => new Vector3(0, 1, 0).applyQuaternion(q);
const rightOf = (q: Quaternion) => new Vector3(1, 0, 0).applyQuaternion(q);
const lookAt = (back: Vector3, up: Vector3) =>
  new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(back, new Vector3(), up));
const axisName = (v: Vector3) => {
  const i = v.toArray().findIndex((c) => Math.abs(c) > 1 - 1e-3);
  return i < 0 ? "tilted" : `${v.getComponent(i) > 0 ? "+" : "-"}${"XYZ"[i]}`;
};

type State = { q: Quaternion; w: Vector3 };
const TARGET = new Vector3();

const context = (state: State, label: LabelFrame, roll: TurnContext["roll"], extra: Partial<TurnContext> = {}) =>
  ({
    camera: { position: backOf(state.q), quaternion: state.q },
    target: TARGET,
    up: state.w,
    label,
    roll,
    speed: 1,
    ...extra,
  }) satisfies TurnContext;

/** Every rest state about an orbit up: 26 directions, the poles at four azimuths. */
function restStates(w: Vector3): State[] {
  const frame = orbitFrameAbout(w, new Vector3(1, 0, 0));
  const states: State[] = [];
  for (const d of DIRS) {
    const polar = Math.acos(Math.max(-1, Math.min(1, d.dot(w))));
    const azimuths =
      Math.sin(polar) > POLE_SINE ? [Math.atan2(d.dot(frame.e2), d.dot(frame.e1))] : [0, 1, 2, 3].map((k) => k * QUARTER);
    for (const azimuth of azimuths) states.push({ q: poseQuaternion({ azimuth, polar }, frame, new Quaternion()), w });
  }
  return states;
}

type Frame = { q: Quaternion; up: Vector3; roll: number };

/** Samples a flight at 60 fps, as the model does. */
function fly(flight: Flight): Frame[] {
  const frames: Frame[] = [];
  const pose = { azimuth: 0, polar: 0, roll: 0 };
  for (let i = 0; ; i++) {
    const out = { quaternion: new Quaternion(), up: new Vector3() };
    const finished = sample(flight, i * DT, out);
    if (flight.kind === "orbit") sampleTransition(flight, i * DT, pose);
    frames.push({ q: out.quaternion, up: out.up, roll: flight.kind === "orbit" ? pose.roll : 0 });
    if (finished) return frames;
  }
}

type Measure = {
  frames: Frame[];
  first: number;
  maxStep: number;
  bound: number;
  monotone: boolean;
  presentable: number;
  end: Quaternion;
  endUprightError: number;
  /** I1: the largest `|right · orbit up|` on any frame. */
  maxTilt: number;
};

function measure(start: Quaternion, flight: Flight): Measure {
  const frames = fly(flight);
  let maxStep = 0;
  let monotone = true;
  let presentable = 0;
  let maxTilt = 0;
  let previous = start;
  frames.forEach((frame, i) => {
    if (i > 0) {
      maxStep = Math.max(maxStep, previous.angleTo(frame.q));
      if (Math.abs(frame.roll) > Math.abs(frames[i - 1].roll) + 1e-12) monotone = false;
    }
    const back = backOf(frame.q);
    // A host that keeps (direction, up) rebuilds the frame with lookAt; skipped where up runs along the direction.
    if (new Vector3().crossVectors(back, frame.up).length() > 1e-2) {
      presentable = Math.max(presentable, lookAt(back, frame.up).angleTo(frame.q));
    }
    maxTilt = Math.max(maxTilt, Math.abs(rightOf(frame.q).dot(flight.up)));
    previous = frame.q;
  });
  const peak = flight.duration === 0 ? 0 : (1.5 * DT) / flight.duration;
  const length =
    flight.kind === "orbit"
      ? Math.abs(flight.azimuth) + Math.abs(flight.polar) + Math.abs(flight.roll)
      : flight.from.angleTo(flight.to);
  const end = frames.at(-1)!.q;
  return {
    frames,
    first: frames.length > 1 ? start.angleTo(frames[0].q) : 0,
    maxStep,
    bound: length * peak + 4 * POLE_SINE,
    monotone,
    presentable,
    end,
    endUprightError: Math.abs(rightOf(end).dot(flight.up)),
    maxTilt,
  };
}

const residual = (flight: Flight) => (flight.kind === "orbit" ? flight.roll : 0);

function tally() {
  const t = {
    flights: 0,
    maxFirstFrameDeg: 0,
    maxStepDeg: 0,
    overBound: 0,
    nonMonotoneRoll: 0,
    maxPresentableErrorDeg: 0,
    endNotUpright: 0,
    rollFreeFlights: 0,
    rollFreeMaxTilt: 0,
  };
  const add = (m: Measure, flight: Flight) => {
    t.flights++;
    t.maxFirstFrameDeg = Math.max(t.maxFirstFrameDeg, deg(m.first));
    t.maxStepDeg = Math.max(t.maxStepDeg, deg(m.maxStep));
    if (m.maxStep > m.bound + 1e-9) t.overBound++;
    if (!m.monotone) t.nonMonotoneRoll++;
    t.maxPresentableErrorDeg = Math.max(t.maxPresentableErrorDeg, deg(m.presentable));
    if (m.endUprightError > 1e-6) t.endNotUpright++;
    if (Math.abs(residual(flight)) < 1e-9) {
      t.rollFreeFlights++;
      t.rollFreeMaxTilt = Math.max(t.rollFreeMaxTilt, m.maxTilt);
    }
  };
  return { t, add };
}

const ACTIONS: ({ kind: "click"; d: Vector3 } | { kind: "roll"; a: number })[] = [
  ...DIRS.map((d) => ({ kind: "click" as const, d })),
  ...[QUARTER, -QUARTER, Math.PI, Math.PI / 12].map((a) => ({ kind: "roll" as const, a })),
];

const act = (state: State, label: LabelFrame, action: (typeof ACTIONS)[number]) =>
  action.kind === "click"
    ? planView(context(state, label, true, { poleEntry: "nearest" }), action.d)
    : planTurn(context(state, label, true), { roll: action.a })!;

describe("orbit-up model tallies (roll research, Findings 3 and 4)", () => {
  it("should keep the orbit up and land upright in all 6,912 face clicks", () => {
    let cases = 0;
    let kept = 0;
    let upright = 0;
    let equator = 0;
    let nearestOfFour = 0;
    let poles = 0;
    let poleQuarter = 0;
    let poleMaxAzimuth = 0;
    for (const label of LABELS)
      for (const w of CARDINALS)
        for (const state of restStates(w))
          for (const face of FACES) {
            const flight = planView(context(state, label, true, { poleEntry: "nearest" }), face);
            const m = measure(state.q, flight);
            cases++;
            if (flight.up.distanceTo(w) < 1e-9) kept++;
            if (m.endUprightError < 1e-9) upright++;
            const screenUp = upOf(m.end);
            const candidates = CARDINALS.filter((c) => Math.abs(c.dot(face)) < 1e-9);
            if (Math.abs(face.dot(w)) < 1e-9) {
              equator++;
              const best = candidates.reduce((a, b) => (b.dot(w) > a.dot(w) ? b : a));
              if (screenUp.distanceTo(best) < 1e-3) nearestOfFour++;
            } else {
              poles++;
              if (candidates.some((c) => screenUp.distanceTo(c) < 1e-3)) poleQuarter++;
              if (flight.kind === "orbit") poleMaxAzimuth = Math.max(poleMaxAzimuth, Math.abs(flight.azimuth));
            }
          }
    expect({ cases, kept, upright, equator, nearestOfFour, poles, poleQuarter }).toEqual({
      cases: 6912,
      kept: 6912,
      upright: 6912,
      equator: 4608,
      nearestOfFour: 4608,
      poles: 2304,
      poleQuarter: 2304,
    });
    expect(deg(poleMaxAzimuth)).toBeCloseTo(45, 6);
  });

  it("should fly all 142,272 flights without a snap, a growing roll or an unpresentable frame", () => {
    const perUp = LABELS.map((label) => {
      const { t, add } = tally();
      const tilted = tally();
      for (const w of CARDINALS)
        for (const state of restStates(w))
          for (const action of ACTIONS) {
            const flight = act(state, label, action);
            const m = measure(state.q, flight);
            add(m, flight);
            // A roll from an edge or corner view leaves a tilted orbit up: fly on from there.
            if (action.kind === "roll" && !isCardinal(flight.up as Vector3)) {
              const next = { q: m.end, w: flight.up as Vector3 };
              for (const second of ACTIONS) {
                const flight2 = act(next, label, second);
                tilted.add(measure(next.q, flight2), flight2);
              }
            }
          }
      return { t, tilted: tilted.t };
    });

    const off = tally();
    for (const label of LABELS)
      for (const w of CARDINALS)
        for (const state of restStates(w))
          for (const d of DIRS) {
            const flight = planView(context(state, label, false), d);
            off.add(measure(state.q, flight), flight);
          }

    const tilted = tally().t;
    for (const { tilted: t } of perUp) {
      tilted.flights += t.flights;
      tilted.rollFreeFlights += t.rollFreeFlights;
      for (const key of ["maxFirstFrameDeg", "maxStepDeg", "maxPresentableErrorDeg", "rollFreeMaxTilt"] as const)
        tilted[key] = Math.max(tilted[key], t[key]);
      for (const key of ["overBound", "nonMonotoneRoll", "endNotUpright"] as const) tilted[key] += t[key];
    }

    const zero = { overBound: 0, nonMonotoneRoll: 0, endNotUpright: 0 };
    for (const { t } of perUp) {
      expect(t).toMatchObject({ flights: 5760, rollFreeFlights: 5184, ...zero });
      expect(t.maxFirstFrameDeg).toBeLessThan(1e-4);
      expect(t.maxPresentableErrorDeg).toBeLessThan(1e-4);
      expect(t.maxStepDeg).toBeCloseTo(12.7025, 3);
      expect(t.rollFreeMaxTilt).toBeLessThan(1e-9); // I1 with roll on
    }
    expect(tilted).toMatchObject({ flights: 77760, rollFreeFlights: 22464, ...zero });
    expect(tilted.maxFirstFrameDeg).toBeLessThan(1e-4);
    expect(tilted.maxStepDeg).toBeCloseTo(17.2427, 3);
    expect(off.t).toMatchObject({ flights: 29952, rollFreeFlights: 9984, ...zero });
    expect(off.t.maxFirstFrameDeg).toBeCloseTo(0.0115, 3); // the pole margin
    expect(off.t.maxStepDeg).toBeCloseTo(18.9576, 3);
    expect(off.t.rollFreeMaxTilt).toBeLessThan(1e-9); // I1 with roll off
    expect(perUp.length * 5760 + tilted.flights + off.t.flights).toBe(142272);
  }, 120_000);

  it("should replay the operator's example (Z up, Front at −Y)", () => {
    const label = labelFrame({ x: 0, y: 0, z: 1 }, { x: 0, y: -1, z: 0 });
    const faceAt = (name: string) => Object.values(label.faces).find((face) => face.label === name)!.direction as Vector3;
    const nameOf = (back: Vector3) =>
      Object.values(label.faces).find((face) => face.direction.distanceTo(back) < 1e-3)?.label ?? "between";
    const frame = orbitFrameAbout(label.up, label.front);
    let state: State = { q: poseQuaternion({ azimuth: 0, polar: QUARTER }, frame, new Quaternion()), w: label.up };
    const rows: string[][] = [];
    const run = (action: string, flight: Flight) => {
      const m = measure(state.q, flight);
      expect(m.first, action).toBeLessThan(1e-9);
      expect(m.maxStep, action).toBeLessThanOrEqual(m.bound);
      state = { q: m.end, w: flight.up as Vector3 };
      rows.push([action, nameOf(backOf(m.end)), axisName(upOf(m.end)), axisName(state.w)]);
    };
    const roll = (a: number) => run(`roll ${deg(a)}`, planTurn(context(state, label, true), { roll: a })!);
    const click = (name: string) => run(`click ${name}`, planView(context(state, label, true), faceAt(name)));

    roll(QUARTER);
    roll(QUARTER);
    click("Right");
    click("Front");
    click("Top");
    click("Front");
    roll(-QUARTER);
    click("Right");
    click("Top");
    click("Front");
    roll(-QUARTER);
    click("Top");

    expect(rows).toEqual([
      ["roll 90", "Front", "-X", "-X"],
      ["roll 90", "Front", "-Z", "-Z"],
      ["click Right", "Right", "-Z", "-Z"],
      ["click Front", "Front", "-Z", "-Z"],
      ["click Top", "Top", "-Y", "-Z"],
      ["click Front", "Front", "-Z", "-Z"],
      ["roll -90", "Front", "-X", "-X"],
      ["click Right", "Right", "-Y", "-X"],
      ["click Top", "Top", "-X", "-X"],
      ["click Front", "Front", "-X", "-X"],
      ["roll -90", "Front", "+Z", "+Z"],
      ["click Top", "Top", "+Y", "+Z"], // Front entry: back in the label frame, the label reads upright
    ]);
  });

  it("should start a turn from a rolled camera with no first-frame jump", () => {
    const label = labelFrame({ x: 0, y: 0, z: 1 });
    const frame = orbitFrameAbout(label.up, label.front);
    const upright = poseQuaternion({ azimuth: 0, polar: QUARTER }, frame, new Quaternion());
    const rolled = new Quaternion().setFromAxisAngle(label.front, QUARTER).multiply(upright);

    for (const roll of [false, true] as const) {
      const flight = planView(context({ q: rolled, w: label.up }, label, roll), new Vector3(1, 0, 0));
      const m = measure(rolled, flight);
      // 2.3.0 read two angles and dropped the roll: its first frame was the upright pose, 90° away.
      expect(deg(rolled.angleTo(upright))).toBeCloseTo(90, 9);
      expect(m.first).toBeLessThan(1e-9);
      expect(m.maxStep).toBeLessThanOrEqual(m.bound);
      expect(deg(m.maxStep)).toBeCloseTo(12.7, 1);
      expect(m.monotone).toBe(true);
    }
  });

  it("should roll in place by exactly the angle (384 quarter rolls)", () => {
    let rolls = 0;
    let drift = 0;
    let angleError = 0;
    let cardinal = 0;
    const label = LABELS[0];
    for (const w of CARDINALS)
      for (const state of restStates(w))
        for (const a of [QUARTER, -QUARTER]) {
          const flight = planTurn(context(state, label, true), { roll: a })!;
          const m = measure(state.q, flight);
          rolls++;
          for (const frame of m.frames) drift = Math.max(drift, deg(backOf(frame.q).angleTo(backOf(state.q))));
          angleError = Math.max(angleError, Math.abs(deg(state.q.angleTo(m.end)) - 90));
          if (isCardinal(flight.up as Vector3)) cardinal++;
        }
    expect({ rolls, cardinal, tilted: rolls - cardinal }).toEqual({ rolls: 384, cardinal: 144, tilted: 240 });
    expect(drift).toBeLessThan(0.0082); // the pole margin
    expect(angleError).toBeLessThan(1e-6);
  });
});

describe("roll: 'free' (approved Tumble)", () => {
  /** Every orientation resting on a target, built independently of the library: lookAt with each allowed up. */
  const allowed = DIRS.flatMap((d) => {
    const ups: Vector3[] = [];
    for (const c of CARDINALS) {
      if (Math.abs(c.dot(d)) > 0.99) continue;
      const projected = c.clone().addScaledVector(d, -c.dot(d)).normalize();
      for (let k = 0; k < 4; k++) {
        const up = projected.clone().applyAxisAngle(d, k * QUARTER);
        if (!ups.some((u) => u.distanceTo(up) < 1e-6)) ups.push(up);
      }
    }
    return ups.map((up) => ({ d, up, q: lookAt(d, up) }));
  });
  const label = labelFrame({ x: 0, y: 1, z: 0 });
  const freeContext = (q: Quaternion) => context({ q, w: upOf(q) }, label, "free");

  it("should turn every allowed start to every other target by the brute-force shortest rotation (4,200)", () => {
    expect(allowed).toHaveLength(168); // 6 faces × 4 + 12 edges × 4 + 8 corners × 12
    let transitions = 0;
    for (const start of allowed)
      for (const d of DIRS) {
        if (d.distanceTo(start.d) < 1e-9) continue;
        const flight = planView(freeContext(start.q), d);
        const m = measure(start.q, flight);
        const minimum = Math.min(...allowed.filter((o) => o.d === d).map((o) => start.q.angleTo(o.q)));
        transitions++;
        expect(backOf(m.end).distanceTo(d)).toBeLessThan(1e-9);
        expect(restsOn(m.end, d)).toBe(true);
        expect(allowed.some((o) => o.d === d && o.up.distanceTo(upOf(m.end)) < 1e-9)).toBe(true);
        expect(Math.abs(start.q.angleTo(m.end) - minimum)).toBeLessThan(1e-9);
        expect(m.first).toBeLessThan(1e-6); // angleTo of equal quaternions resolves to ~3e-8 (acos near 1)
        expect(m.maxStep).toBeLessThanOrEqual(m.bound);
        expect(flight.up.distanceTo(upOf(m.end))).toBeLessThan(1e-9);
      }
    expect(transitions).toBe(4200);
  });

  it("should turn a side triangle at a face as the rigid quarter turn about the screen axis", () => {
    for (const start of allowed.filter(({ d }) => isCardinal(d)))
      for (const toward of ["left", "right", "up", "down"] as const) {
        const end = fly(planTurn(freeContext(start.q), { toward })!).at(-1)!.q;
        const horizontal = toward === "left" || toward === "right";
        const sign = toward === "right" || toward === "down" ? 1 : -1;
        const rigid = new Quaternion()
          .setFromAxisAngle(horizontal ? upOf(start.q) : rightOf(start.q), sign * QUARTER)
          .multiply(start.q);
        expect(end.angleTo(rigid)).toBeLessThan(1e-7);
      }
  });

  it("should keep every allowed start on its target through a quarter roll", () => {
    for (const start of allowed)
      for (const roll of [QUARTER, -QUARTER]) {
        const flight = planTurn(freeContext(start.q), { roll })!;
        const end = fly(flight).at(-1)!.q;
        expect(restsOn(end, start.d)).toBe(true);
        expect(deg(start.q.angleTo(end))).toBeCloseTo(90, 6);
        expect(backOf(end).distanceTo(start.d)).toBeLessThan(1e-9);
      }
  });

  it("should go home and reset upright in the label frame by one rotation", () => {
    const start = allowed.find(({ d, up }) => d.z === 1 && up.x === 1)!; // Front, rolled
    const home = fly(planHome(freeContext(start.q))).at(-1)!.q;
    expect(backOf(home).distanceTo(homeDirection(label))).toBeLessThan(1e-9);
    expect(Math.abs(rightOf(home).dot(label.up))).toBeLessThan(1e-9);
    const reset = fly(planView(freeContext(start.q), start.d, { reset: true })).at(-1)!.q;
    expect(upOf(reset).distanceTo(label.up)).toBeLessThan(1e-9);
  });
});

describe("orbit planning options", () => {
  const label = labelFrame({ x: 0, y: 1, z: 0 });
  const uprightStates = restStates(label.up);
  const polarOf = (q: Quaternion) => backOf(q).angleTo(label.up);

  it("should never pass a polar limit (U5, upstream #42)", () => {
    const limits = { minPolarAngle: 0.3, maxPolarAngle: QUARTER };
    for (const roll of [false, true] as const)
      for (const state of uprightStates.filter(({ q }) => polarOf(q) >= 0.3 && polarOf(q) <= QUARTER + 1e-9)) {
        const flights = [
          ...DIRS.map((d) => planView(context(state, label, roll, { limits }), d)),
          planTurn(context(state, label, roll, { limits }), { polar: Math.PI })!,
          planTurn(context(state, label, roll, { limits }), { polar: -Math.PI })!,
        ];
        for (const flight of flights)
          for (const { q } of fly(flight)) {
            expect(polarOf(q)).toBeLessThanOrEqual(QUARTER + 1e-9);
            expect(polarOf(q)).toBeGreaterThanOrEqual(0.3 - 1e-9);
          }
      }
    const front = uprightStates.find(({ q }) => backOf(q).distanceTo(label.front) < 1e-9)!;
    const bottom = fly(planView(context(front, label, false, { limits }), new Vector3(0, -1, 0))).at(-1)!.q;
    expect(polarOf(bottom)).toBeCloseTo(QUARTER, 12);
  });

  it("should stay inside azimuth limits, also across ±π", () => {
    const frame = orbitFrameAbout(label.up, label.front);
    const azimuthOf = (q: Quaternion) => {
      const back = backOf(q);
      return Math.atan2(back.dot(frame.e2), back.dot(frame.e1));
    };
    for (const [min, max] of [
      [-QUARTER, QUARTER],
      [2.5, -2.5],
    ]) {
      const inside = (a: number) => (min <= max ? a >= min - 1e-9 && a <= max + 1e-9 : a >= min - 1e-9 || a <= max + 1e-9);
      const limits = { minAzimuthAngle: min, maxAzimuthAngle: max };
      const starts = uprightStates.filter(({ q }) => Math.sin(polarOf(q)) > 0.1 && inside(azimuthOf(q)));
      expect(starts.length).toBeGreaterThan(0);
      for (const state of starts)
        for (const d of DIRS)
          for (const { q } of fly(planView(context(state, label, true, { limits }), d))) {
            if (Math.sin(polarOf(q)) > 1e-3) expect(inside(azimuthOf(q)), d.toArray().join()).toBe(true);
          }
    }
  });

  it("should turn to the opposite target on a repeat click only when asked (U6)", () => {
    const front = uprightStates.find(({ q }) => backOf(q).distanceTo(label.front) < 1e-9)!;
    const repeat = planView(context(front, label, true), label.front);
    expect(repeat.duration).toBe(0);
    const opposite = fly(planView(context(front, label, true), label.front, { oppositeOnRepeat: true })).at(-1)!.q;
    expect(backOf(opposite).distanceTo(label.front.clone().negate())).toBeLessThan(1e-9);
  });

  it("should enter a pole from Front or keep the nearest quarter turn (U7)", () => {
    const right = uprightStates.find(({ q }) => backOf(q).distanceTo(label.right) < 1e-9)!;
    const top = (poleEntry: "front" | "nearest") =>
      fly(planView(context(right, label, false, { poleEntry }), label.up)).at(-1)!.q;
    expect(upOf(top("front")).distanceTo(label.front.clone().negate())).toBeLessThan(1e-3);
    expect(upOf(top("nearest")).distanceTo(label.right.clone().negate())).toBeLessThan(1e-3);
  });

  it("should refuse a roll while roll is off, and turn left and right in the rolled orbit frame", () => {
    const front = uprightStates.find(({ q }) => backOf(q).distanceTo(label.front) < 1e-9)!;
    expect(planTurn(context(front, label, false), { roll: QUARTER })).toBeNull();

    const rolledFlight = planTurn(context(front, label, true), { roll: QUARTER })!;
    const rolled = { q: fly(rolledFlight).at(-1)!.q, w: rolledFlight.up as Vector3 };
    expect(axisName(rolled.w)).toBe("-X"); // positive turns the scene clockwise: from Front, −X becomes screen up
    const turned = planTurn(context(rolled, label, true), { azimuth: QUARTER })!;
    const end = fly(turned).at(-1)!.q;
    // A quarter turn about the orbit up on screen: the view keeps −X up and moves to the side of the screen.
    expect(upOf(end).distanceTo(rolled.w)).toBeLessThan(1e-9);
    expect(backOf(end).distanceTo(backOf(rolled.q).applyAxisAngle(rolled.w, QUARTER))).toBeLessThan(1e-9);

    const both = planTurn(context(front, label, true), { roll: QUARTER, azimuth: QUARTER })!;
    const bothEnd = fly(both).at(-1)!.q;
    expect(bothEnd.angleTo(end)).toBeLessThan(1e-9);
  });

  it("should go home and reset to upright in the label frame from a rolled view (L6, ruling 3)", () => {
    const front = uprightStates.find(({ q }) => backOf(q).distanceTo(label.front) < 1e-9)!;
    const rolledFlight = planTurn(context(front, label, true), { roll: QUARTER })!;
    const rolled = { q: fly(rolledFlight).at(-1)!.q, w: rolledFlight.up as Vector3 };

    const home = planHome(context(rolled, label, true));
    const homeEnd = fly(home).at(-1)!.q;
    expect(home.up.distanceTo(label.up)).toBe(0);
    expect(backOf(homeEnd).distanceTo(homeDirection(label))).toBeLessThan(1e-9);
    expect(Math.abs(rightOf(homeEnd).dot(label.up))).toBeLessThan(1e-9);

    const keep = fly(planView(context(rolled, label, true), label.front)).at(-1)!.q;
    expect(upOf(keep).distanceTo(rolled.w)).toBeLessThan(1e-9);
    const reset = planView(context(rolled, label, true), label.front, { reset: true });
    expect(upOf(fly(reset).at(-1)!.q).distanceTo(label.up)).toBeLessThan(1e-9);
  });

  it("should carry a side triangle on over the top at a pole", () => {
    const front = uprightStates.find(({ q }) => backOf(q).distanceTo(label.front) < 1e-9)!;
    const toTop = fly(planTurn(context(front, label, true), { toward: "up" })!).at(-1)!.q;
    expect(backOf(toTop).distanceTo(label.up)).toBeLessThan(1e-3);
    const over = fly(planTurn(context({ q: toTop, w: label.up }, label, true), { toward: "up" })!).at(-1)!.q;
    expect(backOf(over).distanceTo(label.front.clone().negate())).toBeLessThan(1e-9);
    expect(upOf(over).distanceTo(label.up)).toBeLessThan(1e-9);
  });
});
