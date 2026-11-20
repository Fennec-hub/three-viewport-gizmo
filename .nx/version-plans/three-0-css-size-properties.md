---
three-viewport-gizmo: major
---

The gizmo element's inline `width`, `height` and `margin` now read the custom properties `--viewport-gizmo-width`, `--viewport-gizmo-height` and `--viewport-gizmo-margin`, falling back to the `size` and `offset` options. A host class can resize or reposition the gizmo without `!important`, and the package still ships no stylesheet.
