import { OrthographicCamera, Vector2 } from "three";
import { raycaster } from "../ViewportGizmo";

const mouse = new Vector2();

export function updatePointer(
  e: PointerEvent,
  domRect: DOMRect,
  orthoCamera: OrthographicCamera
) {
  mouse.x = ((e.clientX - domRect.left) / domRect.width) * 2 - 1;
  mouse.y = -((e.clientY - domRect.top) / domRect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, orthoCamera);
}
