---
three-viewport-gizmo: major
---

The gizmo's element is created once and kept for the gizmo's life. The library writes only its position, size, margin and `touch-action: none` inline; it no longer writes `cursor`, `z-index` or `border-radius`, nor the dead `id` style. Interaction state is reported as `data-hovered="face|edge|corner"`, `data-dragging` and `data-disabled`, for host CSS. Without a `container` the element goes into the canvas's parent, not `document.body`; a selector that matches nothing, or a canvas with no parent, throws `ViewportGizmoError` with code `CONTAINER_MISSING`. To restore the 2.x look: `.your-class { z-index: 1000; border-radius: 100%; } .your-class[data-hovered] { cursor: pointer; }`.
