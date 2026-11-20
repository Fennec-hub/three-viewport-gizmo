/**
 * The stable code of every caller-caused failure. Superseded, cancelled and refused turns are outcomes, not errors.
 * - `DOCUMENT_MISSING`: constructed where there is no `document`, such as a worker or server render.
 * - `CONTAINER_MISSING`: no `container` and the canvas has no parent, or a selector matched nothing.
 * - `UNKNOWN_OPTION`: an option key the library does not know.
 * - `INVALID_OPTION`: a known option with the wrong type or out of range.
 * - `REMOVED_OPTION`: a 2.x option form, such as `up: 'z'`.
 * - `REMOVED_MEMBER`: a 2.x member called from JavaScript, such as `domUpdate()`.
 * - `INVALID_FRAME`: `up` is not a signed axis, or `frontDirection` is not perpendicular to it.
 * - `ROLL_UNSUPPORTED`: `roll` on with controls that cannot take a new up.
 * - `UNKNOWN_VIEW`: `lookFrom` with a name that is not a view, or a zero vector.
 * - `INVALID_TURN`: `turn` with no field, a non-finite angle, or `toward` beside an angle.
 * - `DISPOSED`: any method after `dispose()`.
 */
export type GizmoErrorCode =
  | "DOCUMENT_MISSING"
  | "CONTAINER_MISSING"
  | "UNKNOWN_OPTION"
  | "INVALID_OPTION"
  | "REMOVED_OPTION"
  | "REMOVED_MEMBER"
  | "INVALID_FRAME"
  | "ROLL_UNSUPPORTED"
  | "UNKNOWN_VIEW"
  | "INVALID_TURN"
  | "DISPOSED";

/** A caller mistake, with a stable `code` and a message that names the fix. */
export class ViewportGizmoError extends Error {
  readonly code: GizmoErrorCode;

  /**
   * @param code - The stable code callers branch on
   * @param message - What went wrong and how to fix it; for a 2.x name, its 3.0 replacement
   */
  constructor(code: GizmoErrorCode, message: string) {
    super(message);
    this.name = "ViewportGizmoError";
    this.code = code;
  }
}
