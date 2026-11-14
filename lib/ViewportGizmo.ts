import {
  Camera,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  Scene,
  Vector3,
  type WebGLRenderer,
} from "three";
import type { WebGPURenderer } from "three/webgpu";
import type { OrbitControls } from "three/addons/controls/OrbitControls.js";

import {
  GizmoOptions,
  ViewportGizmoEventMap,
  GizmoAxisOptions,
  GizmoOptionsFallback,
  GizmoAxisObject,
  GizmoViewportArray,
  GizmoAxisKind,
  GizmoAxisName,
  GizmoFaceName,
  GizmoAxisObjectUserData,
} from "./types";
import { optionsFallback, upAxisFromVector } from "./options/optionsFallback";
import { orbitFrame, type OrbitFrame } from "./orbit/frame";
import { readPose, targetPose, writePose, type OrbitPose } from "./orbit/pose";
import { orbitTransition, sampleTransition, type OrbitTransition } from "./orbit/transition";
import { pointerSession } from "./interaction/pointerSession";
import { intersectedObjects } from "./interaction/intersectedObjects";
import { axisHover } from "./interaction/axisHover";
import { updateBackground } from "./interaction/updateBackground";
import { gizmoDomElement, setDomPlacement } from "./render/gizmoDomElement";
import { getDomElement } from "./render/getDomElement";
import { renderInRect, saveViewport, viewportRect } from "./render/viewport";
import { axesObjects } from "./scene/axesObjects";
import { updateAxis } from "./scene/updateAxis";

export type { GizmoOptions, ViewportGizmoEventMap, GizmoAxisOptions };

function objectIdentity(object: GizmoAxisObject | null): {
  kind: GizmoAxisKind | null;
  axes: readonly GizmoAxisName[] | null;
  face: GizmoFaceName | null;
  direction: Vector3 | null;
} {
  if (!object) return { kind: null, axes: null, face: null, direction: null };

  const userData: GizmoAxisObjectUserData = object.userData;

  return {
    kind: userData.kind ?? null,
    axes: userData.axes ?? null,
    face: userData.face ?? null,
    direction: object.position.clone().normalize(),
  };
}

const _pose: OrbitPose = { azimuth: 0, polar: 0 };

/**
 * ViewportGizmo is a 3D camera orientation controller that provides a visual interface
 * for changing the camera's viewing angle. It creates a widget that shows the current
 * camera orientation and allows direct manipulation of the view through clicking or dragging.
 *
 * Every view change (click, drag, {@link ViewportGizmo.lookFrom}) moves the camera as an
 * upright orbit about {@link ViewportGizmo.target} around the gizmo's up axis.
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
  private _frame!: OrbitFrame;
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
  private _stopPointer?: () => void;
  private _flight: OrbitTransition | null = null;
  /** Seconds; `null` until the first animation frame of a flight, which samples its start. */
  private _flightStart: number | null = null;
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
   * @param renderer - The renderer drawing the scene; `WebGLRenderer` or `WebGPURenderer`
   * @param options - Configuration; see {@link GizmoOptions} for every field and its default
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
    const controls = this._controls;
    this.dispose();

    this.options = options;
    this._options = optionsFallback(options);
    this.up.set(0, 0, 0)[this._options.up] = 1;
    this._frame = orbitFrame(this._options.up);

    this._camera = this._options.isSphere
      ? new OrthographicCamera(-1.8, 1.8, 1.8, -1.8, 5, 10)
      : new PerspectiveCamera(26, 1, 5, 10);

    this._camera.position.set(0, 0, 7);

    const [axes, background, lines] = axesObjects(this._options, this.renderer);

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

    if (controls) this.attachControls(controls);

    this.update();

    return this;
  }

  /**
   * Keeps a gizmo built without an explicit `up` option on the process-wide
   * `Object3D.DEFAULT_UP`: when that global moves to another axis, the gizmo
   * regenerates through {@link set} so faces, drags and clicks follow it.
   *
   * @private
   * @returns Whether the gizmo was regenerated
   */
  private _syncDefaultUp(): boolean {
    if (this.options.up !== undefined) return false;
    if (upAxisFromVector(Object3D.DEFAULT_UP) === this._options.up) return false;

    this.set(this.options);
    return true;
  }

  /**
   * Renders the gizmo to the screen.
   * This method handles viewport and scissor management to ensure the gizmo
   * renders correctly without affecting the main scene rendering.
   *
   * @returns The gizmo instance for method chaining
   */
  render() {
    this._syncDefaultUp();
    if (this.animating) this._animate();

    renderInRect(
      this.renderer,
      this._scene,
      this._camera,
      this._viewport,
      this._originalViewport,
      this._originalScissor
    );

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
    viewportRect(this.renderer, this._domRect, this._viewport);
    saveViewport(this.renderer, this._originalViewport, this._originalScissor);

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
    if (this._syncDefaultUp()) return this;
    if (controls && this._controls) this._controls.update();
    return this.domUpdate().cameraUpdate();
  }

  /**
   * Turns the view to look at {@link target} from `direction`, keeping the camera's
   * current distance. Fires `start`, a `change` per frame and `end`, like a click on
   * the gizmo; a call during a turn retargets it without another `start`.
   *
   * @param direction - From the target toward the camera; need not be normalised.
   *   A direction along the up axis is entered from the Front face's side.
   * @param animate - Whether to turn over time; defaults to {@link animated}
   * @returns The gizmo instance for method chaining
   */
  lookFrom(direction: Vector3, animate: boolean = this.animated) {
    if (!this.animating) this.dispatchEvent({ type: "start" });
    this._turnTo(direction, animate);
    if (!animate) this._animate();
    return this;
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
    // End a press in progress first, while attached controls still hear the `end`.
    if (this._stopPointer) {
      this._stopPointer();
      this._stopPointer = undefined;
      this._dragging = false;
      this.dispatchEvent({ type: "end" });
    }

    this.detachControls();

    // `remove` splices `children`; iterate a copy so no child is skipped.
    for (const child of [...this.children]) {
      this.remove(child);
      const ud = child.userData as Partial<GizmoAxisObjectUserData>;

      if (ud.idleMaterial && ud.hoverMaterial) {
        ud.idleMaterial.map?.dispose();
        ud.idleMaterial.dispose();

        if (ud.hoverMaterial !== ud.idleMaterial) {
          ud.hoverMaterial.map?.dispose();
          ud.hoverMaterial.dispose();
        }
      } else {
        const meshlike = child as Mesh & {
          material?: MeshBasicMaterial | MeshBasicMaterial[] | unknown;
          geometry?: { dispose: () => void };
        };

        const { material } = meshlike;
        if (Array.isArray(material)) {
          for (const mat of material) {
            const m = mat as MeshBasicMaterial;
            m.map?.dispose();
            m.dispose();
          }
        } else if (material && typeof material === "object" && "dispose" in material) {
          const mb = material as MeshBasicMaterial;
          mb.map?.dispose();
          mb.dispose();
        }
      }

      const meshlike = child as Mesh & { geometry?: { dispose: () => void } };
      meshlike.geometry?.dispose();
    }

    this._domElement?.remove();
  }

  /** Turns the gizmo to mirror the camera and refreshes the sphere's depth fade. */
  private _updateOrientation() {
    this.quaternion.copy(this.camera.quaternion).invert();
    this.updateMatrixWorld();

    updateAxis(this._options, this._intersections, this.camera);
  }

  /** Writes `pose` to the camera at its current distance from the target, and reports the change. */
  private _writePose(pose: OrbitPose) {
    writePose(this.camera, pose, this._frame, this.target, this.camera.position.distanceTo(this.target));
    this._updateOrientation();
    this.dispatchEvent({ type: "change", ...objectIdentity(null) });
  }

  /** Starts a turn from the camera's current pose toward `direction`. */
  private _turnTo(direction: Vector3, animate: boolean) {
    const from = readPose(this.camera, this._frame, this.target);
    // An infinite speed makes the turn take no time.
    this._flight = orbitTransition(from, targetPose(direction, this._frame), animate ? this.speed : Infinity);
    this._flightStart = null;
    this.animating = true;
  }

  /** Advances the turn by one frame; ends it, and the interaction, on its last frame. */
  private _animate() {
    if (this._controls) this._controls.enabled = false;

    const nowSeconds = performance.now() / 1000;
    this._flightStart ??= nowSeconds;

    const finished = sampleTransition(this._flight!, nowSeconds - this._flightStart, _pose);
    this._writePose(_pose);

    if (!finished) return;

    this._controls?.update();
    this.animating = false;
    this._flight = null;
    this.dispatchEvent({ type: "end" });
  }

  /**
   * Starts a pointer session: a drag orbits the camera, a release without a drag is a click.
   *
   * @private
   * @param e - The pointer event
   */
  private _onPointerDown(e: PointerEvent) {
    if (!this.enabled || this.animating) return;

    e.preventDefault();

    const from = readPose(this.camera, this._frame, this.target);

    this._stopPointer = pointerSession(e, {
      drag: (dx, dy) => {
        this._dragging = true;
        const radiansPerPixel = Math.PI / this._domRect.width;
        _pose.azimuth = from.azimuth - dx * radiansPerPixel;
        _pose.polar = from.polar - dy * radiansPerPixel;
        this._writePose(_pose);
      },
      click: () => {
        this._stopPointer = undefined;
        this._handleClick(e);
      },
      dragEnd: () => {
        this._stopPointer = undefined;

        if (this._focus) {
          axisHover(this._focus, false);
          this._focus = null;
        }

        this._dragging = false;
        this.dispatchEvent({ type: "end" });
      },
    });

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

    const hadFocus = this._focus !== null;
    if (this._focus) {
      axisHover(this._focus, false);
      this._focus = null;
    }

    this._domElement.style.cursor = "";

    if (hadFocus)
      this.dispatchEvent({
        type: "hoverchange",
        object: null,
        ...objectIdentity(null),
      });
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

    if (!intersection) {
      this.dispatchEvent({ type: "end" });
      return;
    }

    this._turnTo(intersection.object.position, this.animated);

    this.dispatchEvent({
      type: "change",
      ...objectIdentity(intersection.object),
    });
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

    this.dispatchEvent({ type: "hoverchange", object, ...objectIdentity(object) });
  }
}
