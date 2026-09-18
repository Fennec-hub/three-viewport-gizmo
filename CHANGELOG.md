## 2.2.4 (2026-09-18)

### 🩹 Fixes

- Add a per-instance `up` option so face labels, drags and face clicks follow the gizmo's own up axis; a gizmo without one now regenerates when `Object3D.DEFAULT_UP` changes, and `set()` keeps attached controls. ([#21](https://github.com/taucad/three-viewport-gizmo/pull/21))

### ❤️ Thank You

- Claude Opus 5
- Richard Fontein @rifont

## 2.2.3 (2026-08-26)

### 🩹 Fixes

- Publish the cardinal camera settle fix from the current protected main commit so automated tag and GitHub Release closeout remains least-privileged. ([#19](https://github.com/taucad/three-viewport-gizmo/pull/19))

### ❤️ Thank You

- Richard Fontein @rifont

## 2.2.2 (2026-08-26)

### 🩹 Fixes

- Keep Z-up and X-up cardinal camera poses stable when external controls settle, and balance synchronous gizmo interaction events. ([#17](https://github.com/taucad/three-viewport-gizmo/pull/17))

### ❤️ Thank You

- Richard Fontein @rifont

# Changelog

All notable changes to `@taulabs/three-viewport-gizmo` are recorded here.
