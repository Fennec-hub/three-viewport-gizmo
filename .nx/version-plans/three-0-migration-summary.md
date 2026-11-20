---
three-viewport-gizmo: major
---

3.0 is a breaking release; the [migration guide](https://taucad.github.io/three-viewport-gizmo/docs/migrating/) lists every change with the code that replaces it. In short: the package is ESM only, with camera-controls support in the `/camera-controls` subpath. The gizmo goes into the canvas's parent instead of `document.body`, extends `EventDispatcher` instead of `Object3D` (the scene object is `root`, the 26 targets are `targets`) and keeps one public `domElement` with state attributes instead of inline cursor, `z-index` and `border-radius`. Events carry a cause and a pose, turns run through `lookFrom()` and `turn()`, which return a promise of the outcome, and options are validated with coded errors. Views may roll unless `roll: false`, which keeps the 2.x upright behaviour. The gizmo is a keyboard tab stop. New: six up axes with `frontDirection`, controlled mode, limits, opposite click, the rounded cube and triad, and opt-in navigation buttons.
