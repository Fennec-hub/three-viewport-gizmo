---
three-viewport-gizmo: major
---

The `three` peer range starts at 0.167 (was 0.162): the type declarations import `WebGPURenderer` from `three/webgpu`, which three and `@types/three` ship from 0.167. `WebGPURenderer` draws the gizmo from three 0.171, and roll with OrbitControls still needs 0.168. CI checks 0.167, 0.168 and the latest three on every pull request.
