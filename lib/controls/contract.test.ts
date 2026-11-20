// C1: the controls contract against the real controllers. `@ts-expect-error` lines are checked by `tsc` when this file
// is in a typecheck program; the runtime half runs here.
import { describe, expect, expectTypeOf, it } from "vitest";
import * as THREE from "three";
import { PerspectiveCamera, Vector3 } from "three";
import CameraControls from "camera-controls";
import { ArcballControls } from "three/addons/controls/ArcballControls.js";
import { MapControls } from "three/addons/controls/MapControls.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { ViewportGizmoError } from "../errors";
import type { GizmoControls } from "../types";
import { ORBIT_TAKES_UP } from "../__tests__/test-utils";
import { assertControls, cameraUpRefusal, holdControls, readControlsLimits, refreshCameraUp } from "./contract";

CameraControls.install({ THREE });

const cameraAt = (x: number, y: number, z: number) => {
  const camera = new PerspectiveCamera();
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
  return camera;
};

/** The adapter shape the guide names (`cameraControls(controls) => GizmoControls`); C2 ships the real one. */
const adapt = (controls: CameraControls): GizmoControls => ({
  target: controls.getTarget(new Vector3()),
  get enabled() {
    return controls.enabled;
  },
  set enabled(value) {
    controls.enabled = value;
  },
  update: () => controls.update(0),
  addEventListener: (_type, listener) => controls.addEventListener("update", listener),
  removeEventListener: (_type, listener) => controls.removeEventListener("update", listener),
  updateCameraUp: () => controls.updateCameraUp(),
});

/** Rolls the camera 90° about its view direction, as a gizmo roll writes it: same position, new `camera.up`. */
const roll90 = (camera: PerspectiveCamera) => {
  camera.up.set(-1, 0, 0);
  camera.lookAt(0, 0, 0);
};

describe("assertControls (T #23)", () => {
  it("accepts the real controllers", () => {
    const camera = cameraAt(0, 0, 5);
    expect(() => assertControls(new OrbitControls(camera, document.body))).not.toThrow();
    expect(() => assertControls(new TrackballControls(camera, document.body))).not.toThrow();
    expect(() => assertControls(adapt(new CameraControls(camera)))).not.toThrow();
  });

  it("refuses a controller with no target at compile time and at attach, never with an undefined read", () => {
    const camera = cameraAt(0, 0, 5);
    const raw = new CameraControls(camera);
    expectTypeOf<CameraControls>().not.toMatchTypeOf<GizmoControls>();
    const attach = () =>
      // @ts-expect-error -- camera-controls has no `target`; it goes through the adapter
      assertControls(raw);
    expect(attach).toThrow(ViewportGizmoError);
    expect(attach).toThrow(/a `target` Vector3.*cameraControls\(controls\)/);
    try {
      attach();
    } catch (error) {
      expect((error as ViewportGizmoError).code).toBe("INVALID_OPTION");
    }
  });

  it("names every missing member", () => {
    // @ts-expect-error -- not controls at all
    expect(() => assertControls({})).toThrow(/`target` Vector3, `update\(\)`, a `change` event/);
  });
});

describe("holdControls (scope audit P4 inverted)", () => {
  it("keeps controls the host disabled disabled after a gizmo interaction", () => {
    const controls = new OrbitControls(cameraAt(0, 0, 5), document.body);
    controls.enabled = false;
    const restore = holdControls(controls);
    expect(controls.enabled).toBe(false);
    restore();
    expect(controls.enabled).toBe(false);
  });

  it("disables enabled controls during the interaction and re-enables them after", () => {
    for (const controls of [
      new OrbitControls(cameraAt(0, 0, 5), document.body),
      new TrackballControls(cameraAt(0, 0, 5), document.body),
      adapt(new CameraControls(cameraAt(0, 0, 5))),
    ]) {
      const restore = holdControls(controls);
      expect(controls.enabled).toBe(false);
      restore();
      expect(controls.enabled).toBe(true);
    }
  });
});

describe("readControlsLimits (U5)", () => {
  it("reads OrbitControls' numeric limits, keeping Infinity", () => {
    const controls = new MapControls(cameraAt(0, 0, 5), document.body);
    controls.maxPolarAngle = Math.PI / 2;
    expect(readControlsLimits(controls)).toEqual({
      minPolarAngle: 0,
      maxPolarAngle: Math.PI / 2,
      minAzimuthAngle: -Infinity,
      maxAzimuthAngle: Infinity,
    });
  });

  it("reads nothing from controls without limits, and skips non-numbers", () => {
    expect(readControlsLimits(new TrackballControls(cameraAt(0, 0, 5), document.body))).toEqual({});
    const controls = new OrbitControls(cameraAt(0, 0, 5), document.body);
    (controls as { minPolarAngle: unknown }).minPolarAngle = Number.NaN;
    (controls as { maxPolarAngle: unknown }).maxPolarAngle = "1";
    expect(readControlsLimits(controls)).toEqual({ minAzimuthAngle: -Infinity, maxAzimuthAngle: Infinity });
  });
});

describe("cameraUpRefusal (ruling A, roll Finding 5)", () => {
  it.runIf(ORBIT_TAKES_UP)("accepts no controls, OrbitControls and MapControls (three >= 0.168), and updateCameraUp()", () => {
    expect(cameraUpRefusal(undefined)).toBeNull();
    expect(cameraUpRefusal(new OrbitControls(cameraAt(0, 0, 5), document.body))).toBeNull();
    expect(cameraUpRefusal(new MapControls(cameraAt(0, 0, 5), document.body))).toBeNull();
    expect(cameraUpRefusal(adapt(new CameraControls(cameraAt(0, 0, 5))))).toBeNull();
  });

  it("refuses free-tumble and unknown controls, so roll defaults off", () => {
    expect(cameraUpRefusal(new TrackballControls(cameraAt(0, 0, 5), document.body))).toMatch(/no `updateCameraUp\(\)`/);
    const arcball = new ArcballControls(cameraAt(0, 0, 5), document.body) as unknown as GizmoControls;
    expect(cameraUpRefusal(arcball)).toMatch(/no `updateCameraUp\(\)`/);
  });

  it.runIf(!ORBIT_TAKES_UP)("refuses the real OrbitControls and MapControls below three 0.168, naming the revision", () => {
    for (const controls of [new OrbitControls(cameraAt(0, 0, 5), document.body), new MapControls(cameraAt(0, 0, 5), document.body)]) {
      expect(cameraUpRefusal(controls)).toMatch(new RegExp(`three r${THREE.REVISION} cannot take a new up: roll needs three 0.168`));
    }
    expect(cameraUpRefusal(undefined)).toBeNull();
  });

  it("names the three version for OrbitControls without the `_quat` field (three < 0.168)", () => {
    const controls = new OrbitControls(cameraAt(0, 0, 5), document.body) as Partial<OrbitControls & Record<"_quat", unknown>>;
    delete controls._quat;
    expect(cameraUpRefusal(controls as OrbitControls)).toMatch(
      new RegExp(`three r${THREE.REVISION} cannot take a new up: roll needs three 0.168`)
    );
  });
});

// three 0.168 ships the turn as the private `_rotateLeft`; later revisions make it public as `rotateLeft`.
function orbitLeft(controls: OrbitControls, angle: number): void {
  const turn = controls as unknown as { rotateLeft?: (angle: number) => void; _rotateLeft?: (angle: number) => void };
  if (turn.rotateLeft) turn.rotateLeft(angle);
  else turn._rotateLeft!(angle);
}

describe("refreshCameraUp (L5)", () => {
  // A horizontal drag is `rotateLeft` on OrbitControls and `rotate(azimuth, 0)` on camera-controls: a turn about the
  // orbit up. About the rolled up (-1, 0, 0) the camera's x stays 0; about the stale (0, 1, 0) its y stays 0.
  // The cached up is an OrbitControls member from three 0.168; `orbitLeft` reaches the turn on every revision.
  it.runIf(ORBIT_TAKES_UP)("makes a horizontal OrbitControls drag after a roll orbit the new up", () => {
    const camera = cameraAt(0, 0, 5);
    const controls = new OrbitControls(camera, document.body);
    roll90(camera);
    refreshCameraUp(controls);
    controls.update();
    expect(camera.position.distanceTo(new Vector3(0, 0, 5))).toBeLessThan(1e-9);
    expect(camera.up.x).toBeCloseTo(-1, 9);

    orbitLeft(controls, 0.5);
    controls.update();
    expect(camera.position.x).toBeCloseTo(0, 9);
    expect(Math.abs(camera.position.y)).toBeGreaterThan(1);
    expect(camera.position.length()).toBeCloseTo(5, 9);
  });

  it.runIf(ORBIT_TAKES_UP)("control: without the refresh OrbitControls orbits the stale up", () => {
    const camera = cameraAt(0, 0, 5);
    const controls = new OrbitControls(camera, document.body);
    roll90(camera);
    orbitLeft(controls, 0.5);
    controls.update();
    expect(camera.position.y).toBeCloseTo(0, 9);
    expect(Math.abs(camera.position.x)).toBeGreaterThan(1);
  });

  it("calls updateCameraUp() and the camera-controls drag orbits the new up", () => {
    const camera = cameraAt(0, 0, 5);
    const raw = new CameraControls(camera);
    roll90(camera);
    refreshCameraUp(adapt(raw));
    raw.rotate(0.5, 0, false);
    raw.update(0);
    expect(camera.position.x).toBeCloseTo(0, 6);
    expect(Math.abs(camera.position.y)).toBeGreaterThan(1);
  });

  it("leaves TrackballControls untouched: it turns camera.up itself", () => {
    const camera = cameraAt(0, 0, 5);
    const controls = new TrackballControls(camera, document.body);
    roll90(camera);
    expect(() => refreshCameraUp(controls)).not.toThrow();
    expect(camera.up.x).toBeCloseTo(-1, 9);
  });
});
