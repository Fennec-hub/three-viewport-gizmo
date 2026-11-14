export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const REPO = "https://github.com/taucad/three-viewport-gizmo";
export const PACKAGE = "@taulabs/three-viewport-gizmo";

export const GUIDES = [
  { slug: "quickstart", title: "Quickstart" },
  { slug: "webgpu", title: "WebGPU" },
  { slug: "orbit-controls", title: "OrbitControls" },
  { slug: "orbit-controls-events", title: "OrbitControls events" },
  { slug: "hover-events", title: "Hover events" },
  { slug: "standalone", title: "Standalone" },
  { slug: "camera-controls", title: "camera-controls" },
  { slug: "responsive", title: "Responsive" },
  { slug: "multiple-viewports", title: "Multiple viewports" },
  { slug: "post-processing", title: "Post-processing" },
  { slug: "up-axis", title: "Up axis" },
  { slug: "api", title: "API reference" },
] as const;
