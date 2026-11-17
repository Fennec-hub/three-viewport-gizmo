import { Color, PerspectiveCamera, type ColorRepresentation, type OrthographicCamera } from "three";
import { labelFrame } from "../orbit/labelFrame";
import type {
  GizmoAtTarget,
  GizmoHeading,
  GizmoResolvedOptions,
  GizmoSide,
  GizmoTurn,
  GizmoTurnEnd,
  GizmoView,
} from "../types";

// The built-in navigation buttons (OD2 as reversed, the G0 design on `design/view-cube-arrows`): 16 px round chips with
// a 24 px hit area on a 3 x 3 grid around the cube, rolls in the top corners, Home bottom right, side triangles on the
// edges. No stylesheet is injected: inline styles read the `--viewport-gizmo-button-*` custom properties, each falling
// back to the cube's own style, and `hidden` takes a button out.

/** The gizmo state the buttons read: public members of `ViewportGizmo`. */
export type NavigationGizmo = Readonly<{
  enabled: boolean;
  canRoll: boolean;
  atTarget: GizmoAtTarget | null;
  heading: GizmoHeading | null;
  options: GizmoResolvedOptions;
}>;

/** The turns a button makes, with cause `navigation`, and the grid's distance from the cube's centre. */
export type NavigationActions = Readonly<{
  lookFrom: (view: GizmoView) => Promise<GizmoTurnEnd>;
  turn: (turn: GizmoTurn) => Promise<GizmoTurnEnd>;
  /** CSS pixels from the element's centre to the side and corner buttons: see {@link navigationAnchor}. */
  anchor: () => NavigationAnchor;
}>;

/** The buttons in the element: {@link Navigation.refresh} on each state write, `restyle` on each option change. */
export type Navigation = {
  /** Shows, hides and names the buttons from the gizmo's state. */
  refresh(): void;
  /** Writes the cube's colours and the grid anchor from the options. */
  restyle(): void;
  /** Rewrites the anchor when it changed, as after CSS resizes the element: call it after each measure. */
  place(): void;
  /** Removes the buttons and their listeners, and the anchor property. */
  detach(): void;
};

/** The `data-navigation` values, in tab order (row by row). */
export type NavigationButton = "roll-clockwise" | GizmoSide | "roll-counterclockwise" | "home";

/** CSS pixels from the element's centre to the side buttons' grid line, and to the corner buttons' (per axis). */
export type NavigationAnchor = Readonly<{ side: number; corner: number }>;

const QUARTER = Math.PI / 2;
/** Milliseconds the buttons stay after the pointer leaves the element, so it can cross the gap to one outside it. */
const LINGER = 400;
const HIT = 24;
/** CSS pixels from the cube's silhouette to a chip's centre: the 8 px chip radius and an 11 px gap (G0's 42 px). */
const CLEARANCE = 19;

const ROLL_GLYPH =
  '<path d="M4.5 12.5V9.75A3.5 3.5 0 0 1 8 6.25h1.5" stroke-width="1.4"/><path d="M9.5 3.25 13 6.25 9.5 9.25z" fill="currentColor" stroke-width="1"/>';
const SIDE_GLYPH = '<path d="M8 5.25 11.75 10.5h-7.5z" fill="currentColor" stroke-width="1"/>';
const HOME_GLYPH = '<path d="M2.75 7.5 8 3l5.25 4.5M4.25 6.75v6h7.5v-6"/>';

type Spec = Readonly<{ button: NavigationButton; x: number; y: number; glyph: string; size: number; rotate?: string }>;

const SPECS: readonly Spec[] = [
  { button: "roll-clockwise", x: -1, y: -1, glyph: ROLL_GLYPH, size: 10 },
  { button: "up", x: 0, y: -1, glyph: SIDE_GLYPH, size: 7 },
  { button: "roll-counterclockwise", x: 1, y: -1, glyph: ROLL_GLYPH, size: 10, rotate: "scaleX(-1)" },
  { button: "left", x: -1, y: 0, glyph: SIDE_GLYPH, size: 7, rotate: "rotate(-90deg)" },
  { button: "right", x: 1, y: 0, glyph: SIDE_GLYPH, size: 7, rotate: "rotate(90deg)" },
  { button: "down", x: 0, y: 1, glyph: SIDE_GLYPH, size: 7, rotate: "rotate(180deg)" },
  { button: "home", x: 1, y: 1, glyph: HOME_GLYPH, size: 10 },
];

const isSide = (button: NavigationButton): button is GizmoSide =>
  button === "up" || button === "right" || button === "down" || button === "left";

/**
 * The buttons' distance from the gizmo's centre in CSS pixels, from its projected silhouette. On the cube (perspective)
 * one grid serves both: side triangles clear the face square at a face view, and the corner chips clear the cube's
 * bounding sphere, so no chip covers the cube at any of the 26 views and any roll. The sphere (orthographic) is round,
 * so the corner chips sit on the diagonal at the sides' distance, inside the element's corners within reach.
 *
 * @param camera - The gizmo's own camera, looking down -z at the origin
 * @param scale - The cube's scale in the gizmo's scene (0.7 with the triad)
 * @param size - The gizmo's height in CSS pixels: as measured once rendered, else its `size` option
 */
export function navigationAnchor(
  camera: PerspectiveCamera | OrthographicCamera,
  scale: number,
  size: number,
): NavigationAnchor {
  const half = size / 2;
  if (!(camera instanceof PerspectiveCamera)) {
    const side = half * scale + CLEARANCE;
    return { side, corner: side / Math.SQRT2 };
  }
  const distance = camera.position.z;
  const tan = Math.tan((camera.fov * Math.PI) / 360);
  const face = (half * scale) / ((distance - scale) * tan);
  const bound = (half * Math.tan(Math.asin(Math.min(1, (Math.sqrt(3) * scale) / distance)))) / tan;
  const grid = Math.max(face + CLEARANCE, (bound + CLEARANCE) / Math.SQRT2);
  return { side: grid, corner: grid };
}

const hex = (color: ColorRepresentation) => `#${new Color(color).getHexString()}`;

/**
 * Adds the navigation buttons to `element`. Every press goes through `actions` (cause `navigation`). A button is
 * `hidden` while not offered (Home always; side triangles at a face; rolls at any target while `canRoll`; all while
 * `enabled` is false) or not revealed (`reveal: 'hover'`: pointer over the element, focus within it, or a device
 * without hover). Offered state follows `atTarget`, and the heading's target during a flight, so a click does not blink
 * them.
 *
 * @returns The handle the gizmo refreshes, restyles and detaches
 */
export function attachNavigation(element: HTMLElement, gizmo: NavigationGizmo, actions: NavigationActions): Navigation {
  let hovering = false;
  let focused = false;
  /** Each style value: the host's custom property when set, else the cube's colour (written by `restyle`). */
  const paint: Record<"background" | "ring" | "ring-hover" | "color" | "focus-ring", string> = {
    background: "",
    ring: "",
    "ring-hover": "",
    color: "",
    "focus-ring": "",
  };
  const buttons = SPECS.map((spec) => {
    const button = document.createElement("button");
    button.type = "button";
    button.hidden = true;
    button.dataset.navigation = spec.button;
    const anchor = spec.x && spec.y ? "--viewport-gizmo-anchor-corner" : "--viewport-gizmo-anchor";
    const at = (n: number) => (n ? `calc(50% + var(${anchor}) * ${n} - ${HIT / 2}px)` : `calc(50% - ${HIT / 2}px)`);
    Object.assign(button.style, {
      position: "absolute",
      left: at(spec.x),
      top: at(spec.y),
      width: `${HIT}px`,
      height: `${HIT}px`,
      margin: "0",
      padding: "0",
      border: "0",
      borderRadius: "50%",
      background: "none",
      outline: "none",
    });
    button.innerHTML =
      '<span style="display:grid;place-items:center;width:16px;height:16px;margin:4px;border-radius:50%">' +
      `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="width:${spec.size}px;height:${spec.size}px;transform:${spec.rotate ?? "none"}">` +
      `${spec.glyph}</svg></span>`;
    const chip = button.firstElementChild as HTMLElement;
    const ring = (on: boolean) => {
      button.toggleAttribute("data-hovered", on);
      chip.style.boxShadow = `inset 0 0 0 2px ${paint[on ? "ring-hover" : "ring"]}`;
    };
    // The pointer session never hears a press on a button, so it is a button press, not a cube click or drag.
    button.addEventListener("pointerdown", (event) => event.stopPropagation());
    button.addEventListener("pointerenter", () => ring(true));
    button.addEventListener("pointerleave", () => ring(false));
    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) button.style.outline = `2px solid ${paint["focus-ring"]}`;
    });
    button.addEventListener("blur", () => (button.style.outline = "none"));
    button.addEventListener("click", () => {
      const name = spec.button;
      if (name === "home") void actions.lookFrom("home");
      else if (isSide(name)) void actions.turn({ toward: name });
      // Positive roll turns the scene clockwise on screen (`GizmoTurn.roll`).
      else void actions.turn({ roll: name === "roll-clockwise" ? QUARTER : -QUARTER });
    });
    element.appendChild(button);
    return { spec, button, chip, ring };
  });

  let linger: ReturnType<typeof setTimeout> | undefined;
  const pointer = (on: boolean) => (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    clearTimeout(linger);
    const apply = () => {
      hovering = on;
      handle.refresh();
    };
    // Buttons outside the element are its children, so reaching one re-enters it and cancels the pending hide.
    if (on || !hovering) apply();
    else linger = setTimeout(apply, LINGER);
  };
  const enter = pointer(true);
  const leave = pointer(false);
  const focusin = () => {
    focused = true;
    handle.refresh();
  };
  const focusout = (event: FocusEvent) => {
    focused = element.contains(event.relatedTarget as Node | null);
    handle.refresh();
  };
  element.addEventListener("pointerenter", enter);
  element.addEventListener("pointerleave", leave);
  element.addEventListener("focusin", focusin);
  element.addEventListener("focusout", focusout);

  let placed: NavigationAnchor = { side: Number.NaN, corner: Number.NaN };
  const handle: Navigation = {
    refresh() {
      const o = gizmo.options.navigation;
      // ponytail: read once per refresh, no media listener; a device that gains a mouse re-reads on the next state write.
      const touch = typeof matchMedia === "function" && matchMedia("(hover: none)").matches;
      const revealed = gizmo.enabled && (o.reveal === "always" || hovering || focused || touch);
      const target = gizmo.atTarget?.target ?? gizmo.heading?.target ?? null;
      const sides = gizmo.atTarget?.sides;
      for (const { spec, button, ring } of buttons) {
        const name = spec.button;
        const offered =
          name === "home"
            ? o.home
            : isSide(name)
              ? o.sides && target?.kind === "face"
              : o.roll && gizmo.canRoll && target !== null;
        const hidden = !(offered && revealed);
        if (button.hidden !== hidden) {
          button.hidden = hidden;
          if (hidden) ring(false);
        }
        // Side names follow the face each triangle turns to; during a flight they keep the last ones until it ends.
        const label =
          name === "home"
            ? "Home view"
            : isSide(name)
              ? sides
                ? `Turn to ${sides[name].label}`
                : (button.getAttribute("aria-label") ?? `Turn ${name}`)
              : `Roll view ${name === "roll-clockwise" ? "clockwise" : "counter-clockwise"}`;
        if (button.getAttribute("aria-label") !== label) {
          button.setAttribute("aria-label", label);
          button.title = label;
        }
      }
    },
    restyle() {
      const o = gizmo.options;
      const frame = labelFrame(o.up, o.frontDirection);
      const face = o[frame.faces.front.end];
      // The sphere rings its chips in the up axis's colour (Home is the upright view); its hover is that colour darker.
      const up = o.type === "sphere" ? o[frame.faces.top.end].color : null;
      const upHover = up === null ? null : new Color(up).multiplyScalar(0.7);
      const cube: Record<keyof typeof paint, ColorRepresentation> = {
        // The cube's bevel: its edges where they are drawn (Tau's cube), else the body between the tiles (plain cube,
        // and the sphere, whose edges are never drawn).
        background: o.edges.enabled && o.edges.opacity > 0 ? o.edges.color : o.background.color,
        ring: up ?? face.color,
        "ring-hover": upHover ?? face.hover.color,
        color: face.labelColor,
        "focus-ring": upHover ?? face.hover.color,
      };
      for (const key of Object.keys(paint) as (keyof typeof paint)[]) {
        paint[key] = `var(--viewport-gizmo-button-${key}, ${hex(cube[key])})`;
      }
      handle.place();
      for (const { button, chip, ring } of buttons) {
        button.style.color = paint.color;
        chip.style.background = paint.background;
        ring(button.hasAttribute("data-hovered"));
        if (button.style.outline !== "none") button.style.outline = `2px solid ${paint["focus-ring"]}`;
      }
    },
    place() {
      const anchor = actions.anchor();
      if (anchor.side === placed.side && anchor.corner === placed.corner) return;
      placed = anchor;
      element.style.setProperty("--viewport-gizmo-anchor", `${anchor.side}px`);
      element.style.setProperty("--viewport-gizmo-anchor-corner", `${anchor.corner}px`);
    },
    detach() {
      clearTimeout(linger);
      element.removeEventListener("pointerenter", enter);
      element.removeEventListener("pointerleave", leave);
      element.removeEventListener("focusin", focusin);
      element.removeEventListener("focusout", focusout);
      element.style.removeProperty("--viewport-gizmo-anchor");
      element.style.removeProperty("--viewport-gizmo-anchor-corner");
      for (const { button } of buttons) button.remove();
    },
  };
  return handle;
}
