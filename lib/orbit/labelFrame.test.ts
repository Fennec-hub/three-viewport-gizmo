import { Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { ViewportGizmoError } from "../errors";
import type { GizmoFaceName } from "../types";
import { axisEndOf, labelFrame, type AxisEnd } from "./labelFrame";

const ENDS: Record<AxisEnd, Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
  nx: new Vector3(-1, 0, 0),
  ny: new Vector3(0, -1, 0),
  nz: new Vector3(0, 0, -1),
};
const END_NAMES = Object.keys(ENDS) as AxisEnd[];
const FACE_NAMES: GizmoFaceName[] = ["top", "bottom", "front", "back", "right", "left"];
const sameAxis = (a: AxisEnd, b: AxisEnd) => a.at(-1) === b.at(-1);

/** The labels 2.3.0 draws per axis end (`optionsFallback.ts` FACE_LABELS_FROM_UP_DIRECTION, v2.3.0). */
const LABELS_2_3_0: Record<"x" | "y" | "z", Record<AxisEnd, string>> = {
  y: { x: "Right", y: "Top", z: "Front", nx: "Left", ny: "Bottom", nz: "Back" },
  z: { x: "Right", y: "Back", z: "Top", nx: "Left", ny: "Front", nz: "Bottom" },
  x: { x: "Top", y: "Front", z: "Right", nx: "Bottom", ny: "Back", nz: "Left" },
};

/** Where 2.3.0's face text points (local +Y after `axesFaces.ts`' lookAt and pole rotations), per up and axis end. */
const TEXT_UP_2_3_0: Record<"x" | "y" | "z", Record<AxisEnd, [number, number, number]>> = {
  y: { x: [0, 1, 0], y: [0, 0, -1], z: [0, 1, 0], nx: [0, 1, 0], ny: [0, 0, 1], nz: [0, 1, 0] },
  z: { x: [0, 0, 1], y: [0, 0, 1], z: [0, 1, 0], nx: [0, 0, 1], ny: [0, 0, 1], nz: [0, -1, 0] },
  x: { x: [0, -1, 0], y: [1, 0, 0], z: [1, 0, 0], nx: [0, 1, 0], ny: [1, 0, 0], nz: [1, 0, 0] },
};

describe("axisEndOf", () => {
  it("should read a near-unit vector as its axis", () => {
    expect(axisEndOf({ x: 0, y: 0, z: 0.9999999 })).toBe("z");
  });

  it("should read a negative axis as the negative end", () => {
    expect(axisEndOf({ x: 0, y: 0, z: -1 })).toBe("nz");
  });

  it("should ignore length", () => {
    expect(axisEndOf({ x: 0, y: -3, z: 0 })).toBe("ny");
  });

  it("should return null for a zero, non-finite or tilted vector", () => {
    expect(axisEndOf({ x: 0, y: 0, z: 0 })).toBeNull();
    expect(axisEndOf({ x: Number.NaN, y: 1, z: 0 })).toBeNull();
    expect(axisEndOf({ x: Number.POSITIVE_INFINITY, y: 0, z: 0 })).toBeNull();
    expect(axisEndOf({ x: 0, y: 1e-3, z: 1 })).toBeNull();
  });
});

describe("labelFrame", () => {
  describe("2.3.0 labels", () => {
    it.each(["y", "z", "x"] as const)("should draw the 2.3.0 label on every axis end for default %s up", (up) => {
      const frame = labelFrame(ENDS[up]);
      const drawn = Object.fromEntries(END_NAMES.map((end) => [end, frame.byEnd[end].label]));
      expect(drawn).toEqual(LABELS_2_3_0[up]);
    });

    it.each(["y", "z", "x"] as const)("should point the label text as 2.3.0 does for default %s up", (up) => {
      const frame = labelFrame(ENDS[up]);
      for (const end of END_NAMES) {
        expect(frame.byEnd[end].textUp.toArray(), end).toEqual(TEXT_UP_2_3_0[up][end]);
      }
    });

    it("should alias front to the face labelled Front on Z up, where 2.3.0 styled the face labelled Back", () => {
      // 2.3.0's GIZMO_AXES_Z_UP sent `front` to +Y and `back` to −Y, while the labels put Front on −Y.
      const frame = labelFrame(ENDS.z);
      expect(frame.faces.front.end).toBe("ny");
      expect(frame.faces.back.end).toBe("y");
    });
  });

  describe("24 frames", () => {
    const frames = END_NAMES.flatMap((up) =>
      END_NAMES.filter((front) => !sameAxis(up, front)).map((front) => [up, front] as const)
    );

    it("should list 24 frames", () => {
      expect(frames).toHaveLength(24);
    });

    it.each(frames)("should be right-handed for up %s and front %s", (up, front) => {
      const frame = labelFrame(ENDS[up], ENDS[front]);
      expect(frame.up.toArray()).toEqual(ENDS[up].toArray());
      expect(frame.front.toArray()).toEqual(ENDS[front].toArray());
      expect(new Vector3().crossVectors(frame.right, frame.up).equals(frame.front)).toBe(true);
    });

    it.each(frames)("should put each face on its own axis end for up %s and front %s", (up, front) => {
      const frame = labelFrame(ENDS[up], ENDS[front]);
      expect(FACE_NAMES.map((name) => frame.faces[name].end).sort()).toEqual([...END_NAMES].sort());
      expect(frame.faces.top.end).toBe(up);
      expect(frame.faces.front.end).toBe(front);
      for (const name of FACE_NAMES) {
        const face = frame.faces[name];
        expect(face.direction.toArray()).toEqual(ENDS[face.end].toArray());
        expect(Math.abs(face.textUp.dot(face.direction))).toBe(0);
      }
    });
  });

  // Scope audit probe P1, inverted: the style alias, the event face and the drawn label name one face.
  describe("probe P1 inverted", () => {
    it.each(END_NAMES)("should agree on alias, event face and drawn label for %s up", (up) => {
      const frame = labelFrame(ENDS[up]);
      for (const end of END_NAMES) {
        const eventFace = frame.byEnd[end].name;
        const drawn = frame.byEnd[end].label;
        expect(frame.faces[eventFace].end, `alias ${eventFace}`).toBe(end);
        expect(drawn.toLowerCase()).toBe(eventFace);
      }
      expect(frame.faces.top.end).toBe(up);
      expect(frame.byEnd[up].label).toBe("Top");
    });

    it.each([
      ["ny", "z"],
      ["nz", "ny"],
      ["nx", "y"],
    ] as const)("should keep the 2.x front of the axis for %s up", (up, front) => {
      expect(labelFrame(ENDS[up]).faces.front.end).toBe(front);
    });
  });

  describe("errors", () => {
    const codeOf = (fn: () => unknown) => {
      try {
        fn();
      } catch (error) {
        expect(error).toBeInstanceOf(ViewportGizmoError);
        return { code: (error as ViewportGizmoError).code, message: (error as Error).message };
      }
      return expect.fail("should have thrown");
    };

    it("should throw INVALID_FRAME for a non-cardinal up", () => {
      expect(codeOf(() => labelFrame({ x: 0.5, y: 0, z: 0.5 }))).toEqual({
        code: "INVALID_FRAME",
        message: "`up` (0.5, 0, 0.5) is not a signed axis. Pass a vector within 1e-6 of ±X, ±Y or ±Z, such as (0, 0, 1).",
      });
    });

    it("should throw INVALID_FRAME for a zero up", () => {
      expect(codeOf(() => labelFrame({ x: 0, y: 0, z: 0 })).code).toBe("INVALID_FRAME");
    });

    it("should throw INVALID_FRAME for a front parallel to up", () => {
      expect(codeOf(() => labelFrame(ENDS.z, ENDS.nz))).toEqual({
        code: "INVALID_FRAME",
        message:
          "`frontDirection` (0, 0, -1) must be a signed axis perpendicular to `up` (0, 0, 1), such as (0, -1, 0).",
      });
    });

    it("should throw INVALID_FRAME for a tilted front", () => {
      expect(codeOf(() => labelFrame(ENDS.y, { x: 1, y: 0, z: 1 })).code).toBe("INVALID_FRAME");
    });
  });
});
