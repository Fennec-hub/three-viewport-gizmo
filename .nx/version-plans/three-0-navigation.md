---
three-viewport-gizmo: major
---

The gizmo can draw its own navigation buttons, off by default: `navigation: { enabled: true }` adds seven real `<button>`s to its element on a 3 x 3 grid around the cube, side triangles at a face view, roll arrows at any target while `canRoll`, and Home at every view, each a 16 px chip with a 24 px hit area. They show on hover, on focus within the element and always on a device without hover (`reveal: 'always'` shows them always), and `sides`, `roll` and `home` switch each kind off. Every press is a `turn` or `lookFrom` with cause `navigation`. The grid sits at `--viewport-gizmo-anchor`, computed from the cube's silhouette, and the colours follow the cube's style behind the `--viewport-gizmo-button-background`, `-ring`, `-ring-hover`, `-color` and `-focus-ring` custom properties.
