<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Multiple Elements

<IframeContainer :url="`z-up.html?type=${type}`" />

This example demonstrates how to use ViewportGizmo in a Three.js scene with different up-axis configurations. It supports Z-up, X-up, and the default Y-up coordinate system, aligning with the camera’s orientation to provide an interactive reference for navigation.

### Source

[...samples/z-up.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/z-up.html?type="")
