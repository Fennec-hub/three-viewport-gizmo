import { readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { Color, MathUtils, Vector3 } from "three";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewportGizmoError, type GizmoErrorCode } from "../errors";
import { labelFrame, type AxisEnd } from "../orbit/labelFrame";
import { targetTable } from "../orbit/targets";
import type { GizmoControls, GizmoOptions, GizmoResolvedOptions } from "../types";
import { classifyChange, OPTION_CHANGES } from "./changes";
import { mergeOptions, resolveOptions, targetEnabled } from "./resolve";
import { validateOptions } from "./validate";

const Y_UP = { up: new Vector3(0, 1, 0) };
const resolve = (options: GizmoOptions) => resolveOptions(options, Y_UP);
const ENDS: readonly AxisEnd[] = ["x", "y", "z", "nx", "ny", "nz"];
const UPS: readonly Vector3[] = [
  new Vector3(1, 0, 0),
  new Vector3(0, 1, 0),
  new Vector3(0, 0, 1),
  new Vector3(-1, 0, 0),
  new Vector3(0, -1, 0),
  new Vector3(0, 0, -1),
];

const codeOf = (run: () => unknown): GizmoErrorCode | undefined => {
  try {
    run();
  } catch (error) {
    if (error instanceof ViewportGizmoError) return error.code;
    throw error;
  }
  return undefined;
};

const stubReducedMotion = (reduce: boolean) =>
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: reduce && query === "(prefers-reduced-motion: reduce)" }));

afterEach(() => vi.unstubAllGlobals());

describe("mergeOptions", () => {
  it("should keep a cube a cube when set({ size: 64 }) merges into it", () => {
    const current: GizmoOptions = { type: "cube" };
    const merged = mergeOptions(current, { size: 64 });
    const resolved = resolve(merged);

    expect(resolved.type).toBe("cube");
    expect(resolved.size).toBe(64);
    expect(current).toEqual({ type: "cube" });
    expect(classifyChange(resolve(current), resolved)).toBe("cheap");
  });

  it("should merge nested objects and keep their other keys", () => {
    const merged = mergeOptions({ corners: { color: 1, opacity: 0.5 } }, { corners: { color: 2 } });

    expect(merged.corners).toEqual({ color: 2, opacity: 0.5 });
  });

  it("should reset a key to its default when set() passes undefined", () => {
    const merged = mergeOptions({ type: "cube", size: 64 }, { size: undefined });

    expect(resolve(merged).size).toBe(128);
  });
});

describe("resolveOptions", () => {
  it("should keep a THREE.Color as the same instance", () => {
    const color = new Color("tomato");
    const resolved = resolve(mergeOptions({}, { x: { color }, background: { color } }));

    expect(resolved.x?.color).toBe(color);
    expect(resolved.nx?.color).toBe(color);
    expect(resolved.background?.color).toBe(color);
  });

  it("should keep a function option", () => {
    const onMaterial = vi.fn();

    expect(resolve({ onMaterial }).onMaterial).toBe(onMaterial);
  });

  it("should apply every option a caller passes to a rounded-cube", () => {
    const resolved = resolve({
      type: "rounded-cube",
      radius: 0.4,
      edges: { opacity: 0.5, hover: { scale: 0.8 } },
      corners: { scale: 0.6 },
      x: { scale: 0.5, opacity: 0.3 },
    });

    expect(resolved.edges).toMatchObject({ opacity: 0.5, radius: 0.4, scale: 1, hover: { scale: 0.8, opacity: 1 } });
    expect(resolved.corners).toMatchObject({ scale: 0.6, radius: 0.4, opacity: 1 });
    expect(resolved.x).toMatchObject({ scale: 0.5, opacity: 0.3 });
    expect(resolved.nx).toMatchObject({ scale: 1, opacity: 1 });
    expect(resolved.radius).toBe(0.4);
  });

  it("should default to the 2.3.0 values for each type", () => {
    // Unset: the labels size their textures from `size` and the device pixel ratio (S2, D13).
    expect(resolve({}).resolution).toBeUndefined();
    expect(resolve({ type: "cube", resolution: 256 }).resolution).toBe(256);
    expect(resolve({ type: "cube" }).radius).toBe(0.2);
    expect(resolve({ type: "rounded-cube" }).radius).toBe(0.3);
    expect(resolve({}).x).toMatchObject({ label: "X", color: 0xff3653, line: true });
    expect(resolve({}).nx).toMatchObject({ label: "", color: 0xff3653, line: false, scale: 0.45 });
  });

  it("should take the label up from the context and keep `up` as a vector", () => {
    const resolved = resolveOptions({ type: "cube" }, { up: new Vector3(0, 0, 0.9999999) });

    expect(resolved.up.toArray()).toEqual([0, 0, 1]);
    expect(resolved.frontDirection.toArray()).toEqual([0, -1, 0]);
    expect(resolved.z?.label).toBe("Top");
  });

  it.each(UPS.map((up) => [up.toArray().join(", "), up] as const))(
    "should style the face labelled Front through the `front` alias with up (%s)",
    (_name, up) => {
      const resolved = resolveOptions({ type: "cube", front: { color: 0xff0000 } }, { up });
      const { end } = labelFrame(up).faces.front;

      expect(resolved[end]).toMatchObject({ label: "Front", color: 0xff0000 });
      for (const other of ENDS.filter((candidate) => candidate !== end)) {
        expect(resolved[other]?.color).not.toBe(0xff0000);
      }
    }
  );

  it("should merge a face alias over its axis key instead of replacing it", () => {
    const resolved = resolve({ type: "cube", z: { color: 1, opacity: 0.5 }, front: { color: 2 } });

    expect(resolved.z).toMatchObject({ color: 2, opacity: 0.5 });
    expect(resolved).not.toHaveProperty("front");
  });

  it("should follow prefers-reduced-motion when `animated` is unset", () => {
    stubReducedMotion(true);
    expect(resolve({}).animated).toBe(false);
    expect(resolve({ animated: true }).animated).toBe(true);

    stubReducedMotion(false);
    expect(resolve({}).animated).toBe(true);
  });

  it("should default `roll` from controlled mode and the controls", () => {
    const controls = (updateCameraUp?: () => void) => ({ updateCameraUp }) as unknown as GizmoControls;

    expect(resolve({}).roll).toBe(true);
    expect(resolve({ controlled: true }).roll).toBe(false);
    expect(resolveOptions({}, { ...Y_UP, controls: controls() }).roll).toBe(false);
    expect(resolveOptions({}, { ...Y_UP, controls: controls(() => {}) }).roll).toBe(true);
    expect(resolve({ roll: "free" }).roll).toBe("free");
    expect(codeOf(() => resolveOptions({ roll: true }, { ...Y_UP, controls: controls() }))).toBe("ROLL_UNSUPPORTED");
  });

  it("should default the gating flags on and the navigation off", () => {
    const resolved = resolve({ type: "cube" });

    expect(resolved).toMatchObject({ drag: true, controlled: false, poleEntry: "front", oppositeOnRepeat: false });
    expect(resolved.navigation).toEqual({ enabled: false, sides: true, roll: true, home: true, reveal: "hover" });
    expect(resolved.limits).toEqual({
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
    });
  });
});

describe("validateOptions", () => {
  it.each<[string, unknown, GizmoErrorCode]>([
    ["an unknown key", { nonsense: 1 }, "UNKNOWN_OPTION"],
    ["an unknown nested key", { corners: { colour: 1 } }, "UNKNOWN_OPTION"],
    ["an unknown target key", { front: { colour: 1 } }, "UNKNOWN_OPTION"],
    ["the 2.x up string", { up: "z" }, "REMOVED_OPTION"],
    ["a wrong type", { size: "64" }, "INVALID_OPTION"],
    ["an unknown type", { type: "box" }, "INVALID_OPTION"],
    ["an unknown placement", { placement: "bottom-middle" }, "INVALID_OPTION"],
    ["an opacity above 1", { x: { opacity: 2 } }, "INVALID_OPTION"],
    ["NaN", { speed: Number.NaN }, "INVALID_OPTION"],
    ["`navigation: true`", { navigation: true }, "INVALID_OPTION"],
    ["`roll: 'on'`", { roll: "on" }, "INVALID_OPTION"],
    ["a non-finite up", { up: { x: 0, y: Number.NaN, z: 1 } }, "INVALID_OPTION"],
    ["a field of view of 0", { fieldOfView: 0 }, "INVALID_OPTION"],
    ["a field of view above 100°", { fieldOfView: MathUtils.degToRad(101) }, "INVALID_OPTION"],
    ["a field of view in degrees", { fieldOfView: 30 }, "INVALID_OPTION"],
    ["a polar limit above π", { limits: { maxPolarAngle: 4 } }, "INVALID_OPTION"],
  ])("should throw its code for %s", (_name, options, code) => {
    expect(codeOf(() => validateOptions(options))).toBe(code);
  });

  it("should name the 3.0 replacement of the 2.x up string", () => {
    expect(() => validateOptions({ up: "z" })).toThrow("up: new Vector3(0, 0, 1)");
  });

  it("should accept a field of view of exactly 100°, undefined values and a THREE.Color", () => {
    expect(() =>
      validateOptions({ fieldOfView: MathUtils.degToRad(100), size: undefined, x: { color: new Color() } })
    ).not.toThrow();
  });

  it("should refuse crossed limits and a tilted up when resolving", () => {
    expect(codeOf(() => resolve({ limits: { minPolarAngle: 2, maxPolarAngle: 1 } }))).toBe("INVALID_OPTION");
    expect(codeOf(() => resolve({ up: new Vector3(1, 1, 0) }))).toBe("INVALID_FRAME");
  });
});

/** The property names of a type literal in `lib/types.ts`, found by its path from `GizmoOptions`. */
function typeKeys(...path: string[]): string[] {
  const file = resolvePath(import.meta.dirname, "../types.ts");
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest);
  let found: ts.TypeLiteralNode | undefined;
  source.forEachChild((node) => {
    if (ts.isTypeAliasDeclaration(node) && node.name.text === "GizmoOptions") found = node.type as ts.TypeLiteralNode;
  });
  for (const name of path) {
    const member = found!.members.find((entry) => (entry.name as ts.Identifier | undefined)?.text === name);
    found = (member as ts.PropertySignature).type as ts.TypeLiteralNode;
  }
  return found!.members.map((member) => (member.name as ts.Identifier).text).sort();
}

describe("change classification", () => {
  it("should classify every option of GizmoOptions", () => {
    expect(Object.keys(OPTION_CHANGES).sort()).toEqual(typeKeys());
    expect(Object.keys(OPTION_CHANGES.corners).sort()).toEqual(typeKeys("corners"));
    expect(Object.keys(OPTION_CHANGES.edges).sort()).toEqual(typeKeys("edges"));
  });

  it.each<[string, GizmoOptions, ReturnType<typeof classifyChange>]>([
    ["nothing", {}, null],
    ["a colour", { x: { color: 0x123456 } }, "cheap"],
    ["an equal THREE.Color", { background: { color: new Color(0xe0e6ec) } }, null],
    ["a face alias", { front: { labelColor: 0 } }, "cheap"],
    ["a target switched off", { edges: { enabled: false } }, "cheap"],
    ["the field of view", { fieldOfView: 1 }, "cheap"],
    ["an edge radius", { edges: { radius: 0.3 } }, "structural"],
    ["the type", { type: "sphere" }, "structural"],
    ["the up", { up: new Vector3(0, 0, 1) }, "structural"],
  ])("should classify %s", (_name, change, expected) => {
    const base: GizmoOptions = { type: "cube", background: { color: new Color(0xe0e6ec) } };
    const before: GizmoResolvedOptions = resolve(base);

    expect(classifyChange(before, resolve(mergeOptions(base, change)))).toBe(expected);
  });
});

describe("targetEnabled", () => {
  it("should gate a face by its axis end and edges and corners by kind", () => {
    const up = new Vector3(0, 0, 1);
    const options = resolveOptions({ type: "cube", front: { enabled: false }, corners: { enabled: false } }, { up });
    const enabled = targetTable(labelFrame(up))
      .filter((target) => !targetEnabled(options, target))
      .map((target) => target.name);

    expect(enabled.filter((name) => !name.includes("-"))).toEqual(["front"]);
    expect(enabled.filter((name) => name.split("-").length === 3)).toHaveLength(8);
    expect(enabled.filter((name) => name.split("-").length === 2)).toHaveLength(0);
  });
});
