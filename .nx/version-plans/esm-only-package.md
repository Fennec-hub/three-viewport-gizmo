---
three-viewport-gizmo: major
---

Ships the package as ES modules only. The UMD build and the `require` export are gone: `exports` now has `types` and `default` conditions, the package declares `sideEffects: false` and `engines.node >=20`, and the tarball includes the changelog. CommonJS consumers load it with `import()`. The repository no longer commits `dist/`; CDN users load the build from the npm tarball.
