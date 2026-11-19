# Animation timing regression

The fixture uses the library's public constructor, OrbitControls integration and
render loop. The test moves the real pointer, verifies the intended cube face's
prehighlight, clicks, and checks the settled direction, target-relative distance,
controls state and event counts. A consumer orbit reveals the second face before
another click. Page errors and browser warnings/errors fail the journey.

Run `npm run test:browser` after `npx playwright install chromium`. The default
uses bundled Chromium. `PW_BROWSER_CHANNEL=msedge` or `chrome` uses that installed
browser instead. Both desktop and compact windows run by default.

Repeat with `TEST_THREE_PACKAGE=three-minimum` (0.162.0) and
`TEST_THREE_PACKAGE=three-current` (0.185.1). The default is the package's existing
Three.js 0.173 dependency. These aliases are development-only; the peer range is
unchanged. No built distribution files need to be committed for this source fix.

The deprecated Clock failure was found while integrating the MIT-licensed gizmo
in Crawler. This upstream adaptation uses the browser's monotonic timestamp so
it also works with Three.js releases that do not export Timer. The library's
existing MIT licence and author credit remain in place.
