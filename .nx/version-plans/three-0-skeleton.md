---
three-viewport-gizmo: major
---

`ViewportGizmo` is a controller, not a scene object: it extends `EventDispatcher` instead of `Object3D`. Its drawable is the new read-only `root`, so `hostScene.add(gizmo)` is a type error, and `render()` takes `root` back if a host scene adopts it. Code that used the gizmo's `Object3D` side (`gizmo.add(...)`, `gizmo.children`, `gizmo.scale`, `renderer.compileAsync(gizmo, ...)`) moves to `gizmo.root`. The new read-only `targets` lists each target as data: name in the label frame, kind, direction and label.
