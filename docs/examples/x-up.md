<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# X-up Coordinate System

<IframeContainer :url="`x-up.html?type=${type}`" />

This example demonstrates how to use ViewportGizmo in a Three.js scene with an X-up coordinate system. This coordinate system is used in specific engineering applications, some physics engines, and certain legacy CAD workflows where the X-axis represents the vertical direction.

The Gizmo is designed to work out of the box with the X-up, right-handed coordinate system without requiring additional configuration.

The default directions are as follows:
- Up: `X+`
- Right: `Z+`
- Forward: `Y-`

### Source

[...samples/x-up.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/x-up.html)
