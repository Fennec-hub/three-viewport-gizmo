import {
  BufferAttribute,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  PlaneGeometry,
  Quaternion,
  SRGBColorSpace,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GIZMO_MAIN_AXES } from "../utils/constants";
import { pixelsPerUnit } from "./axisLines";
import { turnToCamera } from "./background";
import type { PartBuilder, SceneOptions } from "./build";
import { meshAttributes, targetMaterial, whiteTexture } from "./materials";

/** Tau's triad: axis length from the cube's corner, in the cube's units (its half size is 1). */
const LENGTH = 2.1;
/** The corner the axes start from: just outside the cube's −X −Y −Z corner, so each axis runs along an edge. */
const ORIGIN = -LENGTH / 2;
/** Gap between an axis tip and its label's centre. */
const LABEL_GAP = 0.2;
/** A label sprite's side. */
const LABEL_SIZE = 0.49;
/** Line width in the gizmo's CSS pixels. */
const LINE_WIDTH = 1.5;
/** The scene's scale while the triad shows, as Tau draws it: the cube shrinks to give the axes and labels room. */
export const TRIAD_SCENE_SCALE = 0.7;
/** Tau's `axesHelperColors`: the default of the `triad.colors` option. */
export const TRIAD_COLORS = { x: "rgb(130, 41, 37)", y: "rgb(53, 122, 56)", z: "rgb(0, 70, 145)" } as const;

const RADIAL_SEGMENTS = 8;
const Y = /*@__PURE__*/ new Vector3(0, 1, 0);
/** A unit cylinder along +Y turned onto +X, +Y and +Z. */
const ROTATIONS = /*@__PURE__*/ [new Vector3(1, 0, 0), Y, new Vector3(0, 0, 1)].map((axis) =>
  new Quaternion().setFromUnitVectors(Y, axis)
);
const _vertex = /*@__PURE__*/ new Vector3();
const _scale = /*@__PURE__*/ new Vector3();
const _color = /*@__PURE__*/ new Color();

/** Whether the triad shows for these options: on, and a cube type. */
export const triadShown = (o: SceneOptions): boolean => o.type !== "sphere" && o.triad.enabled;

/** Draws one axis letter edge to edge in its axis colour. */
function drawLetter(canvas: HTMLCanvasElement, axis: (typeof GIZMO_MAIN_AXES)[number], o: SceneOptions): void {
  const n = canvas.width;
  canvas.width = n; // clears the canvas and its state
  const ctx = canvas.getContext("2d")!;
  // Tau's 88 px letter on a 128 px canvas.
  ctx.font = `${o.font.weight} ${Math.floor((n * 88) / 128)}px ${o.font.family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = _color.set(o.triad.colors[axis]).getStyle();
  ctx.fillText(axis.toUpperCase(), n / 2, n / 2);
}

/**
 * The axis triad of the cube types (OD3): world +X, +Y and +Z from the cube's corner, as Tau draws them, with an X, Y
 * or Z label past each tip in the axis colour. The lines are one vertex-coloured mesh and the labels three
 * camera-facing quads, all on the targets' program (`targetMaterial`), so showing the triad adds no program or
 * pipeline (perf budget `programs`). Nothing is built until the triad
 * first shows, so a gizmo without it pays nothing; toggling it after that writes `visible` and the scene's scale only.
 * Draws while shown: 4 (one line mesh, three labels).
 */
export const triad: PartBuilder = (_, __, owned) => {
  const object = new Group();
  object.position.setScalar(ORIGIN);
  let lines: Mesh | null = null;
  let letters: { canvas: HTMLCanvasElement; texture: CanvasTexture }[] = [];
  let base: ArrayLike<number> = [];
  let count = 0;

  const create = (o: SceneOptions) => {
    const unit = new CylinderGeometry(1, 1, 1, RADIAL_SEGMENTS).translate(0, 0.5, 0);
    unit.deleteAttribute("uv");
    base = unit.attributes.position.array;
    count = unit.attributes.position.count;
    // Each line's normals, turned once, as the axis lines' are.
    const turned = ROTATIONS.map((rotation) => unit.clone().applyQuaternion(rotation));
    const geometry = mergeGeometries(turned);
    for (const g of [unit, ...turned]) g.dispose();
    meshAttributes(
      geometry.setAttribute("color", new BufferAttribute(new Float32Array(geometry.attributes.position.count * 3), 3))
    );
    const white = whiteTexture(owned);
    const material = targetMaterial({ sprite: false, map: null, color: 0xffffff, opacity: 1 }, white);
    owned.add(geometry).add(material);
    lines = new Mesh(geometry, material);
    // ponytail: positions move on a size or field-of-view change; the gizmo is always in view.
    lines.frustumCulled = false;
    lines.renderOrder = 2;
    object.add(lines);

    // Texture size fixed at first show, as the face labels' are at build (S2).
    const dpr = globalThis.devicePixelRatio || 1;
    const texels = Math.ceil(LABEL_SIZE * TRIAD_SCENE_SCALE * pixelsPerUnit(o) * dpr * 2);
    const quad = meshAttributes(new PlaneGeometry());
    owned.add(quad);
    letters = GIZMO_MAIN_AXES.map((_axis, i) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = texels;
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      const material = targetMaterial({ sprite: false, map: texture, color: 0xffffff, opacity: 1 }, white);
      owned.add(texture).add(material);
      const sprite = new Mesh(quad, material);
      sprite.onBeforeRender = turnToCamera;
      sprite.renderOrder = 3;
      sprite.scale.set(LABEL_SIZE, LABEL_SIZE, 1);
      sprite.position.setComponent(i, LENGTH + LABEL_GAP);
      object.add(sprite);
      return { canvas, texture };
    });
  };

  return {
    object,
    update(o) {
      const shown = triadShown(o);
      object.parent?.scale.setScalar(shown ? TRIAD_SCENE_SCALE : 1);
      object.visible = shown;
      if (!shown) return;
      if (!lines) create(o);

      // Each line is LINE_WIDTH CSS pixels across inside the scaled scene.
      const radius = LINE_WIDTH / 2 / (pixelsPerUnit(o) * TRIAD_SCENE_SCALE);
      const positions = lines!.geometry.attributes.position as BufferAttribute;
      _scale.set(radius, LENGTH, radius);
      ROTATIONS.forEach((rotation, i) => {
        for (let k = 0; k < count; k++) {
          _vertex.fromArray(base, k * 3).multiply(_scale).applyQuaternion(rotation);
          positions.setXYZ(i * count + k, _vertex.x, _vertex.y, _vertex.z);
        }
      });
      positions.needsUpdate = true;
      const colors = lines!.geometry.attributes.color as BufferAttribute;
      GIZMO_MAIN_AXES.forEach((axis, i) => {
        const { r, g, b } = _color.set(o.triad.colors[axis]);
        for (let k = 0; k < count; k++) colors.setXYZ(i * count + k, r, g, b);
      });
      colors.needsUpdate = true;
      // ponytail: redrawn on every update (three letters), so a font change applies; a late web font waits for one.
      GIZMO_MAIN_AXES.forEach((axis, i) => {
        drawLetter(letters[i].canvas, axis, o);
        letters[i].texture.needsUpdate = true;
      });
    },
  };
};
