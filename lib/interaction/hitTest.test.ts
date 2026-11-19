import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Matrix4, Quaternion, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { resolveOptions } from "../options/resolve";
import { labelFrame } from "../orbit/labelFrame";
import { targetTable, type TargetEntry } from "../orbit/targets";
import { createInternalCamera } from "../render/internalCamera";
import { roundedCubeBox } from "../scene/roundedBox";
import { classifyPoint, hitTest, PRIORITY_DEPTH, sphereDiscs, type HitBox, type HitScene } from "./hitTest";

type Up = "x" | "y" | "z";
type View = { variant: string; up: Up; quaternion: number[]; hits: string };
const fixture: { grid: number; views: View[] } = JSON.parse(
  readFileSync(resolve(__dirname, "__fixtures__/hitTest.v230.json"), "utf8")
);
const { grid } = fixture;

/** The recorder's encoding: the sign triple of the hit's direction, `.` for none. */
const CODES = "abcdefghijklmnopqrstuvwxyz{";
const code = (target: TargetEntry | null) => {
  if (!target) return ".";
  const { x, y, z } = target.direction;
  return CODES[(Math.sign(x) + 1) * 9 + (Math.sign(y) + 1) * 3 + (Math.sign(z) + 1)];
};
const kindOf = (cell: string) => {
  const index = CODES.indexOf(cell);
  const zeros = [Math.floor(index / 9), Math.floor(index / 3) % 3, index % 3].filter((s) => s === 1).length;
  return (["corner", "edge", "face"] as const)[zeros];
};

/**
 * The edge tolerance: where the analytic answer differs from 2.3.0's, 2.3.0 gives the same answer within this many
 * cells (Chebyshev). One cell is 1/32 of the element, 4 px at the default 128 px size.
 */
const TOLERANCE = 2;

const upVector = (up: Up) => new Vector3().setComponent("xyz".indexOf(up), 1);

const CUBE: HitBox = { type: "box", radius: 0, flat: 0.7, corner: 0.65 };

/** The hit scene K5 would build for a fixture variant from 2.3.0's default options. */
function sceneFor(variant: string, up: Up, orientation: Quaternion): HitScene {
  const frame = labelFrame(upVector(up));
  const targets = targetTable(frame);
  const isSphere = variant.startsWith("sphere");
  const options = resolveOptions({ type: isSphere ? "sphere" : (variant as "cube" | "rounded-cube") }, { up: upVector(up) });
  const shape = isSphere
    ? sphereDiscs(targets, (target) =>
        target.kind === "face"
          ? options[frame.faces[target.name as keyof typeof frame.faces].end].scale / 2
          : options[target.kind === "corner" ? "corners" : "edges"].scale / 2
      )
    : variant === "cube"
      ? CUBE
      : roundedCubeBox(options.corners.radius);
  return {
    orientation,
    camera: createInternalCamera(isSphere),
    shape,
    targets,
    // The default sphere draws only its faces.
    enabled: variant === "sphere" ? (target) => target.kind === "face" : undefined,
  };
}

const ndc = (cell: number): [number, number] => [
  (((cell % grid) + 0.5) / grid) * 2 - 1,
  -((Math.floor(cell / grid) + 0.5) / grid) * 2 + 1,
];

function analyticGrid({ variant, up, quaternion }: View) {
  const scene = sceneFor(variant, up, new Quaternion().fromArray(quaternion).invert());
  let hits = "";
  for (let cell = 0; cell < grid * grid; cell++) hits += code(hitTest(...ndc(cell), scene));
  return hits;
}

/** Whether a fixture cell within the tolerance of `cell` says `value`. */
function nearby(expected: string, cell: number, value: string) {
  const row = Math.floor(cell / grid);
  const column = cell % grid;
  for (let r = Math.max(0, row - TOLERANCE); r <= Math.min(grid - 1, row + TOLERANCE); r++)
    for (let c = Math.max(0, column - TOLERANCE); c <= Math.min(grid - 1, column + TOLERANCE); c++)
      if (expected[r * grid + c] === value) return true;
  return false;
}

describe("hitTest against the recorded 2.3.0 raycaster", () => {
  const variants = [...new Set(fixture.views.map((view) => view.variant))];

  it("should cover 26 views of every type on all three up axes", () => {
    expect(variants).toEqual(["cube", "rounded-cube", "sphere", "sphere-all"]);
    for (const variant of variants)
      for (const up of ["x", "y", "z"]) {
        expect(fixture.views.filter((view) => view.variant === variant && view.up === up)).toHaveLength(26);
      }
  });

  it.each(variants)("should classify the %s grid within the edge tolerance", (variant) => {
    const tally = { cells: 0, exact: 0, nearby: 0, holes: 0, beyond: 0, fills: 0, rims: 0 };
    for (const view of fixture.views.filter((candidate) => candidate.variant === variant)) {
      const actual = analyticGrid(view);
      const present = new Set(view.hits);
      for (let cell = 0; cell < actual.length; cell++) {
        const [got, want] = [actual[cell], view.hits[cell]];
        tally.cells++;
        if (got === want) tally.exact++;
        else if (nearby(view.hits, cell, got)) tally[want === "." ? "fills" : "nearby"]++;
        else if (got === ".") tally.holes++;
        // 2.3.0's cube is separate tiles, and an edge's or corner's tile seen edge-on draws nothing: where the view
        // shows that target nowhere, the closed box's rim still names it.
        else if (want === "." && variant === "cube" && kindOf(got) !== "face" && !present.has(got)) tally.rims++;
        else tally.beyond++;
      }
    }
    console.log(variant, JSON.stringify(tally));
    expect(tally.holes).toBe(0);
    expect(tally.beyond).toBe(0);
    if (variant !== "cube") expect(tally.rims).toBe(0);
  });
});

describe("hitTest", () => {
  const targets = targetTable(labelFrame({ x: 0, y: 1, z: 0 }));
  const named = (name: string) => targets.find((target) => target.name === name)!;
  // Looking from +Z (Front, Y up): the gizmo's rotation is the identity.
  const front = new Quaternion();

  it("should land a hit before the first render, from a camera whose world matrix was never updated", () => {
    const camera = createInternalCamera(false);
    expect(camera.matrixWorld.equals(new Matrix4())).toBe(true);
    expect(hitTest(0, 0, { orientation: front, camera, shape: CUBE, targets })?.name).toBe("front");

    const ortho = createInternalCamera(true);
    const shape = sphereDiscs(targets, () => 0.35);
    expect(hitTest(0, 0, { orientation: front, camera: ortho, shape, targets })?.name).toBe("front");
  });

  it("should follow the gizmo's orientation", () => {
    const camera = createInternalCamera(false);
    // The host camera looks from +X: the gizmo turns by the inverse of its rotation.
    const host = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
    expect(hitTest(0, 0, { orientation: host.clone().invert(), camera, shape: CUBE, targets })?.name).toBe("right");
  });

  it("should miss outside the box", () => {
    const camera = createInternalCamera(false);
    expect(hitTest(0.95, 0.95, { orientation: front, camera, shape: roundedCubeBox(0.3), targets })).toBeNull();
  });

  it("should refuse a gated target instead of hitting what lies behind it", () => {
    const camera = createInternalCamera(false);
    const scene = { orientation: front, camera, targets };
    camera.updateMatrixWorld();
    const corner = new Vector3(0.9, 0.9, 1).project(camera);
    expect(hitTest(corner.x, corner.y, { ...scene, shape: CUBE })?.name).toBe("top-front-right");
    const noCorners = (target: TargetEntry) => target.kind !== "corner";
    expect(hitTest(corner.x, corner.y, { ...scene, shape: CUBE, enabled: noCorners })).toBeNull();
    const noFront = (target: TargetEntry) => target.name !== "front";
    expect(hitTest(0, 0, { ...scene, shape: CUBE, enabled: noFront })).toBeNull();
  });

  it("should hit the sphere's disc behind a gated one", () => {
    const camera = createInternalCamera(true);
    const shape = sphereDiscs(targets, () => 0.35);
    const noFront = (target: TargetEntry) => target.name !== "front";
    expect(hitTest(0, 0, { orientation: front, camera, shape, targets, enabled: noFront })?.name).toBe("back");
  });

  // Regression (3.0.0-beta.1 shrank the rounded cube's corners to their rounded patches, so a small `radius` left a
  // corner almost nothing to hover): a pointer near a corner, on the face or edge beside it, still hits the corner.
  it.each([0.05, 0.3])("should hit a rounded cube's corner from the face and edge beside it at radius %s", (radius) => {
    const camera = createInternalCamera(false);
    camera.updateMatrixWorld();
    const scene = { orientation: front, camera, targets, shape: roundedCubeBox(radius) };
    const flat = 1 - radius;
    const at = (x: number, y: number, z: number) => {
      const { x: px, y: py } = new Vector3(x, y, z).project(camera);
      return hitTest(px, py, scene)?.name;
    };
    // On the Front face, between the band's edge and the rounded patch.
    const inside = flat - PRIORITY_DEPTH / 2;
    expect(at(inside, inside, 1)).toBe("top-front-right");
    expect(at(-inside, -inside, 1)).toBe("bottom-front-left");
    // On the Top-Front edge's rounding, beside the corner.
    const arc = flat + radius * Math.SQRT1_2;
    expect(at(inside, arc, arc)).toBe("top-front-right");
    // Outside the band, the face and the edge keep their pointer.
    const outside = flat - PRIORITY_DEPTH * 1.5;
    expect(at(outside, outside, 1)).toBe("front");
    expect(at(outside, arc, arc)).toBe("top-front");
  });

  // 3.0.0-beta.3 caught an edge only on its drawn strip, `radius` wide: 0.05 at radius 0.05. `edges.hitSize` defaults
  // to the strip plus 0.1, at least 0.15, so a pointer 0.1 in from the edge lands on it; the face keeps the rest.
  it("should hit a small-radius rounded cube's edge from 0.1 in on the face beside it", () => {
    const camera = createInternalCamera(false);
    camera.updateMatrixWorld();
    const radius = 0.05;
    const at = (shape: HitBox, x: number, y: number) => {
      const p = new Vector3(x, y, 1).project(camera);
      return hitTest(p.x, p.y, { orientation: front, camera, targets, shape })?.name;
    };
    const box = roundedCubeBox(radius);
    expect(at(box, 0, 0.9)).toBe("top-front");
    expect(at(box, 0.9, 0)).toBe("front-right");
    expect(at(box, 0, 0.8)).toBe("front");
    // Before: the drawn strip only.
    expect(at({ ...box, flat: 1 - radius }, 0, 0.9)).toBe("front");
    // Wider from the option; the corner, tested first, keeps its band.
    const wide = roundedCubeBox(radius, { corners: 0.25, edges: 0.3 });
    expect(at(wide, 0, 0.75)).toBe("top-front");
    expect(at(wide, 0.8, 0.8)).toBe("top-front-right");
  });

  // At the default radius 0.3 the drawn strip is 0.3 wide and the corner band 0.5: the edge band reaches 0.1 beyond its
  // strip (0.4), as the corner's reaches 0.2 beyond its patch, so the face keeps its inner 60 %.
  it("should hit a default rounded cube's edge from 0.1 beyond its drawn strip, as the corner from 0.2", () => {
    const camera = createInternalCamera(false);
    camera.updateMatrixWorld();
    const radius = 0.3;
    const at = (shape: HitBox, x: number, y: number) => {
      const p = new Vector3(x, y, 1).project(camera);
      return hitTest(p.x, p.y, { orientation: front, camera, targets, shape })?.name;
    };
    const box = roundedCubeBox(radius);
    expect(box.flat).toBeCloseTo(0.6, 12);
    expect(box.corner).toBeCloseTo(0.5, 12);
    // 0.35 in from an edge: on the face's drawn region, inside the band.
    expect(at(box, 0, 0.65)).toBe("top-front");
    expect(at(box, 0.65, 0)).toBe("front-right");
    expect(at(box, -0.65, 0)).toBe("front-left");
    expect(at(box, 0, -0.65)).toBe("bottom-front");
    // 0.45 in: the face.
    expect(at(box, 0, 0.55)).toBe("front");
    expect(at(box, 0.55, 0)).toBe("front");
    // The corner, tested first, keeps its zone, on the edge band and beyond it.
    expect(at(box, 0.65, 0.65)).toBe("top-front-right");
    expect(at(box, 0.55, 0.55)).toBe("top-front-right");
    expect(at(box, 0.45, 0.65)).toBe("top-front");
    // An explicit `edges.hitSize` of the radius restores the drawn strip only.
    const strip = roundedCubeBox(radius, { corners: 0.5, edges: radius });
    expect(at(strip, 0, 0.65)).toBe("front");
    expect(at(strip, 0, 0.75)).toBe("top-front");
    expect(at(strip, 0.65, 0.65)).toBe("top-front-right");
  });

  it("should keep a large-radius rounded cube's face centre and corner patches", () => {
    const camera = createInternalCamera(false);
    camera.updateMatrixWorld();
    const radius = 0.8;
    const box = roundedCubeBox(radius);
    // The bands never reach past half the drawn flat face, nor stop short of the rounded patch.
    const drawnFlat = 1 - radius;
    expect(box.corner).toBeCloseTo(drawnFlat / 2, 12);
    expect(box.flat).toBeCloseTo(drawnFlat / 2, 12);
    const scene = { orientation: front, camera, targets, shape: box };
    expect(hitTest(0, 0, scene)?.name).toBe("front");
    const { x, y } = new Vector3(box.flat * 0.4, box.flat * 0.4, 1).project(camera);
    expect(hitTest(x, y, scene)?.name).toBe("front");
  });

  it("should give a corner priority over a nearer face within the priority depth only", () => {
    const camera = createInternalCamera(true);
    const discs = (behind: number) => ({
      type: "discs" as const,
      discs: [
        { target: named("front"), center: new Vector3(0, 0, 1), radius: 0.5 },
        { target: named("top-front-right"), center: new Vector3(0, 0, 1 - behind), radius: 0.5 },
      ],
    });
    const scene = { orientation: front, camera, targets };
    expect(hitTest(0, 0, { ...scene, shape: discs(PRIORITY_DEPTH * 0.75) })?.name).toBe("top-front-right");
    expect(hitTest(0, 0, { ...scene, shape: discs(PRIORITY_DEPTH * 1.5) })?.name).toBe("front");
  });
});

describe("classifyPoint", () => {
  const targets = targetTable(labelFrame({ x: 0, y: 0, z: 1 }));
  const box = { type: "box", radius: 0.3, flat: 0.7, corner: 0.5 } as const;
  const at = (x: number, y: number, z: number) => classifyPoint({ x, y, z }, box, targets)?.name;

  it("should name a face, an edge or a corner by the coordinates beyond the face region", () => {
    // Z up, front −Y, right +X.
    expect(at(0, 0, 1)).toBe("top");
    expect(at(0.7, 0, 1)).toBe("top");
    expect(at(0.8, 0, 1)).toBe("top-right");
    expect(at(0.8, -0.8, 0.9)).toBe("top-front-right");
  });

  it("should give a corner the points beyond `corner` on all three axes, on a face or an edge", () => {
    expect(at(0.6, -0.6, 1)).toBe("top-front-right");
    expect(at(0.6, -0.4, 1)).toBe("top");
  });

  it("should partition every surface point into one of the 26 targets", () => {
    const seen = new Set<string>();
    for (let i = -10; i <= 10; i++)
      for (let j = -10; j <= 10; j++)
        for (const [x, y, z] of [
          [1, i / 10, j / 10],
          [i / 10, -1, j / 10],
          [i / 10, j / 10, 1],
        ]) {
          const name = at(x, y, z);
          expect(name).toBeDefined();
          seen.add(name!);
        }
    // The three faces sampled, their three shared edges and corner, and those edges' and corners' neighbours.
    expect(seen.size).toBe(3 + 9 + 7);
  });
});

describe("hitTest cost", () => {
  it("should average at most 10 µs per call", () => {
    const view = fixture.views.find((candidate) => candidate.variant === "rounded-cube")!;
    const sphere = fixture.views.find((candidate) => candidate.variant === "sphere-all")!;
    const scenes = [view, sphere].map(({ variant, up, quaternion }) =>
      sceneFor(variant, up, new Quaternion().fromArray(quaternion).invert())
    );
    const points = Array.from({ length: grid * grid }, (_, cell) => ndc(cell));
    for (const scene of scenes) {
      for (const [x, y] of points) hitTest(x, y, scene); // warm up
      const rounds = 50;
      const start = performance.now();
      for (let round = 0; round < rounds; round++) for (const [x, y] of points) hitTest(x, y, scene);
      const mean = ((performance.now() - start) * 1000) / (rounds * points.length);
      console.log(`hitTest ${scene.shape.type}: mean ${mean.toFixed(3)} µs over ${rounds * points.length} calls`);
      expect(mean).toBeLessThanOrEqual(10);
    }
  });

  it("should allocate no three.js object per call", () => {
    // Everything after `hitTest`'s declaration runs per call; the scratch vectors above it are made once.
    const source = readFileSync(resolve(__dirname, "hitTest.ts"), "utf8");
    const perCall = source.slice(source.indexOf("export function hitTest("));
    expect(perCall).not.toMatch(/\bnew\s|\.clone\(|\.map\(|\.\.\./);
  });
});

// The 26 targets of each type by real mouse, hover and click: tests/browser/views.spec.ts (H1).
