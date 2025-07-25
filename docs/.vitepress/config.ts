import { defineConfig } from "vitepress";

const examples = (type: "sphere" | "cube" | "rounded-cube") => [
  {
    text: "Orbit controls",
    link: `examples/orbit-controls?type=${type}`,
  },
  {
    text: "OrbitControls Events",
    link: `examples/orbit-controls-events?type=${type}`,
  },
  { text: "Standalone", link: `examples/standalone?type=${type}` },
  { text: "Post processing", link: `examples/post-processing?type=${type}` },
  {
    text: "Yomotsu camera controls",
    link: `examples/yomotsu-camera-controls?type=${type}`,
  },
  { text: "Responsive", link: `examples/responsive?type=${type}` },
  { text: "Resizable grid", link: `examples/resizable-grid?type=${type}` },
  {
    text: "Multiple elements",
    link: `examples/multiple-elements?type=${type}`,
  },
  {
    text: "Z-UP",
    link: `examples/z-up?type=${type}`,
  },
];

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/three-viewport-gizmo/",
  head: [["link", { rel: "icon", href: "./assets/three-viewport-gizmo.svg" }]],
  title: "Three Viewport Gizmo",
  description: "A three.js customizable 3D view helper for any camera setup",
  appearance: "force-dark",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: "./assets/three-viewport-gizmo.svg",
    nav: [
      { text: "API", link: "/api" },
      {
        text: "Examples",
        items: [
          { text: "Sphere", link: "examples/orbit-controls?type=sphere" },
          { text: "Cube", link: "examples/orbit-controls?type=cube" },
          { text: "Rounded Cube", link: "examples/orbit-controls?type=rounded-cube" },
        ],
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
        items: [
          { text: "Sphere", items: examples("sphere"), collapsed: false },
          { text: "Cube", items: examples("cube"), collapsed: false },
          { text: "Rounded Cube", items: examples("rounded-cube"), collapsed: false },
        ],
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
  vite: {
    build: {
      commonjsOptions: {
        include: [/oh-vue-icons/],
      },
    },
    optimizeDeps: {
      include: ["oh-vue-icons"],
    },
    ssr: {
      noExternal: ["oh-vue-icons"],
    },
  },
});
