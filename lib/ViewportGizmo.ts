import {
  Clock,
  Color,
  Euler,
  LineSegments,
  Material,
  Mesh,
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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { AxesColors, DomPlacement, GizmoOrientation } from "./types";
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

export class ViewportGizmo extends Object3D {
  camera: OrthographicCamera | PerspectiveCamera;
  orthoCamera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0, 4);
  isViewHelper = true;
  animating = false;
  target = new Vector3();
  backgroundSphere: Mesh;
  axesLines: LineSegments;
  spritePoints: Sprite[];
  canvas: HTMLElement;
  domElement: HTMLElement;
  domRect: DOMRect;
  dragging: boolean = false;
  renderer: WebGLRenderer;
  controls?: OrbitControls | TrackballControls;
  viewport: Vector4 = new Vector4();
  offsetHeight: number = 0;
  colors: AxesColors;
  size: number;

  constructor({
    renderer,
    camera,
    container,
    placement = "top-right",
    size = 128,
    colors,
  }: {
    renderer: WebGLRenderer;
    camera: PerspectiveCamera | OrthographicCamera;
    container: HTMLElement | string;
    placement: DomPlacement;
    size: number;
    colors?: AxesColors;
  }) {
    super();

    this.renderer = renderer;
    this.camera = camera;
    this.canvas = renderer.domElement;
    this.colors = colors || [
      new Color(0xff3653),
      new Color(0x8adb00),
      new Color(0x2c8fff),
    ];

    this.orthoCamera.position.set(0, 0, 2);

    this.size = size;
    this.backgroundSphere = getBackgroundSphere();
    this.axesLines = getAxesLines(this.colors);
    this.spritePoints = getAxesSpritePoints();

    this.add(this.backgroundSphere, this.axesLines, ...this.spritePoints);

    this.domElement = getDomContainer(placement, size);
    getDomElement(container).appendChild(this.domElement);

    this.domRect = this.domElement.getBoundingClientRect();
    this.startListening();

    this.update();
  }

  startListening() {
    this.domElement.onpointerdown = (e) => this.onPointerDown(e);
    this.domElement.onpointermove = (e) => this.onPointerMove(e);
    this.domElement.onpointerleave = () => this.onPointerLeave();
  }

  onPointerDown(e: PointerEvent) {
    const drag = (e: PointerEvent) => {
      if (!this.dragging && isClick(e, mouseStart)) return;
      if (!this.dragging) {
        resetSprites(this.spritePoints);
        this.dragging = true;
      }

      mouseAngle
        .set(e.clientX, e.clientY)
        .sub(mouseStart)
        .multiplyScalar((1 / this.domRect.width) * Math.PI);

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

      this.updateOrientation(false);
    };
    const endDrag = () => {
      document.removeEventListener("pointermove", drag, false);
      document.removeEventListener("pointerup", endDrag, false);

      if (!this.dragging) {
        this.handleClick(e);
        return;
      }

      this.dragging = false;
    };

    if (this.animating === true) return;
    e.preventDefault();

    mouseStart.set(e.clientX, e.clientY);

    const rotationStart = euler.copy(this.rotation);

    setRadius(this.camera, radius, this.target);

    document.addEventListener("pointermove", drag, false);
    document.addEventListener("pointerup", endDrag, false);
  }

  onPointerMove(e: PointerEvent) {
    if (this.dragging) return;
    (this.backgroundSphere.material as Material).opacity = 0.2;
    this.handleHover(e);
  }

  onPointerLeave() {
    if (this.dragging) return;
    (this.backgroundSphere.material as Material).opacity = 0;
    resetSprites(this.spritePoints);
    this.domElement.style.cursor = "";
  }

  handleClick(e: PointerEvent) {
    const object = getIntersectionObject(
      e,
      this.domRect,
      this.orthoCamera,
      this.spritePoints
    );

    if (!object) return;

    this.setOrientation(object.userData.type);
  }

  handleHover(e: PointerEvent) {
    const object = getIntersectionObject(
      e,
      this.domRect,
      this.orthoCamera,
      this.spritePoints
    );

    resetSprites(this.spritePoints);

    if (!object) {
      this.domElement.style.cursor = "";
    } else {
      object.material.map!.offset.x = 0.5;
      object.scale.multiplyScalar(1.2);
      this.domElement.style.cursor = "pointer";
    }
  }

  render() {
    const delta = clock.getDelta();
    if (this.animating) this.animate(delta);

    const x = this.domRect.left;
    const y = this.offsetHeight - this.domRect.bottom;

    const autoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setViewport(x, y, this.size, this.size);
    this.renderer.render(this, this.orthoCamera);
    this.renderer.setViewport(this.viewport);
    this.renderer.autoClear = autoClear;
  }

  updateOrientation(fromCamera: boolean = true) {
    if (fromCamera) {
      this.quaternion.copy(this.camera.quaternion).invert();
      this.updateMatrixWorld();
    }

    updateSpritesOpacity(this.spritePoints, this.camera);
  }

  update() {
    this.domRect = this.domElement.getBoundingClientRect();
    this.offsetHeight = this.canvas.offsetHeight;
    setRadius(this.camera, radius, this.target);
    this.renderer.getViewport(this.viewport);

    this.updateOrientation();
  }

  animate(delta: number) {
    const step = delta * turnRate;

    // animate position by doing a slerp and then scaling the position on the unit sphere

    q1.rotateTowards(q2, step);
    this.camera.position
      .set(0, 0, 1)
      .applyQuaternion(q1)
      .multiplyScalar(radius.value)
      .add(this.target);

    // animate orientation

    this.camera.quaternion.rotateTowards(targetQuaternion, step);

    this.updateOrientation();

    if (q1.angleTo(q2) === 0) {
      this.animating = false;
    }
  }

  setOrientation(orientation: GizmoOrientation) {
    prepareAnimationData(this.camera, this.target, orientation, radius);
    this.animating = true;
  }

  dispose() {
    this.axesLines.geometry.dispose();
    (this.axesLines.material as Material).dispose();

    this.backgroundSphere.geometry.dispose();
    (this.backgroundSphere.material as Material).dispose();

    this.spritePoints.forEach((sprite) => {
      sprite.material.map!.dispose();
      sprite.material.dispose();
    });

    this.domElement.remove();
  }
}
