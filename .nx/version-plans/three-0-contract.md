---
three-viewport-gizmo: major
---

Freezes the 3.0 public contract: the root entry exports `ViewportGizmoError` with a `GizmoErrorCode`, and the 3.0 types for targets, poses, turns, outcomes, events, options, resolved options, controls, navigation and materials. "Target" replaces "axis" in every public name (`GizmoAxisOptions` is now `GizmoTargetOptions`), the label-frame front is the new `frontDirection` option, and the published types no longer import `utility-types` or `OrbitControls`; `attachControls` takes any structural `GizmoControls`.
