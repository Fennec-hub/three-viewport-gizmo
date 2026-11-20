import {
  type Camera,
  CanvasTexture,
  Color,
  DataTexture,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  type MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
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

/** Each line's soft edge: its alpha falls from 1 to 0 over this many device pixels, centred on the line's edge. */
const FEATHER = 1;
const _camera = /*@__PURE__*/ new Vector3();
const _normal = /*@__PURE__*/ new Vector3();
const _side = /*@__PURE__*/ new Vector3();
const _basis = /*@__PURE__*/ new Matrix4();
const _color = /*@__PURE__*/ new Color();
const AXES = /*@__PURE__*/ [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];

/**
 * The lines' cross-section: `texels` white texels whose alpha is each one's coverage of a line `width` device pixels
 * across, on a ribbon `width + 2 * FEATHER` across, so the edge texels are clear and linear sampling feathers the edge.
 * Antialiased whether or not the host's target has MSAA (Tau's node pipeline is single-sample).
 */
function crossSection(width: number): DataTexture {
  const across = width + 2 * FEATHER;
  const texels = Math.ceil(across);
  const data = new Uint8Array(texels * 4).fill(255);
  for (let i = 0; i < texels; i++) {
    const distance = Math.abs((i + 0.5) / texels - 0.5) * across;
    data[i * 4 + 3] = Math.round(255 * Math.min(Math.max(width / 2 + FEATHER / 2 - distance, 0), 1));
  }
  const texture = new DataTexture(data, texels, 1);
  // A label's sampling (`CanvasTexture` defaults): on WebGPU the sampler is part of the pipeline.
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

/** An `onBeforeRender` that turns an axis ribbon about its axis (local +Y) to face `camera`, as a line is drawn. */
function faceAlongAxis(this: Mesh, _renderer: unknown, _scene: unknown, camera: Camera): void {
  const axis = AXES[this.userData.axis as number];
  camera.getWorldPosition(_camera);
  this.parent!.worldToLocal(_camera).addScaledVector(axis, -LENGTH / 2);
  _normal.copy(_camera).addScaledVector(axis, -_camera.dot(axis));
  // Seen end-on the line is a point: any side will do.
  if (_normal.lengthSq() < 1e-12) _normal.set(axis.y, axis.z, axis.x);
  _side.crossVectors(axis, _normal.normalize());
  this.quaternion.setFromRotationMatrix(_basis.makeBasis(_side, axis, _normal));
  this.updateMatrixWorld();
}

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
 * or Z label past each tip in the axis colour. The lines are three ribbons turned about their axes to face the camera,
 * feathered by {@link crossSection} so they are smooth without MSAA, and the labels three camera-facing quads, all on
 * the targets' program (`targetMaterial`), so showing the triad adds no program or pipeline (perf budget `programs`).
 * Nothing is built until the triad first shows, so a gizmo without it pays nothing; toggling it after that writes
 * `visible` and the scene's scale only. Draws while shown: 6 (three lines, three labels).
 */
export const triad: PartBuilder = (_, __, owned) => {
  const object = new Group();
  object.position.setScalar(ORIGIN);
  let lines: Mesh<PlaneGeometry, MeshBasicMaterial>[] | null = null;
  let letters: { canvas: HTMLCanvasElement; texture: CanvasTexture }[] = [];
  let dpr = 1;

  const create = (o: SceneOptions) => {
    // Texture sizes fixed at first show, as the face labels' are at build (S2).
    dpr = globalThis.devicePixelRatio || 1;
    const section = crossSection(LINE_WIDTH * dpr);
    const ribbon = meshAttributes(new PlaneGeometry().translate(0, 0.5, 0));
    const white = whiteTexture(owned);
    owned.add(section).add(ribbon);
    lines = GIZMO_MAIN_AXES.map((_axis, i) => {
      const material = targetMaterial({ sprite: false, map: section, color: 0xffffff, opacity: 1 }, white) as MeshBasicMaterial;
      owned.add(material);
      const line = new Mesh(ribbon, material);
      line.userData.axis = i;
      line.onBeforeRender = faceAlongAxis;
      line.renderOrder = 2;
      object.add(line);
      return line;
    });

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

      // Each ribbon is LINE_WIDTH CSS pixels and its feather across inside the scaled scene.
      const across = (LINE_WIDTH + (2 * FEATHER) / dpr) / (pixelsPerUnit(o) * TRIAD_SCENE_SCALE);
      GIZMO_MAIN_AXES.forEach((axis, i) => {
        lines![i].scale.set(across, LENGTH, 1);
        lines![i].material.color.set(o.triad.colors[axis]);
      });
      // ponytail: redrawn on every update (three letters), so a font change applies; a late web font waits for one.
      GIZMO_MAIN_AXES.forEach((axis, i) => {
        drawLetter(letters[i].canvas, axis, o);
        letters[i].texture.needsUpdate = true;
      });
    },
  };
};
