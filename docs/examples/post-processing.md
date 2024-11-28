<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Post processing

<IframeContainer :url="`post-processing.html?type=${type}`" />

This example integrates ViewportGizmo with Three.js post-processing effects. The gizmo operates alongside visual effects, providing an orientation guide without interfering with post-processing layers. Resize handling keeps the gizmo and effects responsive to screen size changes.

### Source

[...samples/post-processing.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/post-processing.html)
