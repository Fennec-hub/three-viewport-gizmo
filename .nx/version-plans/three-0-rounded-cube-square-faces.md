---
three-viewport-gizmo: major
---

The `rounded-cube`'s faces and edges are clean rectangles: its corners are exactly the rounded corner patches. Before, a corner reached a little way into the three faces and edges around it (2.3.0's corner-over-face click priority), which cut a square notch out of every face. A click just inside a face corner now lands on the face.
