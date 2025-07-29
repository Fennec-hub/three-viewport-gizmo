<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Z-up Coordinate System

<IframeContainer :url="`z-up.html?type=${type}`" />

This example demonstrates how to use ViewportGizmo in a Three.js scene with a Z-up coordinate system. This coordinate system is commonly used in CAD applications, where the Z-axis represents the vertical direction.

The Gizmo is designed to work out of the box with the Z-up, right-handed coordinate system without requiring additional configuration.

The default directions are as follows:
- Up: `Z+`
- Right: `X+`
- Forward: `Y+`

### Source

[...samples/z-up.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/z-up.html)
