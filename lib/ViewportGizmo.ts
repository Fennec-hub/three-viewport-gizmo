import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Camera,
  CanvasTexture,
  Clock,
  Color,
  Euler,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

const [POS_X, POS_Y, POS_Z, NEG_X, NEG_Y, NEG_Z] = Array(6)
  .fill(0)
  .map((_, i) => i);

const axesColors = [
  new Color(0xff3653),
  new Color(0x8adb00),
  new Color(0x2c8fff),
];

const clock = new Clock();
const targetPosition = new Vector3();
const targetQuaternion = new Quaternion();
const euler = new Euler();
const q1 = new Quaternion();
const q2 = new Quaternion();
const point = new Vector3();
const dim = 128;
const turnRate = 2 * Math.PI; // turn rate in angles per second
const raycaster = new Raycaster();
const mouse = new Vector2();
const mouseStart = new Vector2();
const mouseAngle = new Vector2();
const dummy = new Object3D();
let radius = 0;

type GizmoOrientation = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";

type DomPlacement =
  | "top-left"
  | "top-right"
  | "top-center"
  | "center-right"
  | "center-left"
  | "center-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

class ViewportGizmo extends Object3D {
  camera: OrthographicCamera | PerspectiveCamera;
  orthoCamera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0, 4);
  isViewHelper = true;
  animating = false;
  target = new Vector3();
  backgroundSphere: Mesh;
  axesLines: LineSegments;
  spritePoints: Sprite[];
  domElement: HTMLElement;
  domContainer: HTMLElement;
  domRect: DOMRect;
  dragging: boolean = false;
  renderer: WebGLRenderer;
  controls?: OrbitControls | TrackballControls;
  controlsChangeEvent: { listener: () => void };
  viewport: Vector4 = new Vector4();
  offsetHeight: number = 0;

  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer,
    placement: DomPlacement = "bottom-right",
    size: number = 128
  ) {
    super();

    this.renderer = renderer;
    this.camera = camera;
    this.domElement = renderer.domElement;

    this.orthoCamera.position.set(0, 0, 2);

    this.backgroundSphere = getBackgroundSphere();
    this.axesLines = getAxesLines();
    this.spritePoints = getAxesSpritePoints();

    this.add(this.backgroundSphere, this.axesLines, ...this.spritePoints);

    this.domContainer = getDomContainer(placement, size);

    // This may cause confusion if the parent isn't the body and doesn't have a `position:relative`
    this.domElement.parentElement!.appendChild(this.domContainer);

    this.domRect = this.domContainer.getBoundingClientRect();
    this.startListening();

    this.controlsChangeEvent = { listener: () => this.updateOrientation() };

    this.update();
    this.updateOrientation();
  }

  startListening() {
    this.domContainer.onpointerdown = (e) => this.onPointerDown(e);
    this.domContainer.onpointermove = (e) => this.onPointerMove(e);
    this.domContainer.onpointerleave = () => this.onPointerLeave();
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
        .multiplyScalar(radius)
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

    setRadius(this.camera, this.target);

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
    this.domContainer.style.cursor = "";
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
      this.domContainer.style.cursor = "";
    } else {
      object.material.map!.offset.x = 0.5;
      object.scale.multiplyScalar(1.2);
      this.domContainer.style.cursor = "pointer";
    }
  }

  setControls(controls?: OrbitControls | TrackballControls) {
    if (this.controls) {
      this.controls.removeEventListener(
        "change",
        this.controlsChangeEvent.listener
      );
      this.target = new Vector3();
    }

    if (!controls) return;

    this.controls = controls;
    controls.addEventListener("change", this.controlsChangeEvent.listener);
    this.target = controls.target;
  }

  render() {
    const delta = clock.getDelta();
    if (this.animating) this.animate(delta);

    const x = this.domRect.left;
    const y = this.offsetHeight - this.domRect.bottom;

    const autoClear = this.renderer.autoClear;
    this.renderer.autoClear = false;
    this.renderer.setViewport(x, y, dim, dim);
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
    this.domRect = this.domContainer.getBoundingClientRect();
    this.offsetHeight = this.domElement.offsetHeight;
    setRadius(this.camera, this.target);
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
      .multiplyScalar(radius)
      .add(this.target);

    // animate orientation

    this.camera.quaternion.rotateTowards(targetQuaternion, step);

    this.updateOrientation();

    if (q1.angleTo(q2) === 0) {
      this.animating = false;
    }
  }

  setOrientation(orientation: GizmoOrientation) {
    prepareAnimationData(this.camera, this.target, orientation);
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

    this.domContainer.remove();

    if (this.controls)
      this.controls.removeEventListener(
        "change",
        this.controlsChangeEvent.listener
      );
  }
}

function getDomContainer(placement: DomPlacement, size: number) {
  const div = document.createElement("div");
  const style = div.style;

  style.height = `${size}px`;
  style.width = `${size}px`;
  style.borderRadius = "100%";
  style.position = "absolute";

  const [y, x] = placement.split("-");

  style.transform = "";
  style.left = x === "left" ? "0" : x === "center" ? "50%" : "";
  style.right = x === "right" ? "0" : "";
  style.transform += x === "center" ? "translateX(-50%)" : "";
  style.top = y === "top" ? "0" : y === "bottom" ? "" : "50%";
  style.bottom = y === "bottom" ? "0" : "";
  style.transform += y === "center" ? "translateY(-50%)" : "";

  return div;
}

function getAxesLines() {
  const distance = 0.9;
  const position = Array(3)
    .fill(0)
    .map((_, i) => [
      !i ? distance : 0,
      i === 1 ? distance : 0,
      i === 2 ? distance : 0,
      0,
      0,
      0,
    ])
    .flat();
  const color = Array(6)
    .fill(0)
    .map((_, i) =>
      i < 2
        ? axesColors[0].toArray()
        : i < 4
        ? axesColors[1].toArray()
        : axesColors[2].toArray()
    )
    .flat();

  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(position), 3)
  );
  geometry.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(color), 3)
  );

  return new LineSegments(
    geometry,
    new LineBasicMaterial({
      linewidth: 3,
      vertexColors: true,
    })
  );
}

function getBackgroundSphere() {
  const geometry = new SphereGeometry(1.6);
  const sphere = new Mesh(
    geometry,
    new MeshBasicMaterial({
      color: 0xffffff,
      side: BackSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    })
  );

  return sphere;
}

function getAxesSpritePoints() {
  const axes = ["x", "y", "z"] as const;
  return Array(6)
    .fill(0)
    .map((_, i) => {
      const isPositive = i < 3;
      const sign = isPositive ? "+" : "-";
      const axis = axes[i % 3];
      const color = axesColors[i % 3];

      const sprite = new Sprite(
        getSpriteMaterial(color, isPositive ? axis : null)
      );
      sprite.userData.type = `${sign}${axis}`;
      sprite.scale.setScalar(isPositive ? 0.6 : 0.4);
      sprite.position[axis] = isPositive ? 1.2 : -1.2;
      sprite.renderOrder = 1;

      return sprite;
    });
}

function getSpriteMaterial(color: Color, text: "x" | "y" | "z" | null = null) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 64;

  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.beginPath();
  context.arc(32, 32, 32, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = color.getStyle();
  context.fill();

  context.beginPath();
  context.arc(96, 32, 32, 0, 2 * Math.PI);
  context.closePath();
  context.fillStyle = "#FFF";
  context.fill();

  if (text !== null) {
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.fillStyle = "#000";
    context.fillText(text.toUpperCase(), 32, 48);
    context.fillText(text.toUpperCase(), 96, 48);
  }

  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.x = 0.5;

  return new SpriteMaterial({
    map: texture,
    toneMapped: false,
    transparent: true,
  });
}

function prepareAnimationData(
  camera: OrthographicCamera | PerspectiveCamera,
  focusPoint: Vector3,
  axis: GizmoOrientation
) {
  switch (axis) {
    case "+x":
      targetPosition.set(1, 0, 0);
      targetQuaternion.setFromEuler(new Euler(0, Math.PI * 0.5, 0));
      break;

    case "+y":
      targetPosition.set(0, 1, 0);
      targetQuaternion.setFromEuler(new Euler(-Math.PI * 0.5, 0, 0));
      break;

    case "+z":
      targetPosition.set(0, 0, 1);
      targetQuaternion.setFromEuler(new Euler());
      break;

    case "-x":
      targetPosition.set(-1, 0, 0);
      targetQuaternion.setFromEuler(new Euler(0, -Math.PI * 0.5, 0));
      break;

    case "-y":
      targetPosition.set(0, -1, 0);
      targetQuaternion.setFromEuler(new Euler(Math.PI * 0.5, 0, 0));
      break;

    case "-z":
      targetPosition.set(0, 0, -1);
      targetQuaternion.setFromEuler(new Euler(0, Math.PI, 0));
      break;

    default:
      console.error("ViewHelper: Invalid axis.");
  }

  setRadius(camera, focusPoint);
  prepareQuaternions(camera, focusPoint);
}

function setRadius(camera: Camera, focusPoint: Vector3) {
  radius = camera.position.distanceTo(focusPoint);
}

function prepareQuaternions(camera: Camera, focusPoint: Vector3) {
  targetPosition.multiplyScalar(radius).add(focusPoint);

  dummy.position.copy(focusPoint);

  dummy.lookAt(camera.position);
  q1.copy(dummy.quaternion);

  dummy.lookAt(targetPosition);
  q2.copy(dummy.quaternion);
}

function updatePointer(
  e: PointerEvent,
  domRect: DOMRect,
  orthoCamera: OrthographicCamera
) {
  mouse.x = ((e.clientX - domRect.left) / domRect.width) * 2 - 1;
  mouse.y = -((e.clientY - domRect.top) / domRect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, orthoCamera);
}

function isClick(
  e: PointerEvent,
  startCoords: Vector2,
  threshold: number = 10
) {
  return (
    Math.abs(e.clientX - startCoords.x) < threshold &&
    Math.abs(e.clientY - startCoords.y) < threshold
  );
}

function getIntersectionObject(
  event: PointerEvent,
  domRect: DOMRect,
  orthoCamera: OrthographicCamera,
  intersectionObjects: Sprite[]
) {
  updatePointer(event, domRect, orthoCamera);

  const intersects = raycaster.intersectObjects(intersectionObjects);

  if (!intersects.length) return null;

  const intersection = intersects[0];
  return intersection.object as Sprite;
}

function resetSprites(sprites: Sprite[]) {
  let i = sprites.length;

  while (i--) {
    sprites[i].scale.setScalar(i < 3 ? 0.6 : 0.4);
    sprites[i].material.map!.offset.x = 1;
  }
  //sprites.forEach((sprite) => (sprite.material.map!.offset.x = 1));
}

function updateSpritesOpacity(sprites: Sprite[], camera: Camera) {
  point.set(0, 0, 1);
  point.applyQuaternion(camera.quaternion);

  if (point.x >= 0) {
    sprites[POS_X].material.opacity = 1;
    sprites[NEG_X].material.opacity = 0.5;
  } else {
    sprites[POS_X].material.opacity = 0.5;
    sprites[NEG_X].material.opacity = 1;
  }

  if (point.y >= 0) {
    sprites[POS_Y].material.opacity = 1;
    sprites[NEG_Y].material.opacity = 0.5;
  } else {
    sprites[POS_Y].material.opacity = 0.5;
    sprites[NEG_Y].material.opacity = 1;
  }

  if (point.z >= 0) {
    sprites[POS_Z].material.opacity = 1;
    sprites[NEG_Z].material.opacity = 0.5;
  } else {
    sprites[POS_Z].material.opacity = 0.5;
    sprites[NEG_Z].material.opacity = 1;
  }
}

function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

export { ViewportGizmo as ViewHelper };
