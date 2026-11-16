---
three-viewport-gizmo: major
---

The axis lines are one mesh of six cylinders with one vertex-coloured basic material, drawn in one call, instead of `Line2` with `LineMaterial` or `Line2NodeMaterial`. Their width is `lineWidth` CSS pixels in the gizmo's own rectangle, so it no longer depends on the window size at construction and stays the same when the host canvas resizes, on both renderers. The new scene path imports nothing from `three/webgpu` or `three/addons/lines/`.
