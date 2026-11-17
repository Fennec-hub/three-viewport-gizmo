import { afterEach, describe, expect, it } from "vitest";
import { ViewportGizmoError } from "../../errors";
import { createGizmoElement, GizmoElementOptions, resolveContainer, updateGizmoElement, writeGizmoState } from "../dom";

const options: GizmoElementOptions = {
  placement: "top-right",
  size: 128,
  offset: { top: 10, right: 10, bottom: 10, left: 10 },
  className: "viewport-gizmo-cube",
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("createGizmoElement", () => {
  it("writes only position, size, margin, placement and touch-action", () => {
    const element = createGizmoElement({ ...options, id: "gizmo" });
    const { style } = element;

    expect(style.position).toBe("absolute");
    expect(style.touchAction).toBe("none");
    // The options are the fallbacks of custom properties a host stylesheet can set without `!important`.
    expect(style.width).toBe("var(--viewport-gizmo-width, 128px)");
    expect(style.height).toBe("var(--viewport-gizmo-height, 128px)");
    expect(style.margin).toBe("var(--viewport-gizmo-margin, 10px 10px 10px 10px)");
    expect(style.top).toBe("0px");
    expect(style.right).toBe("0px");
    expect(style.cursor).toBe("");
    expect(style.zIndex).toBe("");
    expect(style.borderRadius).toBe("");
    expect(element.getAttribute("style")).not.toMatch(/(^|;)\s*id\s*:/);
    expect(element.id).toBe("gizmo");
    expect(element.className).toBe("viewport-gizmo-cube");
    for (const name of ["role", "tabindex", "aria-label", "data-hovered", "data-dragging", "data-disabled"]) {
      expect(element.hasAttribute(name)).toBe(false);
    }
  });

  it("centres with a transform", () => {
    const { style } = createGizmoElement({ ...options, placement: "center-center" });
    expect([style.left, style.top, style.transform]).toEqual(["50%", "50%", "translateX(-50%) translateY(-50%)"]);
  });
});

describe("updateGizmoElement", () => {
  it("keeps the element and what the host and later capabilities put on it", () => {
    const element = createGizmoElement({ ...options, id: "a" });
    const child = element.appendChild(document.createElement("button"));
    element.setAttribute("role", "application");
    element.setAttribute("aria-label", "View cube");
    element.tabIndex = 0;
    element.classList.add("host-class");
    element.style.setProperty("--viewport-gizmo-anchor", "40px");
    writeGizmoState(element, { hovered: "face", dragging: false, disabled: false });

    const next = { ...options, size: 96, placement: "bottom-left" as const, className: "viewport-gizmo-sphere" };
    updateGizmoElement(element, next, { ...options, id: "a" });

    expect(element.style.width).toBe("var(--viewport-gizmo-width, 96px)");
    expect([element.style.bottom, element.style.left, element.style.top, element.style.right]).toEqual(["0px", "0px", "", ""]);
    expect(element.style.transform).toBe("");
    expect(element.hasAttribute("id")).toBe(false);
    expect(element.className).toBe("host-class viewport-gizmo-sphere");
    expect(element.firstChild).toBe(child);
    expect(element.getAttribute("role")).toBe("application");
    expect(element.getAttribute("aria-label")).toBe("View cube");
    expect(element.tabIndex).toBe(0);
    expect(element.style.getPropertyValue("--viewport-gizmo-anchor")).toBe("40px");
    expect(element.getAttribute("data-hovered")).toBe("face");
    expect(element.style.touchAction).toBe("none");
  });

  it("leaves a host-set id alone when the option does not change", () => {
    const element = createGizmoElement(options);
    element.id = "host";
    updateGizmoElement(element, { ...options, size: 64 }, options);
    expect(element.id).toBe("host");
  });
});

describe("writeGizmoState", () => {
  // The styling guide's attribute table (revision 3): the names and values are the public contract.
  it.each([
    [{ hovered: null, dragging: false, disabled: false }, {}],
    [{ hovered: "face", dragging: false, disabled: false }, { "data-hovered": "face" }],
    [{ hovered: "edge", dragging: false, disabled: false }, { "data-hovered": "edge" }],
    [{ hovered: "corner", dragging: false, disabled: false }, { "data-hovered": "corner" }],
    [{ hovered: null, dragging: true, disabled: false }, { "data-dragging": "" }],
    [{ hovered: null, dragging: false, disabled: true }, { "data-disabled": "" }],
    [{ hovered: "edge", dragging: true, disabled: true }, { "data-hovered": "edge", "data-dragging": "", "data-disabled": "" }],
  ] as const)("%o writes %o", (state, expected) => {
    const element = createGizmoElement(options);
    writeGizmoState(element, { hovered: "corner", dragging: true, disabled: true });
    writeGizmoState(element, state);

    const written = Object.fromEntries(
      element.getAttributeNames().filter((name) => name.startsWith("data-")).map((name) => [name, element.getAttribute(name)]),
    );
    expect(written).toEqual(expected);
  });
});

describe("resolveContainer", () => {
  it("defaults to the canvas's parent", () => {
    const stage = document.body.appendChild(document.createElement("div"));
    const canvas = stage.appendChild(document.createElement("canvas"));
    expect(resolveContainer(undefined, canvas)).toBe(stage);
  });

  it("takes an element or a selector", () => {
    const stage = document.body.appendChild(document.createElement("div"));
    stage.id = "stage";
    const canvas = document.createElement("canvas");
    expect(resolveContainer(stage, canvas)).toBe(stage);
    expect(resolveContainer("#stage", canvas)).toBe(stage);
  });

  it.each([
    ["a canvas with no parent", undefined],
    ["a selector that matches nothing", "#missing"],
  ])("throws CONTAINER_MISSING naming container for %s", (_, container) => {
    const error = (() => {
      try {
        resolveContainer(container, document.createElement("canvas"));
      } catch (caught) {
        return caught;
      }
    })();
    expect(error).toBeInstanceOf(ViewportGizmoError);
    expect(error).toMatchObject({ code: "CONTAINER_MISSING", message: expect.stringContaining("container") });
  });
});
