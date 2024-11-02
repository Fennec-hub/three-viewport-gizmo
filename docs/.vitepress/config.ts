import { defineConfig } from "vitepress";

const exampleItems = [
  {
    text: "Orbit controls",
    link: "examples/orbit-controls",
  },
  {
    text: "OrbitControls Events",
    link: "examples/orbit-controls-events",
  },
  { text: "Standalone", link: "examples/standalone" },
  { text: "Post processing", link: "examples/post-processing" },
  {
    text: "Yomotsu camera controls",
    link: "examples/yomotsu-camera-controls",
  },
  { text: "Responsive", link: "examples/responsive" },
  { text: "Resizable grid", link: "examples/resizable-grid" },
  {
    text: "Multiple elements",
    link: "examples/multiple-elements",
  },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/three-viewport-gizmo/",
  head: [["link", { rel: "icon", href: "./assets/three-viewport-gizmo.svg" }]],
  title: "Three Viewport Gizmo",
  description:
    "A three.js completely customizable 3D view helper for any camera setup",
  appearance: "force-dark",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "./assets/three-viewport-gizmo.svg",
    nav: [
      { text: "API", link: "/api" },
      {
        text: "Examples",
        items: exampleItems,
      },
      {
        text: "Customize Your Gizmo",
        link: "/custom",
        target: "_blank",
      },
    ],

    sidebar: [
      { text: "Quickstart", link: "/quickstart" },
      { text: "API", link: "/api" },
      {
        text: "Examples",
        items: exampleItems,
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/fennec-hub/three-viewport-gizmo",
      },
      {
        icon: "x",
        link: "https://x.com/_Fennec_Xyz",
      },
    ],
  },
});
