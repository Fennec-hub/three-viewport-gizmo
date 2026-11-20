export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const REPO = "https://github.com/taucad/three-viewport-gizmo";
export const PACKAGE = "@taulabs/three-viewport-gizmo";

export const GUIDES = [
  { slug: "quickstart", title: "Quickstart" },
  { slug: "migrating", title: "Migrating from 2.x" },
  { slug: "webgpu", title: "WebGPU" },
  { slug: "orbit-controls", title: "OrbitControls" },
  { slug: "orbit-controls-events", title: "OrbitControls events" },
  { slug: "camera-controls", title: "camera-controls" },
  { slug: "controlled-mode", title: "Controlled mode" },
  { slug: "standalone", title: "Standalone" },
  { slug: "hover-events", title: "Hover events" },
  { slug: "styling", title: "Styling and state" },
  { slug: "keyboard", title: "Keyboard and accessibility" },
  { slug: "navigation", title: "Navigation buttons" },
  { slug: "limits", title: "Limits, pole entry and opposite click" },
  { slug: "rounded-cube", title: "Rounded cube and triad" },
  { slug: "render-on-demand", title: "Render on demand and warm-up" },
  { slug: "responsive", title: "Responsive" },
  { slug: "multiple-viewports", title: "Multiple viewports" },
  { slug: "post-processing", title: "Post-processing" },
  { slug: "up-axis", title: "Up axis" },
  { slug: "api", title: "API reference" },
] as const;
