---
three-viewport-gizmo: major
---

Face names come from one label frame built from `up` and `frontDirection`, one of the 24 cardinal frames. The face-style alias, the face reported in events and the drawn label always name the same face: on a Z-up gizmo, `front: {...}` now styles the face labelled Front, where 2.3.0 styled the one labelled Back (and `back` the one labelled Front). `up` is read by direction within 1e-6 of a signed axis, so `(0, 0, 0.9999999)` is +Z and `(0, 0, -1)` is −Z, where 2.3.0 read both as +Y; a tilted `up`, or a `frontDirection` that is not a signed axis perpendicular to it, throws `ViewportGizmoError` with code `INVALID_FRAME`. A negative up keeps the 2.x front of its axis.
