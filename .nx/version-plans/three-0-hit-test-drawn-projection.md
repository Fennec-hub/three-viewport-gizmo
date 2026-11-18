---
three-viewport-gizmo: major
---

The pointer hits the target drawn under it at every `fieldOfView`, on `WebGPURenderer` and `WebGLRenderer`, with or without `reversedDepthBuffer`. A renderer rewrites the gizmo camera's projection when it draws (WebGPU clip depth, reversed depth); the hit test now reads that same camera in whichever convention it carries, where it assumed WebGL's and, under reversed depth, picked the face behind the one drawn below 26° (and on the sphere at any angle). The depth reset also stays behind the gizmo at very narrow angles, where it fell in front of the near plane and left the host's depth inside the gizmo's rectangle.
