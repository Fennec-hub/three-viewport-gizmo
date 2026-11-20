/**
 * The hit test against the projection the gizmo is drawn with, across fields of view, host camera types and the
 * clip-space conventions a renderer gives the gizmo's camera when it draws it.
 *
 * three's renderers rewrite a camera's projection on its first draw: `WebGPURenderer` sets `coordinateSystem` to
 * WebGPU (clip z in [0, 1]) and, with `reversedDepthBuffer`, sets `reversedDepth` (near at 1, far at 0);
 * `WebGLRenderer` with `reversedDepthBuffer` sets `reversedDepth`. The renderer stub below does what three's
 * `Renderer._renderScene` and `WebGLRenderer.render` do to the camera, then the pointer goes where the target is
 * drawn: its surface point projected through that same camera.
 */
import {
  Camera,
  MathUtils,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Vector3,
  WebGLCoordinateSystem,
  WebGPUCoordinateSystem,
  type CoordinateSystem,
  type WebGLRenderer,
} from "three";
import { afterEach, describe, expect, it } from "vitest";
import type { GizmoTarget } from "../types";
import { ViewportGizmo } from "../ViewportGizmo";
import { createStubRenderer, fire, RECT } from "../__tests__/test-utils";

type Convention = Readonly<{ name: string; coordinateSystem: CoordinateSystem; reversedDepth: boolean; webgpu: boolean }>;

/** The four projections three can give the gizmo's camera. */
const CONVENTIONS: readonly Convention[] = [
  { name: "WebGLRenderer", coordinateSystem: WebGLCoordinateSystem, reversedDepth: false, webgpu: false },
  { name: "WebGLRenderer reversedDepthBuffer", coordinateSystem: WebGLCoordinateSystem, reversedDepth: true, webgpu: false },
  { name: "WebGPURenderer", coordinateSystem: WebGPUCoordinateSystem, reversedDepth: false, webgpu: true },
  { name: "WebGPURenderer reversedDepthBuffer", coordinateSystem: WebGPUCoordinateSystem, reversedDepth: true, webgpu: true },
];

/**
 * Gizmo fields of view in degrees, either side of 26°, where `far < 2 near` flips under reversed depth (the
 * internal camera keeps near 2 in front of the origin and far 3 behind it). Tau passes half its host's angle: its
 * report's "51° and below" is 25.57° here.
 */
const FIELDS_OF_VIEW = [0.1, 1, 5, 10, 20, 25, 25.57, 26.07, 30, 45, 75, 100];

/** The camera each stub renderer last drew with: the gizmo's own, observed where the renderer receives it. */
const drawnWith = new WeakMap<WebGLRenderer, PerspectiveCamera | OrthographicCamera>();

/** A renderer stub that does to the camera what three does when it draws with it. */
function rendererFor({ coordinateSystem, reversedDepth, webgpu }: Convention): WebGLRenderer {
  const renderer = createStubRenderer({ isWebGPURenderer: webgpu });
  Object.assign(renderer, {
    reversedDepthBuffer: reversedDepth,
    capabilities: { reversedDepthBuffer: reversedDepth },
    render: (_scene: unknown, camera: Camera) => {
      drawnWith.set(renderer, camera as PerspectiveCamera | OrthographicCamera);
      const stamped = camera as Camera & { _reversedDepth: boolean; updateProjectionMatrix(): void };
      stamped.coordinateSystem = coordinateSystem;
      stamped._reversedDepth = reversedDepth;
      stamped.updateProjectionMatrix();
    },
  });
  return renderer;
}

const gizmos: ViewportGizmo[] = [];
afterEach(() => {
  for (const gizmo of gizmos.splice(0)) gizmo.dispose();
});

type Type = "cube" | "rounded-cube" | "sphere";

function mount(
  type: Type,
  convention: Convention,
  fieldOfView: number,
  host: "perspective" | "orthographic",
  eye = new Vector3(3, 2.6, 3.4)
) {
  const camera =
    host === "perspective" ? new PerspectiveCamera(2 * fieldOfView, 1, 0.1, 1000) : new OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
  // By default a view that shows three faces, three edges and a corner, none edge-on.
  camera.position.copy(eye);
  camera.lookAt(0, 0, 0);
  const container = document.createElement("div");
  document.body.appendChild(container);
  const gizmo = new ViewportGizmo(camera, rendererFor(convention), {
    container,
    type,
    fieldOfView: fieldOfView * MathUtils.DEG2RAD,
    corners: type === "rounded-cube" ? { radius: 0.3 } : undefined,
  });
  gizmos.push(gizmo);
  gizmo.domElement.getBoundingClientRect = () => RECT;
  gizmo.render();
  return gizmo;
}

/**
 * Where `target` is drawn, in gizmo-group space, and the surface normal there: the sphere's disc centre; the rounded
 * box's support point along the target (a smooth point, its normal the target's direction); on the sharp cube, the
 * middle of the target's band on its face that best faces `eye`, as its edges and corners are on silhouettes.
 */
function drawnPoint(type: Type, target: GizmoTarget, eye: Vector3, rotation: Quaternion, point: Vector3, normal: Vector3) {
  const unit = target.direction;
  normal.copy(unit);
  if (type === "sphere") return point.copy(unit).multiplyScalar(target.kind === "face" ? 1.3 : 1.7);
  const signs = [Math.sign(unit.x), Math.sign(unit.y), Math.sign(unit.z)];
  if (type === "rounded-cube") {
    // The patch centre (1 - r) along each signed axis, out by r along the normal.
    return point.fromArray(signs).multiplyScalar(1 - 0.3).addScaledVector(unit, 0.3);
  }
  let face = -1;
  let best = -Infinity;
  for (let k = 0; k < 3; k++) {
    if (signs[k] === 0) continue;
    const facing = normal.set(0, 0, 0).setComponent(k, signs[k]!).applyQuaternion(rotation).dot(eye);
    if (facing > best) [face, best] = [k, facing];
  }
  // Between the face tiles' 0.7 and the edge: the band of the edge or corner on that face.
  point.fromArray(signs.map((sign, k) => (k === face ? sign : 0.85 * sign)));
  return normal.set(0, 0, 0).setComponent(face, signs[face]!);
}

/** The targets facing the viewer, and the target the pointer hovers over where each is drawn. */
function hoverDrawn(gizmo: ViewportGizmo, type: Type): { expected: string[]; hovered: string[] } {
  const camera = drawnWith.get(gizmo.renderer as WebGLRenderer)!;
  const group = gizmo.root.children[0]!;
  gizmo.root.updateMatrixWorld(true);
  camera.updateMatrixWorld();
  const expected: string[] = [];
  const hovered: string[] = [];
  const point = new Vector3();
  const normal = new Vector3();
  const toEye = new Vector3();
  const eye = camera.position.clone().normalize();
  for (const target of gizmo.targets) {
    // The sphere draws no edge or corner discs by default.
    if (type === "sphere" && target.kind !== "face") continue;
    drawnPoint(type, target, eye, gizmo.root.quaternion, point, normal);
    point.applyMatrix4(group.matrixWorld);
    normal.applyQuaternion(gizmo.root.quaternion).normalize();
    // Facing the eye well, so the point is not on a silhouette: the box is convex, so it is then in view.
    const facing = type === "sphere" ? normal.z : normal.dot(toEye.copy(camera.position).sub(point).normalize());
    if (facing < 0.4) continue;
    point.project(camera);
    fire(gizmo.domElement, "pointermove", {
      x: RECT.x + ((point.x + 1) / 2) * RECT.width,
      y: RECT.y + ((1 - point.y) / 2) * RECT.height,
    });
    expected.push(target.name);
    hovered.push(gizmo.hovered?.name ?? "none");
  }
  return { expected, hovered };
}

describe("hit test follows the drawn projection", () => {
  for (const type of ["cube", "rounded-cube", "sphere"] as const) {
    for (const convention of CONVENTIONS) {
      for (const host of ["perspective", "orthographic"] as const) {
        it.each(FIELDS_OF_VIEW)(`${type}, ${convention.name}, ${host} host: hits what is drawn at %s°`, (degrees) => {
          const gizmo = mount(type, convention, degrees, host);
          const { expected, hovered } = hoverDrawn(gizmo, type);
          // A wide angle brings the eye close, where fewer targets face it well.
          expect(expected.length).toBeGreaterThanOrEqual(degrees >= 75 ? 1 : 3);
          expect(hovered).toEqual(expected);
        });
      }
    }
  }
});

describe("hit test in a face-on view, where a face and its opposite are drawn at the same place", () => {
  for (const type of ["cube", "rounded-cube", "sphere"] as const) {
    for (const convention of CONVENTIONS) {
      it.each(FIELDS_OF_VIEW)(`${type}, ${convention.name}: the centre of the Right view is right at %s°`, (degrees) => {
        const gizmo = mount(type, convention, degrees, "orthographic", new Vector3(5, 0, 0));
        fire(gizmo.domElement, "pointermove", { x: RECT.x + RECT.width / 2, y: RECT.y + RECT.height / 2 });
        expect(gizmo.hovered?.name).toBe("right");
      });
    }
  }
});
