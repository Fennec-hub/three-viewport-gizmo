<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Yomotsu Camera Controls

<IframeContainer :url="`yomotsu-camera-controls.html?type=${type}`" />

This example demonstrates integrating ViewportGizmo with [Yomotsu camera controls](https://github.com/yomotsu/camera-controls), showing how to link the gizmo with advanced or
custom control setups. The gizmo is configured to follow the camera's movements, allowing precise orientation feedback while preserving custom control behaviors. Resize handling ensures the gizmo and controls remain responsive.

### Source

[...samples/yomotsu-camera-controls.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/yomotsu-camera-controls.html)
