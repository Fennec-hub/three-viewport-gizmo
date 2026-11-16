---
three-viewport-gizmo: major
---

A gizmo now adds at most two programs (WebGL) or pipelines (WebGPU), down from three on the sphere and four on the cubes, and hovering compiles none. Every mesh it draws (labelled faces, edges, corners, axis lines and background) uses one basic material program: a map everywhere, a 1×1 white texture where there is no label, and vertex colours on. Showing the axis triad adds none: its labels are camera-facing quads on that program instead of sprites. The sphere's sprites are the other program. On WebGPU the cubes' background is the second pipeline, because it does not write depth. The cubes' background now draws the front side of mirrored faces instead of `BackSide`. Every pixel is unchanged. A material handed to `onMaterial` for an edge or corner now has `map` set to that white texture and `vertexColors` on.
