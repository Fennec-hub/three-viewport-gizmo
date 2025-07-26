import {
  Camera,
  Clock,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Scene,
  Spherical,
  Vector2,
  Vector3,
  Vector4,
  type WebGLRenderer,
} from "three";

import { gizmoDomElement, setDomPlacement } from "./utils/gizmoDomElement";
import { getDomElement } from "./utils/getDomElement";
import { updateAxis } from "./utils/updateAxis";
import { isClick } from "./utils/isClick";
import { intersectedObjects } from "./utils/intersectedObjects";

import {
  GizmoOptions,
  ViewportGizmoEventMap,
  GizmoAxisOptions,
  GizmoOptionsFallback,
  GizmoAxisObject,
  GizmoViewportArray,
} from "./types";
import { GIZMO_EPSILON, GIZMO_TURN_RATE } from "./utils/constants";
import { updateBackground } from "./utils/updateBackground";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import { optionsFallback } from "./utils/optionsFallback";
import { clamp } from "three/src/math/MathUtils.js";
import { axesObjects } from "./utils/axesObjects";
import { axisHover } from "./utils/axisHover";
import type { WebGPURenderer } from "three/webgpu";

export type { GizmoOptions, ViewportGizmoEventMap, GizmoAxisOptions };

const _matrix = /*@__PURE__*/ new Matrix4();
const _spherical = /*@__PURE__*/ new Spherical();
const _vec2 = /*@__PURE__*/ new Vector2();
const _vec3 = /*@__PURE__*/ new Vector3();
const _vec4 = /*@__PURE__*/ new Vector4();

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

  /** The WebGLRenderer rendering the gizmo */
  renderer: WebGLRenderer | WebGPURenderer;

  /** The configuration options */
  options!: GizmoOptions;

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

  private _options!: GizmoOptionsFallback;
  private _intersections!: GizmoAxisObject[];
  private _background: Mesh<any, MeshBasicMaterial> | null = null;
  private _viewport: GizmoViewportArray = [0, 0, 0, 0];
  private _originalViewport: GizmoViewportArray = [0, 0, 0, 0];
  private _originalScissor: GizmoViewportArray = [0, 0, 0, 0];
  private _scene: Scene;
  private _camera!: Camera;
  private _container!: HTMLElement;
  private _domElement!: HTMLElement;
  private _domRect!: DOMRect;
  private _dragging: boolean = false;
  private _distance: number = 0;
  private _clock: Clock = new Clock();
  private _targetQuaternion = new Quaternion();
  private _quaternionStart = new Quaternion();
  private _quaternionEnd = new Quaternion();
  private _pointerStart = new Vector2();
  private _focus: GizmoAxisObject | null = null;
  private _placement!: GizmoOptionsFallback["placement"];
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
   * @param options - {@link GizmoOptions}, Configuration options for the gizmo.
   * @param options.container - Parent element for the gizmo. Can be an HTMLElement or a CSS selector string
   * @param options.type - The gizmo configuration type. Either 'sphere' or 'cube', defaults to 'sphere'
   * @param options.size - Size of the gizmo widget in pixels. Defaults to 128
   * @param options.placement - Position of the gizmo in the viewport
   *    Options include:
   *    - `"top-left"`
   *    - `"top-center"`
   *    - `"top-right"`
   *    - `"center-left"`
   *    - `"center-center"`
   *    - `"center-right"`
   *    - `"bottom-left"`
   *    - `"bottom-center"`
   *    - `"bottom-right"`
   * @param options.offset - Offset of the gizmo from container edges in pixels
   * @param options.offset.left - Offset from the left edge
   * @param options.offset.top - Offset from the top edge
   * @param options.offset.right - Offset from the right edge
   * @param options.offset.bottom - Offset from the bottom edge
   * @param options.animated - Whether view changes should be animated. Defaults to true
   * @param options.speed - Animation speed multiplier. Defaults to 1
   * @param options.resolution - Texture resolution. Defaults to 64 for sphere, 128 for cube
   * @param options.lineWidth - Width of the axes lines in pixels
   * @param options.id - HTML `id` attribute for the gizmo container
   * @param options.className - HTML `class` attribute for the gizmo container
   * @param options.font - Font configuration for axis labels
   * @param options.font.family - Font family for axis labels
   * @param options.font.weight - Font weight for axis labels
   * @param options.background - Configuration for the background sphere/cube
   * @param options.background.enabled - Whether to display the background
   * @param options.background.color - Color of the background in normal state
   * @param options.background.opacity - Opacity of the background in normal state
   * @param options.background.hover.color - Color of the background when hovered
   * @param options.background.hover.opacity - Opacity of the background when hovered
   * @param options.corners - Configuration for corner indicators
   * @param options.corners.enabled - Whether to display corner indicators
   * @param options.corners.color - Base color of corner indicators
   * @param options.corners.opacity - Opacity of corner indicators
   * @param options.corners.scale - Scale multiplier for corner indicators
   * @param options.corners.radius - Radius of corner indicators
   * @param options.corners.smoothness - Smoothness of corner indicators
   * @param options.corners.hover.color - Color of corner indicators when hovered
   * @param options.corners.hover.opacity - Opacity of corner indicators when hovered
   * @param options.corners.hover.scale - Scale of corner indicators when hovered
   * @param options.edges - Configuration for edge indicators
   * @param options.edges.enabled - Whether to display edge indicators
   * @param options.edges.color - Base color of edge indicators
   * @param options.edges.opacity - Opacity of edge indicators
   * @param options.edges.scale - Scale multiplier for edge indicators
   * @param options.edges.radius - Radius of edge indicators
   * @param options.edges.smoothness - Smoothness of edge indicators
   * @param options.edges.hover.color - Color of edge indicators when hovered
   * @param options.edges.hover.opacity - Opacity of edge indicators when hovered
   * @param options.edges.hover.scale - Scale of edge indicators when hovered
   * @param options.x - Configuration for positive X axis/face
   * @param options.y - Configuration for positive Y axis/face
   * @param options.z - Configuration for positive Z axis/face
   * @param options.nx - Configuration for negative X axis/face
   * @param options.ny - Configuration for negative Y axis/face
   * @param options.nz - Configuration for negative Z axis/face
   *
   * @remarks Axis-specific configuration can also use alias names for cube mode:
   * - `right` (same as `x`)
   * - `left` (same as `nx`)
   * - `top` (same as `y`)
   * - `bottom` (same as `ny`)
   * - `front` (same as `z`)
   * - `back` (same as `nz`)
   *
   * For each axis/face configuration, the following options are available:
   * @param options.AXIS.enabled - Whether to draw the axis
   * @param options.AXIS.label - Custom text label for the axis
   * @param options.AXIS.opacity - Axis opacity
   * @param options.AXIS.scale - Scale multiplier for indicator size
   * @param options.AXIS.line - Whether to draw the axis line
   * @param options.AXIS.color - Axis indicator background color
   * @param options.AXIS.labelColor - Axis label color
   * @param options.AXIS.border.size - Border size around the axis indicator
   * @param options.AXIS.border.color - Border color around the axis indicator
   * @param options.AXIS.hover.color - Fill color on hover
   * @param options.AXIS.hover.labelColor - Label text color on hover
   * @param options.AXIS.hover.opacity - Opacity when hovered
   * @param options.AXIS.hover.scale - Indicator scale when hovered
   * @param options.AXIS.hover.border.size - Hover border size
   * @param options.AXIS.hover.border.color - Hover border color
   */
  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer | WebGPURenderer,
    options: GizmoOptions = {}
  ) {
    super();

    this.camera = camera;
    this.renderer = renderer;
    this._scene = new Scene().add(this);
    this.set(options);
  }

  /** Gets the current placement of the gizmo relative to its container. */
  get placement(): GizmoOptionsFallback["placement"] {
    return this._placement;
  }

  /**
   * Sets and update the placement of the gizmo relative to its container.
   *
   * @param placement - The new placement position
   */
  set placement(placement: GizmoOptionsFallback["placement"]) {
    this._placement = setDomPlacement(this._domElement, placement);
    this.domUpdate();
  }

  /**
   * Regenerates the gizmo with the new options.
   *
   * @remarks
   * - Not recommended for use in real-time rendering or animation loops
   * - Provides a way to completely rebuild the gizmo with new options
   * - Can be computationally expensive, so use sparingly
   */
  set(options: GizmoOptions = {}) {
    this.dispose();

    this.options = options;
    this._options = optionsFallback(options);

    this._camera = this._options.isSphere
      ? new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10)
      : new PerspectiveCamera(26, 1, 5, 10);

    this._camera.position.set(0, 0, 7);

    const [axes, background, lines] = axesObjects(this._options);

    if (background) this.add(background);
    if (lines) this.add(lines);
    this.add(...axes);

    this._background = background;
    this._intersections = axes;

    const { container, animated, speed } = this._options;

    this.animated = animated;
    this.speed = speed;

    this._container = container
      ? getDomElement(container as string)
      : document.body;

    this._domElement = gizmoDomElement(this._options);
    this._domElement.onpointerdown = (e) => this._onPointerDown(e);
    this._domElement.onpointermove = (e) => this._onPointerMove(e);
    this._domElement.onpointerleave = () => this._onPointerLeave();

    this._container.appendChild(this._domElement);

    if (this._controls) this.attachControls(this._controls);

    this.update();

    return this;
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

    const { renderer, _viewport } = this;

    const _prevScissorTest = renderer.getScissorTest();
    const _prevAutoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.setViewport(..._viewport);
    if (_prevScissorTest) renderer.setScissor(..._viewport);

    renderer.clear(false, true, false);
    renderer.render(this._scene, this._camera);

    renderer.setViewport(...this._originalViewport);
    if (_prevScissorTest) renderer.setScissor(...this._originalScissor);

    renderer.autoClear = _prevAutoClear;

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

    const renderer = this.renderer;
    const domRect = this._domRect;
    const containerRect = renderer.domElement.getBoundingClientRect();

    this._viewport.splice(
      0,
      4,
      domRect.left - containerRect.left,
      renderer.domElement.clientHeight -
        (domRect.top - containerRect.top + domRect.height),
      domRect.width,
      domRect.height
    );

    renderer.getViewport(_vec4).toArray(this._originalViewport);
    if (renderer.getScissorTest())
      renderer.getScissor(_vec4).toArray(this._originalScissor);

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

    return this;
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

    return this;
  }

  /** Cleans up all resources including geometries, materials, textures, and event listeners. */
  dispose() {
    this.detachControls();

    this.children.forEach((child) => {
      this.remove(child);
      const mesh = child as Mesh<any, MeshBasicMaterial>;
      mesh.material?.dispose();
      mesh.material?.map?.dispose();
      mesh.geometry?.dispose();
    });

    this._domElement?.remove();
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

    updateAxis(this._options, this._intersections, this.camera);
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

    if (this._controls) this._controls.enabled = false;

    const delta = this._clock.getDelta();

    const step = delta * GIZMO_TURN_RATE * this.speed;

    this._quaternionStart.rotateTowards(this._quaternionEnd, step);

    position
      .applyQuaternion(this._quaternionStart)
      .multiplyScalar(this._distance)
      .add(this.target);

    quaternion.rotateTowards(this._targetQuaternion, step);

    this._updateOrientation();
    // FIXME - Need fix?
    requestAnimationFrame(() => this.dispatchEvent({ type: "change" }));

    if (this._quaternionStart.angleTo(this._quaternionEnd) < GIZMO_EPSILON) {
      if (this._controls) this._controls.enabled = true;
      this.animating = false;
      this.up.copy(Object3D.DEFAULT_UP); // Reset the up vector to the default after applying coordinate system changes
      this.dispatchEvent({ type: "end" });
    }
  }

  /**
   * Sets the camera orientation to look at the target from a specific axis.
   *
   * @private
   * @param position - The axis point position
   */
  private _setOrientation(position: Vector3) {
    const camera = this.camera;
    const focusPoint = this.target;

    // Apply proper camera rotation to ensure text is upright when looking along the up axis
    const defaultUp = Object3D.DEFAULT_UP;
    let forwardAxis = this.up;

    // Determine the correct "forward" direction for the top view based on coordinate system
    if (Math.abs(position.z) >= 1 && defaultUp.z === 1) {
      // Z-up: use positive Y as forward 
      forwardAxis.set(0, 1, 0);
    } else if (Math.abs(position.x) >= 1 && defaultUp.x === 1) {
      // X-up: use negative Y as forward?
      // TODO: determine what the correct forward axis should be for X-up
      // forwardAxis.set(0, -1, 0);
    }

    _vec3.copy(position).multiplyScalar(this._distance);

    _matrix.setPosition(_vec3).lookAt(_vec3, this.position, forwardAxis);
    this._targetQuaternion.setFromRotationMatrix(_matrix);

    _vec3.add(focusPoint);

    _matrix.lookAt(_vec3, focusPoint, forwardAxis);
    this._quaternionEnd.setFromRotationMatrix(_matrix);

    _matrix
      .setPosition(camera.position)
      .lookAt(camera.position, focusPoint, forwardAxis);
    this._quaternionStart.setFromRotationMatrix(_matrix);

    this.animating = true;
    this._clock.start();
    this.dispatchEvent({ type: "start" });
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
        if (isClick(e, this._pointerStart)) return;
        this._dragging = true;
      }

      const pointerAngle = _vec2
        .set(e.clientX, e.clientY)
        .sub(this._pointerStart)
        .multiplyScalar((1 / this._domRect.width) * Math.PI);

      const direction = this.coordinateConversion(
        _vec3.subVectors(this.camera.position, this.target)
      );

      const spherical = _spherical.setFromVector3(direction);

      spherical.theta = initialTheta - pointerAngle.x;
      spherical.phi = clamp(
        initialPhi - pointerAngle.y,
        GIZMO_EPSILON,
        Math.PI - GIZMO_EPSILON
      );

      this.coordinateConversion(
        this.camera.position.setFromSpherical(spherical),
        true
      ).add(this.target);

      this.camera.lookAt(this.target);

      this.quaternion.copy(this.camera.quaternion).invert();

      this._updateOrientation(false);
      this.dispatchEvent({ type: "change" });
    };

    const endDrag = () => {
      document.removeEventListener("pointermove", drag, false);
      document.removeEventListener("pointerup", endDrag, false);

      if (!this._dragging) return this._handleClick(e);

      if (this._focus) {
        axisHover(this._focus, false);
        this._focus = null;
      }

      this._dragging = false;
      this.dispatchEvent({ type: "end" });
    };

    if (this.animating) return;

    e.preventDefault();
    this._pointerStart.set(e.clientX, e.clientY);

    const direction = this.coordinateConversion(
      _vec3.subVectors(this.camera.position, this.target)
    );

    const initialSpherical = _spherical.setFromVector3(direction);
    const initialTheta = initialSpherical.theta;
    const initialPhi = initialSpherical.phi;
    this._distance = initialSpherical.radius;

    document.addEventListener("pointermove", drag, false);
    document.addEventListener("pointerup", endDrag, false);

    this.dispatchEvent({ type: "start" });
  }

  /**
   * Converts the input-coordinates from the standard Y-axis up to what is set in Object3D.DEFAULT_UP.
   *
   * @private
   * @param target      - The target Vector3 to be converted
   * @param isSpherical - Whether or not the coordinates are for a sphere
   * @returns The converted coordinates
   */
  private coordinateConversion(target: Vector3, isSpherical = false) {
    const { x, y, z } = target;

    const defaultUp = Object3D.DEFAULT_UP;

    if (defaultUp.x === 1)
      return isSpherical ? target.set(y, z, x) : target.set(z, x, y);

    if (defaultUp.z === 1)
      return isSpherical ? target.set(z, x, y) : target.set(y, z, x);

    return target;
  }

  /**
   * Handles pointer move events for hover effects and drag operations.
   *
   * @private
   * @param e - The pointer event
   */
  private _onPointerMove(e: PointerEvent) {
    if (!this.enabled || this._dragging) return;

    if (this._background) updateBackground(this._background, true);

    this._handleHover(e);
  }

  /**
   * Handles pointer leave events to reset hover states.
   *
   * @private
   */
  private _onPointerLeave() {
    if (!this.enabled || this._dragging) return;

    if (this._background) updateBackground(this._background, false);
    if (this._focus) axisHover(this._focus, false);

    this._domElement.style.cursor = "";
  }

  /**
   * Handles click events for axis selection.
   *
   * @private
   * @param e - The pointer event
   */
  private _handleClick(e: PointerEvent) {
    const intersection = intersectedObjects(
      e,
      this._domRect,
      this._camera,
      this._intersections
    );

    if (this._focus) {
      axisHover(this._focus, false);
      this._focus = null;
    }

    if (!intersection) return;

    this._setOrientation(intersection.object.position);

    this.dispatchEvent({ type: "change" });
  }

  /**
   * Handles hover effects for interactive elements.
   *
   * @private
   * @param e - The pointer event
   */
  private _handleHover(e: PointerEvent) {
    const intersection = intersectedObjects(
      e,
      this._domRect,
      this._camera,
      this._intersections
    );

    const object = intersection?.object || null;

    if (this._focus === object) return;

    this._domElement.style.cursor = object ? "pointer" : "";

    if (this._focus) axisHover(this._focus, false);

    if ((this._focus = object)) axisHover(object, true);
    else updateAxis(this._options, this._intersections, this.camera);
  }
}
