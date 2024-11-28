<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Standalone

<IframeContainer :url="`standalone.html?type=${type}`" />

This example shows ViewportGizmo used as a standalone component without OrbitControls. The gizmo provides an independent orientation guide, allowing direct manipulation of the camera's view without additional control layers. Resize handling ensures the gizmo remains responsive across different screen sizes.

### Source

[...samples/standalone.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/standalone.html)
