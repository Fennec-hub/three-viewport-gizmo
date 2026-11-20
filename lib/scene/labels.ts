import { CanvasTexture, Color, SRGBColorSpace, type ColorRepresentation, type Texture } from "three";
import type { AxisEnd } from "../orbit/labelFrame";
import { DEFAULT_FIELD_OF_VIEW } from "../render/internalCamera";
import { GIZMO_AXES } from "../utils/constants";
import type { SceneOptions } from "./build";
import type { LabelProvider, LabelTextures } from "./faces";

/** A label's owner: a face by its axis end, or every edge or corner sprite of the sphere. */
export type LabelPart = AxisEnd | "edge" | "corner";

/** What one label texture shows. Equal looks of a part's idle and hover states share one texture (D14). */
type Look = Readonly<{
  label: string;
  color: ColorRepresentation;
  labelColor: ColorRepresentation;
  border: Readonly<{ size: number; color: ColorRepresentation }> | null;
  radius: number;
}>;

/**
 * Gizmo CSS pixels per world unit. The sphere's camera is orthographic over ±1.8; the cube's front face keeps its
 * 2.3.0 projected size under any `fieldOfView`, `(7 - 1) * tan(13°)` above the centre.
 */
const UNITS_PER_SIZE = { sphere: 3.6, cube: 2 * 6 * Math.tan(DEFAULT_FIELD_OF_VIEW / 2) } as const;

/**
 * Texels per device pixel. A sphere sprite is a small glyph that bilinear filtering at 1:1 visibly softens; its 16
 * textures at 2× stay under 1 MB at device pixel ratio 2. The cube's faces are large enough at 1:1, and 2× would put
 * its 12 textures over the 1.5 MB budget (P3).
 */
const OVERSAMPLE = { sphere: 2, cube: 1 } as const;

/** A `font` size fallback for the descent when the browser reports no metric (U3): about Arial's. */
const DESCENT_PER_EM = 0.21;

const _color = /*@__PURE__*/ new Color();
const hex = (color: ColorRepresentation) => (color === "" ? "none" : _color.set(color).getHexString());

const lookOf = (o: SceneOptions, part: LabelPart, state: "idle" | "hover"): Look => {
  if (part === "edge" || part === "corner") {
    const { color, hover, radius } = part === "edge" ? o.edges : o.corners;
    return { label: "", color: state === "hover" ? hover.color : color, labelColor: 0, border: null, radius };
  }
  const t = o[part];
  const s = state === "hover" ? t.hover : t;
  // The rounded cube's pieces carry the rounding, so its face labels bleed to the edge: a rounded corner or gutter
  // would show as slivers in the corner notches and lines along the face boundaries (S5).
  const radius = o.type === "rounded-cube" ? 0 : o.radius;
  return { label: t.label, color: s.color, labelColor: s.labelColor, border: s.border, radius };
};

const keyOf = ({ label, color, labelColor, border, radius }: Look) =>
  [label, hex(color), hex(labelColor), border?.size ? `${border.size}:${hex(border.color)}` : "", radius].join("|");

/** A part's size on screen, in CSS pixels, at the larger of its idle and hover scale. */
function cssExtent(o: SceneOptions, part: LabelPart): number {
  const sphere = o.type === "sphere";
  const { scale, hover } = part === "edge" ? o.edges : part === "corner" ? o.corners : o[part];
  // A sprite is one unit across; a face is two, less the rounded cube's rounding (its UVs span `±(1 - radius)`).
  const units = sphere ? 1 : o.type === "rounded-cube" ? 2 - 2 * o.radius : 2;
  return (units * Math.max(scale, hover.scale) * o.size) / UNITS_PER_SIZE[sphere ? "sphere" : "cube"];
}

/**
 * The side of a part's label texture in texels: `resolution` when the caller set it, else the label's size on screen
 * in device pixels (D13), oversampled on the sphere.
 *
 * @param dpr - Device pixel ratio
 */
export function labelTexels(o: SceneOptions, part: LabelPart, dpr: number): number {
  return o.resolution ?? Math.ceil(cssExtent(o, part) * dpr * OVERSAMPLE[o.type === "sphere" ? "sphere" : "cube"]);
}

/** RGBA8 bytes of a square texture of side `texels` with its full mip chain: four thirds of the base level. */
export const textureBytes = (texels: number): number => Math.ceil((texels * texels * 4 * 4) / 3);

/**
 * Draws a label into its own canvas, edge to edge: the rounded background, the border, then the text centred on its
 * ink. The font fills the square of the longest face label, as in 2.3.0, unless `font.size` sets it in CSS pixels.
 */
function drawLabel(canvas: HTMLCanvasElement, look: Look, o: SceneOptions, texelsPerCss: number): void {
  const n = canvas.width;
  canvas.width = n; // clears the canvas and its state
  const ctx = canvas.getContext("2d")!;
  let x = 0;
  let size = n;
  let radius = (look.radius * n) / 2;
  // `arcTo`, not `roundRect`: the browsers U3 covers predate it.
  const path = () => {
    const end = x + size;
    ctx.beginPath();
    ctx.moveTo(x + radius, x);
    ctx.arcTo(end, x, end, end, radius);
    ctx.arcTo(end, end, x, end, radius);
    ctx.arcTo(x, end, x, x, radius);
    ctx.arcTo(x, x, end, x, radius);
    ctx.closePath();
  };
  if (look.color !== "") {
    path();
    ctx.fillStyle = _color.set(look.color).getStyle();
    ctx.fill();
  }
  if (look.border?.size) {
    const half = (look.border.size * n) / 2;
    x += half;
    size -= 2 * half;
    radius = Math.max(0, radius - half);
    path();
    ctx.strokeStyle = _color.set(look.border.color).getStyle();
    ctx.lineWidth = 2 * half;
    ctx.stroke();
  }
  if (!look.label) return;

  const { family, weight, size: fontSize = 0 } = o.font;
  // The sphere's text fits the square inside its 0.7 circle.
  const square = o.type === "sphere" ? (n * 0.7) / Math.SQRT2 : n;
  let px = fontSize > 0 ? fontSize * texelsPerCss : square;
  if (!(fontSize > 0)) {
    const longest = GIZMO_AXES.map((end) => o[end].label).reduce((a, b) => (b.length > a.length ? b : a), "");
    ctx.font = `${weight} ${square}px ${family}`;
    const width = ctx.measureText(longest).width;
    if (width > 0) px = (square * square) / width;
  }
  ctx.font = `${weight} ${Math.floor(px)}px ${family}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = _color.set(look.labelColor).getStyle();
  // Centre the ink; without ink metrics (U3) fall back to the font's, then to a fraction of the em.
  const m = ctx.measureText(look.label);
  const ascent = m.actualBoundingBoxAscent ?? (m.fontBoundingBoxAscent || px * (1 - DESCENT_PER_EM));
  const descent = m.actualBoundingBoxDescent ?? (m.fontBoundingBoxDescent || px * DESCENT_PER_EM);
  ctx.fillText(look.label, n / 2, (n + ascent - descent) / 2);
}

type Entry = { canvas: HTMLCanvasElement; texture: CanvasTexture; look: Look };

/**
 * One small texture per label (P3, R25): a face's own, sized from `size` and the device pixel ratio (D13), and a
 * hover texture only where the hover look differs (D14). The cube's edges and corners have none. Late web fonts redraw
 * every texture in place (R25): a `loadingdone` on `document.fonts` needs no `set()`, and `onRedraw` asks for a frame.
 */
export const canvasLabels: LabelProvider = (built) => {
  const dpr = globalThis.devicePixelRatio || 1;
  let o = built;
  const entries = new Map<string, Entry>();

  const draw = (part: LabelPart, entry: Entry) =>
    drawLabel(entry.canvas, entry.look, o, entry.canvas.width / cssExtent(built, part));

  const redraw = (next: SceneOptions) => {
    o = next;
    for (const [key, entry] of entries) {
      const [part, state] = key.split("|") as [LabelPart, "idle" | "hover"];
      const look = lookOf(o, part, state);
      // A hover look now equal to idle frees its texture; `texture()` hands out the idle one.
      if (state === "hover" && keyOf(look) === keyOf(lookOf(o, part, "idle"))) {
        entry.texture.dispose();
        entries.delete(key);
        continue;
      }
      entry.look = look;
      draw(part, entry);
      entry.texture.needsUpdate = true;
    }
  };

  const onFonts = () => {
    redraw(o);
    labels.onRedraw?.();
  };
  globalThis.document?.fonts?.addEventListener("loadingdone", onFonts);

  const labels: LabelTextures = {
    texture(part, state): Texture {
      const look = lookOf(o, part, state);
      if (state === "hover" && keyOf(look) === keyOf(lookOf(o, part, "idle"))) return labels.texture(part, "idle");
      const key = `${part}|${state}`;
      let entry = entries.get(key);
      if (!entry) {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = labelTexels(built, part, dpr);
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        entries.set(key, (entry = { canvas, texture, look }));
        draw(part, entry);
      }
      return entry.texture;
    },
    update: redraw,
    dispose() {
      globalThis.document?.fonts?.removeEventListener("loadingdone", onFonts);
      for (const { texture } of entries.values()) texture.dispose();
      entries.clear();
    },
  };
  return labels;
};
