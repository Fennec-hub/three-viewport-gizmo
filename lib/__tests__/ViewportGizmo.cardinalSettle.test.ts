import { afterEach, describe, expect, it, vi } from "vitest";
import CameraControls from "camera-controls";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Box3,
  Matrix4,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import { createGizmo, runFlight } from "./test-utils.js";

CameraControls.install({
  THREE: {
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
  },
});

const TARGET = new Vector3(3, -4, 2);

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

describe("cardinal orientation settle", () => {
  it.each([
    ["Z-up Top", new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(1, 0, 0)],
    ["Z-up Bottom", new Vector3(0, 0, 1), new Vector3(0, 0, -1), new Vector3(1, 0, 0)],
    ["X-up Right", new Vector3(1, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1)],
    ["X-up Left", new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1)],
  ])("keeps %s stable on every frame when CameraControls accepts the position", (_, up, direction, expectedRight) => {
    const cameraPosition = TARGET.clone().add(new Vector3(7, 8, 9));
    const gizmo = createGizmo({ up, cameraPosition });
    gizmo.target.copy(TARGET);
    gizmo.camera.position.copy(cameraPosition);
    gizmo.camera.lookAt(TARGET);

    const controls = new CameraControls(gizmo.camera as PerspectiveCamera, document.body);
    void controls.setLookAt(...gizmo.camera.position.toArray(), ...TARGET.toArray(), false);
    controls.update(0);

    void gizmo.lookFrom(direction);
    let worstAngle = 0;
    let worstDistance = 0;
    const frames = runFlight(gizmo, () => {
      const quaternion = gizmo.camera.quaternion.clone();
      const distance = gizmo.camera.position.distanceTo(TARGET);

      void controls.setPosition(...gizmo.camera.position.toArray(), false);
      controls.update(0);

      worstAngle = Math.max(worstAngle, quaternion.angleTo(gizmo.camera.quaternion));
      worstDistance = Math.max(worstDistance, Math.abs(gizmo.camera.position.distanceTo(TARGET) - distance));
    });

    expect(gizmo.animating).toBe(false);
    expect(frames).toBeGreaterThan(2);
    expect(worstAngle).toBeLessThan(1e-6);
    expect(worstDistance).toBeLessThan(1e-9);
    expect(
      new Vector3(1, 0, 0)
        .applyQuaternion(gizmo.camera.quaternion)
        .dot(expectedRight)
    ).toBeGreaterThan(0.999999);

    controls.dispose();
    gizmo.dispose();
  });

  it("preserves a non-origin target when attached OrbitControls settles Z-up Top on every frame", () => {
    const cameraPosition = TARGET.clone().add(new Vector3(7, 8, 9));
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.copy(cameraPosition);
    camera.lookAt(TARGET);
    const gizmo = createGizmo({ up: new Vector3(0, 0, 1), cameraPosition });
    const controls = new OrbitControls(camera, gizmo.renderer.domElement);
    controls.target.copy(TARGET);
    controls.update();

    // The controls must drive the gizmo's own camera for the settle check to mean anything.
    gizmo.camera = camera;
    gizmo.attachControls(controls);

    const distance = camera.position.distanceTo(TARGET);
    void gizmo.lookFrom(new Vector3(0, 0, 1));
    let worstAngle = 0;
    let worstMove = 0;
    runFlight(gizmo, () => {
      const quaternion = gizmo.camera.quaternion.clone();
      const position = gizmo.camera.position.clone();
      controls.update();
      worstAngle = Math.max(worstAngle, quaternion.angleTo(gizmo.camera.quaternion));
      worstMove = Math.max(worstMove, position.distanceTo(gizmo.camera.position));
    });

    expect(gizmo.animating).toBe(false);
    expect(worstAngle).toBeLessThan(1e-6);
    expect(worstMove).toBeLessThan(1e-9);
    expect(gizmo.camera.position.distanceTo(TARGET)).toBeCloseTo(distance, 10);
    expect(gizmo.camera.position.x).toBeCloseTo(TARGET.x, 3);
    expect(gizmo.camera.position.y).toBeLessThan(TARGET.y);

    gizmo.dispose();
    controls.dispose();
  });
});
