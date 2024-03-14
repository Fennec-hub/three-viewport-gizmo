import { Euler, OrthographicCamera, PerspectiveCamera, Vector3 } from "three";
import { GizmoOrientation } from "../types";
import { targetPosition, targetQuaternion } from "../ViewportGizmo";
import { prepareQuaternions } from "./prepareQuaternions";
import { setRadius } from "./setRadius";

export function prepareAnimationData(
  camera: OrthographicCamera | PerspectiveCamera,
  focusPoint: Vector3,
  axis: GizmoOrientation,
  radius: { value: number }
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

  setRadius(camera, radius, focusPoint);
  prepareQuaternions(camera, radius, focusPoint);
}
