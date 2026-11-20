---
three-viewport-gizmo: major
---

The navigation buttons are easier to reach. On the sphere, the corner buttons (Home and the rolls) sit on the diagonal at the side buttons' distance, overlapping the element's corner, instead of on the cube's square grid far outside it; the element also carries `--viewport-gizmo-anchor-corner`, their per-axis distance from its centre. With `reveal: "hover"`, the buttons stay for 400 ms after the pointer leaves the element, so it can cross the gap to one outside. The sphere's buttons are white chips ringed in the up axis's colour; a cube's chip takes its edge colour only when edges are drawn.

The button grid follows the element's measured height after each render, so a gizmo resized from CSS keeps its buttons clear of it.

The buttons no longer set `cursor: pointer`: they show the default cursor, like the cube, and a host can style `[data-navigation]` buttons without `!important`.
