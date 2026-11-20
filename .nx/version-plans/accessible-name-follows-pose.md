---
three-viewport-gizmo: patch
---

The gizmo's accessible name follows every pose it observes. It was rewritten only when the view moved onto or off a target, so a pose the host applied off a target (a saved pose adopted after construction, the host's own controls, controlled mode) kept the previous "Near …" name, a roll the host applied at an edge or corner kept the previous roll, and `set()` that relabelled a face kept the old label in `aria-label` and in `atTarget`. The name is now derived from the pose wherever the gizmo observes it (`update()`, the end of a turn, `set()`), and `aria-label` is written only when the name changes, so an observed turn that keeps the name allocates nothing for it.
