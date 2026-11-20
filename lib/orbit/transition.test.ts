import { setFlagsFromString } from "node:v8";
import { runInNewContext } from "node:vm";
import { Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { orbitFrameAbout } from "./frame";
import { orbitFlight, orbitTransition, rigidFlight, sample, sampleTransition } from "./transition";

setFlagsFromString("--expose-gc");
const gc = runInNewContext("gc") as () => void;

const frame = orbitFrameAbout(new Vector3(0, 1, 0), new Vector3(0, 0, 1));

describe("orbitTransition", () => {
  it("should ease the roll residual to zero on the same parameter as the angles", () => {
    const transition = orbitTransition({ azimuth: 0, polar: 1, roll: 0.8 }, { azimuth: 1, polar: 1, roll: 5 }, 1);
    expect(transition.roll).toBe(0.8);
    expect(transition.duration).toBeCloseTo(1 / (2 * Math.PI), 12); // the largest of the three angles
    const out = { azimuth: 0, polar: 0, roll: 0 };
    let previous = Infinity;
    for (let elapsed = 0; !sampleTransition(transition, elapsed, out); elapsed += 0.01) {
      expect(Math.abs(out.roll)).toBeLessThanOrEqual(previous);
      expect(out.roll / 0.8).toBeCloseTo(1 - out.azimuth, 12);
      previous = Math.abs(out.roll);
    }
    expect(out).toEqual({ azimuth: 1, polar: 1, roll: 0 });
  });

  it("should take no time for an infinite speed or a zero-length turn", () => {
    expect(orbitTransition({ azimuth: 0, polar: 1 }, { azimuth: 2, polar: 0.5 }, Infinity).duration).toBe(0);
    expect(orbitTransition({ azimuth: 0, polar: 1 }, { azimuth: 1e-7, polar: 1 }, 1).duration).toBe(0);
  });

  it("should take the arc inside the azimuth limits, not the shortest one", () => {
    const limits = { minAzimuthAngle: -1, maxAzimuthAngle: 3 };
    expect(orbitTransition({ azimuth: 3, polar: 1 }, { azimuth: -1, polar: 1 }, 1).azimuth).toBeCloseTo(
      2 * Math.PI - 4,
      12
    );
    expect(orbitTransition({ azimuth: 3, polar: 1 }, { azimuth: -1, polar: 1 }, 1, limits).azimuth).toBe(-4);
  });
});

describe("sample", () => {
  it("should write the orbit up on the last frame and the screen up while a roll eases out (L2)", () => {
    const up = new Vector3(0, 1, 0);
    const flight = orbitFlight(frame, up, { azimuth: 0, polar: 1, roll: 1 }, { azimuth: 1, polar: 1 }, 1);
    const out = { quaternion: new Quaternion(), up: new Vector3() };
    sample(flight, flight.duration / 2, out);
    expect(out.up.distanceTo(new Vector3(0, 1, 0).applyQuaternion(out.quaternion))).toBeLessThan(1e-12);
    expect(out.up.distanceTo(up)).toBeGreaterThan(0.1);
    expect(sample(flight, flight.duration, out)).toBe(true);
    expect(out.up).toEqual(up);
  });

  it("should land a rigid flight exactly on its end", () => {
    const from = new Quaternion();
    const to = new Quaternion().setFromAxisAngle(new Vector3(1, 2, 3).normalize(), 2);
    const flight = rigidFlight(from, to, 1);
    const out = { quaternion: new Quaternion(), up: new Vector3() };
    expect(sample(flight, 0, out)).toBe(false);
    expect(out.quaternion.equals(from)).toBe(true);
    expect(sample(flight, flight.duration, out)).toBe(true);
    expect(out.quaternion.equals(to)).toBe(true);
    expect(out.up.distanceTo(flight.up)).toBeLessThan(1e-12);
  });

  it("should allocate nothing per frame (I4)", () => {
    const flights = [
      orbitFlight(frame, frame.u, { azimuth: 0, polar: 1, roll: 0.7 }, { azimuth: 2, polar: 2 }, 1),
      rigidFlight(new Quaternion(), new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 2), 1),
    ];
    const out = { quaternion: new Quaternion(), up: new Vector3() };
    // Elapsed times boxed once, up front: a fresh double passed to a call the JIT does not inline is boxed by the
    // caller (16 B), which is the host's frame and not `sample`.
    const elapsed: unknown[] = [{}];
    elapsed.length = 0;
    for (let i = 0; i < 97; i++) elapsed.push(i / 300);
    const run = (count: number) => {
      for (let i = 0; i < count; i++) sample(flights[i & 1], elapsed[i % 97] as number, out);
    };
    run(200_000); // warm-up: JIT tier-up and its own allocations stay out of the measurement

    // Bytes per call in short batches between full collections. A batch allocating 16 B per call (160 KB) stays well
    // below the young generation, so no scavenge hides it; the median drops a batch a stray collection disturbed.
    const calls = 10_000;
    const perCall: number[] = [];
    for (let batch = 0; batch < 15; batch++) {
      gc();
      const before = process.memoryUsage().heapUsed;
      run(calls);
      perCall.push((process.memoryUsage().heapUsed - before) / calls);
    }
    const median = perCall.sort((x, y) => x - y)[7];
    // `sample` owns none of I4's 256 B per animating frame: a single Vector3 (about 40 B) fails this.
    expect(median).toBeLessThan(8);
  });
});
