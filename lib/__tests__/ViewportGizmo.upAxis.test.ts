import { afterEach, describe, expect, it } from "vitest";
import { Object3D, Vector3 } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createGizmo, createStubRenderer, getInternals, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
});

/** The label resolved for one axis of a cube gizmo. */
const faceLabel = (gizmo: ReturnType<typeof createGizmo>, axis: "x" | "y" | "z" | "nx" | "ny" | "nz") =>
  getInternals(gizmo)._options[axis].label;

describe("up option", () => {
  it("defaults to Object3D.DEFAULT_UP", () => {
    Object3D.DEFAULT_UP.set(0, 0, 1);
    const gizmo = createGizmo({ defaultUp: new Vector3(0, 0, 1), cameraPosition: new Vector3(5, 5, 5) });

    expect(getInternals(gizmo)._options.up).toBe("z");
    expect(faceLabel(gizmo, "z")).toBe("Top");
  });

  it("orients a Z-up gizmo while the process default stays Y-up", () => {
    const gizmo = createGizmo({
      cameraPosition: new Vector3(5, 5, 5),
      gizmoOptions: { type: "cube", up: "z" },
    });

    expect(Object3D.DEFAULT_UP.y).toBe(1);
    expect(faceLabel(gizmo, "z")).toBe("Top");
    expect(faceLabel(gizmo, "ny")).toBe("Front");
    expect(faceLabel(gizmo, "x")).toBe("Right");
    expect(gizmo.up.toArray()).toEqual([0, 0, 1]);

    const converted = getInternals(gizmo).coordinateConversion(new Vector3(1, 2, 3));
    expect(converted.toArray()).toEqual([2, 3, 1]);
  });

  it("orients every face exactly as the legacy DEFAULT_UP path did", () => {
    const camera = new Vector3(5, 5, 5);
    for (const up of ["x", "y", "z"] as const) {
      const legacyUp = new Vector3(0, 0, 0);
      legacyUp[up] = 1;
      const legacy = createGizmo({ defaultUp: legacyUp, cameraPosition: camera, gizmoOptions: { type: "cube" } });
      const legacyFaces = getInternals(legacy)._intersections.map((face) => face.quaternion.toArray());

      const perInstance = createGizmo({ cameraPosition: camera, gizmoOptions: { type: "cube", up } });
      expect(Object3D.DEFAULT_UP.y).toBe(1);
      const faces = getInternals(perInstance)._intersections.map((face) => face.quaternion.toArray());

      expect(faces).toEqual(legacyFaces);
    }
  });

  it("maps face options onto the axes of the given up", () => {
    const gizmo = createGizmo({
      cameraPosition: new Vector3(5, 5, 5),
      gizmoOptions: { type: "cube", up: "z", top: { label: "UP" } },
    });

    expect(faceLabel(gizmo, "z")).toBe("UP");
  });
});

describe("Object3D.DEFAULT_UP tracking", () => {
  /** The orientation of every face, edge and corner, in intersection order. */
  const faceQuaternions = (gizmo: ReturnType<typeof createGizmo>) =>
    getInternals(gizmo)._intersections.map((face) => face.quaternion.toArray());

  it("regenerates a default-up gizmo when the global moves to another axis", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5), gizmoOptions: { type: "cube" } });
    const renderer = createStubRenderer();
    const controls = new OrbitControls(gizmo.camera, renderer.domElement);
    gizmo.attachControls(controls);
    expect(getInternals(gizmo)._options.up).toBe("y");

    Object3D.DEFAULT_UP.set(0, 0, 1);
    gizmo.update();

    expect(getInternals(gizmo)._options.up).toBe("z");
    expect(faceLabel(gizmo, "z")).toBe("Top");
    expect(gizmo.up.toArray()).toEqual([0, 0, 1]);
    expect(getInternals(gizmo)._controls).toBe(controls);

    const fresh = createGizmo({ defaultUp: new Vector3(0, 0, 1), cameraPosition: new Vector3(5, 5, 5) });
    expect(faceQuaternions(gizmo)).toEqual(faceQuaternions(fresh));

    gizmo.dispose();
    controls.dispose();
  });

  it("keeps the caller's options and container across the regeneration", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const options = { type: "cube" as const, container, top: { label: "UP" } };
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5), gizmoOptions: options });
    expect(options.container).toBe(container);

    Object3D.DEFAULT_UP.set(0, 0, 1);
    gizmo.update();

    expect(gizmo.options).toBe(options);
    expect(container.querySelector("div")).not.toBeNull();
    expect(faceLabel(gizmo, "z")).toBe("UP");

    gizmo.dispose();
    container.remove();
  });

  it("regenerates from render() as well, once per change", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5), gizmoOptions: { type: "cube" } });
    const before = getInternals(gizmo)._intersections;

    Object3D.DEFAULT_UP.set(1, 0, 0);
    gizmo.render();
    const after = getInternals(gizmo)._intersections;
    expect(after).not.toBe(before);
    expect(getInternals(gizmo)._options.up).toBe("x");

    gizmo.render();
    expect(getInternals(gizmo)._intersections).toBe(after);
  });

  it("leaves an explicit up alone when the global changes", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5), gizmoOptions: { type: "cube", up: "y" } });
    const before = getInternals(gizmo)._intersections;

    Object3D.DEFAULT_UP.set(0, 0, 1);
    gizmo.update();
    gizmo.render();

    expect(getInternals(gizmo)._intersections).toBe(before);
    expect(getInternals(gizmo)._options.up).toBe("y");
  });
});
