---
three-viewport-gizmo: major
---

The axis triad's lines are smooth without MSAA: each is a camera-facing ribbon with a feathered edge instead of a hard-edged cylinder, so a single-sample host (Tau's WebGPU node pipeline, phones) no longer draws them jagged. The triad now adds six draws (three lines, three labels) instead of four. The navigation buttons no longer show their focus ring at rest in Safari (WebKit reads `outline: none` back as "medium", which a restyle took for a focused button); the ring now shows only on the `:focus-visible` button and sits snug around its chip.
