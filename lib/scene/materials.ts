import {
  BufferAttribute,
  Color,
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  MeshBasicMaterial,
  SpriteMaterial,
  SRGBColorSpace,
  type BufferGeometry,
  type ColorRepresentation,
  type Material,
  type Texture,
} from "three";
import type { GizmoMaterial, GizmoMaterialUse, GizmoResolvedOptions, GizmoTarget } from "../types";

/** Something the gizmo created and frees on `dispose()`: a material, geometry, texture or label provider. */
export type Disposable = { dispose(): void };

/** The resources a scene created, and only those (P1): a host material, sprite or texture is never in it. */
export type Owned = Set<Disposable>;

/** How a target looks in one state. Equal styles share one material (P8). */
export type TargetStyle = Readonly<{
  /** A `SpriteMaterial` (sphere) or a `MeshBasicMaterial` (cubes). */
  sprite: boolean;
  map: Texture | null;
  color: ColorRepresentation;
  opacity: number;
}>;

/** One target's material in one state. */
export type MaterialSlot = Readonly<{ target: GizmoTarget; state: GizmoMaterialUse["state"]; style: TargetStyle }>;

const _color = /*@__PURE__*/ new Color();

const keyOf = ({ state, style: { sprite, map, color, opacity } }: MaterialSlot) =>
  `${state}|${sprite ? "sprite" : "mesh"}|${map?.id ?? -1}|${_color.set(color).getHex()}|${opacity}`;

/**
 * A target material. Its flags are fixed for its life, so a cheap change writes only `color` and `opacity` and never
 * compiles a program or pipeline (P5, P9): `transparent` (labels carry alpha and opacity is a cheap option),
 * `depthWrite` on (the cube hides its own back), `toneMapped` off (gizmo colours are display colours, R6).
 *
 * Every mesh of the gizmo draws with this one program (perf budget `programs`, at most two per gizmo with the sphere's
 * sprites): a `map` everywhere, `white` where there is no label, and vertex colours on, white where a geometry has
 * one colour ({@link meshAttributes}). The axis lines and the background use it too; on WebGPU the cubes'
 * background adds the second pipeline, as it must not write depth (`background.ts`).
 *
 * @param white - The scene's {@link whiteTexture}
 */
export function targetMaterial({ sprite, map, color, opacity }: TargetStyle, white: Texture): MeshBasicMaterial | SpriteMaterial {
  const parameters = { map: map ?? white, color, opacity, transparent: true, depthWrite: true, toneMapped: false };
  return sprite ? new SpriteMaterial(parameters) : new MeshBasicMaterial({ ...parameters, vertexColors: true });
}

/**
 * Gives `geometry` the attributes of {@link targetMaterial}'s program that it lacks, since a program is keyed on which
 * attributes a geometry has: white vertex colours, UVs on the one white texel, normals along local +Z, where the
 * gizmo's flat pieces face, and an index (on WebGPU an indexed draw is a pipeline of its own).
 *
 * @returns `geometry`
 */
export function meshAttributes<T extends BufferGeometry>(geometry: T): T {
  const count = geometry.attributes.position.count;
  const filled = (size: number, value: (i: number) => number) =>
    new BufferAttribute(Float32Array.from({ length: count * size }, (_, i) => value(i % size)), size);
  if (!geometry.hasAttribute("color")) geometry.setAttribute("color", filled(3, () => 1));
  if (!geometry.hasAttribute("uv")) geometry.setAttribute("uv", filled(2, () => 0));
  if (!geometry.hasAttribute("normal")) geometry.setAttribute("normal", filled(3, (i) => (i === 2 ? 1 : 0)));
  if (!geometry.index) geometry.setIndex(Array.from({ length: count }, (_, i) => i));
  return geometry;
}

const whites = /*@__PURE__*/ new WeakMap<Owned, Texture>();

/** The 1×1 white texture of the scene that owns `owned`: created on first use, freed with the scene. */
export function whiteTexture(owned: Owned): Texture {
  let white = whites.get(owned);
  if (!white || !owned.has(white)) {
    white = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    // A label's colour space and sampling (`CanvasTexture` defaults): on WebGPU the sampler is part of the pipeline.
    white.colorSpace = SRGBColorSpace;
    white.magFilter = LinearFilter;
    white.minFilter = LinearMipmapLinearFilter;
    white.generateMipmaps = true;
    white.needsUpdate = true;
    owned.add(white);
    whites.set(owned, white);
  }
  return white;
}

/**
 * Gives every slot a material, sharing one between all slots of equal state and style (P8): six face labels idle and
 * hover, then one material per edge and corner style, so a cube holds at most 14 target materials. A material whose
 * style is still wanted is kept as it is; one no longer wanted is restyled in place for a new style of the same kind
 * and map, else disposed if the scene owns it. A new material goes through `onMaterial` with the targets that share
 * it; a replacement it returns belongs to the host and is never disposed.
 *
 * @param previous - The materials by style key from the last call; empty on build
 * @param owned - Receives the materials created here; loses those disposed here
 * @returns The materials by style key, and the material of each slot in slot order
 */
export function assignMaterials(
  slots: readonly MaterialSlot[],
  previous: ReadonlyMap<string, Material>,
  owned: Owned,
  onMaterial?: GizmoResolvedOptions["onMaterial"]
): { byKey: Map<string, Material>; bySlot: Material[] } {
  const keys = slots.map(keyOf);
  const groups = new Map<string, MaterialSlot[]>();
  keys.forEach((key, i) => (groups.get(key) ?? groups.set(key, []).get(key)!).push(slots[i]));

  const white = whiteTexture(owned);
  const byKey = new Map<string, Material>();
  for (const key of groups.keys()) if (previous.has(key)) byKey.set(key, previous.get(key)!);
  const spare = [...previous].filter(([key]) => !groups.has(key)).map(([, material]) => material as GizmoMaterial);

  for (const [key, group] of groups) {
    if (byKey.has(key)) continue;
    const [{ state, style }] = group;
    const reuse = spare.findIndex(
      (material) =>
        ((material as Material & { isSpriteMaterial?: boolean }).isSpriteMaterial === true) === style.sprite &&
        material.map === (style.map ?? white)
    );
    if (reuse >= 0) {
      const [material] = spare.splice(reuse, 1);
      material.color.set(style.color);
      material.opacity = style.opacity;
      byKey.set(key, material);
      continue;
    }
    const created = targetMaterial(style, white);
    const material = onMaterial?.(created, { targets: group.map((slot) => slot.target), state }) ?? created;
    if (material === created) owned.add(created);
    else created.dispose();
    byKey.set(key, material);
  }

  for (const material of spare) if (owned.delete(material)) material.dispose();
  return { byKey, bySlot: keys.map((key) => byKey.get(key)!) };
}
