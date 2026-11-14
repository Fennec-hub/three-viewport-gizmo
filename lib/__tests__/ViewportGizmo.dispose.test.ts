import { afterEach, describe, expect, it, vi } from "vitest";
import { Vector3, type BufferGeometry, type Material, type Mesh } from "three";
import { createGizmo, resetDefaultUp } from "./test-utils.js";

afterEach(() => {
  resetDefaultUp();
  vi.restoreAllMocks();
});

describe("dispose", () => {
  it("removes and disposes every child", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const children = [...gizmo.children] as Mesh<BufferGeometry, Material>[];
    expect(children.length).toBeGreaterThan(20);
    // Faces, edges and corners share geometries; spy on each one once.
    const geometries = new Set(children.map((child) => child.geometry));
    const disposed = [...geometries].map((geometry) => vi.spyOn(geometry, "dispose"));

    gizmo.dispose();

    expect(gizmo.children).toHaveLength(0);
    for (const spy of disposed) expect(spy).toHaveBeenCalled();
  });

  it("leaves only the regenerated children after set()", () => {
    const gizmo = createGizmo({ cameraPosition: new Vector3(5, 5, 5) });
    const count = gizmo.children.length;

    gizmo.set({ type: "cube" });

    expect(gizmo.children).toHaveLength(count);
  });

  it("stops a press in progress, ending it once, and no longer follows the pointer", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const gizmo = createGizmo({
      cameraPosition: new Vector3(5, 5, 5),
      gizmoOptions: { type: "cube", container },
    });
    const element = container.firstElementChild as HTMLElement;
    element.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: 0, width: 128, height: 128 });
    gizmo.update();
    const events: string[] = [];
    for (const type of ["start", "change", "end"] as const) {
      gizmo.addEventListener(type, () => events.push(type));
    }

    element.onpointerdown!(new MouseEvent("pointerdown", { clientX: 20, clientY: 20 }) as PointerEvent);
    gizmo.dispose();
    const position = gizmo.camera.position.clone();
    document.dispatchEvent(new MouseEvent("pointermove", { clientX: 80, clientY: 60 }));
    document.dispatchEvent(new MouseEvent("pointerup", { clientX: 80, clientY: 60 }));

    expect(events).toEqual(["start", "end"]);
    expect(gizmo.camera.position.toArray()).toEqual(position.toArray());

    container.remove();
  });
});
