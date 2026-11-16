"use client";

import { useState } from "react";
import type { GizmoAtTarget, GizmoNavigationOptions, GizmoSide, ViewportGizmo } from "@lib/index";
import { Stage } from "@site/components/Stage";

/** Room for the buttons outside the 128 px cube's box. */
const OFFSET = { top: 36, right: 36 };
const SWITCHES = ["sides", "roll", "home"] as const;

/** The built-in buttons, with each switch and the reveal mode applied live through `set()`. */
export function NavigationExample() {
  const [navigation, setNavigation] = useState<Required<Omit<GizmoNavigationOptions, "enabled">>>({
    sides: true,
    roll: true,
    home: true,
    reveal: "hover",
  });
  return (
    <>
      <fieldset style={{ marginBottom: "0.75rem" }}>
        <legend>Navigation</legend>
        <div className="segmented">
          {SWITCHES.map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={navigation[key]}
                onChange={(event) => setNavigation({ ...navigation, [key]: event.target.checked })}
              />
              <span>{key}</span>
            </label>
          ))}
          {(["hover", "always"] as const).map((reveal) => (
            <label key={reveal}>
              <input
                type="radio"
                name="navigation-reveal"
                checked={navigation.reveal === reveal}
                onChange={() => setNavigation({ ...navigation, reveal })}
              />
              <span>reveal: {reveal}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <Stage
        label="Cube gizmo with the built-in navigation buttons"
        config={{ controller: "orbit", gizmo: { type: "cube", offset: OFFSET } }}
        options={{ navigation: { enabled: true, ...navigation } }}
      />
    </>
  );
}

const SIDES: readonly GizmoSide[] = ["up", "left", "right", "down"];

/** Your own buttons on the public API: `turn`, `lookFrom`, `atTarget`, `canRoll` and `attargetchange`. */
export function CustomControlsExample() {
  const [gizmo, setGizmo] = useState<ViewportGizmo | null>(null);
  const [at, setAt] = useState<GizmoAtTarget | null>(null);
  const canRoll = gizmo?.canRoll ?? false;
  return (
    <>
      <Stage
        label="Cube gizmo driven by custom navigation buttons"
        config={{ controller: "orbit", gizmo: { type: "cube" } }}
        setup={({ gizmo }) => {
          if (!gizmo) return;
          setGizmo(gizmo);
          setAt(gizmo.atTarget);
          const refresh = ({ atTarget }: { atTarget: GizmoAtTarget | null }) => setAt(atTarget);
          gizmo.addEventListener("attargetchange", refresh);
          return {
            dispose: () => {
              gizmo.removeEventListener("attargetchange", refresh);
              setGizmo(null);
            },
          };
        }}
      />
      <div className="views" role="toolbar" aria-label="Custom navigation">
        {at?.sides &&
          SIDES.map((side) => (
            <button key={side} type="button" className="button" onClick={() => void gizmo?.turn({ toward: side })}>
              Turn to {at.sides?.[side].label}
            </button>
          ))}
        {at && canRoll && (
          <>
            <button type="button" className="button" onClick={() => void gizmo?.turn({ roll: Math.PI / 2 })}>
              Roll clockwise
            </button>
            <button type="button" className="button" onClick={() => void gizmo?.turn({ roll: -Math.PI / 2 })}>
              Roll counter-clockwise
            </button>
          </>
        )}
        <button type="button" className="button" onClick={() => void gizmo?.lookFrom("home")}>
          Home
        </button>
      </div>
      <p className="event-log" aria-live="polite">
        atTarget: {at ? at.target.label : "null"}
      </p>
    </>
  );
}
