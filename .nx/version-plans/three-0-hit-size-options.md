---
three-viewport-gizmo: major
---

Add `corners.hitSize` and `edges.hitSize`: how far in from the cube's edge, in gizmo units (a face's half-width is 1), a pointer still lands on a corner or an edge. They change the hit test only; the drawn pieces and their hover highlight stay the same, and changing either through `set()` rebuilds nothing. The `sphere` ignores both.

- `cube`: corners 0.35 and edges 0.3 by default, the 2.3.0 hit regions. Edges are never narrower than the gap between the face tiles.
- `rounded-cube`: corners `min(radius + 0.2, (1 + radius) / 2)` by default, exactly the 3.0.0-beta.3 corner band at every radius; edges `max(radius, 0.15)`, clamped to `[radius, 1)` like the corners.

Behaviour change: below `radius` 0.15 the `rounded-cube`'s edges now catch a pointer 0.15 in from the cube's edge instead of only on their drawn strip (0.05 wide at `radius` 0.05), so a small-radius cube's edges are easy to hover and click. Pass `edges: { hitSize: radius }` for the previous hit region.
