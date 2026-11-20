---
three-viewport-gizmo: major
---

`compile()` logs nothing on a WebGL device without `KHR_parallel_shader_compile`: it compiles synchronously there instead of through three's `compileAsync`, which warned that the extension is not supported.
