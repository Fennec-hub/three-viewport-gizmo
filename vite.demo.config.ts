import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/three-viewport-gizmo/",
  root: "./demo",
  build: {
    outDir: "../dist/demo",
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "demo/src"),
      "@lib": resolve(__dirname, "lib"),
    },
  },
});
