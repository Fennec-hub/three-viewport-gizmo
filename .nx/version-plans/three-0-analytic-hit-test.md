---
three-viewport-gizmo: major
---

Hover and click are tested analytically: one pointer ray against the gizmo's box (sharp for `cube`, rounded for `rounded-cube`) or the sphere's discs, classified into one of the 26 targets, with 2.3.0's corner-over-face priority. Hit regions no longer depend on the render meshes, their `smoothness` or a host-replaced geometry, and no longer on the gizmo camera having rendered, so a hover or click before the first frame lands. The closed box also answers in the gaps between 2.3.0's cube tiles, where 2.3.0 hit nothing. A disabled target is never hit.
