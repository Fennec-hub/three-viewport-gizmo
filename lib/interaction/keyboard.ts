import { Quaternion, Vector3 } from "three";
import type {
  GizmoFaceName,
  GizmoSide,
  GizmoTarget,
  GizmoTurn,
  GizmoTurnEnd,
  GizmoView,
} from "../types";

/** The gizmo state keyboard operation reads: the public members of `ViewportGizmo` it needs. */
export type KeyboardGizmo = Readonly<{
  enabled: boolean;
  canRoll: boolean;
  targets: readonly GizmoTarget[];
  options: Readonly<{ type: string }>;
}>;

/** The turns a key makes: `lookFrom` and `turn` with cause `key`. */
export type KeyboardActions = Readonly<{
  /** Where the view is going: the running flight's end orientation, else the camera's. */
  aim: () => Readonly<Quaternion>;
  /** The view now: the camera's orientation, or the reported pose in controlled mode. */
  orientation: () => Readonly<Quaternion>;
  lookFrom: (view: GizmoView) => Promise<GizmoTurnEnd>;
  turn: (turn: GizmoTurn) => Promise<GizmoTurnEnd>;
}>;

/** One entry of the key map: when it is offered and the call it makes. */
export type KeyBinding = Readonly<{
  offered: (gizmo: KeyboardGizmo) => boolean;
  run: (gizmo: KeyboardGizmo, actions: KeyboardActions) => Promise<GizmoTurnEnd>;
}>;

const QUARTER = Math.PI / 2;
const STEP = Math.PI / 4;

/** Digits name faces in SolidWorks' Ctrl+1 to Ctrl+6 order, without the Ctrl (which switches browser tabs). */
const DIGIT_FACES: Readonly<Record<string, GizmoFaceName>> = {
  "1": "front",
  "2": "back",
  "3": "left",
  "4": "right",
  "5": "top",
  "6": "bottom",
};

const ARROW_SIDES: Readonly<Record<string, GizmoSide>> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

const always = () => true;

/** The target whose direction is nearest `direction`, skipping `except`; a tie goes to the earlier entry. */
function nearest(targets: readonly GizmoTarget[], direction: Readonly<Vector3>, except?: GizmoTarget): GizmoTarget {
  let best = targets[0];
  let bestDot = -Infinity;
  for (const target of targets) {
    if (target === except) continue;
    const dot = target.direction.dot(direction);
    if (dot > bestDot + 1e-9) {
      best = target;
      bestDot = dot;
    }
  }
  return best;
}

/**
 * The neighbouring view on a side of the screen (K2 `arrow-step`): the view the gizmo is going to turned 45° toward
 * that side, snapped to the nearest of the 26 targets other than the one it starts from. At a face this is the edge on
 * that side; at an upright edge the face or corner on that side; at a corner one of its edges or the face that projects
 * that way. Computed on screen, so a rolled view steps the way it looks.
 *
 * @param aim - The orientation the step starts from
 * @returns The target to look from
 */
export function neighbourOn(targets: readonly GizmoTarget[], aim: Readonly<Quaternion>, side: GizmoSide): GizmoTarget {
  const back = new Vector3(0, 0, 1).applyQuaternion(aim);
  const toward = new Vector3(side === "left" || side === "right" ? 1 : 0, side === "up" || side === "down" ? 1 : 0, 0)
    .multiplyScalar(side === "left" || side === "down" ? -1 : 1)
    .applyQuaternion(aim);
  const stepped = back.clone().multiplyScalar(Math.cos(STEP)).addScaledVector(toward, Math.sin(STEP));
  return nearest(targets, stepped, nearest(targets, back));
}

/**
 * The binding a key press names, or undefined to leave the key to the page. A press with Ctrl, Meta or Alt held, or
 * during IME composition, is never the gizmo's, so every browser and OS chord passes through untouched.
 */
export function bindingFor(event: KeyboardEvent): KeyBinding | undefined {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return undefined;
  const side = ARROW_SIDES[event.key];
  if (side) {
    if (!event.shiftKey) {
      return { offered: always, run: (g, a) => a.lookFrom(neighbourOn(g.targets, a.aim(), side).name) };
    }
    if (side === "up" || side === "down") return undefined;
    // Shift+Right rolls the scene clockwise on screen: the camera turns counter-clockwise about its line of sight.
    const roll = side === "right" ? QUARTER : -QUARTER;
    return { offered: (g) => g.canRoll, run: (_, a) => a.turn({ roll }) };
  }
  if (event.key === "Home" && !event.shiftKey) return { offered: always, run: (_, a) => a.lookFrom("home") };
  // By `code`, so an AZERTY top row (digits under Shift) and the keypad reach the same faces.
  const face = DIGIT_FACES[/^(?:Digit|Numpad)([1-6])$/.exec(event.code)?.[1] ?? ""];
  return face ? { offered: always, run: (_, a) => a.lookFrom(face) } : undefined;
}

/**
 * The accessible name: the view and the roll. At a target, its label and, when rolled from its upright (`up: 'reset'`)
 * pose, ", rolled 90° clockwise", ", rolled 180°" or ", rolled 90° counter-clockwise"; off a target, "Near " and the
 * nearest target's label.
 *
 * @param at - The target the view rests on, or null
 * @param orientation - The camera's orientation
 */
export function accessibleName(
  targets: readonly GizmoTarget[],
  at: GizmoTarget | null,
  orientation: Readonly<Quaternion>
): string {
  const back = new Vector3(0, 0, 1).applyQuaternion(orientation);
  if (!at) return `Near ${nearest(targets, back).label}`;
  const named = (name: string) => targets.find((t) => t.name === name)!.direction;
  const top = named("top");
  const d = at.direction;
  // Upright: the label up on screen; at a pole, entered from Front (the Front face below Top, above Bottom).
  const upright =
    Math.abs(d.dot(top)) < 0.99
      ? top.clone().addScaledVector(d, -d.dot(top)).normalize()
      : named("front").clone().multiplyScalar(d.dot(top) > 0 ? -1 : 1);
  const screenUp = new Vector3(0, 1, 0).applyQuaternion(orientation);
  const angle = Math.atan2(new Vector3().crossVectors(upright, screenUp).dot(d), upright.dot(screenUp));
  const quarters = ((Math.round(angle / QUARTER) % 4) + 4) % 4;
  return at.label + ["", ", rolled 90° clockwise", ", rolled 180°", ", rolled 90° counter-clockwise"][quarters];
}

/** Keyboard operation on the gizmo's element. */
export type KeyboardInput = {
  /** Rewrites `tabindex`, `aria-disabled`, `aria-roledescription` and `aria-label` from the host's state. */
  refresh(at: GizmoTarget | null): void;
  /** After each `end`, once the name is written: announces a reached key or navigation turn. */
  ended(end: GizmoTurnEnd): void;
  /** Removes the listeners and the status child; the attributes stay with the element. */
  detach(): void;
};

/** How long the status child stays empty before it is written, so the same text is announced again. */
const ANNOUNCE_DELAY_MS = 50;

/**
 * Makes `element` a focusable `role="application"` with the K2 key map. Keys run only while `gizmo.enabled`; a consumed
 * key is `preventDefault`ed and still propagates, so a host can observe it. A pointer press does not take focus. A
 * `role="status"` first child announces the name once when a key or navigation turn is reached.
 *
 * @returns The handle the gizmo refreshes on each state write and detaches on dispose
 */
export function attachKeyboard(element: HTMLElement, gizmo: KeyboardGizmo, actions: KeyboardActions): KeyboardInput {
  element.setAttribute("role", "application");
  const status = document.createElement("div");
  status.setAttribute("role", "status");
  status.setAttribute("data-announcer", "");
  Object.assign(status.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  });
  element.prepend(status);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const keydown = (event: KeyboardEvent) => {
    const binding = gizmo.enabled ? bindingFor(event) : undefined;
    if (!binding?.offered(gizmo)) return;
    event.preventDefault();
    void binding.run(gizmo, actions);
  };
  // Keep focus where it is on a pointer press (K2 `press-focus`); the pointer session has already taken the press.
  const mousedown = (event: MouseEvent) => event.preventDefault();
  element.addEventListener("keydown", keydown);
  element.addEventListener("mousedown", mousedown);

  return {
    refresh(at) {
      element.tabIndex = gizmo.enabled ? 0 : -1;
      if (gizmo.enabled) element.removeAttribute("aria-disabled");
      else element.setAttribute("aria-disabled", "true");
      element.setAttribute("aria-roledescription", gizmo.options.type === "sphere" ? "view sphere" : "view cube");
      element.setAttribute("aria-label", accessibleName(gizmo.targets, at, actions.orientation()));
    },
    ended({ cause, outcome }) {
      if ((cause !== "key" && cause !== "navigation") || outcome.status !== "reached") return;
      status.textContent = "";
      clearTimeout(timer);
      timer = setTimeout(() => (status.textContent = element.getAttribute("aria-label")), ANNOUNCE_DELAY_MS);
    },
    detach() {
      clearTimeout(timer);
      element.removeEventListener("keydown", keydown);
      element.removeEventListener("mousedown", mousedown);
      status.remove();
    },
  };
}
