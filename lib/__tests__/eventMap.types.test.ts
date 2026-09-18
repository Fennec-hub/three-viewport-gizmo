import { describe, expectTypeOf, it } from "vitest";
import type { Vector3 } from "three";
import type {
  GizmoAxisKind,
  GizmoAxisName,
  GizmoAxisObject,
  GizmoAxisObjectUserData,
  GizmoFaceName,
  ViewportGizmoEventMap,
} from "../types.js";
import { GIZMO_AXES, GIZMO_FACES } from "../utils/constants.js";

describe("ViewportGizmoEventMap + userData contracts", () => {
  it("change and hoverchange carry identity fields", () => {
    expectTypeOf<ViewportGizmoEventMap["change"]>().toMatchTypeOf<{
      kind: GizmoAxisKind | null;
      axes: readonly GizmoAxisName[] | null;
      face: GizmoFaceName | null;
      direction: Vector3 | null;
    }>();
    expectTypeOf<ViewportGizmoEventMap["hoverchange"]>().toMatchTypeOf<{
      object: GizmoAxisObject | null;
      kind: GizmoAxisKind | null;
      axes: readonly GizmoAxisName[] | null;
      face: GizmoFaceName | null;
      direction: Vector3 | null;
    }>();
  });

  it("GizmoAxisObjectUserData optional fields", () => {
    expectTypeOf<GizmoAxisObjectUserData["kind"]>().toEqualTypeOf<
      GizmoAxisKind | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["axes"]>().toEqualTypeOf<
      readonly GizmoAxisName[] | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["face"]>().toEqualTypeOf<
      GizmoFaceName | undefined
    >();
    expectTypeOf<GizmoAxisObjectUserData["intersectionOrder"]>().toEqualTypeOf<
      number | undefined
    >();
  });

  it("constants tuples narrow to name unions (regression sentinel)", () => {
    expectTypeOf<(typeof GIZMO_FACES)[number]>().toEqualTypeOf<GizmoFaceName>();
    expectTypeOf<(typeof GIZMO_AXES)[number]>().toEqualTypeOf<GizmoAxisName>();
  });
});
