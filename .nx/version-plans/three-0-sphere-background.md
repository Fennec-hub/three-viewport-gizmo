---
three-viewport-gizmo: major
---

The sphere's background is a camera-facing disc of 128 triangles instead of a 64 × 64 back-facing sphere of 8,064. It draws the same circle behind the axis lines, and follows `background` and `background.hover` the same way; at oblique orientations its rim is the exact circle where the sphere's tessellated silhouette lost up to 48 edge pixels in a 256 px gizmo.
