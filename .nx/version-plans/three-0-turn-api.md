---
three-viewport-gizmo: major
---

The turn API is pinned by tests against the 3.0 guide: `lookFrom(view, { animated, up })` and `turn({ toward })` or `turn({ azimuth, polar, roll })` resolve with `reached`, `interrupted` (`by` the newer turn, click or drag), `cancelled` (`cancel`, `pointercancel`, `disabled`, `set`, `dispose`) or `unavailable` (`roll-off`, with no event and the running turn left alone). `atTarget` is set after a click, a quarter turn and a roll (a rolled edge or corner stays at its target) and cleared by a drag or a host camera move. A double-click on the cube lands upright on the view the first click turned to and never turns to the opposite target; with `roll: false` the second click now keeps the first click's turn instead of turning back.
