---
three-viewport-gizmo: major
---

The gizmo's own camera gets a field of view in radians (`fieldOfView`, not three.js's degree `fov`) that moves the camera to keep the cube's apparent size and rebuilds no geometry or material, and a warm-up that compiles the gizmo's scene with its own camera for the renderer's current render target on WebGL and WebGPU. These replace a host's reach into the private `_camera` and its own `compileAsync` call; the class wires them as the `fieldOfView` option and `compile()`.
