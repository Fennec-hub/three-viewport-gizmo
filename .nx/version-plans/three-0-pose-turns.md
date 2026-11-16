---
three-viewport-gizmo: major
---

Turns are planned on the orbit-up model (roll research L1, L2, L6, L7). A turn reads the camera's roll about its line of sight as a residual and eases it out with the other two angles, so a turn from a camera a host has rolled no longer jumps by the whole roll on its first frame, and a turn with no roll stays upright on every frame as in 2.3.0. A click keeps the signed axis nearest the current orbit up with `roll: true`, returns to the label up with `roll: false`, and turns by the single shortest rotation to an orientation resting on the target with `roll: 'free'`. Pole entry (`front` or `nearest`), the opposite view on a repeat click, polar and azimuth limits in the orbit frame, relative turns with roll, side-triangle turns, `home` and `up: 'reset'` are planned in `lib/orbit/turn.ts`; the class wires them in a later change.
