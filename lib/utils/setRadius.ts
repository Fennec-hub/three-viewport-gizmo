import { Camera, Vector3 } from "three";

export function setRadius(
  camera: Camera,
  radius: {
    value: number;
  },
  focusPoint: Vector3
) {
  radius.value = camera.position.distanceTo(focusPoint);
}
