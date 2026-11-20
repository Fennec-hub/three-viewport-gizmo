---
three-viewport-gizmo: major
---

The `rounded-cube`'s corners are easy to hover and click again at any `radius`. 3.0.0-beta.1 shrank a corner's hit region to its rounded patch, so a small `radius` (0.05) left each corner under 1% of the view; the hit region again reaches 0.2 into the faces and edges around the patch, as in 2.3.0 and beta.0 (it keeps at least the inner half of each face, so a large `radius` no longer turns the whole cube into corners). The faces and edges are still drawn as clean rectangles: hovering inside the band lights the corner's rounded patch.
