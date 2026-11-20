import { describe, expect, it, vi } from "vitest";
import {
  type BufferGeometry,
  type Material,
  MathUtils,
  Mesh,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
} from "three";
import { createStubRenderer } from "../__tests__/test-utils";
import { ViewportGizmoError } from "../errors";
import { resolveOptions } from "../options/resolve";
import { buildScene } from "../scene/build";
import {
  DEFAULT_FIELD_OF_VIEW,
  createInternalCamera,
  fieldOfViewDistance,
  setFieldOfView,
} from "./internalCamera";
import { warmUp } from "./warmUp";

/** Normalised device x of a point on the front face, after the camera's world matrix is current. */
const ndcX = (camera: PerspectiveCamera, point: Vector3): number => {
  camera.updateMatrixWorld();
  return point.clone().project(camera).x;
};

/** Every geometry and material under `root`, in traversal order. */
const resourcesOf = (root: Object3D): (BufferGeometry | Material)[] => {
  const resources: (BufferGeometry | Material)[] = [];
  root.traverse((object) => {
    const { geometry, material } = object as Partial<Mesh>;
    if (geometry) resources.push(geometry);
    for (const entry of [material].flat()) if (entry) resources.push(entry);
  });
  return resources;
};

describe("createInternalCamera", () => {
  it("matches 2.3.0 at the default field of view", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    expect(camera).toBeInstanceOf(PerspectiveCamera);
    expect(camera.fov).toBeCloseTo(26, 12);
    expect(camera.position.toArray()).toEqual([0, 0, 7]);
    expect(camera.near).toBeCloseTo(5, 12);
    expect(camera.far).toBeCloseTo(10, 12);
  });

  it("keeps the sphere's orthographic camera", () => {
    const camera = createInternalCamera(true) as OrthographicCamera;
    expect(camera).toBeInstanceOf(OrthographicCamera);
    expect([camera.left, camera.right, camera.top, camera.bottom, camera.near, camera.far]).toEqual([
      -1.8, 1.8, 1.8, -1.8, 5, 10,
    ]);
    expect(camera.position.toArray()).toEqual([0, 0, 7]);
  });
});

describe("setFieldOfView", () => {
  it("takes radians and writes three's degrees", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    setFieldOfView(camera, Math.PI / 3);
    expect(camera.fov).toBeCloseTo(60, 12);
  });

  it.each([5, 26, 45, 60, 90])("keeps the front face's projected size at %i°", (degrees) => {
    const reference = createInternalCamera(false) as PerspectiveCamera;
    const camera = createInternalCamera(false, degrees * MathUtils.DEG2RAD) as PerspectiveCamera;
    const faceEdge = new Vector3(0.5, 0, 1);
    expect(ndcX(camera, faceEdge)).toBeCloseTo(ndcX(reference, faceEdge), 12);
    expect(camera.position.z).toBeCloseTo(fieldOfViewDistance(degrees * MathUtils.DEG2RAD), 12);
  });

  it("holds the clip margins around the origin and keeps near positive", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    setFieldOfView(camera, Math.PI / 4);
    expect(camera.position.z - camera.near).toBeCloseTo(2, 12);
    expect(camera.far - camera.position.z).toBeCloseTo(3, 12);

    setFieldOfView(camera, 3);
    expect(camera.near).toBeGreaterThan(0);
  });

  it("updates the projection matrix", () => {
    const camera = createInternalCamera(false) as PerspectiveCamera;
    const before = camera.projectionMatrix.clone();
    setFieldOfView(camera, Math.PI / 2);
    expect(camera.projectionMatrix.equals(before)).toBe(false);
  });

  it("leaves the sphere's orthographic camera unchanged", () => {
    const camera = createInternalCamera(true);
    const before = camera.projectionMatrix.clone();
    setFieldOfView(camera, Math.PI / 2);
    expect(camera.projectionMatrix.equals(before)).toBe(true);
    expect(camera.position.z).toBe(7);
  });

  // 26 is degrees passed by mistake: 26 rad is outside (0, π).
  it.each([0, -1, Math.PI, Number.NaN, Number.POSITIVE_INFINITY, 26])("refuses %s with INVALID_OPTION", (value) => {
    const camera = createInternalCamera(false);
    try {
      setFieldOfView(camera, value);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ViewportGizmoError);
      expect((error as ViewportGizmoError).code).toBe("INVALID_OPTION");
    }
  });

  it.each(["cube", "rounded-cube", "sphere"] as const)(
    "rebuilds no geometry or material and compiles nothing new for a %s",
    async (type) => {
      const renderer = createStubRenderer();
      const options = resolveOptions({ type }, { up: new Vector3(0, 1, 0) });
      const root = new Object3D().add(buildScene(options).group);
      const scene = new Scene().add(root);
      const camera = createInternalCamera(type === "sphere");

      const resources = resourcesOf(root);
      expect(resources.length).toBeGreaterThan(0);
      const snapshot = () => resources.map((resource) => ("version" in resource ? resource.version : 0));
      const versions = snapshot();
      const children = root.children.slice();
      const disposed = vi.fn();
      for (const resource of resources) resource.addEventListener("dispose", disposed);

      const compileAsync = vi.fn(async () => {});
      Object.assign(renderer, { compileAsync });
      await warmUp(renderer, scene, camera);
      expect(compileAsync).toHaveBeenCalledWith(scene, camera);
      // Without KHR_parallel_shader_compile, compile synchronously: three's compileAsync would log a warning.
      const compile = vi.fn();
      Object.assign(renderer, { compile, extensions: { has: () => false } });
      await warmUp(renderer, scene, camera);
      expect(compile).toHaveBeenCalledWith(scene, camera);
      expect(compileAsync).toHaveBeenCalledTimes(1);

      setFieldOfView(camera, Math.PI / 3);

      expect(root.children).toEqual(children);
      expect(snapshot()).toEqual(versions);
      expect(disposed).not.toHaveBeenCalled();
      expect(resourcesOf(root)).toEqual(resources);
    }
  );
});

describe("DEFAULT_FIELD_OF_VIEW", () => {
  it("is 26° in radians", () => {
    expect(DEFAULT_FIELD_OF_VIEW).toBeCloseTo((26 * Math.PI) / 180, 15);
  });
});
