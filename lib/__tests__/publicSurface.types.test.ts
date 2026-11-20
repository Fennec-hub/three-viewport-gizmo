// The 3.0 public contract (K3). `tsconfig.json` lists this file in `files`, so `:typecheck` checks every
// `expectTypeOf` and `@ts-expect-error` here; `:test` runs the runtime half.
import { describe, expect, expectTypeOf, it } from "vitest";
import { Vector3, type Color, type Object3D, type Scene, type Texture, type Vector3Like } from "three";
import type CameraControls from "camera-controls";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  ViewportGizmo,
  ViewportGizmoError,
  type GizmoAtTarget,
  type GizmoCause,
  type GizmoControls,
  type GizmoErrorCode,
  type GizmoFaceName,
  type GizmoHeading,
  type GizmoLimits,
  type GizmoLookFromOptions,
  type GizmoMaterial,
  type GizmoMaterialUse,
  type GizmoNavigationOptions,
  type GizmoOptions,
  type GizmoOutcome,
  type GizmoPose,
  type GizmoResolvedOptions,
  type GizmoSide,
  type GizmoTarget,
  type GizmoTargetKind,
  type GizmoTargetName,
  type GizmoTargetOptions,
  type GizmoTurn,
  type GizmoTurnEnd,
  type GizmoView,
  type GizmoViewport,
  type ViewportGizmoEventMap,
} from "../index.js";
import * as entry from "../index.js";

const targetNames = [
  "top",
  "bottom",
  "front",
  "back",
  "right",
  "left",
  "top-front",
  "top-back",
  "bottom-front",
  "bottom-back",
  "top-right",
  "top-left",
  "bottom-right",
  "bottom-left",
  "front-right",
  "front-left",
  "back-right",
  "back-left",
  "top-front-right",
  "top-front-left",
  "top-back-right",
  "top-back-left",
  "bottom-front-right",
  "bottom-front-left",
  "bottom-back-right",
  "bottom-back-left",
] as const satisfies readonly GizmoTargetName[];

const errorCodes = [
  "DOCUMENT_MISSING",
  "CONTAINER_MISSING",
  "UNKNOWN_OPTION",
  "INVALID_OPTION",
  "REMOVED_OPTION",
  "REMOVED_MEMBER",
  "INVALID_FRAME",
  "ROLL_UNSUPPORTED",
  "UNKNOWN_VIEW",
  "INVALID_TURN",
  "DISPOSED",
] as const satisfies readonly GizmoErrorCode[];

const pose: GizmoPose = { direction: new Vector3(0, 0, 1), up: new Vector3(0, 1, 0) };

/** Reads every outcome's own field after narrowing on `status` alone; a missing case fails to compile. */
const describeOutcome = (end: GizmoTurnEnd): string => {
  const { outcome } = end;
  switch (outcome.status) {
    case "reached": {
      return "reached";
    }
    case "interrupted": {
      expectTypeOf(outcome.by).toEqualTypeOf<GizmoCause>();
      return `interrupted by ${outcome.by}`;
    }
    case "cancelled": {
      return `cancelled: ${outcome.reason}`;
    }
    case "unavailable": {
      expectTypeOf(outcome.reason).toEqualTypeOf<"roll-off">();
      return `unavailable: ${outcome.reason}`;
    }
  }
};

describe("public surface", () => {
  it("names every target, kind and face once, in vertical-depth-lateral order", () => {
    expectTypeOf<(typeof targetNames)[number]>().toEqualTypeOf<GizmoTargetName>();
    expect(new Set(targetNames).size).toBe(26);
    expectTypeOf<GizmoFaceName>().toEqualTypeOf<"top" | "bottom" | "front" | "back" | "right" | "left">();
    expectTypeOf<GizmoTargetKind>().toEqualTypeOf<"face" | "edge" | "corner">();
    expectTypeOf<GizmoFaceName>().toMatchTypeOf<GizmoTargetName>();

    // @ts-expect-error -- `front-top` is not a target name; `top-front` is
    const misordered: GizmoTargetName = "front-top";
    expect(misordered).toBe("front-top");
  });

  it("builds every public signature from exported types", () => {
    expectTypeOf<GizmoTarget["name"]>().toEqualTypeOf<GizmoTargetName>();
    expectTypeOf<GizmoTarget["kind"]>().toEqualTypeOf<GizmoTargetKind>();
    expectTypeOf<GizmoHeading>().toEqualTypeOf<Readonly<{ target: GizmoTarget | null; pose: GizmoPose }>>();
    expectTypeOf<GizmoTurnEnd>().toEqualTypeOf<
      Readonly<{ cause: GizmoCause; pose: GizmoPose; outcome: GizmoOutcome }>
    >();
    expectTypeOf<GizmoAtTarget["target"]>().toEqualTypeOf<GizmoTarget>();
    expectTypeOf<GizmoAtTarget["sides"]>().toEqualTypeOf<Readonly<Record<GizmoSide, GizmoTarget>> | null>();
    expectTypeOf<GizmoView>().toMatchTypeOf<GizmoTargetName | "home" | Readonly<{ x: number; y: number; z: number }>>();

    expectTypeOf<ViewportGizmoEventMap["press"]>().toEqualTypeOf<Readonly<{ pressed: GizmoTarget | null }>>();
    expectTypeOf<ViewportGizmoEventMap["start"]>().toEqualTypeOf<
      Readonly<{ cause: GizmoCause; heading: GizmoHeading | null }>
    >();
    expectTypeOf<ViewportGizmoEventMap["change"]>().toEqualTypeOf<
      Readonly<{ cause: GizmoCause; heading: GizmoHeading | null; pose: GizmoPose }>
    >();
    expectTypeOf<ViewportGizmoEventMap["end"]>().toEqualTypeOf<GizmoTurnEnd>();
    expectTypeOf<ViewportGizmoEventMap["hoverchange"]>().toEqualTypeOf<Readonly<{ hovered: GizmoTarget | null }>>();
    // three's EventDispatcher writes the dispatcher to `event.target`, so no payload may name a field `target`.
    expectTypeOf<ViewportGizmoEventMap[keyof ViewportGizmoEventMap]>().not.toHaveProperty("target");
    expectTypeOf<ViewportGizmoEventMap["attargetchange"]>().toEqualTypeOf<
      Readonly<{ atTarget: GizmoAtTarget | null }>
    >();
    expectTypeOf<keyof ViewportGizmoEventMap>().toEqualTypeOf<
      "press" | "start" | "change" | "end" | "hoverchange" | "attargetchange" | "invalidate"
    >();

    expectTypeOf<GizmoOptions["limits"]>().toEqualTypeOf<GizmoLimits | undefined>();
    expectTypeOf<GizmoOptions["navigation"]>().toEqualTypeOf<GizmoNavigationOptions | undefined>();
    expectTypeOf<GizmoOptions["top"]>().toEqualTypeOf<GizmoTargetOptions | undefined>();
    expectTypeOf<GizmoOptions["front"]>().toEqualTypeOf<GizmoTargetOptions | undefined>();
    expectTypeOf<GizmoOptions["frontDirection"]>().toEqualTypeOf<Readonly<Vector3Like> | undefined>();
    expectTypeOf<GizmoResolvedOptions["frontDirection"]>().toEqualTypeOf<Readonly<Vector3>>();
    // Deep-required, and the face aliases are merged into their axis ends and dropped (N1).
    expectTypeOf<GizmoResolvedOptions>().not.toHaveProperty("front");
    expectTypeOf<GizmoResolvedOptions["x"]["hover"]["color"]>().toEqualTypeOf<NonNullable<GizmoTargetOptions["color"]>>();
    expectTypeOf<GizmoResolvedOptions["limits"]["maxPolarAngle"]>().toEqualTypeOf<number>();
    expectTypeOf<GizmoResolvedOptions["font"]["size"]>().toEqualTypeOf<number | undefined>();
    expectTypeOf<GizmoOptions["roll"]>().toEqualTypeOf<boolean | "free" | undefined>();
    expectTypeOf<NonNullable<GizmoOptions["onMaterial"]>>().parameter(1).toEqualTypeOf<GizmoMaterialUse>();
    expectTypeOf<NonNullable<GizmoOptions["onMaterial"]>>().returns.toEqualTypeOf<GizmoMaterial>();
    expectTypeOf<GizmoMaterialUse["targets"]>().toEqualTypeOf<readonly GizmoTarget[]>();
    expectTypeOf<GizmoMaterial["color"]>().toEqualTypeOf<Color>();
    expectTypeOf<GizmoMaterial["map"]>().toEqualTypeOf<Texture | null>();
    expectTypeOf<GizmoResolvedOptions["up"]>().toEqualTypeOf<Readonly<Vector3>>();
    expectTypeOf<GizmoResolvedOptions["roll"]>().toEqualTypeOf<boolean | "free">();
    expectTypeOf<GizmoResolvedOptions["animated"]>().toEqualTypeOf<boolean>();
    expectTypeOf<GizmoViewport>().toEqualTypeOf<Readonly<{ x: number; y: number; width: number; height: number }>>();
    expectTypeOf<ViewportGizmoError["code"]>().toEqualTypeOf<GizmoErrorCode>();
  });

  it("is a controller whose drawable is its root, not a scene object (R9)", () => {
    const adopt = (hostScene: Scene, gizmo: ViewportGizmo): void => {
      // @ts-expect-error A gizmo is not an Object3D; a host scene cannot adopt it.
      hostScene.add(gizmo);
      // @ts-expect-error The root and the target list are read-only.
      gizmo.root = gizmo.root;
      // @ts-expect-error The root and the target list are read-only.
      gizmo.targets = [];
    };

    expectTypeOf<ViewportGizmo>().not.toMatchTypeOf<Object3D>();
    expectTypeOf<ViewportGizmo["root"]>().toEqualTypeOf<Object3D>();
    expectTypeOf<ViewportGizmo["targets"]>().toEqualTypeOf<readonly GizmoTarget[]>();
    expect(adopt).toBeTypeOf("function");
  });

  it("exports only the class and the error class at runtime", () => {
    expect(Object.keys(entry).sort()).toEqual(["ViewportGizmo", "ViewportGizmoError"]);
  });

  it("rejects assignment to read-only members", () => {
    const assign = (
      target: GizmoTarget,
      end: GizmoTurnEnd,
      resolved: GizmoResolvedOptions,
      viewport: GizmoViewport,
      error: ViewportGizmoError,
      press: ViewportGizmoEventMap["press"]
    ): void => {
      // @ts-expect-error -- `name` is read-only
      target.name = "top";
      // @ts-expect-error -- a target's direction is a read-only vector
      target.direction.x = 1;
      // @ts-expect-error -- `outcome` is read-only
      end.outcome = { status: "reached" };
      // @ts-expect-error -- a pose's up is a read-only vector
      end.pose.up.y = 1;
      // @ts-expect-error -- resolved options change only through `set()`
      resolved.size = 64;
      // @ts-expect-error -- `width` is read-only
      viewport.width = 0;
      // @ts-expect-error -- `code` is read-only
      error.code = "DISPOSED";
      // @ts-expect-error -- event payloads are read-only
      press.target = null;
    };
    expect(assign).toBeTypeOf("function");
  });

  it("narrows every turn outcome on its status without a cast", () => {
    const outcomes: GizmoOutcome[] = [
      { status: "reached" },
      { status: "interrupted", by: "drag" },
      { status: "cancelled", reason: "pointercancel" },
      { status: "unavailable", reason: "roll-off" },
    ];
    const read = (outcome: GizmoOutcome): void => {
      // @ts-expect-error -- only `cancelled` and `unavailable` carry a reason
      void outcome.reason;
    };

    expect(outcomes.map((outcome) => describeOutcome({ cause: "api", pose, outcome }))).toEqual([
      "reached",
      "interrupted by drag",
      "cancelled: pointercancel",
      "unavailable: roll-off",
    ]);
    expect(read).toBeTypeOf("function");
  });

  it("refuses 2.x forms and mixed requests", () => {
    // @ts-expect-error -- `up: 'z'` was the 2.x form; `up` is a vector
    const zUp: GizmoOptions = { up: "z" };
    // @ts-expect-error -- `navigation` follows the `{ enabled }` shape
    const navigating: GizmoOptions = { navigation: true };
    // @ts-expect-error -- `toward` and `roll` cannot be combined
    const mixed: GizmoTurn = { toward: "left", roll: Math.PI / 2 };
    // @ts-expect-error -- `lookFrom`'s options are an object, not the 2.x boolean
    const animate: GizmoLookFromOptions = false;
    // @ts-expect-error -- `front` styles the Front face; the label direction is `frontDirection`
    const frontVector: GizmoOptions = { front: { x: 0, y: -1, z: 0 } };
    // @ts-expect-error -- not a code
    const code: GizmoErrorCode = "NOT_A_CODE";

    const accepted: GizmoOptions = {
      up: { x: 0, y: 0, z: 1 },
      frontDirection: { x: 0, y: -1, z: 0 },
      front: { color: 0x3366ff, label: "Front" },
      roll: "free",
      navigation: { enabled: true, reveal: "always" },
      limits: { maxPolarAngle: Math.PI / 2 },
    };
    const turns: GizmoTurn[] = [{ toward: "up" }, { azimuth: Math.PI / 2 }, { roll: -Math.PI / 2, animated: false }];

    expect([zUp, navigating, mixed, animate, frontVector, code]).toHaveLength(6);
    expect(accepted.roll).toBe("free");
    expect([accepted.front?.label, accepted.frontDirection?.y]).toEqual(["Front", -1]);
    expect(turns).toHaveLength(3);
  });

  it("takes three.js controls structurally and camera-controls only through an adapter", () => {
    expectTypeOf<OrbitControls>().toMatchTypeOf<GizmoControls>();
    expectTypeOf<TrackballControls>().toMatchTypeOf<GizmoControls>();
    expectTypeOf<CameraControls>().not.toMatchTypeOf<GizmoControls>();
  });

  it("codes errors with a stable code and keeps them instances of Error", () => {
    const errors = errorCodes.map((code) => new ViewportGizmoError(code, `${code} message`));

    expectTypeOf<(typeof errorCodes)[number]>().toEqualTypeOf<GizmoErrorCode>();
    expect(errors.map((error) => [error.code, error.name, error.message, error instanceof Error])).toEqual(
      errorCodes.map((code) => [code, "ViewportGizmoError", `${code} message`, true])
    );
  });
});
