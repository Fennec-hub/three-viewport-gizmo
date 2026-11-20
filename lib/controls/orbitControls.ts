import { Vector3, type Quaternion } from "three";

// The one place the library reads a controller's private fields (roll Finding 1, L10). three's `OrbitControls` (and
// `MapControls`, its subclass) caches its orbit axis at construction as `_quat`, the rotation from `object.up` to +Y,
// with no public way to refresh it. Without a refresh, a drag after a roll orbits the old up. `_quat` is an instance
// field from three 0.168; in 0.167 and earlier it is a closure variable and cannot be reached.
// ponytail: delete this file when three.js ships a public up refresh (L10).

/** `OrbitControls` internals the refresh writes. `ArcballControls` has a `_quat` too, but no `_quatInverse`. */
type OrbitUpCache = {
  object: { up: Vector3 };
  _quat: Quaternion;
  _quatInverse: Quaternion;
};

const Y_UP = new Vector3(0, 1, 0);

const isQuaternion = (value: unknown): value is Quaternion =>
  (value as Quaternion | undefined)?.isQuaternion === true;

/**
 * Whether `controls` hold `OrbitControls`' cached up (three 0.168 or later).
 *
 * @param controls - Any attached controls
 * @returns `true` when {@link refreshOrbitControlsUp} can refresh them
 */
export const hasOrbitUpCache = (controls: object): controls is OrbitUpCache => {
  const c = controls as Partial<OrbitUpCache>;
  return isQuaternion(c._quat) && isQuaternion(c._quatInverse) && (c.object?.up as { isVector3?: unknown } | undefined)?.isVector3 === true;
};

/**
 * Whether `controls` look like `OrbitControls` from before three 0.168, whose cached up cannot be reached.
 *
 * @param controls - Any attached controls
 * @returns `true` for an `OrbitControls` or `MapControls` without the `_quat` field
 */
export const isUnreachableOrbitControls = (controls: object): boolean =>
  typeof (controls as { getAzimuthalAngle?: unknown }).getAzimuthalAngle === "function" && !hasOrbitUpCache(controls);

/**
 * Re-derives `OrbitControls`' orbit axis from its camera's current `up`, as its constructor does, so the next drag
 * orbits the new up.
 *
 * @param controls - `OrbitControls` or `MapControls` from three 0.168 or later
 */
export const refreshOrbitControlsUp = (controls: OrbitUpCache): void => {
  controls._quat.setFromUnitVectors(controls.object.up, Y_UP);
  controls._quatInverse.copy(controls._quat).invert();
};
