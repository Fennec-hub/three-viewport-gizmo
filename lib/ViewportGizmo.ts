import {
  BufferGeometry,
  Clock,
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Sprite,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
} from "three";

import { createDomElement } from "./utils/createDomElement";
import { getAxesLines } from "./utils/getAxesLines";
import { getDomElement } from "./utils/getDomElement";
import { getBackgroundSphere } from "./utils/getBackgroundSphere";
import { getAxesSpritePoints } from "./utils/getAxesSpritePoints";
import { updateSpritesOpacity } from "./utils/updateSpritesOpacity";
import { isClick } from "./utils/isClick";
import { resetSprites } from "./utils/resetSprites";
import { getIntersectionObject } from "./utils/getIntersectionObject";
import { clamp } from "./utils/clamp";

import {
  GizmoOptions,
  ViewportGizmoEventMap,
  GizmoDomPlacement,
  GizmoAxisOptions,
  OrientationAxes,
} from "./types";
import {
  GIZMO_AXES,
  GIZMO_AXES_ORIENTATIONS,
  GIZMO_DEFAULT_OPTIONS,
  GIZMO_TURN_RATE,
} from "./utils/constants";
import { setSphereColor } from "./utils/setSphereColor";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

export type {
  GizmoOptions,
  ViewportGizmoEventMap,
  GizmoDomPlacement,
  GizmoAxisOptions,
  OrientationAxes,
};

const _matrix = /*@__PURE__*/ new Matrix4();
const _euler = /*@__PURE__*/ new Euler();

/**
 * ViewportGizmo is a 3D camera orientation controller that provides a visual interface
 * for changing the camera's viewing angle. It creates a widget that shows the current
 * camera orientation and allows direct manipulation of the view through clicking or dragging.
 *
 * @fires ViewportGizmo#start - Fired when a view change interaction begins
 * @fires ViewportGizmo#change - Fired during view changes
 * @fires ViewportGizmo#end - Fired when a view change interaction ends
 *
 * @extends Object3D
 */
export class ViewportGizmo extends Object3D<ViewportGizmoEventMap> {
  /** Whether the gizmo is currently active and responding to user input */
  enabled: boolean = true;

  /** The camera being controlled by this gizmo */
  camera: OrthographicCamera | PerspectiveCamera;

  /** The point around which the camera rotates */
  target = new Vector3();

  /** Whether view changes should be animated */
  animated: boolean = true;

  /** The speed of view change animations. Higher values result in faster animations */
  speed: number = 1;

  /**
   * Indicates whether the gizmo is currently being animated or not,
   * Useful when interacting with other camera controllers
   *
   * @readonly This value is set internally.
   **/
  animating = false;

  private _sphere?: Mesh<BufferGeometry, MeshBasicMaterial>;
  private _sphereConfig?: GizmoOptions["sphere"];
  private _spritePoints: Sprite[];
  private _viewport: Vector4 = new Vector4();
  private _originalViewport: Vector4 = new Vector4();
  private _originalScissor: Vector4 = new Vector4();
  private _renderer: WebGLRenderer;
  private _orthoCamera = new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 0, 4);
  private _container: HTMLElement;
  private _domElement: HTMLElement;
  private _domRect!: DOMRect;
  private _dragging: boolean = false;
  private _distance: number = 0;
  private _clock: Clock = new Clock();
  private _targetPosition = new Vector3();
  private _targetQuaternion = new Quaternion();
  private _quaternionStart = new Quaternion();
  private _quaternionEnd = new Quaternion();
  private _mouseStart = new Vector2();
  private _mouseAngle = new Vector2();
  private _controls?: OrbitControls;
  private _controlsListeners?: {
    start: () => void;
    end: () => void;
    change: () => void;
  };

  /**
   * Creates a new ViewportGizmo instance.
   *
   * @param camera - The camera to be controlled by this gizmo
   * @param renderer - The WebGL renderer used to render the scene
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.size - Size of the gizmo widget in pixels
   * @param options.placement - Position of the gizmo in the viewport. One of:
   *
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   *
   * @param options.animated - Whether view changes should be animated
   * @param options.speed - Animation speed multiplier
   * @param options.lineWidth - Width of the axis lines
   * @param options.offset - Offset from the container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.sphere - Configuration for the background sphere
   * @param options.sphere.enabled - Whether to show the background sphere
   * @param options.sphere.color - Color of the background sphere
   * @param options.sphere.opacity - Opacity of the background sphere
   * @param options.sphere.hoverColor - Hover color of the background sphere
   * @param options.sphere.hoverOpacity - Hover opacity of the background sphere
   * @param options.id - HTML id attribute for the gizmo container
   * @param options.className - HTML class attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.resolution - Resolution of the gizmo rendering
   * @param options.x - Configuration for positive X axis
   * @param options.y - Configuration for positive Y axis
   * @param options.z - Configuration for positive Z axis
   * @param options.nx - Configuration for negative X axis
   * @param options.ny - Configuration for negative Y axis
   * @param options.nz - Configuration for negative Z axis
   *
   * @AXIS The following is the configuration for each AXIS `options.[x | y | z | nx | ny | nz]`:
   *
   * @param options.AXIS.text - Custom text label for the axis
   * @param options.AXIS.circle - Whether to draw a circle indicator
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.border - Whether to draw a border around the axis indicator
   * @param options.AXIS.colors - Color configuration for the axis
   * @param options.AXIS.colors.main - Main color(s) for the axis. Can be a single color or [normal, hover] colors
   * @param options.AXIS.colors.hover - Hover color for the axis
   * @param options.AXIS.colors.text - Color for the axis label
   * @param options.AXIS.colors.hoverText - Color for the axis label on hover
   */
  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer,
    options?: GizmoOptions
  ) {
    super();

    this._renderer = renderer;
    this.camera = camera;

    this._orthoCamera.position.set(0, 0, 2);

    options = { ...GIZMO_DEFAULT_OPTIONS, ...(options || {}) };

    const {
      container,
      placement,
      size,
      animated,
      speed,
      offset,
      sphere,
      id,
      className,
    } = options as Required<GizmoOptions>;

    this.animated = animated;
    this.speed = speed;

    const axesLines = getAxesLines(options);
    if (axesLines) this.add(axesLines);

    this._spritePoints = getAxesSpritePoints(options);
    this.add(...this._spritePoints);

    if (sphere.enabled) {
      this._sphere = getBackgroundSphere(sphere);
      this._sphereConfig = sphere;
      this.add(this._sphere);
    }

    this._container = container ? getDomElement(container) : document.body;
    this._domElement = createDomElement(placement, size, offset, id, className);
    this._container.appendChild(this._domElement);

    this._startListening();
    this.update();
  }

  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    if (this.animating) this._animate();

    const { _renderer, _viewport } = this;

    // save the current viewport config
    const scissorTest = _renderer.getScissorTest();
    const autoClear = _renderer.autoClear;

    // render
    _renderer.autoClear = false;
    _renderer.setViewport(_viewport);
    if (scissorTest) _renderer.setScissor(_viewport);

    _renderer.clear(false, true, false);
    _renderer.render(this, this._orthoCamera);

    // reset the current viewport config
    _renderer.setViewport(this._originalViewport);
    if (scissorTest) _renderer.setScissor(this._originalScissor);

    _renderer.autoClear = autoClear;

    return this;
  }

  /**
   * Updates the gizmo's DOM-related properties based on its current position
   * and size in the document.
   *
   * @returns The gizmo instance for method chaining
   */
  domUpdate() {
    this._domRect = this._domElement.getBoundingClientRect();

    const renderer = this._renderer;
    const domRect = this._domRect;
    const containerRect = renderer.domElement.getBoundingClientRect();

    this._viewport.set(
      domRect.left - containerRect.left,
      renderer.domElement.clientHeight -
        (domRect.top - containerRect.top + domRect.height),
      domRect.width,
      domRect.height
    );

    renderer.getViewport(this._originalViewport);
    if (renderer.getScissorTest()) renderer.getScissor(this._originalScissor);

    return this;
  }

  /**
   * Updates the gizmo's orientation to match the current camera orientation.
   *
   * @returns The gizmo instance for method chaining
   */
  cameraUpdate() {
    this._updateOrientation();
    return this;
  }

  /**
   * Performs a complete update of the gizmo, including both DOM and camera-related updates.
   *
   * @param controls - Internal. Set to `false` if the update event comes from the attached controls.
   *
   * @returns The gizmo instance for method chaining
   */
  update(controls: boolean = true) {
    if (controls && this._controls) this._controls.update();
    return this.domUpdate().cameraUpdate();
  }

  /**
   * Connects OrbitControls with the gizmo, handling interaction states and updates.
   * Automatically detaches any previously attached controls.
   *
   * @param controls - The scene's {@link https://threejs.org/docs/#examples/en/controls/OrbitControls OrbitControls}
   */
  attachControls(controls: OrbitControls) {
    this.detachControls();

    this.target = controls.target;

    this._controlsListeners = {
      start: () => (controls.enabled = false),
      end: () => (controls.enabled = true),
      change: () => this.update(false),
    };

    this.addEventListener("start", this._controlsListeners.start);
    this.addEventListener("end", this._controlsListeners.end);
    controls.addEventListener("change", this._controlsListeners.change);

    this._controls = controls;
  }

  /** Removes all control event listeners and references. Safe to call multiple times. */
  detachControls() {
    if (!this._controlsListeners || !this._controls) return;

    this.target = new Vector3().copy(this._controls.target);

    this.removeEventListener("start", this._controlsListeners.start);
    this.removeEventListener("end", this._controlsListeners.end);

    this._controls.removeEventListener(
      "change",
      this._controlsListeners.change
    );

    this._controlsListeners = undefined;
    this._controls = undefined;
  }

  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    this.detachControls();

    this.children.forEach((child) => {
      const mesh = child as Mesh<any, MeshBasicMaterial>;
      mesh.material?.dispose();
      mesh.material?.map?.dispose();
      mesh.geometry?.dispose();
    });

    this._domElement.remove();
  }

  /**
   * Updates the gizmo's orientation either based on the camera or internal state.
   *
   * @private
   * @param fromCamera - Whether to update based on camera orientation (true) or internal state (false)
   */
  private _updateOrientation(fromCamera: boolean = true) {
    if (fromCamera) {
      this.quaternion.copy(this.camera.quaternion).invert();
      this.updateMatrixWorld();
    }

    updateSpritesOpacity(this._spritePoints, this.camera);
  }

  /**
   * Handles the animation of camera position and orientation changes.
   *
   * @private
   */
  private _animate() {
    const { position, quaternion } = this.camera;

    position.set(0, 0, 1);

    if (!this.animated) {
      position
        .applyQuaternion(this._quaternionEnd)
        .multiplyScalar(this._distance)
        .add(this.target);

      quaternion.copy(this._targetQuaternion);

      this._updateOrientation();

      this.animating = false;
      this.dispatchEvent({ type: "change" });
      this.dispatchEvent({ type: "end" });
      return;
    }

    const delta = this._clock.getDelta();

    const step = delta * GIZMO_TURN_RATE * this.speed;

    this._quaternionStart.rotateTowards(this._quaternionEnd, step);
    position
      .applyQuaternion(this._quaternionStart)
      .multiplyScalar(this._distance)
      .add(this.target);

    quaternion.rotateTowards(this._targetQuaternion, step);

    this._updateOrientation();
    requestAnimationFrame(() => this.dispatchEvent({ type: "change" }));

    if (this._quaternionStart.angleTo(this._quaternionEnd) === 0) {
      this.animating = false;
      this.dispatchEvent({ type: "end" });
    }
  }

  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param axis - The axis to orient the camera along
   */
  private _setOrientation(axis: (typeof GIZMO_AXES)[number]) {
    const camera = this.camera;
    const focusPoint = this.target;

    const [position, orientation] = GIZMO_AXES_ORIENTATIONS[axis];
    this._targetPosition.fromArray(position);
    this._targetQuaternion.setFromEuler(_euler.fromArray(orientation));

    this._targetPosition.multiplyScalar(this._distance).add(focusPoint);

    _matrix.setPosition(camera.position);
    _matrix.lookAt(camera.position, focusPoint, this.up);
    this._quaternionStart.setFromRotationMatrix(_matrix);

    _matrix.setPosition(this._targetPosition);
    _matrix.lookAt(this._targetPosition, focusPoint, this.up);
    this._quaternionEnd.setFromRotationMatrix(_matrix);

    this.animating = true;
    this._clock.start();
    this.dispatchEvent({ type: "start" });
  }

  /**
   * Initializes event listeners for user interaction.
   *
   * @private
   */
  private _startListening() {
    this._domElement.onpointerdown = (e) => this._onPointerDown(e);
    this._domElement.onpointermove = (e) => this._onPointerMove(e);
    this._domElement.onpointerleave = () => this._onPointerLeave();
  }

  /**
   * Handles the pointer down event for starting drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  private _onPointerDown(e: PointerEvent) {
    if (!this.enabled) return;

    const drag = (e: PointerEvent) => {
      if (!this._dragging) {
        if (isClick(e, this._mouseStart)) return;

        resetSprites(this._spritePoints);
        this._dragging = true;
      }

      this._mouseAngle
        .set(e.clientX, e.clientY)
        .sub(this._mouseStart)
        .multiplyScalar((1 / this._domRect.width) * Math.PI);

      this.rotation.x = clamp(
        rotationStart.x + this._mouseAngle.y,
        Math.PI / -2 + 0.001,
        Math.PI / 2 - 0.001
      );
      this.rotation.y = rotationStart.y + this._mouseAngle.x;
      this.updateMatrixWorld();

      this._quaternionStart.copy(this.quaternion).invert();

      this.camera.position
        .set(0, 0, 1)
        .applyQuaternion(this._quaternionStart)
        .multiplyScalar(this._distance)
        .add(this.target);

      this.camera.rotation.setFromQuaternion(this._quaternionStart);

      this._updateOrientation(false);

      this.dispatchEvent({ type: "change" });
    };
    const endDrag = () => {
      document.removeEventListener("pointermove", drag, false);
      document.removeEventListener("pointerup", endDrag, false);

      if (!this._dragging) return this._handleClick(e);

      this._dragging = false;
      this.dispatchEvent({ type: "end" });
    };

    if (this.animating) return;

    e.preventDefault();

    this._mouseStart.set(e.clientX, e.clientY);

    const rotationStart = _euler.copy(this.rotation);

    this._distance = this.camera.position.distanceTo(this.target);

    document.addEventListener("pointermove", drag, false);
    document.addEventListener("pointerup", endDrag, false);

    this.dispatchEvent({ type: "start" });
  }

  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  private _onPointerMove(e: PointerEvent) {
    if (!this.enabled || this._dragging) return;

    if (this._sphere) setSphereColor(this._sphere, this._sphereConfig);

    this._handleHover(e);
  }

  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  private _onPointerLeave() {
    if (!this.enabled || this._dragging) return;

    if (this._sphere) setSphereColor(this._sphere, this._sphereConfig, false);

    resetSprites(this._spritePoints);
    this._domElement.style.cursor = "";
  }

  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  private _handleClick(e: PointerEvent) {
    const object = getIntersectionObject(
      e,
      this._domRect,
      this._orthoCamera,
      this._spritePoints
    );

    if (!object) return;

    this._setOrientation(object.userData.axis);
    this.dispatchEvent({ type: "change" });
  }

  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
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
