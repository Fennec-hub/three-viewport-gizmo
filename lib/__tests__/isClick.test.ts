import { describe, expect, it } from "vitest";
import { classifyClick, isClick, noClick, type ClickMark } from "../interaction/isClick";

describe("isClick", () => {
  it("should stay a click inside the 10 px box and stop at its edge", () => {
    const start = { x: 100, y: 100 };
    expect(isClick({ clientX: 109, clientY: 91 }, start)).toBe(true);
    expect(isClick({ clientX: 110, clientY: 100 }, start)).toBe(false);
    expect(isClick({ clientX: 100, clientY: 90 }, start)).toBe(false);
  });
});

describe("classifyClick (G0 rule)", () => {
  const first: ClickMark = { at: 1000, x: 50, y: 50 };

  // [case, second press, expected double]
  const table: [string, ClickMark, boolean][] = [
    ["same spot, 100 ms later", { at: 1100, x: 50, y: 50 }, true],
    ["4 px away, 399 ms later", { at: 1399, x: 54, y: 50 }, true],
    ["3, 4 px away (5 px), 100 ms later", { at: 1100, x: 53, y: 54 }, false],
    ["same spot, 400 ms later", { at: 1400, x: 50, y: 50 }, false],
    ["same spot, 2 s later", { at: 3000, x: 50, y: 50 }, false],
    ["30 px away on another target, 100 ms later", { at: 1100, x: 80, y: 50 }, false],
  ];

  it.each(table)("should classify a second press %s", (_, second, double) => {
    expect(classifyClick(first, second).double).toBe(double);
  });

  it("should never make the first click a double-click", () => {
    expect(classifyClick(noClick, first)).toEqual({ double: false, next: first });
  });

  it("should start over after a double-click, so a third quick click is a single", () => {
    const second = classifyClick(first, { at: 1100, x: 50, y: 50 });
    expect(second).toEqual({ double: true, next: noClick });
    expect(classifyClick(second.next, { at: 1200, x: 50, y: 50 }).double).toBe(false);
  });

  it("should compare a missed second click's successor with that second click", () => {
    const late = { at: 2000, x: 50, y: 50 };
    const { next } = classifyClick(first, late);
    expect(next).toBe(late);
    expect(classifyClick(next, { at: 2100, x: 50, y: 50 }).double).toBe(true);
  });
});
