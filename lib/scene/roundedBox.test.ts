import { Mesh, Vector3, type BufferAttribute } from "three";
import { describe, expect, it } from "vitest";
import { classifyPoint } from "../interaction/hitTest";
import { targetTable } from "../orbit/targets";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { buildScene } from "./build";
import { cubeBox, defaultHitSizes, roundedCubeBox, roundedCubeDrawnBox } from "./roundedBox";

const UPS = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [-1, 0, 0],
  [0, -1, 0],
  [0, 0, -1],
] as const;

const build = (options: GizmoOptions, up: readonly number[] = [0, 1, 0]) =>
  buildScene(resolveOptions({ type: "rounded-cube", ...options }, { up: new Vector3(...up) }));

/** Each piece's triangles in gizmo space (pieces sit at the origin, unrotated, at scale 1). */
function pieces(scene: ReturnType<typeof build>) {
  return scene.targets.map(({ entry, object }) => {
    const mesh = object as Mesh;
    expect(mesh.position.length()).toBe(0);
    expect(mesh.quaternion.w).toBe(1);
    const position = mesh.geometry.getAttribute("position") as BufferAttribute;
    const vertices = Array.from({ length: position.count }, (_, i) => new Vector3().fromBufferAttribute(position, i));
    return { entry, mesh, vertices };
  });
}

const key = (v: Vector3) => `${v.x},${v.y},${v.z}`;

/** Signed distance from the rounded box `[-1, 1]³` with edges and corners of `radius`. */
function distance(v: Vector3, radius: number) {
  const half = 1 - radius;
  const q = new Vector3(Math.abs(v.x) - half, Math.abs(v.y) - half, Math.abs(v.z) - half);
  const outside = new Vector3(Math.max(q.x, 0), Math.max(q.y, 0), Math.max(q.z, 0)).length();
  return outside + Math.min(Math.max(q.x, q.y, q.z), 0) - radius;
}

describe("roundedBoxGeometry", () => {
  const cases = UPS.flatMap((up) => [0, 0.1, 0.3, 0.45].map((radius) => [up.join(","), radius, up] as const));

  it.each(cases)("partitions the box by classifyPoint on up %s, radius %s", (_, radius, up) => {
    const scene = build({ radius }, up);
    // The pieces are drawn without the hit box's bands: corners are exactly the rounded patches.
    const box = roundedCubeDrawnBox(radius);
    const table = targetTable(scene.frame);
    const owners = new Map<string, Set<string>>();
    for (const { entry, vertices } of pieces(scene)) {
      expect(vertices.length).toBeGreaterThan(0);
      for (let i = 0; i < vertices.length; i += 3) {
        // Every triangle lies in its target's region: its centroid classifies to it.
        const centroid = vertices[i].clone().add(vertices[i + 1]).add(vertices[i + 2]).divideScalar(3);
        expect(classifyPoint(centroid, box, table)?.name).toBe(entry.name);
      }
      for (const v of vertices) {
        expect(Math.abs(distance(v, box.radius))).toBeLessThan(1e-6);
        (owners.get(key(v)) ?? owners.set(key(v), new Set()).get(key(v))!).add(entry.name);
      }
    }
    // A vertex in one piece only classifies to that piece; one on a boundary is shared, at one exact position.
    for (const [position, names] of owners) {
      const [x, y, z] = position.split(",").map(Number);
      const name = classifyPoint({ x, y, z }, box, table)?.name;
      if (names.size === 1) expect(names).toContain(name);
    }
  });

  // Regression (3.0.0-beta.0 drew the pieces from the hit box, whose corner band cut a square notch out of every face):
  // each face piece is the whole flat square, however far the corners' hit band reaches.
  it.each([0.05, 0.3, 0.45, 0.8])("draws every face as a whole square, without a notch, at radius %s", (radius) => {
    const { flat } = roundedCubeDrawnBox(radius);
    expect(roundedCubeBox(radius).corner).toBeLessThan(flat);
    for (const { entry, vertices } of pieces(build({ radius }))) {
      if (entry.kind !== "face") continue;
      let area = 0;
      for (let i = 0; i < vertices.length; i += 3) {
        const [a, b, c] = vertices.slice(i, i + 3);
        area += b.clone().sub(a).cross(c.clone().sub(a)).length() / 2;
        // Flat on the face plane, within the square.
        for (const v of [a, b, c]) {
          expect(v.dot(entry.direction)).toBeCloseTo(1, 6);
          for (const axis of ["x", "y", "z"] as const) expect(Math.abs(v[axis])).toBeLessThanOrEqual(1 + 1e-6);
        }
      }
      expect(area).toBeCloseTo(4 * flat * flat, 6);
    }
  });

  it.each([0.05, 0.3, 0.8])("hits each drawn corner patch as its corner at radius %s", (radius) => {
    const scene = build({ radius });
    const hit = roundedCubeBox(radius);
    const table = targetTable(scene.frame);
    for (const { entry, vertices } of pieces(scene)) {
      if (entry.kind !== "corner") continue;
      for (let i = 0; i < vertices.length; i += 3) {
        const centroid = vertices[i].clone().add(vertices[i + 1]).add(vertices[i + 2]).divideScalar(3);
        expect(classifyPoint(centroid, hit, table)?.name).toBe(entry.name);
      }
    }
  });

  it.each(cases)("closes with no gap or seam on up %s, radius %s", (_, radius, up) => {
    // A closed, consistently wound surface: every edge of every piece is met once in each direction.
    const edges = new Map<string, number>();
    for (const { vertices } of pieces(build({ radius }, up))) {
      for (let i = 0; i < vertices.length; i += 3) {
        for (let k = 0; k < 3; k++) {
          const edge = `${key(vertices[i + k])}>${key(vertices[i + ((k + 1) % 3)])}`;
          edges.set(edge, (edges.get(edge) ?? 0) + 1);
        }
      }
    }
    for (const [edge, count] of edges) {
      const [a, b] = edge.split(">");
      expect(count).toBe(1);
      expect(edges.get(`${b}>${a}`)).toBe(1);
    }
  });

  it("winds every triangle outward and gives it an outward normal", () => {
    for (const { mesh, vertices } of pieces(build({}))) {
      const normal = mesh.geometry.getAttribute("normal") as BufferAttribute;
      for (let i = 0; i < vertices.length; i += 3) {
        const [a, b, c] = vertices.slice(i, i + 3);
        const centroid = a.clone().add(b).add(c);
        const face = b.clone().sub(a).cross(c.clone().sub(a));
        if (face.length() > 1e-12) expect(face.dot(centroid)).toBeGreaterThan(0);
        expect(new Vector3().fromBufferAttribute(normal, i).dot(a)).toBeGreaterThan(0);
      }
    }
  });

  it.each([1, 18, 32, 1000])("draws at most 15,000 triangles at smoothness %s", (smoothness) => {
    const triangles = pieces(build({ smoothness })).reduce((sum, { vertices }) => sum + vertices.length / 3, 0);
    expect(triangles).toBeLessThanOrEqual(15_000);
  });

  it.each(UPS.map((up) => [up.join(","), up] as const))("maps each face label upright along textUp on up %s", (_, up) => {
    const scene = build({}, up);
    const flat = roundedCubeDrawnBox(0.3).flat;
    for (const { entry, mesh, vertices } of pieces(scene)) {
      // Every piece has UVs (one program for all targets); an edge's or corner's sample one white texel.
      const uv = mesh.geometry.getAttribute("uv") as BufferAttribute;
      if (entry.kind !== "face") {
        expect(new Set(uv.array)).toEqual(new Set([0]));
        continue;
      }
      const { textUp, direction } = scene.frame.faces[entry.faces[0]];
      const right = new Vector3().crossVectors(textUp, direction);
      vertices.forEach((v, i) => {
        expect(uv.getX(i)).toBeCloseTo(v.dot(right) / (2 * flat) + 0.5, 6);
        expect(uv.getY(i)).toBeCloseTo(v.dot(textUp) / (2 * flat) + 0.5, 6);
        expect(uv.getX(i)).toBeGreaterThanOrEqual(-1e-6);
        expect(uv.getY(i)).toBeLessThanOrEqual(1 + 1e-6);
      });
    }
  });
  // Regression (S6's report of an upside-down "Top"): the rounded cube's labels read exactly as the plain cube's on
  // every up, so any orientation question belongs to the label frame (O1), not to these UVs.
  it.each(UPS.map((up) => [up.join(","), up] as const))("orients each label as the plain cube does on up %s", (_, up) => {
    const cube = buildScene(resolveOptions({ type: "cube" }, { up: new Vector3(...up) }));
    for (const { entry, mesh, vertices } of pieces(build({}, up))) {
      if (entry.kind !== "face") continue;
      const uv = mesh.geometry.getAttribute("uv") as BufferAttribute;
      // The texture's right and up on the surface: on the flat face, u and v grow linearly along them. Each distinct
      // vertex counts once, so triangles repeating a corner vertex do not lean the sums along their diagonals.
      const right = new Vector3();
      const top = new Vector3();
      const seen = new Set<string>();
      vertices.forEach((v, i) => {
        const key = v.toArray().map((c) => c.toFixed(6)).join(",");
        if (seen.has(key)) return;
        seen.add(key);
        right.addScaledVector(v, uv.getX(i) - 0.5);
        top.addScaledVector(v, uv.getY(i) - 0.5);
      });
      const plain = cube.targets.find((t) => t.target.name === entry.name)!.object;
      const along = (x: number, y: number) => new Vector3(x, y, 0).applyQuaternion(plain.quaternion);
      const normal = entry.direction;
      const project = (v: Vector3) => v.sub(normal.clone().multiplyScalar(v.dot(normal))).normalize();
      // A flip or a quarter turn would be at or below 0.
      expect(project(right).dot(along(1, 0))).toBeGreaterThan(0.99);
      expect(project(top).dot(along(0, 1))).toBeGreaterThan(0.99);
    }
  });
});

/** 3.0.0-beta.3's rounded-cube hit box, before the hit sizes were options. */
const beta3Box = (radius: number) => {
  const flat = 1 - radius;
  return { type: "box", radius, flat, corner: Math.max(flat - 0.2, flat / 2) };
};

describe("hit sizes", () => {
  const resolved = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });
  const sizes = (options: GizmoOptions) => {
    const o = resolved(options);
    return { corners: o.corners.hitSize, edges: o.edges.hitSize };
  };

  it.each([0.05, 0.1, 0.3, 0.6, 0.8])("resolves the corner band of 3.0.0-beta.3 at radius %s", (radius) => {
    const box = roundedCubeBox(radius, sizes({ type: "rounded-cube", radius }));
    const before = beta3Box(radius);
    expect(box.radius).toBe(before.radius);
    expect(box.corner).toBeCloseTo(before.corner, 12);
    expect(roundedCubeBox(radius)).toEqual(box);
  });

  // Edges reach 0.1 beyond their drawn strip, as corners reach 0.2 beyond their patch: `min(max(r + 0.1, 0.15),
  // (1 + r) / 2)`. The 0.15 floor acts below radius 0.05 only; the half-face cap from radius 0.8 up.
  it.each([
    [0.001, 0.201, 0.15],
    [0.05, 0.25, 0.15],
    [0.1, 0.3, 0.2],
    [0.3, 0.5, 0.4],
    [0.6, 0.8, 0.7],
    [0.8, 0.9, 0.9],
    [0.999, 0.9995, 0.9995],
  ])("resolves the default hit sizes at radius %s: corners %s, edges %s", (radius, corners, edges) => {
    const given = sizes({ type: "rounded-cube", radius });
    expect(given.corners).toBeCloseTo(corners, 12);
    expect(given.edges).toBeCloseTo(edges, 12);
    expect(defaultHitSizes("rounded-cube", radius)).toEqual(given);
    // Never narrower than the drawn strip, and the face keeps its centre.
    const box = roundedCubeBox(radius, given);
    expect(box.flat).toBeCloseTo(1 - edges, 12);
    expect(box.flat).toBeLessThan(roundedCubeDrawnBox(radius).flat);
    expect(box.flat).toBeGreaterThanOrEqual(roundedCubeDrawnBox(radius).flat / 2 - 1e-12);
    expect(box.corner).toBeLessThanOrEqual(box.flat + 1e-12);
  });

  it("restores the drawn-strip-only edge from an explicit `edges.hitSize` of the radius", () => {
    for (const radius of [0.05, 0.3, 0.6]) {
      const box = roundedCubeBox(radius, sizes({ type: "rounded-cube", radius, edges: { hitSize: radius } }));
      expect(box.flat).toBeCloseTo(roundedCubeDrawnBox(radius).flat, 12);
      expect(box.corner).toBeCloseTo(beta3Box(radius).corner, 12);
    }
  });

  it("resolves the documented defaults for each type", () => {
    expect(sizes({ type: "cube" })).toEqual({ corners: 0.35, edges: 0.3 });
    expect(sizes({ type: "sphere" })).toEqual({ corners: 0.35, edges: 0.3 });
    expect(sizes({ type: "rounded-cube" })).toEqual({ corners: 0.5, edges: 0.4 });
    expect(sizes({ type: "rounded-cube", radius: 0.05 }).corners).toBeCloseTo(0.25, 12);
    expect(sizes({ type: "rounded-cube", radius: 0.05 }).edges).toBeCloseTo(0.15, 12);
    expect(sizes({ type: "rounded-cube", radius: 0.8 }).corners).toBeCloseTo(0.9, 12);
    expect(sizes({ type: "rounded-cube", radius: 0.8 }).edges).toBeCloseTo(0.9, 12);
    // A caller's value is kept as given; the hit box clamps it.
    const given = sizes({ type: "rounded-cube", corners: { hitSize: 2 }, edges: { hitSize: 0 } });
    expect(given).toEqual({ corners: 2, edges: 0 });
    expect(defaultHitSizes("rounded-cube", 0)).toEqual(defaultHitSizes("rounded-cube", 1e-3));
  });

  it("keeps the plain cube's 2.3.0 hit box by default", () => {
    expect(cubeBox(sizes({ type: "cube" }))).toEqual({ type: "box", radius: 0, flat: 0.7, corner: 0.65 });
    expect(cubeBox()).toEqual({ type: "box", radius: 0, flat: 0.7, corner: 0.65 });
  });

  it("widens the bands from the options", () => {
    expect(roundedCubeBox(0.05, { corners: 0.4, edges: 0.25 })).toMatchObject({ flat: 0.75, corner: 0.6 });
    expect(cubeBox({ corners: 0.5, edges: 0.4 })).toMatchObject({ flat: 0.6, corner: 0.5 });
  });

  it("clamps a hit size below the radius to the radius, and one of 1 or more to just below 1", () => {
    const small = roundedCubeBox(0.3, { corners: 0.1, edges: 0 });
    expect(small.corner).toBeCloseTo(0.7, 12);
    expect(small.flat).toBeCloseTo(0.7, 12);
    for (const size of [1, 5]) {
      const large = roundedCubeBox(0.3, { corners: size, edges: size });
      expect(large.corner).toBeGreaterThan(0);
      expect(large.corner).toBeLessThan(1e-3);
      expect(large.flat).toBeGreaterThan(0);
      expect(large.flat).toBeLessThan(1e-3);
    }
    // The plain cube: corners from 0, edges never narrower than the gap between its tiles.
    expect(cubeBox({ corners: -1, edges: 0 })).toMatchObject({ corner: 1, flat: 0.7 });
    expect(cubeBox({ corners: 1, edges: 1 }).corner).toBeGreaterThan(0);
    expect(cubeBox({ corners: 1, edges: 1 }).flat).toBeGreaterThan(0);
  });

  it.each([0.05, 0.3])("draws the same pieces whatever the hit sizes at radius %s", (radius) => {
    const plain = pieces(build({ radius }));
    const wide = pieces(build({ radius, corners: { hitSize: 0.6 }, edges: { hitSize: 0.5 } }));
    expect(wide.map(({ entry, vertices }) => [entry.name, vertices.map(key)])).toEqual(
      plain.map(({ entry, vertices }) => [entry.name, vertices.map(key)])
    );
  });
});
