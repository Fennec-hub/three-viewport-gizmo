---
three-viewport-gizmo: major
---

`controlled: true` now writes no camera (U4). Clicks, drags and flights report each pose in `change` as `{ direction, up }` and continue from the reported pose, so a host that applies it late or not at all never changes a turn. A host that applies the pose with `camera.lookAt` matches write mode frame for frame. The gizmo still disables attached controls while it turns, but in controlled mode it neither updates them nor calls `updateCameraUp()`: sync controls that keep their own state, such as camera-controls, after `end`.
