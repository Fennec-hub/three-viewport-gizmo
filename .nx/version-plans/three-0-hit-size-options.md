---
three-viewport-gizmo: major
---

Add `corners.hitSize` and `edges.hitSize`: how far in from the cube's edge, in gizmo units (a face's half-width is 1), a pointer still lands on a corner or an edge. They change the hit test only; the drawn pieces and their hover highlight stay the same, and changing either through `set()` rebuilds nothing. The `sphere` ignores both.

- `cube`: corners 0.35 and edges 0.3 by default, the 2.3.0 hit regions. Edges are never narrower than the gap between the face tiles.
- `rounded-cube`: corners `min(radius + 0.2, (1 + radius) / 2)` by default, exactly the 3.0.0-beta.3 corner band at every radius; edges `min(max(radius + 0.1, 0.15), (1 + radius) / 2)`: the drawn strip plus a 0.1 band, as the corners have their 0.2, never under 0.15 and never past the inner half of a face. Both are clamped to `[radius, 1)`.

Behaviour change: the `rounded-cube`'s edges now catch a pointer up to 0.1 beyond their drawn strip (0.15 in from the cube's edge below `radius` 0.05), as its corners already did, instead of only on the strip. At the default `radius` 0.3 an edge reaches 0.4 in and the face keeps its inner 60 %. Pass `edges: { hitSize: radius }` for the drawn strip only (the 3.0.0-beta.3 hit region), or `edges: { hitSize: Math.max(radius, 0.15) }` for this option's earlier default.
