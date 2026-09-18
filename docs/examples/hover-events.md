<script setup lang="ts">
const type = typeof window === "undefined" ? "rounded-cube" : new URLSearchParams(window.location.search).get("type") || "rounded-cube";
</script>

# Hover Events

<IframeContainer :url="`hover-events.html?type=${type}`" />

Subscribe to **`hoverchange`** and **`change`** to read enriched identity fields from the gizmo: `kind` (`face` | `edge` | `corner` | `null`), `axes`, `face` (face hits only), and `direction` (unit `Vector3`, use `.toArray()` when logging). Open **DevTools → Console** while hovering and clicking the widget. The fixed overlay in the sample mirrors the latest payloads without opening DevTools.

On **`hoverchange`**, `object` is the hovered mesh or sprite, or `null` when the pointer leaves (identity fields are then `null`). On **`change`**, a click that starts view alignment dispatches populated identity fields once; during drag or per-frame animation, `kind` / `axes` / `face` / `direction` are `null`.

This page defaults to **`rounded-cube`** so faces, edges, and corners are all present; use the sidebar or `?type=sphere` / `?type=cube` for other shapes.

<div v-if="type === `sphere`">

```js
const gizmo = new ViewportGizmo(camera, renderer);
gizmo.attachControls(controls);

gizmo.addEventListener("hoverchange", (event) => {
  console.log("[viewport-gizmo] hoverchange", {
    object: event.object,
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});

gizmo.addEventListener("change", (event) => {
  console.log("[viewport-gizmo] change", {
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});
```

</div>

<div v-else-if="type === `cube`">

```js
const gizmo = new ViewportGizmo(camera, renderer, { type: "cube" });
gizmo.attachControls(controls);

gizmo.addEventListener("hoverchange", (event) => {
  console.log("[viewport-gizmo] hoverchange", {
    object: event.object,
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});

gizmo.addEventListener("change", (event) => {
  console.log("[viewport-gizmo] change", {
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});
```

</div>

<div v-else-if="type === `rounded-cube`">

```js
const gizmo = new ViewportGizmo(camera, renderer, { type: "rounded-cube" /* + face/edge/corner options */ });
gizmo.attachControls(controls);

gizmo.addEventListener("hoverchange", (event) => {
  console.log("[viewport-gizmo] hoverchange", {
    object: event.object,
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});

gizmo.addEventListener("change", (event) => {
  console.log("[viewport-gizmo] change", {
    kind: event.kind,
    axes: event.axes,
    face: event.face,
    direction: event.direction?.toArray() ?? null,
  });
});
```

</div>

### Source

[...samples/hover-events.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/hover-events.html)
