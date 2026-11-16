import {
  Group,
  Mesh,
  Sprite,
  type BufferGeometry,
  type Material,
  type Object3D,
  type SpriteMaterial,
} from "three";
import { labelFrame, type AxisEnd, type LabelFrame } from "../orbit/labelFrame";
import { targetTable, type TargetEntry } from "../orbit/targets";
import type { GizmoResolvedOptions, GizmoTarget, GizmoTargetKind } from "../types";
import { GIZMO_SPHERE_AXES_DISTANCE } from "../utils/constants";
import { axisLines } from "./axisLines";
import { background } from "./background";
import { cornerGeometry, placeCorner } from "./corners";
import { edgeGeometry, placeEdge } from "./edges";
import { faceGeometry, placeFace, type LabelProvider, type LabelTextures, type Placement } from "./faces";
import { canvasLabels } from "./labels";
import type { Owned } from "./materials";
import { roundedBoxGeometry } from "./roundedBox";
import { triad } from "./triad";
import { restyleTargets, targetMaterials, targetOf } from "./update";

/** Resolved options as the scene reads them. */
export type SceneOptions = GizmoResolvedOptions;

/** One of the 26 targets as built. Hidden kinds and targets are built too, so `enabled` is a `visible` flag (U10). */
export type SceneTarget = {
  /** The target as data; its `label` follows cheap label changes. */
  target: GizmoTarget;
  readonly entry: TargetEntry;
  /** A face's axis end, whose options style it; null for an edge or corner. */
  readonly end: AxisEnd | null;
  readonly object: Mesh<BufferGeometry, Material> | Sprite;
  idle: Material;
  hover: Material;
};

/** A part that is not a target: built on a structural change, restyled in place on a cheap one. */
export type ScenePart = Readonly<{ object: Object3D; update(o: SceneOptions, pointerOver: boolean): void }>;

/** Builds one part from the options and the placed targets; registers whatever it creates in `owned`. */
export type PartBuilder = (o: SceneOptions, scene: Readonly<{ frame: LabelFrame; targets: readonly SceneTarget[] }>, owned: Owned) => ScenePart;

/** A target's geometry and where it sits. The geometry is registered in `owned` by the provider. */
export type PlacedGeometry = Readonly<{ geometry: BufferGeometry }> & Placement;

/** The geometry of every target for one cube type. */
export type GeometryProvider = (o: SceneOptions, frame: LabelFrame, owned: Owned) => (entry: TargetEntry) => PlacedGeometry;

/** The seams later tasks fill: labels (S2), axis lines (S3), background (S4), cube geometry (S5), triad (S6). */
export type SceneBuilders = Readonly<{
  labels: LabelProvider;
  geometry: Readonly<Record<"cube" | "rounded-cube", GeometryProvider>>;
  lines: PartBuilder;
  background: PartBuilder;
  triad: PartBuilder;
}>;

/** A built gizmo scene. Add `group` under the gizmo's `root`; free it with {@link disposeScene}. */
export type GizmoScene = {
  readonly group: Group;
  readonly frame: LabelFrame;
  /** All 26, in `targetTable` order. */
  readonly targets: readonly SceneTarget[];
  readonly parts: Readonly<{ background: ScenePart; lines: ScenePart; triad: ScenePart }>;
  readonly labels: LabelTextures;
  /** Everything the scene created, and only that (P1). */
  readonly owned: Owned;
  /** The target materials by style key (P8). */
  materials: Map<string, Material>;
  options: SceneOptions;
  hovered: GizmoTarget["name"] | null;
  pointerOver: boolean;
};

const PARTS: Readonly<Record<GizmoTargetKind, (entry: TargetEntry, frame: LabelFrame) => Placement>> = {
  face: (entry, frame) => placeFace(entry, frame),
  edge: placeEdge,
  corner: placeCorner,
};

/** The cube: one shared geometry per kind. */
const cubeGeometry: GeometryProvider = (o, frame, owned) => {
  const geometry = { face: faceGeometry(o), edge: edgeGeometry(o), corner: cornerGeometry(o) };
  Object.values(geometry).forEach((g) => owned.add(g));
  return (entry) => ({ geometry: geometry[entry.kind], ...PARTS[entry.kind](entry, frame) });
};

/** The 3.0 look: S2's labels, S3's lines, S4's background, S5's rounded box and S6's triad. */
export const DEFAULT_BUILDERS: SceneBuilders = {
  labels: canvasLabels,
  geometry: { cube: cubeGeometry, "rounded-cube": roundedBoxGeometry },
  lines: axisLines,
  background,
  triad,
};

/**
 * Builds the gizmo scene for resolved options (P1, P8): all 26 targets in the label frame, the background, the axis
 * lines and the triad. Every material, geometry and texture it creates is listed in `owned`.
 *
 * @param options - From `resolveOptions`
 * @param builders - Replace a default part; later tasks fill these seams
 * @returns A new scene, styled for `options`
 */
export function buildScene(options: GizmoResolvedOptions, builders: Partial<SceneBuilders> = {}): GizmoScene {
  const o = options as SceneOptions;
  const { labels, geometry, lines, background, triad } = { ...DEFAULT_BUILDERS, ...builders };
  const owned: Owned = new Set();
  const frame = labelFrame(o.up, o.frontDirection);
  const textures = labels(o);
  owned.add(textures);

  const entries = targetTable(frame);
  const draft = entries.map((entry) => ({
    entry,
    target: targetOf(entry, frame, o),
    end: entry.kind === "face" ? frame.faces[entry.faces[0]].end : null,
  }));
  const { byKey, pairs } = targetMaterials(draft, o, textures, new Map(), owned);

  const place = o.type === "sphere" ? null : geometry[o.type](o, frame, owned);
  const targets = draft.map<SceneTarget>((part, i) => {
    const { idle, hover } = pairs[i];
    let object: SceneTarget["object"];
    if (place) {
      const { geometry, position, quaternion } = place(part.entry);
      object = new Mesh(geometry, idle);
      object.position.copy(position);
      object.quaternion.copy(quaternion);
    } else {
      object = new Sprite(idle as SpriteMaterial);
      object.position.copy(part.entry.direction).multiplyScalar(part.end ? GIZMO_SPHERE_AXES_DISTANCE : 1.7);
    }
    object.renderOrder = 1;
    return { ...part, object, idle, hover };
  });

  const context = { frame, targets };
  const parts = { background: background(o, context, owned), lines: lines(o, context, owned), triad: triad(o, context, owned) };
  const group = new Group();
  group.add(parts.background.object, parts.lines.object, ...targets.map((t) => t.object), parts.triad.object);

  const scene: GizmoScene = {
    group,
    frame,
    targets,
    parts,
    labels: textures,
    owned,
    materials: byKey,
    options: o,
    hovered: null,
    pointerOver: false,
  };
  restyleTargets(scene);
  for (const part of Object.values(parts)) part.update(o, false);
  return scene;
}

/**
 * Frees exactly what the scene created (P1) and detaches its group. A host object, material or texture added under
 * the gizmo, or a host material returned from `onMaterial`, is left as it is.
 */
export function disposeScene(scene: GizmoScene): void {
  scene.group.removeFromParent();
  for (const resource of scene.owned) resource.dispose();
  scene.owned.clear();
}
