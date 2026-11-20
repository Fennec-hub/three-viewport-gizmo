---
three-viewport-gizmo: major
---

camera-controls attaches through `cameraControls(controls)` from the new `@taulabs/three-viewport-gizmo/camera-controls` subpath: `gizmo.attachControls(cameraControls(controls))` replaces the hand-written event glue. The adapter hands camera-controls the pose the gizmo wrote, keeps a copy of its target, maps `enabled` and its polar and azimuth limits, and forwards `updateCameraUp()`, so `roll` defaults on with camera-controls. `camera-controls` is an optional peer dependency (`^3.0.0`); the root entry and its types never import it.
