<script setup lang="ts">
const type = typeof window === "undefined" ? "sphere" : new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Z-up Coordinate System

<IframeContainer :url="`z-up.html?type=${type}`" />

This example demonstrates how to use ViewportGizmo in a Three.js scene with a Z-up coordinate system. This coordinate system is commonly used in CAD applications, where the Z-axis represents the vertical direction.

A new Three.js process is Y-up (`Object3D.DEFAULT_UP` is `(0, 1, 0)`). For a Z-up gizmo either set `Object3D.DEFAULT_UP.set(0, 0, 1)` before creating it — the gizmo reads the axis from that global and regenerates on its next update or render if the global changes later — or pass the axis per gizmo: `new ViewportGizmo(camera, renderer, { up: "z" })`. Pass it per gizmo when several views with different up axes share one process.

The default directions are as follows:
- Up: `Z+`
- Right: `X+`
- Forward: `Y+`

### Source

[...samples/z-up.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/z-up.html)
