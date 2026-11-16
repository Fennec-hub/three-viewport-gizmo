import { ViewportGizmo, type GizmoSide } from "@taulabs/three-viewport-gizmo";
import { camera, controls, renderer, viewport } from "./host"; // @hide

// The built-in buttons stay off; these call the same public turns.
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

const toolbar = document.createElement("div");
viewport.appendChild(toolbar);
const button = (text: string, onClick: () => void) => {
  const element = document.createElement("button");
  element.type = "button";
  element.textContent = text;
  element.addEventListener("click", onClick);
  toolbar.appendChild(element);
  return element;
};

const SIDES: readonly GizmoSide[] = ["up", "left", "right", "down"];
// Upright to the face on that side of the screen; only meaningful at a face.
const sides = SIDES.map((side) => [side, button(side, () => void gizmo.turn({ toward: side }))] as const);
// Positive roll turns the scene clockwise on screen.
const rolls = [
  button("Roll clockwise", () => void gizmo.turn({ roll: Math.PI / 2 })),
  button("Roll counter-clockwise", () => void gizmo.turn({ roll: -Math.PI / 2 })),
];
button("Home", async () => {
  const { outcome } = await gizmo.lookFrom("home");
  console.log(outcome.status); // "reached", "interrupted" or "unavailable"
});

function refresh() {
  const at = gizmo.atTarget; // null while dragging or flying, and after a free drag
  for (const [side, element] of sides) {
    element.hidden = !at?.sides;
    if (at?.sides) element.textContent = `Turn to ${at.sides[side].label}`;
  }
  for (const element of rolls) element.hidden = !(at && gizmo.canRoll);
}
gizmo.addEventListener("attargetchange", refresh);
refresh();
