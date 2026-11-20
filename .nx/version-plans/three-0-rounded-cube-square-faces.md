---
three-viewport-gizmo: major
---

The `rounded-cube`'s faces and edges are drawn as clean rectangles: its drawn corners are exactly the rounded corner patches. Before, a corner reached a little way into the three faces and edges around it (2.3.0's corner-over-face click priority), which cut a square notch out of every face. A corner still wins clicks a little way into them; only the drawing changed.
