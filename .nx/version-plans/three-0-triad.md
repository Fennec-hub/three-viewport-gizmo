---
three-viewport-gizmo: major
---

The cube types gain a built-in axis triad, off by default: `triad: { enabled: true }` draws world +X, +Y and +Z from the cube's corner with an X, Y or Z label past each tip in the axis colour, and shrinks the cube to 0.7 to give it room. It switches on and off through `set({ triad })` as a cheap change, with no rebuild, and draws four calls while shown. The sphere has no triad.
