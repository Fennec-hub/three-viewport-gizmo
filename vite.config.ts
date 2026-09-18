import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "./lib/ViewportGizmo",
      name: "ThreeViewportGizmo",
    },
    rollupOptions: {
      // Externalize every `three` subpath (`three`, `three/webgpu`, `three/addons/...`,
      // `three/src/...`, etc.) so the consumer's module graph supplies them. Inlining
      // them produced cross-graph `Line2NodeMaterial` / `Line2` instances that
      // `WebGPURenderer` (importmapped from a different copy of three) refused to
      // render and that confused WebGL's `LineMaterial` resolver -- see ../docs/webgpu.md.
      external: (id) => id === "three" || id.startsWith("three/"),
      output: {
        // UMD users only see the bare `three` global; subpath imports (notably
        // `three/webgpu`) are unsupported in UMD and Rollup will warn -- ESM
        // (importmap / bundler) is the supported path for WebGPU.
        globals: (id) => (id === "three" ? "THREE" : "THREE"),
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      exclude: ["live"],
    }),
  ],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "live/src"),
      "@lib": resolve(__dirname, "lib"),
      "@docs": resolve(__dirname, "docs"),
    },
  },
});
