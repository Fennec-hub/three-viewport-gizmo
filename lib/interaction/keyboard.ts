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

/** What the accessible name says: the target it names, and at a target the roll in quarter turns; -1 off a target. */
type Named = { target: GizmoTarget; quarters: number };

const ROLLED = ["", ", rolled 90° clockwise", ", rolled 180°", ", rolled 90° counter-clockwise"] as const;
const _back = new Vector3();
const _upright = new Vector3();
const _screenUp = new Vector3();
const _cross = new Vector3();

/** The target named `name`; every label frame has all six faces. */
function byName(targets: readonly GizmoTarget[], name: GizmoFaceName): GizmoTarget {
  for (const target of targets) if (target.name === name) return target;
  throw new Error(`No ${name} target`);
}

/**
 * The accessible name's parts, a pure function of the targets, the at-target state and the orientation, written into
 * `out`. At a target, the target and its roll from its upright (`up: 'reset'`) pose in quarter turns; off a target,
 * the nearest target and -1 ("Near "). Allocates nothing, so the gizmo derives it on every observed turn and spells
 * the name ({@link spell}) only when a part changes.
 *
 * @param at - The target the view rests on, or null
 * @param orientation - The camera's orientation
 */
function nameOf(targets: readonly GizmoTarget[], at: GizmoTarget | null, orientation: Readonly<Quaternion>, out: Named): Named {
  if (!at) {
    out.target = nearest(targets, _back.set(0, 0, 1).applyQuaternion(orientation));
    out.quarters = -1;
    return out;
  }
  const top = byName(targets, "top").direction;
  const d = at.direction;
  // Upright: the label up on screen; at a pole, entered from Front (the Front face below Top, above Bottom).
  if (Math.abs(d.dot(top)) < 0.99) _upright.copy(top).addScaledVector(d, -d.dot(top)).normalize();
  else _upright.copy(byName(targets, "front").direction).multiplyScalar(d.dot(top) > 0 ? -1 : 1);
  _screenUp.set(0, 1, 0).applyQuaternion(orientation);
  const angle = Math.atan2(_cross.crossVectors(_upright, _screenUp).dot(d), _upright.dot(_screenUp));
  out.target = at;
  out.quarters = ((Math.round(angle / QUARTER) % 4) + 4) % 4;
  return out;
}

/** The accessible name: the label, then ", rolled 90° clockwise", ", rolled 180°" or ", rolled 90° counter-clockwise" at a target; "Near " and the label off one. */
const spell = ({ target, quarters }: Readonly<Named>) =>
  quarters < 0 ? `Near ${target.label}` : target.label + ROLLED[quarters];

/** Keyboard operation on the gizmo's element. */
export type KeyboardInput = {
  /** Rewrites `tabindex`, `aria-disabled` and `aria-roledescription` from the host's state. */
  refresh(): void;
  /**
   * Names the view: derives the accessible name from `at` and the orientation now, and rewrites `aria-label` only
   * when the name changed. Allocates nothing when it did not. The gizmo calls it wherever it observes the pose.
   */
  name(at: GizmoTarget | null): void;
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

  // The name written last, by its parts: a new target object (a rebuilt target list) or roll rewrites it.
  const written: { target: GizmoTarget | null; quarters: number } = { target: null, quarters: Number.NaN };
  const derived: Named = { target: gizmo.targets[0], quarters: -1 };

  return {
    refresh() {
      element.tabIndex = gizmo.enabled ? 0 : -1;
      if (gizmo.enabled) element.removeAttribute("aria-disabled");
      else element.setAttribute("aria-disabled", "true");
      element.setAttribute("aria-roledescription", gizmo.options.type === "sphere" ? "view sphere" : "view cube");
    },
    name(at) {
      const named = nameOf(gizmo.targets, at, actions.orientation(), derived);
      if (named.target === written.target && named.quarters === written.quarters) return;
      written.target = named.target;
      written.quarters = named.quarters;
      element.setAttribute("aria-label", spell(named));
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
