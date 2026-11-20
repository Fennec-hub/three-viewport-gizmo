import {
  EventDispatcher,
  Object3D,
  Quaternion,
  Scene,
  Vector3,
  type OrthographicCamera,
  type PerspectiveCamera,
  type Vector3Like,
  type WebGLRenderer,
} from "three";
import type { WebGPURenderer } from "three/webgpu";

import { assertControls, holdControls, readControlsLimits, refreshCameraUp } from "./controls/contract";
import { ViewportGizmoError } from "./errors";
import { attachPointer, forwardWheel, type PointerInput } from "./interaction/pointerSession";
import { hitTest, sphereDiscs, type HitScene } from "./interaction/hitTest";
import { attachKeyboard, type KeyboardInput } from "./interaction/keyboard";
import { attachNavigation, navigationAnchor, type Navigation } from "./navigation/navigation";
import { classifyChange } from "./options/changes";
import { mergeOptions, resolveOptions, targetEnabled } from "./options/resolve";
import { orbitFrameAbout, type OrbitFrame } from "./orbit/frame";
import type { LabelFrame } from "./orbit/labelFrame";
import { clampPose, hasAzimuthLimits, poseQuaternion, readPose, type OrbitCamera, type OrbitPose } from "./orbit/pose";
import type { TargetEntry } from "./orbit/targets";
import { sample, type Flight, type FlightFrame } from "./orbit/transition";
import { planHome, planTurn, planView, restsOn, snapCardinal, TARGET_TOLERANCE, type TurnContext } from "./orbit/turn";
import { createGizmoElement, resolveContainer, updateGizmoElement, writeGizmoState, type GizmoElementOptions } from "./render/dom";
import { createInternalCamera, setFieldOfView } from "./render/internalCamera";
import { createDepthReset, renderInRect, type DepthReset } from "./render/frame";
import { measureViewport, type MutableViewport } from "./render/rect";
import { warmUp } from "./render/warmUp";
import { buildScene, disposeScene, type GizmoScene, type SceneTarget } from "./scene/build";
import { cubeBox, roundedCubeBox } from "./scene/roundedBox";
import { fadeScene, hoverScene, pointerOverScene, updateScene } from "./scene/update";
import type {
  GizmoAtTarget,
  GizmoCause,
  GizmoControls,
  GizmoHeading,
  GizmoLimits,
  GizmoLookFromOptions,
  GizmoOptions,
  GizmoOutcome,
  GizmoPose,
  GizmoResolvedOptions,
  GizmoSide,
  GizmoTarget,
  GizmoTurn,
  GizmoTurnEnd,
  GizmoView,
  GizmoViewport,
  ViewportGizmoEventMap,
} from "./types";

// Composition only: the class holds state, dispatches events and calls the modules. orbit/ plans every turn, drag and
// at-target test; interaction/ owns the pointer and the hit test; render/ the element, camera and frame; options/
// resolution and change classes; scene/ the meshes; controls/ the controls contract.

/** A flight in progress: a click, key, navigation button or API turn. */
type FlightRun = {
  kind: "flight";
  cause: GizmoCause;
  heading: GizmoHeading;
  flight: Flight;
  /** Seconds; null until the first frame samples it, so the first frame is the start pose. */
  started: number | null;
  resolve: (end: GizmoTurnEnd) => void;
};

/** A drag in progress. `orbit` holds its frame and start pose; `free` (`roll: 'free'`) its last travel. */
type DragRun = {
  kind: "drag";
  cause: "drag";
  /** Radians per CSS pixel: half a turn across the element. */
  rate: number;
  /** Travel at the previous step, for the incremental `'free'` drag. */
  dx: number;
  dy: number;
  orbit: Readonly<{ frame: OrbitFrame; from: Required<OrbitPose>; limits: GizmoLimits; up: Vector3 }> | null;
};

/** A press held on the element: where, the rectangle measured then and the target under it. */
type Press = Readonly<{ rect: DOMRect; pressed: GizmoTarget | null }>;

const REACHED: GizmoOutcome = Object.freeze({ status: "reached" });
const cancelled = (reason: "cancel" | "pointercancel" | "disabled" | "set" | "dispose"): GizmoOutcome => ({
  status: "cancelled",
  reason,
});

const COS_TARGET_TOLERANCE = Math.cos(TARGET_TOLERANCE);
const X = new Vector3(1, 0, 0);
const Y = new Vector3(0, 1, 0);
const SIDES: readonly GizmoSide[] = ["up", "right", "down", "left"];

const _back = /*@__PURE__*/ new Vector3();
const _up = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _turn = /*@__PURE__*/ new Quaternion();
const _pose: Required<OrbitPose> = { azimuth: 0, polar: 0, roll: 0 };
const _frame: FlightFrame = { quaternion: new Quaternion(), up: new Vector3() };

const elementOptions = (o: GizmoResolvedOptions): GizmoElementOptions => ({
  placement: o.placement,
  size: o.size,
  offset: o.offset,
  id: o.id,
  className: o.className,
});

/**
 * The azimuth, in the orbit frame about `w`, of the zero azimuth of `OrbitControls` (and camera-controls) whose up is
 * `w`: they measure from +Z of the space that turns `w` onto +Y, the frame here from the label front (U5).
 */
function controlsAzimuthOffset(w: Readonly<Vector3>, label: LabelFrame): number {
  const { e1, e2 } = orbitFrameAbout(w, label.front);
  const zero = new Vector3(0, 0, 1).applyQuaternion(new Quaternion().setFromUnitVectors(w, Y).invert());
  return Math.atan2(zero.dot(e2), zero.dot(e1));
}

/**
 * A view-orientation controller: a cube or sphere in a corner of the host's canvas that shows the camera's orientation
 * and turns it on a click or a drag. It extends `EventDispatcher`, not `Object3D`: its drawable is {@link root}, drawn
 * by {@link render} with its own camera into its own rectangle.
 *
 * Every turn (click, drag, key, navigation button, {@link lookFrom}, {@link turn}) writes the camera through one pose
 * write: `camera.position` at its current distance from {@link target}, `camera.quaternion` and `camera.up`, then tells
 * the attached controls the up changed. Each one fires `start`, a `change` per frame and a balanced `end`; `invalidate`
 * asks for a frame, so a render-on-demand host renders from it alone.
 */
export class ViewportGizmo extends EventDispatcher<ViewportGizmoEventMap> {
  /** The camera it turns. Reassignable (a host swaps perspective and orthographic). */
  camera: PerspectiveCamera | OrthographicCamera;

  /** The renderer that draws the host scene and the gizmo. */
  readonly renderer: WebGLRenderer | WebGPURenderer;

  /** The gizmo's scene object, drawn with its own camera. Never add it to a host scene: `render()` takes it back. */
  readonly root = new Object3D();

  /** The orbit target. The same vector for life; copied from attached controls, never shared with them (R13). */
  readonly target = new Vector3();

  /** Styling guide revision 3: one element for life, state attributes, host CSS owns the look. */
  readonly domElement: HTMLElement;

  private _options: GizmoResolvedOptions;
  /** The options as merged from the constructor and every `set()`, before resolution. */
  private _raw: GizmoOptions;
  /** The label up's default: `camera.up` at construction (R12). */
  private readonly _defaultUp: Vector3;
  private _scene: GizmoScene;
  private _label: LabelFrame;
  private _targets: readonly GizmoTarget[] = [];
  private _byEntry = new Map<TargetEntry, SceneTarget>();
  private _hit!: HitScene;
  private _camera: PerspectiveCamera | OrthographicCamera;
  private readonly _three = new Scene();
  /** F1's depth-reset quad: a sibling of `root` in the gizmo's scene, owned by the gizmo scene. */
  private _reset!: DepthReset;
  private readonly _viewport: MutableViewport = { x: 0, y: 0, width: 0, height: 0 };
  /** The orbit up `w` (L1, L2): the label up until a roll; mirrored to `camera.up` by every pose write. */
  private readonly _up = new Vector3();
  private _enabled = true;
  private _hovered: GizmoTarget | null = null;
  private _atTarget: GizmoAtTarget | null = null;
  private _active: FlightRun | DragRun | null = null;
  /** A press grabbed the running flight: it is held where it is until the press turns into a click or a drag. */
  private _grabbed = false;
  private _press: Press | null = null;
  /** The mouse or pen over the element, for re-hovering after the view turns under it. Never touch. */
  private _pointer: { x: number; y: number; rect: DOMRect } | null = null;
  private _pointerOver = false;
  private _controls: GizmoControls | null = null;
  /** Restores the controls' `enabled` after an interaction (scope audit P4). */
  private _release: (() => void) | null = null;
  /** Set while the gizmo itself calls `controls.update()`, so their `change` does not come back. */
  private _syncing = false;
  /**
   * The pose the gizmo last wrote, or reported in controlled mode (U4). In controlled mode it stands in for the camera
   * while a turn runs, so a host that applies the pose late, or not at all, never changes a flight or a drag.
   */
  private readonly _written = { quaternion: new Quaternion(), up: new Vector3(), valid: false };
  /** The camera orientation `update()` last saw; a change asks for a frame. */
  private readonly _seen = new Quaternion();
  /** The camera orientation `_sync` last mirrored; NaN after a scene change, so the next sync applies. */
  private readonly _faded = new Quaternion(NaN, NaN, NaN, NaN);
  /** The camera orientation the at-target state was last computed for. */
  private readonly _atSeen = new Quaternion(NaN, NaN, NaN, NaN);
  private readonly _input: PointerInput;
  private readonly _stopWheel: () => void;
  private readonly _keys: KeyboardInput;
  /** The built-in navigation buttons while `navigation.enabled` (OD2); null adds no node. */
  private _nav: Navigation | null = null;
  private _disposed = false;

  /**
   * @param camera - The camera to turn; its `up` at this call is the default label up
   * @param renderer - The renderer drawing the scene; `WebGLRenderer` or `WebGPURenderer`
   * @param options - See {@link GizmoOptions}
   * @throws {ViewportGizmoError} `DOCUMENT_MISSING` without a `document`; `CONTAINER_MISSING`; the option codes of
   * {@link set}
   */
  constructor(
    camera: PerspectiveCamera | OrthographicCamera,
    renderer: WebGLRenderer | WebGPURenderer,
    options: GizmoOptions = {}
  ) {
    super();
    if (typeof document === "undefined") {
      throw new ViewportGizmoError(
        "DOCUMENT_MISSING",
        "ViewportGizmo needs a `document` for its element and pointer input. Construct it in the browser's main thread, not in a worker or a server render."
      );
    }

    this.camera = camera;
    this.renderer = renderer;
    // R12: the label up defaults to `camera.up`, snapped to its nearest signed axis, so a host camera left rolled or
    // tilted (a trackball, an interrupted roll) still builds a gizmo; an explicit `up` must be a signed axis.
    this._defaultUp = camera.up.lengthSq() > 0 ? snapCardinal(camera.up.clone().normalize()) : new Vector3(0, 1, 0);
    this._raw = mergeOptions({}, options);
    this._options = resolveOptions(this._raw, this._resolveContext(null));

    const o = this._options;
    this._scene = buildScene(o);
    this._label = this._scene.frame;
    this._up.copy(this._label.up);
    this._camera = createInternalCamera(o.type === "sphere", o.fieldOfView);
    this._three.add(this.root);
    this._adoptReset();
    this._adoptScene();

    this.domElement = createGizmoElement(elementOptions(o));
    resolveContainer(o.container, renderer.domElement).appendChild(this.domElement);
    this._input = attachPointer(this.domElement, {
      press: ({ event, rect }) => this._onPress(event, rect),
      drag: (dx, dy) => this._onDrag(dx, dy),
      dragEnd: () => this._onDragEnd(),
      click: (_, double) => this._onClick(double),
      cancel: () => this._onCancel(),
      hover: (event, rect) => this._onHover(event, rect),
    });
    this._stopWheel = forwardWheel(this.domElement, renderer.domElement);
    this._keys = attachKeyboard(this.domElement, this, {
      aim: () => {
        if (this._active?.kind !== "flight") return this._current();
        sample(this._active.flight, Infinity, _frame);
        return _frame.quaternion;
      },
      orientation: () => this._current(),
      lookFrom: (view) => this._lookFrom("key", view),
      turn: (turn) => this._turn("key", turn),
    });
    this._navigate();

    this._seen.copy(camera.quaternion);
    this._sync();
    this._refreshAtTarget(true);
    this._writeState();
    measureViewport(renderer, this.domElement, this._viewport);
  }

  // --- Read-only state -------------------------------------------------------------------------------------------

  /** The options as resolved. Changed only through {@link set}. */
  get options(): GizmoResolvedOptions {
    return this._options;
  }

  /** All 26 targets in the label frame, built for every type; a hidden target stays in the list. */
  get targets(): readonly GizmoTarget[] {
    return this._targets;
  }

  /** Display-only when false (U10, `data-disabled`). Setting it false ends hover, any press and any turn. */
  get enabled(): boolean {
    return this._enabled;
  }

  set enabled(value: boolean) {
    if (value === this._enabled) return;
    this._enabled = value;
    if (!value) {
      this._input.release();
      this._press = null;
      if (this._active) this._finish(cancelled("disabled"));
      this._unholdIfIdle();
      this._pointer = null;
      this._setPointerOver(false);
      this._setHover(null);
    }
    this._writeState();
    this._invalidate();
  }

  /** The orbit up: the label up until the view is rolled (L4). */
  get up(): Readonly<Vector3> {
    return this._up;
  }

  /** Whether roll commands work: the resolved `roll` is not `false` (L4). */
  get canRoll(): boolean {
    return this._options.roll !== false;
  }

  /** The target under the mouse or pen, or null. */
  get hovered(): GizmoTarget | null {
    return this._hovered;
  }

  /** Whether a drag on the gizmo is turning the view. */
  get dragging(): boolean {
    return this._active?.kind === "drag";
  }

  /** Whether a flight is running. */
  get animating(): boolean {
    return this._active?.kind === "flight";
  }

  /** Where the current flight is going; null when none runs. */
  get heading(): GizmoHeading | null {
    return this._active?.kind === "flight" ? this._active.heading : null;
  }

  /** The target the view rests on; null while dragging or animating (roll rulings 2 and B). */
  get atTarget(): GizmoAtTarget | null {
    return this._atTarget;
  }

  /** The gizmo's rectangle as {@link render} last measured it. */
  get viewport(): GizmoViewport {
    return this._viewport;
  }

  // --- Commands ---------------------------------------------------------------------------------------------------

  /**
   * Merges `options` into the current options (R8). Cheap changes update in place; structural ones rebuild `root`'s
   * children and cancel a turn in progress (`cancelled`, reason `set`). Nothing changes when it throws.
   *
   * @param options - A partial; an explicit `undefined` returns a key to its default
   * @throws {ViewportGizmoError} `UNKNOWN_OPTION`, `INVALID_OPTION`, `REMOVED_OPTION`, `INVALID_FRAME`,
   * `ROLL_UNSUPPORTED`, `DISPOSED`
   */
  set(options: GizmoOptions): void {
    this._assertLive();
    const merged = mergeOptions(this._raw, options);
    const next = resolveOptions(merged, this._resolveContext(this._controls));
    this._raw = merged;
    this._apply(next);
  }

  /**
   * Turns to a view: a target name, `home` (Top Front Right, upright in the label frame) or a direction from the target
   * toward the camera. A named face or edge entered at a pole follows `poleEntry`.
   *
   * @returns Resolves with the `end` payload; rejects only for a caller mistake (`UNKNOWN_VIEW`, `DISPOSED`)
   */
  lookFrom(view: GizmoView, options: GizmoLookFromOptions = {}): Promise<GizmoTurnEnd> {
    return this._lookFrom("api", view, options);
  }

  private _lookFrom(cause: GizmoCause, view: GizmoView, options: GizmoLookFromOptions = {}): Promise<GizmoTurnEnd> {
    try {
      this._assertLive();
      if (typeof options !== "object" || options === null) {
        throw new ViewportGizmoError(
          "REMOVED_OPTION",
          "`lookFrom(view, animate)` is the 2.x form. Pass `lookFrom(view, { animated })`."
        );
      }
      const direction = view === "home" ? null : this._directionOf(view);
      const context = this._context(options.animated);
      const flight = direction
        ? planView(context, direction, { reset: options.up === "reset" })
        : planHome(context);
      return this._fly(cause, flight);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * A relative turn: toward the face on a side of the screen, or by angles in the orbit frame (U9, L6, ruling B). A
   * roll while {@link canRoll} is false resolves `unavailable` with reason `roll-off`, and fires no event.
   *
   * @returns Resolves with the `end` payload; rejects only for a caller mistake (`INVALID_TURN`, `DISPOSED`)
   */
  turn(turn: GizmoTurn): Promise<GizmoTurnEnd> {
    return this._turn("api", turn);
  }

  private _turn(cause: GizmoCause, turn: GizmoTurn): Promise<GizmoTurnEnd> {
    try {
      this._assertLive();
      assertTurn(turn);
      const flight = planTurn(this._context(turn.animated), turn);
      if (!flight) {
        return Promise.resolve({
          cause,
          pose: this._pose(),
          outcome: { status: "unavailable", reason: "roll-off" },
        });
      }
      return this._fly(cause, flight);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** Stops the flight or drag where it is: `end` with `cancelled`, reason `cancel`. */
  cancel(): void {
    this._assertLive();
    if (this._active?.kind === "drag" || this._grabbed) {
      this._input.release();
      this._press = null;
    }
    if (this._active) this._finish(cancelled("cancel"));
    this._unholdIfIdle();
  }

  /**
   * Connects controls (R13): their `target` is copied in on attach and on each `change`, they are disabled while the
   * gizmo turns the view and restored to their previous `enabled` after, and told after every `camera.up` write.
   *
   * @throws {ViewportGizmoError} `INVALID_OPTION` for controls without the contract's members; `ROLL_UNSUPPORTED` for
   * `roll: true` with controls that cannot take a new up
   */
  attachControls(controls: GizmoControls): void {
    this._assertLive();
    assertControls(controls);
    const next = resolveOptions(this._raw, this._resolveContext(controls));
    this.detachControls();
    this._controls = controls;
    this.target.copy(controls.target);
    controls.addEventListener("change", this._onControlsChange);
    if (this._active || this._press) this._hold();
    this._apply(next);
  }

  /** Disconnects the controls and restores their previous `enabled` (R13). Safe to call with none attached. */
  detachControls(): void {
    this._assertLive();
    const controls = this._controls;
    if (!controls) return;
    this._release?.();
    this._release = null;
    controls.removeEventListener("change", this._onControlsChange);
    this._controls = null;
    this._apply(resolveOptions(this._raw, this._resolveContext(null)));
  }

  /**
   * Syncs from the camera: the gizmo's orientation, the at-target state and hover under a still pointer; asks for a
   * frame when the camera turned. Steps no controls, so it is safe inside a controls `change` (R6, T #22).
   */
  update(): void {
    this._assertLive();
    const turned = !this._seen.equals(this.camera.quaternion);
    if (turned) this._seen.copy(this.camera.quaternion);
    this._sync();
    if (!this._active) this._refreshAtTarget(false);
    this._rehover();
    if (turned) this._invalidate();
  }

  /** Advances the flight and draws into the gizmo's rectangle over the host's frame (R6). */
  render(): void {
    this._assertLive();
    const active = this._active;
    if (active?.kind === "flight" && !this._grabbed) this._step(active);
    this._sync();
    // ponytail: a host that parented `root` loses it here; without this its gizmo would draw nothing (probe P3).
    if (this.root.parent !== this._three) this._three.add(this.root);
    measureViewport(this.renderer, this.domElement, this._viewport);
    this._nav?.place();
    renderInRect(this.renderer, this._three, this._camera, this._viewport, this._reset);
  }

  /** Compiles the gizmo's own scene and camera for the renderer's current render target (P6). */
  compile(): Promise<void> {
    try {
      this._assertLive();
    } catch (error) {
      return Promise.reject(error);
    }
    if (this.root.parent !== this._three) this._three.add(this.root);
    return warmUp(this.renderer, this._three, this._camera);
  }

  /**
   * Ends a turn or drag in progress (`cancelled`, reason `dispose`) while the controls still hear it, detaches them,
   * removes the element and its listeners, and frees exactly what the gizmo created. Later calls throw `DISPOSED`.
   */
  dispose(): void {
    if (this._disposed) return;
    this._input.release();
    this._press = null;
    if (this._active) this._finish(cancelled("dispose"));
    this.detachControls();
    this._input.detach();
    this._stopWheel();
    this._keys.detach();
    this._nav?.detach();
    this._reset.removeFromParent();
    disposeScene(this._scene);
    this._three.remove(this.root);
    this.domElement.remove();
    this._disposed = true;
  }

  // --- Pointer ----------------------------------------------------------------------------------------------------

  private _onPress(event: PointerEvent, rect: DOMRect): boolean {
    if (!this._enabled) return false;
    const pressed = this._hitAt(event.clientX, event.clientY, rect);
    // A press grabs a running flight (R5): it holds where it is until the press turns out a click or a drag.
    if (this._active?.kind === "flight") this._grabbed = true;
    this._press = { rect, pressed };
    if (event.pointerType !== "touch") this._pointer = { x: event.clientX, y: event.clientY, rect };
    // The host's controls sit out the whole press, so a second finger on the canvas cannot turn the view meanwhile.
    this._hold();
    this.dispatchEvent({ type: "press", pressed });
    return true;
  }

  private _onDrag(dx: number, dy: number): void {
    const press = this._press;
    if (!press || !this._options.drag) return;
    let run = this._active?.kind === "drag" ? this._active : null;

    if (!run) {
      if (this._grabbed) this._finish({ status: "interrupted", by: "drag" }, true);
      this._setHover(null);
      const w = this._gestureUp();
      let orbit: DragRun["orbit"] = null;
      if (this._options.roll !== "free") {
        const frame = orbitFrameAbout(w, this._label.front);
        orbit = { frame, from: readPose(this._view(), frame, this.target), limits: this._limits(w), up: w.clone() };
      }
      run = { kind: "drag", cause: "drag", rate: Math.PI / press.rect.width, dx: 0, dy: 0, orbit };
      this._active = run;
      this._begin("drag", null);
    }

    const { rate, orbit } = run;
    if (orbit) {
      // Orbit about the gesture's up from where the drag started; a roll residual the start had stays (no snap).
      _pose.azimuth = orbit.from.azimuth - dx * rate;
      _pose.polar = orbit.from.polar - dy * rate;
      _pose.roll = Math.abs(orbit.from.roll) < 1e-6 ? 0 : orbit.from.roll;
      poseQuaternion(clampPose(_pose, orbit.limits), orbit.frame, _quaternion);
      this._write(_quaternion, _pose.roll ? _up.set(0, 1, 0).applyQuaternion(_quaternion) : orbit.up);
    } else {
      // `roll: 'free'` (free orbit): a trackball turn by this step's travel about the screen's axes; the
      // orbit up follows the screen up.
      _quaternion
        .copy(this._current())
        .multiply(_turn.setFromAxisAngle(Y, -(dx - run.dx) * rate))
        .multiply(_turn.setFromAxisAngle(X, -(dy - run.dy) * rate));
      run.dx = dx;
      run.dy = dy;
      this._write(_quaternion, _up.set(0, 1, 0).applyQuaternion(_quaternion));
      this._up.copy(_up);
    }

    this.dispatchEvent({ type: "change", cause: "drag", heading: null, pose: this._pose() });
    this._invalidate();
  }

  private _onDragEnd(): void {
    this._press = null;
    if (this._active?.kind === "drag") this._finish(REACHED);
    else if (this._grabbed) this._finish({ status: "interrupted", by: "drag" });
    this._unholdIfIdle();
  }

  private _onClick(double: boolean): void {
    const press = this._press;
    this._press = null;
    if (!press) return;
    const grabbed = this._grabbed && this._active?.kind === "flight" ? this._active : null;
    const o = this._options;
    let flight: Flight | null = null;

    if (double && (o.roll !== false || grabbed)) {
      // Roll ruling 3: a double-click returns to upright on the view the first click turned to, never to the opposite
      // and never back. With roll off there is no up to reset: the second click keeps the first one's turn.
      const direction =
        grabbed?.heading.pose.direction ?? this._atTarget?.target.direction ?? this._pose().direction;
      flight = planView(this._context(undefined), direction, { reset: o.roll !== false });
    } else if (press.pressed && targetEnabled(o, press.pressed)) {
      flight = planView(this._context(undefined), press.pressed.direction, {
        oppositeOnRepeat: o.oppositeOnRepeat && !double,
      });
    }

    if (flight) void this._fly("click", flight);
    else if (grabbed) this._finish({ status: "interrupted", by: "click" });
    this._unholdIfIdle();
  }

  private _onCancel(): void {
    this._press = null;
    if (this._active?.kind === "drag" || this._grabbed) this._finish(cancelled("pointercancel"));
    this._unholdIfIdle();
  }

  private _onHover(event: PointerEvent | null, rect: DOMRect): void {
    if (!this._enabled) return;
    if (!event) {
      this._pointer = null;
      this._setPointerOver(false);
      this._setHover(null);
      return;
    }
    this._pointer = { x: event.clientX, y: event.clientY, rect };
    this._setPointerOver(true);
    this._setHover(this._hitAt(event.clientX, event.clientY, rect));
  }

  private readonly _onControlsChange = (): void => {
    if (this._syncing || !this._controls) return;
    this.target.copy(this._controls.target);
    this.update();
  };

  // --- Turns --------------------------------------------------------------------------------------------------------

  /** Starts a flight, ending one in progress as `interrupted` by `cause`. A turn that takes no time ends in the call. */
  private _fly(cause: GizmoCause, flight: Flight): Promise<GizmoTurnEnd> {
    const heading = this._headingOf(flight);
    if (this._active?.kind === "drag") {
      this._input.release();
      this._press = null;
    }
    if (this._active) this._finish({ status: "interrupted", by: cause }, true);

    let resolve!: (end: GizmoTurnEnd) => void;
    const promise = new Promise<GizmoTurnEnd>((r) => (resolve = r));
    const run: FlightRun = { kind: "flight", cause, heading, flight, started: null, resolve };
    this._active = run;
    this._begin(cause, heading);
    if (flight.duration === 0) this._step(run);
    else this._invalidate();
    return promise;
  }

  /** One frame of the flight at `performance.now()`; ends it on its last frame. */
  private _step(run: FlightRun): void {
    const now = performance.now() / 1000;
    run.started ??= now;
    const finished = sample(run.flight, now - run.started, _frame);
    this._write(_frame.quaternion, _frame.up);
    this.dispatchEvent({ type: "change", cause: run.cause, heading: run.heading, pose: this._pose() });
    if (!finished) {
      this._invalidate();
      return;
    }
    this._up.copy(run.flight.up);
    this._finish(REACHED);
  }

  /** Disables the attached controls, once, until {@link _unholdIfIdle} or the end of the turn. */
  private _hold(): void {
    if (this._controls && !this._release) this._release = holdControls(this._controls);
  }

  /** Gives the controls their `enabled` back when no press is held and no turn runs. */
  private _unholdIfIdle(): void {
    if (this._press || this._active || !this._release) return;
    this._release();
    this._release = null;
  }

  private _begin(cause: GizmoCause, heading: GizmoHeading | null): void {
    this._hold();
    this._setAtTarget(null);
    this._writeState();
    this.dispatchEvent({ type: "start", cause, heading });
  }

  /**
   * Ends the turn or drag in progress with `outcome`. Unless another takes over at once (`handover`), the controls
   * sync from the camera and get their `enabled` back, and the at-target state is recomputed.
   */
  private _finish(outcome: GizmoOutcome, handover = false): void {
    const run = this._active;
    if (!run) return;
    const pose = this._pose();
    this._active = null;
    // A handover continues from the reported pose; at rest the camera is the truth again.
    if (!handover) this._written.valid = false;
    this._grabbed = false;

    const controls = this._controls;
    // Controlled mode wrote no camera, so the controls have nothing to sync from: the host syncs them (U4).
    if (!handover && controls && !this._options.controlled) {
      // camera-controls keeps its own pose: hand it the one the gizmo wrote before it is enabled again.
      this._syncing = true;
      try {
        controls.update();
      } finally {
        this._syncing = false;
      }
      if (!this._press) {
        this._release?.();
        this._release = null;
      }
    }
    if (!handover && controls && this._options.controlled && !this._press) {
      this._release?.();
      this._release = null;
    }
    if (!handover) this._refreshAtTarget(true);
    this._writeState();

    const end: GizmoTurnEnd = { cause: run.cause, pose, outcome };
    this.dispatchEvent({ type: "end", ...end });
    this._keys.ended(end);
    if (run.kind === "flight") run.resolve(end);
    if (!handover) this._invalidate();
  }

  /**
   * The one pose write (I7): orientation, position at the camera's current distance from the target, and `camera.up`
   * (L2); the controls hear about an up change.
   */
  private _write(quaternion: Readonly<Quaternion>, up: Readonly<Vector3>): void {
    this._written.quaternion.copy(quaternion);
    this._written.up.copy(up);
    this._written.valid = true;
    if (this._options.controlled) return; // U4: the pose goes out in `change`; the host writes the camera
    const { camera, target } = this;
    const distance = camera.position.distanceTo(target);
    camera.quaternion.copy(quaternion);
    camera.position.copy(target).addScaledVector(_back.set(0, 0, 1).applyQuaternion(quaternion), distance);
    if (!camera.up.equals(up)) {
      camera.up.copy(up);
      if (this._controls) refreshCameraUp(this._controls);
    }
    this._seen.copy(quaternion);
    this._sync();
    this._rehover();
  }

  /** What a plan starts from (O2). With `roll` on, the orbit up is read from `camera.up` at the gesture's start (L2). */
  private _context(animated: boolean | undefined): TurnContext {
    const o = this._options;
    const w = this._gestureUp();
    return {
      camera: this._view(),
      target: this.target,
      up: w,
      label: this._label,
      roll: o.roll,
      poleEntry: o.poleEntry,
      limits: this._limits(roll(o) ? snapCardinal(w, this._label.up) : this._label.up),
      speed: (animated ?? o.animated) ? o.speed : Infinity,
    };
  }

  private _gestureUp(): Vector3 {
    const up = this._reported() ? this._written.up : this.camera.up;
    if (roll(this._options) && up.lengthSq() > 0) this._up.copy(up).normalize();
    else if (!roll(this._options)) this._up.copy(this._label.up);
    return this._up;
  }

  /**
   * The limits in the orbit frame about `w`: the `limits` option, narrowed by the attached controls' polar limits, and
   * the controls' azimuth limits turned into this frame when the option sets none (U5).
   *
   * ponytail: the controls' azimuth zero is taken about `w`, which is exact while their up is `w` (roll off, or after
   * the up refresh); a frame about another up gets a turned window.
   */
  private _limits(w: Readonly<Vector3>): GizmoLimits {
    const own = this._options.limits;
    if (!this._controls) return own;
    const theirs = readControlsLimits(this._controls);
    const offset = hasAzimuthLimits(theirs) ? controlsAzimuthOffset(w, this._label) : 0;
    const azimuth = hasAzimuthLimits(own)
      ? own
      : hasAzimuthLimits(theirs)
        ? { minAzimuthAngle: theirs.minAzimuthAngle! + offset, maxAzimuthAngle: theirs.maxAzimuthAngle! + offset }
        : own;
    return {
      minPolarAngle: Math.max(own.minPolarAngle, theirs.minPolarAngle ?? 0),
      maxPolarAngle: Math.min(own.maxPolarAngle, theirs.maxPolarAngle ?? Math.PI),
      minAzimuthAngle: azimuth.minAzimuthAngle,
      maxAzimuthAngle: azimuth.maxAzimuthAngle,
    };
  }

  /** Where `flight` ends: its pose, and the target it rests on there. */
  private _headingOf(flight: Flight): GizmoHeading {
    sample(flight, Infinity, _frame);
    const quaternion = _frame.quaternion;
    const direction = new Vector3(0, 0, 1).applyQuaternion(quaternion);
    return { target: this._restingTarget(quaternion, direction), pose: { direction, up: _frame.up.clone() } };
  }

  private _directionOf(view: GizmoView): Vector3 {
    if (typeof view === "string") {
      const target = this._targets.find((candidate) => candidate.name === view);
      if (target) return target.direction.clone();
      throw new ViewportGizmoError(
        "UNKNOWN_VIEW",
        `\`${view}\` is not a view. Pass \`home\`, a target name such as \`top-front-right\`, or a direction vector.`
      );
    }
    const { x, y, z } = (view ?? {}) as Partial<Vector3Like>;
    const direction = new Vector3(x, y, z);
    if (![x, y, z].every(Number.isFinite) || direction.lengthSq() === 0) {
      throw new ViewportGizmoError(
        "UNKNOWN_VIEW",
        "`lookFrom` needs a non-zero direction with finite x, y and z, a target name or `home`."
      );
    }
    return direction.normalize();
  }

  // --- State --------------------------------------------------------------------------------------------------------

  /** The target the view with orientation `quaternion` rests on, if any; `direction` is its line of sight. */
  private _restingTarget(quaternion: Readonly<Quaternion>, direction: Readonly<Vector3>): GizmoTarget | null {
    for (const target of this._targets) {
      if (direction.dot(target.direction) < COS_TARGET_TOLERANCE) continue;
      return restsOn(quaternion, target.direction) ? target : null;
    }
    return null;
  }

  /**
   * Observes the pose: recomputes the at-target state and the accessible name when the camera turned since the last
   * time, or always when `force`. Every pose the gizmo did not turn to itself (a host's controls, a host-applied or
   * persisted pose, controlled mode, `set()`) reaches the name here, through {@link _setAtTarget}.
   */
  private _refreshAtTarget(force: boolean): void {
    const { quaternion } = this.camera;
    if (!force && this._atSeen.equals(quaternion)) return;
    this._atSeen.copy(quaternion);
    const target = this._restingTarget(quaternion, _back.set(0, 0, 1).applyQuaternion(quaternion));
    if (!target) return this._setAtTarget(null);
    let sides: Record<GizmoSide, GizmoTarget> | null = null;
    if (target.kind === "face") {
      const right = new Vector3(1, 0, 0).applyQuaternion(quaternion);
      const up = new Vector3(0, 1, 0).applyQuaternion(quaternion);
      const face = (side: Vector3) => {
        const direction = snapCardinal(side);
        return this._targets.find((t) => t.kind === "face" && t.direction.distanceTo(direction) < 1e-6)!;
      };
      sides = { up: face(up), right: face(right), down: face(up.negate()), left: face(right.negate()) };
    }
    this._setAtTarget({ target, sides });
  }

  /**
   * Sets the at-target state and names the view. The name is derived on every call, not only when the target changes:
   * off a target it names the nearest one, and at a target it carries the roll, so a turn that keeps the target (none
   * to none, or a roll at an edge) still renames it. It is rewritten only when it changed.
   */
  private _setAtTarget(next: GizmoAtTarget | null): void {
    const key = (at: GizmoAtTarget | null) =>
      at ? [at.target.name, ...SIDES.map((side) => at.sides?.[side].name)].join() : "";
    const changed = key(next) !== key(this._atTarget);
    // Kept even when unchanged: after `set()` the same view is a new target object with the new options' label.
    this._atTarget = next;
    this._keys.name(next?.target ?? null);
    if (!changed) return;
    this._nav?.refresh();
    this.dispatchEvent({ type: "attargetchange", atTarget: next });
  }

  private _hitAt(clientX: number, clientY: number, rect: DOMRect): GizmoTarget | null {
    this._sync();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = 1 - ((clientY - rect.top) / rect.height) * 2;
    const entry = hitTest(x, y, this._hit);
    return entry ? this._byEntry.get(entry)!.target : null;
  }

  /** Re-hovers under a still mouse after the view turned (G0 rule). */
  private _rehover(): void {
    const pointer = this._pointer;
    if (!pointer || this._press || this._active?.kind === "drag") return;
    this._setHover(this._hitAt(pointer.x, pointer.y, pointer.rect));
  }

  private _setHover(target: GizmoTarget | null): void {
    if ((this._hovered?.name ?? null) === (target?.name ?? null)) return;
    this._hovered = target;
    hoverScene(this._scene, target?.name ?? null);
    this._writeState();
    this.dispatchEvent({ type: "hoverchange", hovered: target });
    this._invalidate();
  }

  private _setPointerOver(over: boolean): void {
    if (over === this._pointerOver) return;
    this._pointerOver = over;
    pointerOverScene(this._scene, over);
    this._invalidate();
  }

  private _writeState(): void {
    writeGizmoState(this.domElement, {
      hovered: this._hovered?.kind ?? null,
      dragging: this._active?.kind === "drag",
      disabled: !this._enabled,
    });
    this._keys.refresh();
    this._nav?.refresh();
  }

  /** Adds or removes the navigation buttons to match `navigation.enabled`, and restyles them from the options. */
  private _navigate(): void {
    const on = this._options.navigation.enabled;
    if (on && !this._nav) {
      this._nav = attachNavigation(this.domElement, this, {
        lookFrom: (view) => this._lookFrom("navigation", view),
        turn: (turn) => this._turn("navigation", turn),
        // The measured height once rendered (CSS may resize the element), else the size option.
        anchor: () => navigationAnchor(this._camera, this._scene.group.scale.x, this._viewport.height || this._options.size),
      });
    } else if (!on && this._nav) {
      this._nav.detach();
      this._nav = null;
    }
    this._nav?.restyle();
  }

  /** Turns the gizmo to mirror the camera, and the sphere's depth fade when the camera turned. Allocates nothing. */
  private _sync(): void {
    const { quaternion } = this.camera;
    if (this._faded.equals(quaternion)) return;
    this._faded.copy(quaternion);
    this.root.quaternion.copy(quaternion).invert();
    fadeScene(this._scene, quaternion);
  }

  /** Whether the reported pose stands in for the camera: controlled mode, during a turn or a handover (U4). */
  private _reported(): boolean {
    return this._options.controlled && this._written.valid;
  }

  /** The orientation a turn continues from. */
  private _current(): Readonly<Quaternion> {
    return this._reported() ? this._written.quaternion : this.camera.quaternion;
  }

  /** The camera as a plan reads it: the reported pose at the camera's distance in controlled mode. */
  private _view(): OrbitCamera {
    if (!this._reported()) return this.camera;
    const distance = this.camera.position.distanceTo(this.target);
    const quaternion = this._written.quaternion.clone();
    return { quaternion, position: _back.set(0, 0, 1).applyQuaternion(quaternion).multiplyScalar(distance).add(this.target).clone() };
  }

  private _pose(): GizmoPose {
    return {
      direction: new Vector3(0, 0, 1).applyQuaternion(this._current()),
      up: (this._reported() ? this._written.up : this.camera.up).clone(),
    };
  }

  private _invalidate(): void {
    this.dispatchEvent({ type: "invalidate" });
  }

  // --- Options and scene --------------------------------------------------------------------------------------------

  private _resolveContext(controls: GizmoControls | null) {
    return { up: this._defaultUp, controls };
  }

  /** Applies resolved options by their change class (N1): in place when cheap, a rebuild when structural. */
  private _apply(next: GizmoResolvedOptions): void {
    const previous = this._options;
    const change = classifyChange(previous, next);
    this._options = next;
    if (!change) return;

    if (change === "structural") {
      if (this._active) this._finish(cancelled("set"));
      this._input.release();
      this._press = null;
      this._setHover(null);
      this._reset.removeFromParent();
      disposeScene(this._scene);
      this._scene = buildScene(next);
      this._adoptReset();
      this._camera = createInternalCamera(next.type === "sphere", next.fieldOfView);
      const label = this._scene.frame;
      if (!label.up.equals(this._label.up) || !label.front.equals(this._label.front)) this._up.copy(label.up);
      this._label = label;
      this._pointerOver = false;
    } else {
      updateScene(this._scene, next);
      setFieldOfView(this._camera, next.fieldOfView);
    }
    this._adoptScene();
    this._faded.set(NaN, NaN, NaN, NaN);
    // Every change rebuilds the target list (labels come from the options), so the at-target state and the name are
    // derived again even when the camera did not turn.
    this._atSeen.set(NaN, NaN, NaN, NaN);

    updateGizmoElement(this.domElement, elementOptions(next), elementOptions(previous));
    if (next.container !== previous.container) {
      resolveContainer(next.container, this.renderer.domElement).appendChild(this.domElement);
    }
    this._navigate();
    this._sync();
    // Mid-turn the at-target state is null and is not observed until the turn ends, so name the view from the rebuilt
    // targets here; otherwise observe the pose as usual.
    if (this._active) this._keys.name(null);
    else this._refreshAtTarget(false);
    this._rehover();
    this._writeState();
    this._invalidate();
  }

  /** Creates the depth reset for the current scene, freed with it, and puts it beside `root` (F1). */
  private _adoptReset(): void {
    this._reset = createDepthReset(this._scene.owned);
    this._three.add(this._reset);
  }

  /** Puts the scene under `root` and builds what reads it: the target list, the hit scene and the redraw signal. */
  private _adoptScene(): void {
    const scene = this._scene;
    const o = this._options;
    if (scene.group.parent !== this.root) this.root.add(scene.group);
    this._targets = scene.targets.map((t) => t.target);
    this._byEntry = new Map(scene.targets.map((t) => [t.entry, t]));
    // S2/S6: a late web font redraws the labels and the triad's letters in place; the host needs a frame.
    scene.labels.onRedraw = () => {
      scene.parts.triad.update(scene.options, scene.pointerOver);
      this._invalidate();
    };

    const entries = scene.targets.map((t) => t.entry);
    const shape =
      o.type === "sphere"
        ? sphereDiscs(entries, (entry) => {
            const { end } = this._byEntry.get(entry)!;
            return (end ? o[end] : entry.kind === "edge" ? o.edges : o.corners).scale / 2;
          })
        : // The hit box only: `corners.hitSize` and `edges.hitSize` change it without rebuilding a mesh.
          o.type === "cube"
          ? cubeBox({ corners: o.corners.hitSize, edges: o.edges.hitSize })
          : roundedCubeBox(o.radius, { corners: o.corners.hitSize, edges: o.edges.hitSize });
    const group = scene.group;
    this._hit = {
      orientation: this.root.quaternion,
      camera: this._camera,
      shape,
      targets: entries,
      enabled: (entry) => targetEnabled(this._options, entry),
      get scale() {
        return group.scale.x;
      },
    };
  }

  private _assertLive(): void {
    if (this._disposed) {
      throw new ViewportGizmoError("DISPOSED", "This ViewportGizmo was disposed. Construct a new one.");
    }
  }
}

/** Whether the orbit up follows `camera.up`: `roll` on or `'free'`. */
const roll = (o: GizmoResolvedOptions) => o.roll !== false;

/** Checks a `turn` request from JavaScript. */
function assertTurn(turn: GizmoTurn): void {
  const t = (turn ?? {}) as Partial<Record<"toward" | "azimuth" | "polar" | "roll", unknown>>;
  const angles = (["azimuth", "polar", "roll"] as const).filter((key) => t[key] !== undefined);
  const ok =
    typeof turn === "object" &&
    turn !== null &&
    (t.toward !== undefined
      ? SIDES.includes(t.toward as GizmoSide) && angles.length === 0
      : angles.length > 0 && angles.every((key) => typeof t[key] === "number" && Number.isFinite(t[key])));
  if (!ok) {
    throw new ViewportGizmoError(
      "INVALID_TURN",
      "`turn` takes `{ toward: 'up' | 'right' | 'down' | 'left' }` or finite radians in `azimuth`, `polar` or `roll`, not both."
    );
  }
}

/** 2.x members a JavaScript caller may still reach: each throws `REMOVED_MEMBER` naming its 3.0 replacement (R6). */
const REMOVED_MEMBERS: Readonly<Record<string, string>> = {
  domUpdate: "`domUpdate()` is gone: `render()` measures the gizmo's rectangle itself.",
  cameraUpdate: "`cameraUpdate()` is gone: call `update()` after moving the camera without attached controls.",
  placement: "`placement` is an option now: call `set({ placement })` and read `options.placement`.",
  animated: "`animated` is an option now: call `set({ animated })` and read `options.animated`.",
  speed: "`speed` is an option now: call `set({ speed })` and read `options.speed`.",
};

for (const [name, message] of Object.entries(REMOVED_MEMBERS)) {
  const removed = () => {
    throw new ViewportGizmoError("REMOVED_MEMBER", message);
  };
  Object.defineProperty(ViewportGizmo.prototype, name, { get: removed, set: removed, configurable: true });
}
