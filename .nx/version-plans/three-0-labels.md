---
three-viewport-gizmo: major
---

Labels are drawn one small texture per label instead of one shared atlas: a face gets its own texture, and a hover texture only where its hover colour, label colour or border differs. The default cube holds 12 label textures, about 1 MB, instead of 2.3.0's clones of one atlas (13.4 MB of WebGPU texture memory after hovering). Each texture is sized from `size` and the device pixel ratio unless `resolution` is set, so labels stay sharp on high-DPI screens; `resolution` has no fixed default any more. Rounded-cube face labels fill their texture edge to edge. `font.size` is in CSS pixels as documented. Text is centred on its ink, and the label no longer disappears where the browser reports no `fontBoundingBoxDescent` (Firefox before 116). A web font that finishes loading after construction redraws the labels with no `set()`.
