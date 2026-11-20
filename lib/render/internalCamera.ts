import { MathUtils, OrthographicCamera, PerspectiveCamera } from "three";
import { ViewportGizmoError } from "../errors";

/** The 2.3.0 vertical field of view of the cube's camera, in radians (26°). */
export const DEFAULT_FIELD_OF_VIEW = 26 * MathUtils.DEG2RAD;

/** Camera distance at {@link DEFAULT_FIELD_OF_VIEW}. */
const BASE_DISTANCE = 7;

/** Front face plane of a unit cube; its projected size is what a field-of-view change keeps. */
const FOCUS_OFFSET = 1;

/** Clip margins in front of and behind the origin: 2.3.0's near 5 and far 10 at distance 7. */
const NEAR_MARGIN = 2;
const FAR_MARGIN = 3;

/** Smallest near plane, for wide fields of view that bring the camera inside the near margin. */
const MIN_NEAR = 0.01;

/**
 * The camera distance that keeps the front face at its 2.3.0 projected size under `fieldOfView`:
 * `(distance - focus) * tan(fieldOfView / 2)` is held constant.
 *
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @returns The distance from the gizmo's origin to its camera
 */
export const fieldOfViewDistance = (fieldOfView: number): number =>
  FOCUS_OFFSET +
  ((BASE_DISTANCE - FOCUS_OFFSET) * Math.tan(DEFAULT_FIELD_OF_VIEW / 2)) / Math.tan(fieldOfView / 2);

/**
 * Applies `fieldOfView` to the gizmo's own camera in place: field of view, distance, near and far, then the
 * projection. Touches no geometry, material or scene object, so it compiles nothing. An orthographic camera
 * (the sphere) has no field of view and is left unchanged.
 *
 * @param camera - The camera from {@link createInternalCamera}
 * @param fieldOfView - Vertical field of view in radians, in `(0, π)`
 * @throws {ViewportGizmoError} `INVALID_OPTION` when `fieldOfView` is not a finite number in `(0, π)`
 */
export const setFieldOfView = (
  camera: PerspectiveCamera | OrthographicCamera,
  fieldOfView: number
): void => {
  if (!(Number.isFinite(fieldOfView) && fieldOfView > 0 && fieldOfView < Math.PI)) {
    throw new ViewportGizmoError(
      "INVALID_OPTION",
      `fieldOfView must be radians in (0, π), got ${fieldOfView}; three.js's \`fov\` is degrees, convert with MathUtils.degToRad.`
    );
  }
  if (!(camera instanceof PerspectiveCamera)) return;

  const distance = fieldOfViewDistance(fieldOfView);
  camera.fov = fieldOfView * MathUtils.RAD2DEG;
  camera.position.set(0, 0, distance);
  camera.near = Math.max(MIN_NEAR, distance - NEAR_MARGIN);
  camera.far = distance + FAR_MARGIN;
  camera.updateProjectionMatrix();
};

/**
 * Creates the gizmo's own camera: orthographic for the sphere, perspective for the cube types.
 * At the default field of view it matches 2.3.0 exactly (26°, distance 7, near 5, far 10).
 *
 * @param isSphere - Whether the gizmo type is `sphere`
 * @param fieldOfView - Vertical field of view in radians; ignored by the sphere
 * @returns The camera, looking down -z at the origin
 */
export const createInternalCamera = (
  isSphere: boolean,
  fieldOfView = DEFAULT_FIELD_OF_VIEW
): PerspectiveCamera | OrthographicCamera => {
  if (isSphere) {
    const camera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10);
    camera.position.set(0, 0, BASE_DISTANCE);
    return camera;
  }
  const camera = new PerspectiveCamera();
  setFieldOfView(camera, fieldOfView);
  return camera;
};
