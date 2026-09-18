import { describe, expectTypeOf, it } from "vitest";
import type { GizmoAxisObjectUserData } from "../types.js";

describe("GizmoAxisObjectUserData", () => {
  it("exposes optional intersectionOrder for raycast tie-break metadata", () => {
    expectTypeOf<GizmoAxisObjectUserData["intersectionOrder"]>().toEqualTypeOf<
      number | undefined
    >();
  });
});
