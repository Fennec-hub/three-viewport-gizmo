import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { labelFrame } from "./labelFrame";
import { targetTable } from "./targets";

describe("targetTable", () => {
  const frame = labelFrame({ x: 0, y: 0, z: 1 });
  const table = targetTable(frame);

  it("should list 6 faces, 12 edges and 8 corners with unique names", () => {
    expect(table.filter((t) => t.kind === "face")).toHaveLength(6);
    expect(table.filter((t) => t.kind === "edge")).toHaveLength(12);
    expect(table.filter((t) => t.kind === "corner")).toHaveLength(8);
    expect(new Set(table.map((t) => t.name)).size).toBe(26);
  });

  it("should give every target a distinct unit direction", () => {
    for (const { direction } of table) expect(direction.length()).toBeCloseTo(1, 12);
    const keys = table.map(({ direction: d }) => d.toArray().map((c) => Math.round(c * 1e6)).join());
    expect(new Set(keys).size).toBe(26);
  });

  it("should name each target by the faces it joins, vertical, depth, lateral", () => {
    const corner = table.find((t) => t.name === "top-front-right")!;
    expect(corner.kind).toBe("corner");
    expect(corner.faces).toEqual(["top", "front", "right"]);
    // Z up, front −Y, right +X.
    expect(corner.direction.distanceTo(new Vector3(1, -1, 1).normalize())).toBeCloseTo(0, 12);
    expect(table.find((t) => t.name === "back-left")!.direction.distanceTo(new Vector3(-1, 1, 0).normalize())).toBeCloseTo(0, 12);
  });

  it("should point each face target along its labelled face", () => {
    for (const target of table.filter((t) => t.kind === "face")) {
      expect(target.direction.distanceTo(frame.faces[target.faces[0]].direction), target.name).toBe(0);
    }
  });

  it("should list the same 26 names for every frame", () => {
    const names = table.map((t) => t.name);
    expect(targetTable(labelFrame({ x: -1, y: 0, z: 0 }, { x: 0, y: 0, z: -1 })).map((t) => t.name)).toEqual(names);
  });
});
