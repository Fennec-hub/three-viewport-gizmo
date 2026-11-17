import { ViewportGizmoError } from "../errors";
import type { GizmoOptions, GizmoTargetKind } from "../types";

/** The options the gizmo's element is built from, with defaults filled. */
export type GizmoElementOptions = {
  placement: NonNullable<GizmoOptions["placement"]>;
  size: number;
  offset: Required<NonNullable<GizmoOptions["offset"]>>;
  id?: string;
  className?: string;
};

/** The interaction state the element reports as `data-*` attributes (styling guide revision 3). */
export type GizmoElementState = {
  /** The kind of the hovered target, or `null`. Written as `data-hovered="face|edge|corner"`. */
  hovered: GizmoTargetKind | null;
  /** A drag is in progress. Written as `data-dragging=""`. */
  dragging: boolean;
  /** `enabled` is false. Written as `data-disabled=""`. */
  disabled: boolean;
};

/**
 * Finds the element the gizmo's element goes into: `container` itself, the element a selector matches, or, when
 * `container` is absent, the canvas's parent.
 *
 * @param container - The `container` option
 * @param canvas - The renderer's canvas
 * @returns The container element
 * @throws {ViewportGizmoError} `CONTAINER_MISSING` when a selector matches nothing, or the canvas has no parent
 */
export function resolveContainer(container: HTMLElement | string | undefined, canvas: HTMLElement): HTMLElement {
  if (typeof container === "string") {
    const element = document.querySelector<HTMLElement>(container);
    if (element) return element;
    throw new ViewportGizmoError(
      "CONTAINER_MISSING",
      `ViewportGizmo: no element matches container "${container}". Pass the element itself, or construct the gizmo after the container is in the document.`,
    );
  }
  if (container) return container;
  if (canvas.parentElement) return canvas.parentElement;
  throw new ViewportGizmoError(
    "CONTAINER_MISSING",
    "ViewportGizmo: the canvas has no parent element to hold the gizmo. Pass a `container`, or add the canvas to the document first.",
  );
}

/**
 * Creates the gizmo's one element. It lives as long as the gizmo: `set()` updates it with
 * {@link updateGizmoElement}, never replaces it.
 *
 * The library writes only its position, size, margin and `touch-action: none` inline. It writes no cursor, stacking
 * order or corner radius: the host styles those through `className`, `id` and the state attributes.
 *
 * Seam for keyboard operation (I3) and the navigation buttons (I4): this module never writes `role`, `tabindex`,
 * `aria-*`, custom properties or children, and never clears them, so the keyboard capability can make the element
 * focusable and add its status child, and the buttons can live inside it, all surviving every `set()`.
 *
 * @param options - Placement, size, offset, `id` and `className`
 * @returns The element, not yet in the document
 */
export function createGizmoElement(options: GizmoElementOptions): HTMLDivElement {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.touchAction = "none";
  updateGizmoElement(element, options);
  return element;
}

/**
 * Writes the options into the element in place. `id` and `className` change only when they differ from `previous`,
 * so attributes and classes a host added survive.
 *
 * @param element - The element from {@link createGizmoElement}
 * @param options - The new options
 * @param previous - The options last written, if any
 */
export function updateGizmoElement(element: HTMLElement, options: GizmoElementOptions, previous?: GizmoElementOptions) {
  const { size, placement, offset } = options;
  const [y, x] = placement.split("-");
  Object.assign(element.style, {
    // Each size and offset reads a custom property first, so a host's stylesheet can set
    // `--viewport-gizmo-width`, `--viewport-gizmo-height` or `--viewport-gizmo-margin` on the element without
    // `!important` and without the library shipping a stylesheet; the options are the fallback.
    width: `var(--viewport-gizmo-width, ${size}px)`,
    height: `var(--viewport-gizmo-height, ${size}px)`,
    margin: `var(--viewport-gizmo-margin, ${offset.top}px ${offset.right}px ${offset.bottom}px ${offset.left}px)`,
    left: x === "left" ? "0" : x === "center" ? "50%" : "",
    right: x === "right" ? "0" : "",
    top: y === "top" ? "0" : y === "center" ? "50%" : "",
    bottom: y === "bottom" ? "0" : "",
    transform: [x === "center" && "translateX(-50%)", y === "center" && "translateY(-50%)"].filter(Boolean).join(" "),
  });

  if (options.id !== previous?.id) {
    if (options.id) element.id = options.id;
    else element.removeAttribute("id");
  }
  if (options.className !== previous?.className) {
    element.classList.remove(...tokens(previous?.className));
    element.classList.add(...tokens(options.className));
  }
}

/**
 * Writes the interaction state as `data-hovered`, `data-dragging` and `data-disabled`, removing each when off.
 *
 * @param element - The element from {@link createGizmoElement}
 * @param state - The current state
 */
export function writeGizmoState(element: HTMLElement, { hovered, dragging, disabled }: GizmoElementState) {
  if (hovered) element.setAttribute("data-hovered", hovered);
  else element.removeAttribute("data-hovered");
  element.toggleAttribute("data-dragging", dragging);
  element.toggleAttribute("data-disabled", disabled);
}

const tokens = (className: string | undefined) => className?.split(/\s+/).filter(Boolean) ?? [];
