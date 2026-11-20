import { Vector3, type Material, type Quaternion } from "three";
import type { AxisEnd, LabelFrame } from "../orbit/labelFrame";
import type { TargetEntry } from "../orbit/targets";
import type { GizmoResolvedOptions, GizmoTarget } from "../types";
import type { GizmoScene, SceneOptions, SceneTarget } from "./build";
import type { LabelTextures } from "./faces";
import { assignMaterials, type MaterialSlot, type Owned } from "./materials";

/** The target as data, labelled from its faces' options. */
export const targetOf = (entry: TargetEntry, frame: LabelFrame, o: SceneOptions): GizmoTarget => ({
  name: entry.name,
  kind: entry.kind,
  direction: entry.direction,
  label: entry.faces.map((face) => o[frame.faces[face].end].label).join(" "),
});

type TargetDraft = Readonly<{ entry: TargetEntry; target: GizmoTarget; end: AxisEnd | null }>;

/** The options that style a target: its face's axis end, or the edges or corners. */
const styleOf = (o: SceneOptions, { entry, end }: TargetDraft) =>
  end ? o[end] : entry.kind === "edge" ? o.edges : o.corners;

/**
 * The idle and hover materials of every target, shared by style (P8). A target at opacity 0 at rest draws nothing
 * then, so it is hidden instead and needs no idle material: on the cube the edges (opacity 0) then share the corners'
 * materials' budget, one idle and one hover for all 20.
 *
 * @returns The materials by style key, and each target's pair; `idle` is `hover` for a target hidden at rest
 */
export function targetMaterials(
  targets: readonly TargetDraft[],
  o: SceneOptions,
  labels: LabelTextures,
  previous: ReadonlyMap<string, Material>,
  owned: Owned
): { byKey: Map<string, Material>; pairs: { idle: Material; hover: Material }[] } {
  const sprite = o.type === "sphere";
  const slots: MaterialSlot[] = [];
  const indices = targets.map((draft) => {
    const part = draft.end ?? (draft.entry.kind as "edge" | "corner");
    const { color, opacity, hover } = styleOf(o, draft);
    // A label texture carries the face's colours, as does every sphere sprite's; the cube's edges and corners are flat.
    const textured = draft.end !== null || sprite;
    const slot = (state: "idle" | "hover") =>
      slots.push({
        target: draft.target,
        state,
        style: {
          sprite,
          map: textured ? labels.texture(part, state) : null,
          color: textured ? 0xffffff : state === "idle" ? color : (hover.color ?? color),
          opacity: state === "idle" ? opacity : hover.opacity,
        },
      }) - 1;
    const hoverIndex = slot("hover");
    return [opacity > 0 ? slot("idle") : hoverIndex, hoverIndex] as const;
  });
  const { byKey, bySlot } = assignMaterials(slots, previous, owned, o.onMaterial);
  return { byKey, pairs: indices.map(([idle, hover]) => ({ idle: bySlot[idle], hover: bySlot[hover] })) };
}

/** Whether a target draws: enabled, and not at opacity 0 at rest unless hovered. */
const drawn = (scene: GizmoScene, target: SceneTarget, hovered: boolean) => {
  const { enabled, opacity } = styleOf(scene.options, target);
  return enabled && (hovered || opacity > 0);
};

/** Writes `visible`, scale and the idle or hover material of every target from the options and the hover state. */
export function restyleTargets(scene: GizmoScene): void {
  for (const target of scene.targets) {
    const { scale, hover } = styleOf(scene.options, target);
    const hovered = scene.hovered === target.target.name;
    target.object.visible = drawn(scene, target, hovered);
    target.object.scale.setScalar(hovered ? hover.scale : scale);
    target.object.material = (hovered ? target.hover : target.idle) as SceneTarget["object"]["material"];
  }
}

/**
 * Applies a cheap change in place (P5, U10): label pixels, target colours, opacities, scales and `visible` flags, line
 * and background styling. Nothing is rebuilt; a material is created only for a style no material had, and a material
 * is never recompiled. The caller sends a `structural` change from `classifyChange` to a rebuild instead.
 *
 * @param options - From `resolveOptions`, differing from `scene.options` only in cheap options
 */
export function updateScene(scene: GizmoScene, options: GizmoResolvedOptions): void {
  const o = options as SceneOptions;
  scene.options = o;
  scene.labels.update(o);
  for (const target of scene.targets) target.target = targetOf(target.entry, scene.frame, o);
  const { byKey, pairs } = targetMaterials(scene.targets, o, scene.labels, scene.materials, scene.owned);
  scene.materials = byKey;
  scene.targets.forEach((target, i) => Object.assign(target, pairs[i]));
  restyleTargets(scene);
  for (const part of Object.values(scene.parts)) part.update(o, scene.pointerOver);
}

/**
 * Hovers one target or none: swaps to its hover material, built with the scene, and its hover scale. No material is
 * created, so hovering compiles nothing (P9).
 */
export function hoverScene(scene: GizmoScene, name: GizmoTarget["name"] | null): void {
  scene.hovered = name;
  restyleTargets(scene);
}

/** Restyles the background for the pointer being over the gizmo or not. */
export function pointerOverScene(scene: GizmoScene, over: boolean): void {
  scene.pointerOver = over;
  scene.parts.background.update(scene.options, over);
}

const _view = /*@__PURE__*/ new Vector3();

/**
 * The sphere's depth fade: each axis end at its opacity while it faces the camera, at half while it faces away. Writes
 * the face materials' `opacity` only, which the sphere never shares between faces.
 *
 * @param quaternion - The host camera's
 */
export function fadeScene(scene: GizmoScene, quaternion: Readonly<Quaternion>): void {
  if (scene.options.type !== "sphere") return;
  _view.set(0, 0, 1).applyQuaternion(quaternion);
  const { targets, options } = scene;
  // An indexed loop with no destructuring or string slicing: it runs every flight frame (perf budget `alloc`).
  for (let i = 0; i < targets.length; i++) {
    const { end, idle, hover } = targets[i];
    if (!end) continue;
    const { opacity, hover: hovered } = options[end];
    const value = end === "x" || end === "nx" ? _view.x : end === "y" || end === "ny" ? _view.y : _view.z;
    const near = end.length === 1 ? value >= 0 : value < 0;
    // Inline, and written only on change: a double handed to a call or stored anew is boxed (perf budget `alloc`).
    const base = near ? opacity : opacity / 2;
    const raised = base * (hovered.opacity / (opacity > 0 ? opacity : 1));
    const lit = raised > 1 ? 1 : raised < 0 ? 0 : raised;
    if (idle !== hover && idle.opacity !== base) idle.opacity = base;
    if (hover.opacity !== lit) hover.opacity = lit;
  }
}
