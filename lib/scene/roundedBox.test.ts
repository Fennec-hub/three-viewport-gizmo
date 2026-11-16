import { Mesh, Vector3, type BufferAttribute } from "three";
import { describe, expect, it } from "vitest";
import { classifyPoint } from "../interaction/hitTest";
import { targetTable } from "../orbit/targets";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { buildScene } from "./build";
import { roundedCubeBox } from "./roundedBox";

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
    const box = roundedCubeBox(radius);
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
    const flat = roundedCubeBox(0.3).flat;
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
      // The texture's right and up on the surface: on the flat face, u and v grow linearly along them.
      const right = new Vector3();
      const top = new Vector3();
      vertices.forEach((v, i) => {
        right.addScaledVector(v, uv.getX(i) - 0.5);
        top.addScaledVector(v, uv.getY(i) - 0.5);
      });
      const plain = cube.targets.find((t) => t.target.name === entry.name)!.object;
      const along = (x: number, y: number) => new Vector3(x, y, 0).applyQuaternion(plain.quaternion);
      const normal = entry.direction;
      const project = (v: Vector3) => v.sub(normal.clone().multiplyScalar(v.dot(normal))).normalize();
      // The vertex sums lean with the triangle diagonals; a flip or a quarter turn would be at or below 0.
      expect(project(right).dot(along(1, 0))).toBeGreaterThan(0.99);
      expect(project(top).dot(along(0, 1))).toBeGreaterThan(0.99);
    }
  });
});
