import {
  Clock,
  Euler,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sprite,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

import { getDomContainer } from "./utils/getDomContainer";
import { getAxesLines } from "./utils/getAxesLines";
import { getDomElement } from "./utils/getDomElement";
import { getBackgroundSphere } from "./utils/getBackgroundSphere";
import { getAxesSpritePoints } from "./utils/getAxesSpritePoints";
import { prepareAnimationData } from "./utils/prepareAnimationData";
import { setRadius } from "./utils/setRadius";
import { updateSpritesOpacity } from "./utils/updateSpritesOpacity";
import { isClick } from "./utils/isClick";
import { resetSprites } from "./utils/resetSprites";
import { getIntersectionObject } from "./utils/getIntersectionObject";
import { clamp } from "./utils/clamp";

import { GizmoOptions, ViewportGizmoEventMap } from "./types";
import { GIZMO_AXES, GIZMO_DEFAULT_OPTIONS } from "./utils/constants";

export const targetPosition = new Vector3();
export const targetQuaternion = new Quaternion();
export const q1 = new Quaternion();
export const q2 = new Quaternion();
export const raycaster = new Raycaster();

const clock = new Clock();
const euler = new Euler();
const turnRate = 2 * Math.PI; // turn rate in angles per second

const mouseStart = new Vector2();
const mouseAngle = new Vector2();
const radius = { value: 0 };
let offsetHeight = 0;

export class ViewportGizmo extends Object3D<ViewportGizmoEventMap> {
  private _backgroundSphere?: Mesh;
  private _bgSphereOpacity: number = 0.2;
  private _spritePoints: Sprite[];
  private _container: HTMLElement;
  private _domRect: DOMRect;
  private _viewport: Vector4 = new Vector4();
  private _renderer: WebGLRenderer;
  private _orthoCamera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0, 4);
  private _domElement: HTMLElement;
  enabled: boolean = true;
  camera: OrthographicCamera | PerspectiveCamera;
  animated: boolean = true;
  animating = false;
  target = new Vector3();
  dragging: boolean = false;
  size: number;
  speed: number = 1;

  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer,
    options?: GizmoOptions
  ) {
    super();

    this._renderer = renderer;
    this._container = renderer.domElement;
    this.camera = camera;

    this._orthoCamera.position.set(0, 0, 2);

    options = Object.assign(GIZMO_DEFAULT_OPTIONS, options || {});

    const { container, placement, size, offset, backgroundSphere } =
      options as Required<GizmoOptions>;

    this.size = size;

    const axesLines = getAxesLines(options);
    this._spritePoints = getAxesSpritePoints(options);

    this.add(axesLines, ...this._spritePoints);

    if (backgroundSphere.enabled) {
      this._backgroundSphere = getBackgroundSphere(backgroundSphere.color!);
      this._bgSphereOpacity = backgroundSphere.opacity ?? 0.2;
      this.add(this._backgroundSphere);
    }

    this._domElement = getDomContainer(placement, size, offset);
    getDomElement(container).appendChild(this._domElement);

    this._domRect = this._domElement.getBoundingClientRect();
    this._startListening();

    this.update();
  }

  render() {
    if (this.animating) this._animate();

    const x = this._domRect.left;
    const y = offsetHeight - this._domRect.bottom;

    const autoClear = this._renderer.autoClear;
    this._renderer.autoClear = false;
    this._renderer.setViewport(x, y, this.size, this.size);
    this._renderer.clear(false, true, false);
    this._renderer.render(this, this._orthoCamera);
    this._renderer.setViewport(this._viewport);
    this._renderer.autoClear = autoClear;
  }

  update() {
    this._domRect = this._domElement.getBoundingClientRect();
    offsetHeight = this._container.offsetHeight;
    setRadius(this.camera, radius, this.target);
    this._renderer.getViewport(this._viewport);

    this._updateOrientation();
  }

  dispose() {
    this.children.forEach((child) => {
      const mesh = child as Mesh<any, MeshBasicMaterial>;
      mesh.material?.dispose();
      mesh.material?.map?.dispose();
      mesh.geometry?.dispose();
    });

    this._domElement.remove();
  }

  // INTERNALS ↓↓↓
  private _updateOrientation(fromCamera: boolean = true) {
    if (fromCamera) {
      this.quaternion.copy(this.camera.quaternion).invert();
      this.updateMatrixWorld();
    }

    updateSpritesOpacity(this._spritePoints, this.camera);
  }

  private _animate() {
    if (!this.animated) {
      this.camera.quaternion.copy(targetQuaternion);
      this.animating = false;
      this.dispatchEvent({ type: "change" });
      this.dispatchEvent({ type: "end" });
      return;
    }

    const delta = clock.getDelta();

    const step = delta * turnRate * this.speed;

    q1.rotateTowards(q2, step);
    this.camera.position
      .set(0, 0, 1)
      .applyQuaternion(q1)
      .multiplyScalar(radius.value)
      .add(this.target);

    this.camera.quaternion.rotateTowards(targetQuaternion, step);

    this._updateOrientation();
    requestAnimationFrame(() => this.dispatchEvent({ type: "change" }));

    if (q1.angleTo(q2) === 0) {
      this.animating = false;
      this.dispatchEvent({ type: "end" });
    }
  }

  private _setOrientation(orientation: (typeof GIZMO_AXES)[number]) {
    prepareAnimationData(this.camera, this.target, orientation, radius);
    this.animating = true;
    clock.start();
    this.dispatchEvent({ type: "start" });
  }

  private _startListening() {
    this._domElement.onpointerdown = (e) => this._onPointerDown(e);
    this._domElement.onpointermove = (e) => this._onPointerMove(e);
    this._domElement.onpointerleave = () => this._onPointerLeave();
  }

  private _onPointerDown(e: PointerEvent) {
    if (!this.enabled) return;

    const drag = (e: PointerEvent) => {
      if (!this.dragging && isClick(e, mouseStart)) return;
      if (!this.dragging) {
        resetSprites(this._spritePoints);
        this.dragging = true;
      }

      mouseAngle
        .set(e.clientX, e.clientY)
        .sub(mouseStart)
        .multiplyScalar((1 / this._domRect.width) * Math.PI);

      this.rotation.x = clamp(
        rotationStart.x + mouseAngle.y,
        Math.PI / -2 + 0.001,
        Math.PI / 2 - 0.001
      );
      this.rotation.y = rotationStart.y + mouseAngle.x;
      this.updateMatrixWorld();

      q1.copy(this.quaternion).invert();

      this.camera.position
        .set(0, 0, 1)
        .applyQuaternion(q1)
        .multiplyScalar(radius.value)
        .add(this.target);

      this.camera.rotation.setFromQuaternion(q1);

      this._updateOrientation(false);

      this.dispatchEvent({ type: "change" });
    };
    const endDrag = () => {
      document.removeEventListener("pointermove", drag, false);
      document.removeEventListener("pointerup", endDrag, false);

      if (!this.dragging) return this._handleClick(e);

      this.dragging = false;
      this.dispatchEvent({ type: "end" });
    };

    if (this.animating === true) return;
    e.preventDefault();

    mouseStart.set(e.clientX, e.clientY);

    const rotationStart = euler.copy(this.rotation);

    setRadius(this.camera, radius, this.target);

    document.addEventListener("pointermove", drag, false);
    document.addEventListener("pointerup", endDrag, false);

    this.dispatchEvent({ type: "start" });
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this.enabled || this.dragging) return;

    if (this._backgroundSphere)
      (this._backgroundSphere.material as Material).opacity =
        this._bgSphereOpacity;

    this._handleHover(e);
  }

  private _onPointerLeave() {
    if (!this.enabled || this.dragging) return;

    if (this._backgroundSphere)
      (this._backgroundSphere.material as Material).opacity = 0;

    resetSprites(this._spritePoints);
    this._domElement.style.cursor = "";
  }

  private _handleClick(e: PointerEvent) {
    const object = getIntersectionObject(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );

    if (!object) return;

    this._setOrientation(object.userData.type);
    this.dispatchEvent({ type: "change" });
  }

  private _handleHover(e: PointerEvent) {
    const object = getIntersectionObject(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );

    resetSprites(this._spritePoints);

    if (!object) {
      this._domElement.style.cursor = "";
    } else {
      object.material.map!.offset.x = 0.5;
      object.scale.multiplyScalar(1.2);
      this._domElement.style.cursor = "pointer";
    }
  }
}
