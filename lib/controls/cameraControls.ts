import { Vector3 } from "three";
import type CameraControls from "camera-controls";
import type { GizmoControls } from "../types";

const EPSILON_SQ = 1e-18;
const _position = new Vector3();
const _target = new Vector3();

/**
 * Adapts [camera-controls](https://github.com/yomotsu/camera-controls) to {@link GizmoControls} for
 * `attachControls` (U11). camera-controls keeps its own orbit state and writes the camera from it on every
 * `update(delta)`, so the adapter hands it the camera pose the gizmo wrote, and its `target` is a copy the adapter
 * refreshes on each camera-controls `update` event. Its `updateCameraUp()` makes `roll` default on (ruling A).
 *
 * Keep calling `controls.update(delta)` in the render loop, but skip it while `controls.enabled` is `false`: the
 * gizmo disables the controls while it turns the camera.
 *
 * @param controls - A camera-controls instance, after `CameraControls.install({ THREE })`
 * @returns The controls in the shape `attachControls` takes
 */
export const cameraControls = (controls: CameraControls): GizmoControls => {
  const target = controls.getTarget(new Vector3(), false);
  const listeners = new Map<() => void, () => void>();
  // While the adapter pushes the gizmo's pose, camera-controls' own `update` event must not reach the gizmo again.
  let syncing = false;

  /** Hands camera-controls the camera's pose and `target`, applies it now, and reads the target back. */
  const sync = (force: boolean) => {
    const { camera } = controls;
    const moved =
      force ||
      controls.getPosition(_position, false).distanceToSquared(camera.position) > EPSILON_SQ ||
      controls.getTarget(_target, false).distanceToSquared(target) > EPSILON_SQ;
    syncing = true;
    try {
      // ponytail: a pushed pose drops a focal offset; read `getFocalOffset` here if a host needs both.
      if (moved) void controls.setLookAt(...camera.position.toArray(), ...target.toArray(), false);
      return controls.update(0);
    } finally {
      syncing = false;
      controls.getTarget(target, false);
    }
  };

  return {
    target,
    get enabled() {
      return controls.enabled;
    },
    set enabled(value) {
      controls.enabled = value;
    },
    update: () => sync(false),
    updateCameraUp: () => {
      controls.updateCameraUp();
      sync(true);
    },
    addEventListener: (_type, listener) => {
      if (listeners.has(listener)) return;
      const onUpdate = () => {
        controls.getTarget(target, false);
        if (!syncing) listener();
      };
      listeners.set(listener, onUpdate);
      controls.addEventListener("update", onUpdate);
    },
    removeEventListener: (_type, listener) => {
      const onUpdate = listeners.get(listener);
      if (!onUpdate) return;
      listeners.delete(listener);
      controls.removeEventListener("update", onUpdate);
    },
    get minPolarAngle() {
      return controls.minPolarAngle;
    },
    get maxPolarAngle() {
      return controls.maxPolarAngle;
    },
    get minAzimuthAngle() {
      return controls.minAzimuthAngle;
    },
    get maxAzimuthAngle() {
      return controls.maxAzimuthAngle;
    },
  };
};
