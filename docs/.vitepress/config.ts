import { defineConfig } from "vitepress";
import { threeViewportGizmoLocalDistPlugin } from "./plugins/local-dist";

/**
 * Sidebar links for each sphere / cube / rounded-cube family.
 *
 * Appends the URL-toggle WebGPU sample (`examples/webgpu?type=<family>`) to every family.
 */
const examples = (type: "sphere" | "cube" | "rounded-cube") => [
  {
    text: "Orbit controls",
    link: `examples/orbit-controls?type=${type}`,
  },
  {
    text: "Hover Events",
    link: `examples/hover-events?type=${type}`,
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
    text: "Z-up coordinate system",
    link: `examples/z-up?type=${type}`,
  },
  {
    text: "X-up coordinate system",
    link: `examples/x-up?type=${type}`,
  },
  {
    text: "WebGPU sample (header toggle)",
    link: `examples/webgpu?type=${type}`,
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
      { text: "WebGPU", link: "/webgpu" },
      {
        text: "Examples",
        items: [
          { text: "Sphere", link: "examples/orbit-controls?type=sphere" },
          { text: "Cube", link: "examples/orbit-controls?type=cube" },
          { text: "Rounded Cube", link: "examples/orbit-controls?type=rounded-cube" },
          {
            text: "WebGPU (sphere)",
            link: "/examples/webgpu?type=sphere",
          },
          {
            text: "WebGPU (cube)",
            link: "/examples/webgpu?type=cube",
          },
          {
            text: "WebGPU (rounded-cube)",
            link: "/examples/webgpu?type=rounded-cube",
          },
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
      { text: "WebGPU", link: "/webgpu" },
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
    plugins: [threeViewportGizmoLocalDistPlugin()],
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
