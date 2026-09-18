import { afterEach, describe, expect, it } from "vitest";
import { Object3D, Vector3 } from "three";
import { GIZMO_EPSILON } from "../utils/constants.js";
import { createGizmo, getInternals, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
});

describe("_setOrientation", () => {
  it("uses camera.quaternion as _quaternionStart for a non-pole Y-up +x face click", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.distanceTo(gizmo.target);
    internals._setOrientation(new Vector3(1, 0, 0));

    expect(internals._quaternionStart.angleTo(gizmo.camera.quaternion)).toBeLessThan(1e-7);
  });

  it("second bottom click on same Z-up axis yields aligned start/end quaternions", () => {
    Object3D.DEFAULT_UP.set(0, 0, 1);
    const eps = GIZMO_EPSILON;
    const d = 10;
    const gizmo = createGizmo({
      defaultUp: new Vector3(0, 0, 1),
      cameraPosition: new Vector3(0, -eps, -d),
    });
    gizmo.camera.up.set(0, 0, 1);
    gizmo.camera.lookAt(0, 0, 0);

    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.distanceTo(gizmo.target);

    internals._setOrientation(new Vector3(0, 0, -1));
    gizmo.camera.quaternion.copy(internals._quaternionEnd);

    internals._setOrientation(new Vector3(0, 0, -1));

    expect(internals._quaternionStart.angleTo(internals._quaternionEnd)).toBeLessThan(GIZMO_EPSILON);
  });

  it("second top click on same Z-up axis yields aligned start/end quaternions", () => {
    Object3D.DEFAULT_UP.set(0, 0, 1);
    const eps = GIZMO_EPSILON;
    const d = 10;
    const gizmo = createGizmo({
      defaultUp: new Vector3(0, 0, 1),
      cameraPosition: new Vector3(0, eps, d),
    });
    gizmo.camera.up.set(0, 0, 1);
    gizmo.camera.lookAt(0, 0, 0);

    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.distanceTo(gizmo.target);

    internals._setOrientation(new Vector3(0, 0, 1));
    gizmo.camera.quaternion.copy(internals._quaternionEnd);

    internals._setOrientation(new Vector3(0, 0, 1));

    expect(internals._quaternionStart.angleTo(internals._quaternionEnd)).toBeLessThan(GIZMO_EPSILON);
  });

  it("second click on same X-up ±x poles yields aligned start/end quaternions", () => {
    Object3D.DEFAULT_UP.set(1, 0, 0);
    const eps = GIZMO_EPSILON;
    const d = 10;

    const gizmoRight = createGizmo({
      defaultUp: new Vector3(1, 0, 0),
      cameraPosition: new Vector3(d, eps, 0),
    });
    gizmoRight.camera.up.set(1, 0, 0);
    gizmoRight.camera.lookAt(0, 0, 0);
    const ir = getInternals(gizmoRight);
    ir._distance = gizmoRight.camera.position.distanceTo(gizmoRight.target);
    ir._setOrientation(new Vector3(1, 0, 0));
    gizmoRight.camera.quaternion.copy(ir._quaternionEnd);
    ir._setOrientation(new Vector3(1, 0, 0));
    expect(ir._quaternionStart.angleTo(ir._quaternionEnd)).toBeLessThan(GIZMO_EPSILON);

    const gizmoLeft = createGizmo({
      defaultUp: new Vector3(1, 0, 0),
      cameraPosition: new Vector3(-d, eps, 0),
    });
    gizmoLeft.camera.up.set(1, 0, 0);
    gizmoLeft.camera.lookAt(0, 0, 0);
    const il = getInternals(gizmoLeft);
    il._distance = gizmoLeft.camera.position.distanceTo(gizmoLeft.target);
    il._setOrientation(new Vector3(-1, 0, 0));
    gizmoLeft.camera.quaternion.copy(il._quaternionEnd);
    il._setOrientation(new Vector3(-1, 0, 0));
    expect(il._quaternionStart.angleTo(il._quaternionEnd)).toBeLessThan(GIZMO_EPSILON);

    resetDefaultUp();
  });
});
