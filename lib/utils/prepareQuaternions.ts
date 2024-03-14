import { Camera, Object3D, Vector3 } from "three";
import { targetPosition, q1, q2 } from "../ViewportGizmo";

const dummy = new Object3D();

export function prepareQuaternions(
  camera: Camera,
  radius: { value: number },
  focusPoint: Vector3
) {
  targetPosition.multiplyScalar(radius.value).add(focusPoint);

  dummy.position.copy(focusPoint);

  dummy.lookAt(camera.position);
  q1.copy(dummy.quaternion);

  dummy.lookAt(targetPosition);
  q2.copy(dummy.quaternion);
}
