import { afterEach, describe, expect, it, vi } from "vitest";
import CameraControls from "camera-controls";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  Box3,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
} from "three";
import {
  createGizmo,
  createStubRenderer,
  getInternals,
  resetDefaultUp,
} from "./test-utils.js";

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

const finishAnimation = (gizmo: ReturnType<typeof createGizmo>) => {
  const internals = getInternals(gizmo);
  vi.spyOn(performance, "now").mockReturnValueOnce(0).mockReturnValueOnce(1000);
  internals._animate();
  internals._animate();
  expect(gizmo.animating).toBe(false);
};

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

describe("cardinal orientation settle", () => {
  it.each([
    ["Z-up Top", new Vector3(0, 0, 1), new Vector3(0, 0, 1), new Vector3(1, 0, 0)],
    ["Z-up Bottom", new Vector3(0, 0, 1), new Vector3(0, 0, -1), new Vector3(1, 0, 0)],
    ["X-up Right", new Vector3(1, 0, 0), new Vector3(1, 0, 0), new Vector3(0, 0, 1)],
    ["X-up Left", new Vector3(1, 0, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1)],
  ])("keeps %s stable when CameraControls accepts the final position", (_, up, direction, expectedRight) => {
    Object3D.DEFAULT_UP.copy(up);
    const cameraPosition = TARGET.clone().add(new Vector3(7, 8, 9));
    const gizmo = createGizmo({ defaultUp: up, cameraPosition });
    gizmo.target.copy(TARGET);
    gizmo.camera.position.copy(cameraPosition);
    gizmo.camera.lookAt(TARGET);

    const controls = new CameraControls(gizmo.camera as PerspectiveCamera, document.body);
    void controls.setLookAt(...gizmo.camera.position.toArray(), ...TARGET.toArray(), false);
    controls.update(0);

    const internals = getInternals(gizmo);
    internals._distance = gizmo.camera.position.distanceTo(TARGET);
    internals._setOrientation(direction);
    finishAnimation(gizmo);

    const finalQuaternion = gizmo.camera.quaternion.clone();
    const finalDistance = gizmo.camera.position.distanceTo(TARGET);

    void controls.setPosition(...gizmo.camera.position.toArray(), false);
    controls.update(0);

    expect(finalQuaternion.angleTo(gizmo.camera.quaternion)).toBeLessThan(1e-6);
    expect(gizmo.camera.position.distanceTo(TARGET)).toBeCloseTo(finalDistance, 10);
    expect(
      new Vector3(1, 0, 0)
        .applyQuaternion(gizmo.camera.quaternion)
        .dot(expectedRight)
    ).toBeGreaterThan(0.999999);

    controls.dispose();
    gizmo.dispose();
  });

  it("preserves a non-origin target when attached OrbitControls settles Z-up Top", () => {
    Object3D.DEFAULT_UP.set(0, 0, 1);
    const cameraPosition = TARGET.clone().add(new Vector3(7, 8, 9));
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    camera.up.set(0, 0, 1);
    camera.position.copy(cameraPosition);
    camera.lookAt(TARGET);
    const renderer = createStubRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(TARGET);
    controls.update();

    const gizmo = createGizmo({
      defaultUp: new Vector3(0, 0, 1),
      cameraPosition,
    });
    gizmo.camera.copy(camera);
    gizmo.attachControls(controls);

    const distance = camera.position.distanceTo(TARGET);
    const internals = getInternals(gizmo);
    internals._distance = distance;
    internals._setOrientation(new Vector3(0, 0, 1));
    finishAnimation(gizmo);

    expect(gizmo.camera.position.distanceTo(TARGET)).toBeCloseTo(distance, 10);
    expect(gizmo.camera.position.x).toBeCloseTo(TARGET.x, 3);
    expect(gizmo.camera.position.y).toBeLessThan(TARGET.y);

    gizmo.dispose();
    controls.dispose();
  });
});
