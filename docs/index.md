---
layout: home

hero:
  name: Three Viewport Gizmo
  text: 3D View Camera Helper for Three.js
  tagline: Lightweight, Customizable & Responsive
  image:
    src: ./assets/three-viewport-gizmo.png
    alt: Three Viewport Gizmo Preview
  actions:
    - theme: brand
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: Examples
      link: /examples
    - theme: alt
      text: View on GitHub
      link: https://github.com/fennec-hub/three-viewport-gizmo

features:
  - icon: { src: "./assets/icons/camera.svg", alt: "camera" }
    title: Universal Camera Support
    details: Seamlessly integrates with any camera setup, whether standalone or with OrbitControls.

  - icon: { src: "./assets/icons/palette.svg", alt: "palette" }
    title: Fully Customizable
    details: From position and size to axis colors and fonts. Adapt the gizmo to match your project's aesthetic perfectly.

  - icon: { src: "./assets/icons/responsive.svg", alt: "responsive" }
    title: Responsive Design
    details: Automatically adapts to viewport changes and different screen sizes for both desktop and mobile applications.

  - icon: { src: "./assets/icons/render.svg", alt: "render" }
    title: Advanced Rendering Support
    details: Compatible with post-processing effects, multiple viewports, and scissor rendering.

head:
  - - meta
    - name: description
      content: Three Viewport Gizmo - A customizable 3D orientation helper for Three.js cameras
  - - meta
    - name: keywords
      content: three.js, webgl, 3d, viewport, gizmo, camera, controls

footer: MIT Licensed | Copyright © 2024 Fennec
---

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  const heroImage = document.querySelector('.VPHero .image-container')!;
  const container = heroImage.parentElement
  heroImage.remove();
  
  const iframe = document.createElement('iframe')
  iframe.src = `${window.location.origin}/three-viewport-gizmo/samples/responsive.html`;
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.frameBorder = '0'
  
  container.appendChild(iframe);
})
</script>
