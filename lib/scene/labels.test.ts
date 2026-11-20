import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3, type CanvasTexture } from "three";
import { resolveOptions } from "../options/resolve";
import type { GizmoOptions } from "../types";
import { GIZMO_AXES } from "../utils/constants";
import type { SceneOptions } from "./build";
import { canvasLabels, labelTexels, textureBytes } from "./labels";

const resolve = (options: GizmoOptions) =>
  resolveOptions(options, { up: new Vector3(0, 1, 0) }) as unknown as SceneOptions;

/** Every texture a cube or sphere scene asks for: its faces, and on the sphere its edge and corner sprites. */
const request = (o: SceneOptions) => {
  const labels = canvasLabels(o);
  const parts = o.type === "sphere" ? [...GIZMO_AXES, "edge", "corner"] as const : GIZMO_AXES;
  const textures = new Set(parts.flatMap((part) => [labels.texture(part, "idle"), labels.texture(part, "hover")]));
  return { labels, textures: [...textures] as CanvasTexture[] };
};

const side = (texture: CanvasTexture) => (texture.image as HTMLCanvasElement).width;

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("canvasLabels", () => {
  it.each([1, 2])("gives the default cube 12 textures within 1.5 MB at device pixel ratio %d", (dpr) => {
    vi.stubGlobal("devicePixelRatio", dpr);
    const o = resolve({ type: "cube" });
    const { textures } = request(o);
    expect(textures).toHaveLength(12);
    // 128 CSS px, faces at scale 0.7: 64.7 px across, so 65 texels at 1 and 130 at 2.
    for (const texture of textures) expect(side(texture)).toBe(dpr === 1 ? 65 : 130);
    expect(textures.reduce((sum, t) => sum + textureBytes(side(t)), 0)).toBeLessThanOrEqual(1.5 * 2 ** 20);
  });

  it("shares a part's texture between idle and hover where their looks are equal (D14)", () => {
    const o = resolve({ type: "cube", x: { hover: { color: 0xffffff } } });
    const { labels, textures } = request(o);
    expect(textures).toHaveLength(10); // x and nx (it fills from x) hover like they rest
    expect(labels.texture("x", "hover")).toBe(labels.texture("x", "idle"));
    expect(labels.texture("y", "hover")).not.toBe(labels.texture("y", "idle"));
  });

  it("sizes sphere labels from size and device pixel ratio unless resolution is set (D13)", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    const o = resolve({ size: 256 });
    // 256 CSS px over ±1.8 units, the x sprite at its hover scale 0.7: 49.8 px, 299 texels at 3 oversampled 2×.
    expect(labelTexels(o, "x", 3)).toBe(299);
    expect(labelTexels(o, "edge", 3)).toBe(86); // hover scale 0.2: 14.2 px
    expect(labelTexels(resolve({ size: 256, resolution: 512 }), "x", 3)).toBe(512);
    expect(labelTexels(resolve({ size: 256, resolution: 32 }), "x", 3)).toBe(32);
  });

  it("frees a hover texture that a cheap change makes equal to idle, and redraws the rest in place", () => {
    const o = resolve({ type: "cube" });
    const { labels, textures } = request(o);
    const hover = labels.texture("y", "hover");
    const dispose = vi.spyOn(hover, "dispose");
    const idle = labels.texture("y", "idle");
    const version = idle.version;
    labels.update(resolve({ type: "cube", y: { hover: { color: 0xffffff } } }));
    expect(dispose).toHaveBeenCalled();
    expect(labels.texture("y", "hover")).toBe(idle);
    expect(idle.version).toBeGreaterThan(version);
    labels.dispose();
    expect(textures).toHaveLength(12);
  });

  it("draws rounded-cube faces edge to edge, since its pieces carry the rounding (S5)", () => {
    const radii: number[] = [];
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        new Proxy(
          {
            arcTo: (...args: number[]) => radii.push(args[4]),
            measureText: (text: string) => ({ width: text.length * 10 }),
          },
          { get: (target, key) => (key in target ? target[key as keyof typeof target] : () => {}) }
        ) as never
    );
    request(resolve({ type: "rounded-cube" }));
    expect(radii.length).toBeGreaterThan(0);
    expect(new Set(radii)).toEqual(new Set([0]));
    radii.length = 0;
    request(resolve({ type: "cube" }));
    expect(Math.min(...radii)).toBeGreaterThan(0);
  });

  it("draws at finite coordinates when the browser has no font bounding box metrics (U3)", () => {
    const calls: { font: string; y: number }[] = [];
    let font = "";
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () =>
        new Proxy(
          {
            set font(value: string) {
              font = value;
            },
            get font() {
              return font;
            },
            measureText: (text: string) => ({ width: text.length * 10 }), // no bounding box metrics at all
            fillText: (_: string, __: number, y: number) => calls.push({ font, y }),
          },
          { get: (target, key) => (key in target ? target[key as keyof typeof target] : () => {}) }
        ) as never
    );
    for (const type of ["sphere", "cube"] as const) request(resolve({ type }));
    expect(calls.length).toBeGreaterThan(0);
    for (const { font, y } of calls) {
      expect(Number.isFinite(y)).toBe(true);
      expect(font).toMatch(/^900 \d+px sans-serif$/);
    }
  });

  it("redraws on a late font without set() and asks for a frame", () => {
    const fonts = new EventTarget();
    vi.stubGlobal("document", Object.assign(document, { fonts }));
    const { labels } = request(resolve({ type: "cube" }));
    const texture = labels.texture("x", "idle");
    const version = texture.version;
    labels.onRedraw = vi.fn();
    fonts.dispatchEvent(new Event("loadingdone"));
    expect(texture.version).toBeGreaterThan(version);
    expect(labels.onRedraw).toHaveBeenCalledOnce();
    labels.dispose();
    fonts.dispatchEvent(new Event("loadingdone"));
    expect(labels.onRedraw).toHaveBeenCalledOnce();
  });
});
