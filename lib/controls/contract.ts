import { REVISION } from "three";
import { ViewportGizmoError } from "../errors";
import type { GizmoControls, GizmoLimits } from "../types";
import { hasOrbitUpCache, isUnreachableOrbitControls, refreshOrbitControlsUp } from "./orbitControls";

const LIMIT_KEYS = ["minPolarAngle", "maxPolarAngle", "minAzimuthAngle", "maxAzimuthAngle"] as const;

/**
 * Checks at `attachControls` what the type promises, so JavaScript callers get a coded error and never a later
 * `undefined` read (T #23): a `target` vector, `update()` and the event methods.
 *
 * @param controls - The controls passed to `attachControls`
 * @throws {ViewportGizmoError} `INVALID_OPTION` naming the missing member and the camera-controls adapter
 */
export const assertControls = (controls: GizmoControls): void => {
  const c = (controls ?? {}) as Partial<Record<keyof GizmoControls, unknown>>;
  const missing = [
    (c.target as { isVector3?: unknown } | undefined)?.isVector3 !== true && "a `target` Vector3",
    typeof c.update !== "function" && "`update()`",
    (typeof c.addEventListener !== "function" || typeof c.removeEventListener !== "function") && "a `change` event",
  ].filter(Boolean);
  if (missing.length === 0) return;
  throw new ViewportGizmoError(
    "INVALID_OPTION",
    `attachControls() needs controls with ${missing.join(", ")}. For camera-controls, pass ` +
      "`cameraControls(controls)` from `@taulabs/three-viewport-gizmo/camera-controls`."
  );
};

/**
 * Disables the controls for a gizmo interaction and returns the restore, which puts back the `enabled` value they
 * had, so a host that disabled its controls keeps them disabled (scope audit P4).
 *
 * @param controls - The attached controls
 * @returns Call at the interaction's end to restore the previous `enabled`
 */
export const holdControls = (controls: GizmoControls): (() => void) => {
  const enabled = controls.enabled;
  controls.enabled = false;
  return () => {
    controls.enabled = enabled;
  };
};

/**
 * Reads the limits the controls carry as numbers (U5, triage D7). `Infinity` is kept: it means unlimited.
 *
 * @param controls - The attached controls
 * @returns The numeric limits, keyed with the `OrbitControls` names; absent keys are not limited by the controls
 */
export const readControlsLimits = (controls: GizmoControls): GizmoLimits => {
  const limits: GizmoLimits = {};
  for (const key of LIMIT_KEYS) {
    const value = controls[key];
    if (typeof value === "number" && !Number.isNaN(value)) limits[key] = value;
  }
  return limits;
};

/**
 * The capability probe for `roll` (ruling A, roll Finding 5): whether the gizmo can hand these controls a new
 * `camera.up`. `resolveOptions` uses it for the `roll` default and throws `ROLL_UNSUPPORTED` with the reason.
 *
 * @param controls - The attached controls, or none
 * @returns `null` when the controls take a new up (or none are attached); otherwise the reason and the fix
 */
export const cameraUpRefusal = (controls: GizmoControls | null | undefined): string | null => {
  if (!controls || typeof controls.updateCameraUp === "function" || hasOrbitUpCache(controls)) return null;
  if (isUnreachableOrbitControls(controls)) {
    return (
      `\`roll\` is on, but OrbitControls in three r${REVISION} cannot take a new up: roll needs three 0.168 or ` +
      "later. Upgrade three or pass `roll: false`."
    );
  }
  return "`roll` is on, but the attached controls have no `updateCameraUp()` to take a new up. Pass `roll: false`.";
};

/**
 * Tells the controls that the gizmo changed `camera.up`, so their next drag orbits the new up (L5). Call after every
 * up write; does nothing for controls that cannot take one.
 *
 * @param controls - The attached controls
 */
export const refreshCameraUp = (controls: GizmoControls): void => {
  if (typeof controls.updateCameraUp === "function") controls.updateCameraUp();
  else if (hasOrbitUpCache(controls)) refreshOrbitControlsUp(controls);
};
