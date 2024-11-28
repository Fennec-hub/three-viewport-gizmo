<script setup lang="ts">
const type = new URLSearchParams(window.location.search).get("type") || "sphere";
</script>

# Multiple Elements

<IframeContainer :url="`multiple-elements.html?type=${type}`" />

This example demonstrates using ViewportGizmo with Three.js multi-element rendering using scissor rendering. Each viewport is defined by scissor areas, and the gizmo is set up to track camera orientation in each section independently. This setup allows flexible multi-view configurations while maintaining orientation cues across different viewports.

### Source

[...samples/multiple-elements.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/multiple-elements.html?type="")
