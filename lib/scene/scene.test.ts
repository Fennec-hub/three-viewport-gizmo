import {
  BufferGeometry,
  CanvasTexture,
  Material,
  Mesh,
  MeshBasicMaterial,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
  type EventDispatcher,
} from "three";
import { describe, expect, it, vi } from "vitest";
import { classifyChange } from "../options/changes";
import { mergeOptions, resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { buildScene, disposeScene, type GizmoScene } from "./build";
import { fadeScene, hoverScene, pointerOverScene, updateScene } from "./update";

const UPS = [
  new Vector3(1, 0, 0),
  new Vector3(0, 1, 0),
  new Vector3(0, 0, 1),
  new Vector3(-1, 0, 0),
  new Vector3(0, -1, 0),
  new Vector3(0, 0, -1),
];
const TYPES = ["sphere", "cube", "rounded-cube"] as const;

const resolve = (options: GizmoOptions) => resolveOptions(options, { up: new Vector3(0, 1, 0) });
const build = (options: GizmoOptions) => buildScene(resolve(options));

/** Every material, geometry and texture the scene can draw with, as reached from its objects. */
function reachable(scene: GizmoScene) {
  const found = new Set<Material | BufferGeometry | Texture>();
  const addMaterial = (material: Material) => {
    found.add(material);
    const map = (material as MeshBasicMaterial).map;
    if (map) found.add(map);
  };
  scene.group.traverse((object) => {
    const { geometry, material } = object as Mesh;
    if (geometry && !(object instanceof Sprite)) found.add(geometry);
    if (material) addMaterial(material as Material);
  });
  for (const { idle, hover } of scene.targets) [idle, hover].forEach(addMaterial);
  return found;
}

const materialsOf = (scene: GizmoScene) => [...reachable(scene)].filter((r): r is Material => r instanceof Material);

/** The axis lines drawn: the six are one mesh, and a hidden one collapses to the origin. */
const shownLines = (scene: GizmoScene) => {
  const { array } = (scene.parts.lines.object as Mesh).geometry.attributes.position;
  const block = array.length / 6;
  return [0, 1, 2, 3, 4, 5].filter((i) => array.slice(i * block, (i + 1) * block).some((v) => v !== 0)).length;
};

const listenDispose = (resources: Iterable<EventDispatcher<any>>) => {
  const disposed = new Set<unknown>();
  for (const resource of resources) resource.addEventListener("dispose", () => disposed.add(resource));
  return disposed;
};

describe("buildScene", () => {
  it.each(TYPES)("builds all 26 targets, the lines as one mesh, a background and a triad slot on %s", (type) => {
    const scene = build({ type });
    expect(scene.targets.map((t) => t.target.name)).toHaveLength(26);
    expect(scene.parts.lines.object).toBeInstanceOf(Mesh);
    expect(scene.group.children).toContain(scene.parts.triad.object);
  });

  // The rounded cube's white corners and grey edges (2.3.0's defaults) take one material more than the cube.
  it.each([["cube", 16], ["rounded-cube", 17]] as const)("draws %s with at most %i materials, sharing per style", (type, budget) => {
    const scene = build({ type });
    expect(materialsOf(scene).length).toBeLessThanOrEqual(budget);
    const edges = scene.targets.filter((t) => t.entry.kind === "edge");
    expect(new Set(edges.map((t) => t.idle)).size).toBe(1);
    expect(new Set(edges.map((t) => t.hover)).size).toBe(1);
  });

  it.each(TYPES)("gives every material on %s fixed intent flags", (type) => {
    const scene = build({ type });
    for (const material of materialsOf(scene)) expect(material.toneMapped).toBe(false);
    for (const { idle, hover } of scene.targets) {
      for (const material of [idle, hover]) {
        expect(material.transparent).toBe(true);
        expect(material.depthWrite).toBe(true);
      }
    }
    const background = (scene.parts.background.object as Mesh).material as Material;
    // The cubes' background must not hide what reaches past its far faces; the sphere's disc hides nothing.
    expect(background.depthWrite).toBe(type === "sphere");
    expect(((scene.parts.lines.object as Mesh).material as Material).depthWrite).toBe(true);
  });

  it.each(TYPES)("draws %s with at most two programs or pipelines, idle, hovered and with the triad (perf budget `programs`)", (type) => {
    const scene = build({ type, triad: { enabled: true } });
    const signatures = new Set<string>();
    const drawn: (Mesh | Sprite)[] = [scene.parts.background.object as Mesh, scene.parts.lines.object as Mesh];
    scene.parts.triad.object.traverse((object) => (object as Mesh).isMesh && drawn.push(object as Mesh));
    for (const { object, idle, hover } of scene.targets) for (const material of [idle, hover]) drawn.push(Object.assign(object.clone(), { material }));
    for (const object of drawn) {
      const material = object.material as MeshBasicMaterial;
      const { map } = material;
      const { attributes, index } = object.geometry;
      // What a WebGL program or WebGPU pipeline is keyed on, for these materials: flags, the map's sampling and which
      // attributes the geometry has (a sprite's are the renderer's).
      signatures.add(
        [material.type, material.vertexColors, material.side, material.blending, material.transparent, material.depthWrite,
          material.depthTest, material.toneMapped, map?.colorSpace, map?.minFilter, map?.magFilter,
          ...(object instanceof Mesh ? [!!index, ...Object.keys(attributes).sort()] : [])].join()
      );
    }
    expect(signatures.size).toBeLessThanOrEqual(2);
  });

  it.each(UPS.map((up) => [up.toArray().join(","), up] as const))(
    "turns each face label to the frame's textUp, and each edge along a frame axis, on up %s",
    (_, up) => {
      const scene = buildScene(resolveOptions({ type: "cube" }, { up }));
      for (const { entry, object } of scene.targets) {
        const x = new Vector3(1, 0, 0).applyQuaternion(object.quaternion);
        const y = new Vector3(0, 1, 0).applyQuaternion(object.quaternion);
        const z = new Vector3(0, 0, 1).applyQuaternion(object.quaternion);
        expect(z.distanceTo(entry.direction)).toBeLessThan(1e-6);
        if (entry.kind === "face") expect(y.distanceTo(scene.frame.faces[entry.faces[0]].textUp)).toBeLessThan(1e-6);
        if (entry.kind === "edge") {
          const axes = [scene.frame.right, scene.frame.up, scene.frame.front];
          expect(axes.some((axis) => x.distanceTo(axis) < 1e-6)).toBe(true);
        }
      }
    }
  );

  it("passes each new target material to onMaterial with the targets that share it, and keeps the host's", () => {
    const host = new MeshBasicMaterial();
    const uses: number[] = [];
    const onMaterial = vi.fn((material: MeshBasicMaterial | SpriteMaterial, use) => {
      uses.push(use.targets.length);
      return use.state === "hover" && use.targets.length === 20 ? host : material;
    });
    const scene = build({ type: "cube", onMaterial });
    // One hover material for all 20 edges and corners (P8); the cube's edges are hidden at rest, so need no idle one.
    expect(uses).toContain(20);
    expect(scene.targets.find((t) => t.entry.kind === "edge")!.hover).toBe(host);
    const disposed = listenDispose([host]);
    disposeScene(scene);
    expect(disposed.size).toBe(0);
  });
});

describe("disposeScene", () => {
  it.each(TYPES)("disposes exactly what %s created and leaves host objects alone", (type) => {
    const scene = build({ type });
    const root = new Mesh();
    root.add(scene.group);
    const hostTexture = new CanvasTexture(document.createElement("canvas"));
    const hostMaterial = new SpriteMaterial({ map: hostTexture });
    const hostSprite = new Sprite(hostMaterial);
    scene.group.add(hostSprite);
    root.add(new Sprite(hostMaterial));

    const ours = [...reachable(scene)].filter((r) => r !== hostMaterial && r !== hostTexture);
    for (const resource of ours) {
      // A label texture is reached through its material; the provider frees it.
      if (!(resource instanceof Texture)) expect(scene.owned.has(resource)).toBe(true);
    }
    const disposed = listenDispose([...ours, hostMaterial, hostTexture]);
    disposeScene(scene);

    for (const resource of ours) expect(disposed.has(resource)).toBe(true);
    expect(disposed.has(hostMaterial)).toBe(false);
    expect(disposed.has(hostTexture)).toBe(false);
    expect(scene.group.parent).toBeNull();
    expect(scene.owned.size).toBe(0);
  });
});

describe("hoverScene", () => {
  it.each(TYPES)("swaps to a material built with %s and compiling the same program", (type) => {
    const scene = build({ type });
    const before = new Set(scene.owned);
    for (const { target, object, idle, hover } of scene.targets) {
      hoverScene(scene, target.name);
      expect(object.material).toBe(hover);
      expect(hover.constructor).toBe(idle.constructor);
      for (const flag of ["transparent", "depthWrite", "depthTest", "toneMapped", "side", "blending"] as const) {
        expect(hover[flag]).toBe(idle[flag]);
      }
      expect(!!(hover as MeshBasicMaterial).map).toBe(!!(idle as MeshBasicMaterial).map);
    }
    hoverScene(scene, null);
    pointerOverScene(scene, true);
    expect(new Set(scene.owned)).toEqual(before);
  });
});

describe("updateScene", () => {
  // Each toggle flips the type's default: the sphere has no edges or corners and draws its positive lines.
  const cheap = (type: (typeof TYPES)[number]): [string, GizmoOptions][] => [
    ["edges toggled", { edges: { enabled: type === "sphere" } }],
    ["corners toggled", { corners: { enabled: type === "sphere" } }],
    ["one face off", { x: { enabled: false } }],
    ["a line toggled", { x: { line: type !== "sphere" } }],
    ["background off", { background: { enabled: false } }],
    ["a label", { front: { label: "F" } }],
    ["opacity", { edges: { opacity: 0.5 }, x: { opacity: 0.4 } }],
    ["line width and size", { lineWidth: 8, size: 96 }],
    [
      "a theme",
      {
        x: { color: 0x101010, labelColor: 0xeeeeee },
        edges: { color: 0x333333, hover: { color: 0x2266ff } },
        corners: { color: 0x444444, hover: { color: 0x2266ff } },
        background: { color: 0x000000 },
      },
    ],
  ];

  it.each(TYPES.flatMap((type) => cheap(type).map(([name, partial]) => [type, name, partial] as const)))(
    "applies a cheap change on %s (%s) in place",
    (type, _, partial) => {
      const base = { type };
      const previous = resolve(base);
      const next = resolve(mergeOptions(base, partial));
      expect(classifyChange(previous, next)).toBe("cheap");

      const scene = buildScene(previous);
      const objects = scene.targets.map((t) => t.object);
      const geometries = [...scene.owned].filter((r) => r instanceof BufferGeometry);
      const materials = materialsOf(scene).length;
      updateScene(scene, next);

      expect(scene.targets.map((t) => t.object)).toEqual(objects);
      expect([...scene.owned].filter((r) => r instanceof BufferGeometry)).toEqual(geometries);
      expect(materialsOf(scene).length).toBeLessThanOrEqual(materials + 2);
    }
  );

  it("toggles visible flags without rebuilding", () => {
    const options = resolve({ type: "cube" });
    const scene = buildScene(options);
    updateScene(scene, resolve({ type: "cube", edges: { enabled: false }, x: { enabled: false, line: true } }));
    for (const { entry, end, object } of scene.targets) {
      // `nx` fills from `x`, as in 2.x.
      expect(object.visible).toBe(entry.kind === "edge" ? false : end !== "x" && end !== "nx");
    }
    expect(shownLines(scene)).toBe(0); // x is off, so its line is too
    expect(scene.parts.lines.object.visible).toBe(false);
    updateScene(scene, resolve({ type: "cube", x: { line: true } }));
    expect(shownLines(scene)).toBe(1);
    // The cube's edges are at opacity 0 at rest: hidden until hovered.
    expect(scene.targets.every((t) => t.object.visible === (t.entry.kind !== "edge"))).toBe(true);
    hoverScene(scene, "top-front");
    expect(scene.targets.find((t) => t.target.name === "top-front")!.object.visible).toBe(true);
  });

  it("restyles a theme change in the same material instances", () => {
    const scene = build({ type: "cube" });
    const before = new Set(materialsOf(scene));
    updateScene(scene, resolve({ type: "cube", edges: { color: 0x333333, hover: { color: 0x2266ff } }, corners: { color: 0x444444, hover: { color: 0x2266ff } } }));
    expect(new Set(materialsOf(scene))).toEqual(before);
    const corner = scene.targets.find((t) => t.entry.kind === "corner")!;
    expect((corner.idle as MeshBasicMaterial).color.getHex()).toBe(0x444444);
    expect((corner.hover as MeshBasicMaterial).color.getHex()).toBe(0x2266ff);
  });

  it("keeps a hovered target hovered across an update", () => {
    const scene = build({ type: "cube" });
    hoverScene(scene, "top-front");
    updateScene(scene, resolve({ type: "cube", edges: { hover: { color: 0xff0000 } } }));
    const edge = scene.targets.find((t) => t.target.name === "top-front")!;
    expect(edge.object.material).toBe(edge.hover);
    expect((edge.hover as MeshBasicMaterial).color.getHex()).toBe(0xff0000);
  });
});

describe("fadeScene", () => {
  it("halves the sphere faces turned away from the camera", () => {
    const scene = build({ type: "sphere" });
    fadeScene(scene, new Mesh().quaternion); // looking from +Z
    const opacity = (end: string) => scene.targets.find((t) => t.end === end)!.idle.opacity;
    expect(opacity("z")).toBe(1);
    expect(opacity("nz")).toBe(0.5);
  });
});
