---
three-viewport-gizmo: major
---

The gizmo's scene is built once per structural option change and updated in place for every other one. It disposes only the materials, geometries and textures it created, so a sprite, material or texture a host adds under the gizmo, or a material a host returns from `onMaterial`, survives `dispose()`. Targets of equal style share one material: a cube draws with at most 16, its 20 edges and corners share one hover material, and hovering swaps to a material that compiles the same program or pipeline. Every gizmo material is `toneMapped: false` with fixed transparency and depth-write flags. Disabling a face, the edges, the corners, an axis line or the background hides it without a rebuild. Face labels and edges are oriented by the label frame, so the Top and Bottom labels read upright on every up axis.
