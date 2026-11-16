---
three-viewport-gizmo: major
---

`attachControls` takes any controls of the structural `GizmoControls` shape and checks them: controls without a `target` vector, `update()` or a `change` event throw `ViewportGizmoError` with code `INVALID_OPTION`, naming the camera-controls adapter, instead of failing later on an undefined read. The gizmo copies the controls' `target` instead of sharing the vector. After a gizmo interaction the controls get back the `enabled` value they had, so controls the host disabled stay disabled. Numeric `minPolarAngle`, `maxPolarAngle`, `minAzimuthAngle` and `maxAzimuthAngle` on the controls are read as limits. After the gizmo changes `camera.up`, controls with `updateCameraUp()` are told, and `OrbitControls` and `MapControls` from three 0.168 have their orbit axis refreshed so the next drag orbits the new up; below three 0.168, `roll: true` with `OrbitControls` throws `ROLL_UNSUPPORTED` naming the three version.
