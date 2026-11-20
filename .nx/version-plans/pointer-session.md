---
three-viewport-gizmo: major
---

The gizmo's pointer input follows one captured pointer at a time and the primary button only: a second finger, another device or a right-button press does nothing, and the right button keeps its context menu. A browser `pointercancel` ends the gesture as cancelled instead of leaving it stuck, the hit rectangle is measured at each press so a page scroll no longer shifts picks, hover never runs for touch, and a second click within 400 ms on the same spot (within 5 px) is classified as a double-click whatever target it hits. A wheel over the gizmo can be handed to the host's canvas so its controls keep zooming.
