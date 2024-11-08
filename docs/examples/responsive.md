# Responsive

<IframeContainer url="responsive.html" />

This example illustrates ViewportGizmo in a CSS-responsive design setup. The gizmo adapts to different screen sizes, maintaining its functionality and orientation cues across various devices. CSS media queries and flexible layouts ensure that the gizmo remains usable and visually appealing in responsive web environments, enhancing the user experience.

---

First, assign a class name or an ID to the gizmo instance for styling purposes:

```javascript
const gizmo = new ViewportGizmo(camera, renderer, {
  className: "responsive-gizmo",
});
```

Next, define your CSS styles with responsiveness in mind, just as you would for any HTML element.

::: warning `!important`
Be sure to use the `!important` flag to override the default styles applied to the gizmo.
:::

```css
.responsive-gizmo {
  width: auto !important;
  height: 50% !important;
  aspect-ratio: 1;
}
```

This setup ensures that the gizmo scales appropriately within your responsive design, enhancing usability across different screen sizes.

### Source

[...samples/responsive.html](https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/responsive.html)
