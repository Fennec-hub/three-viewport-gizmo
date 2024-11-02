import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/three-viewport-gizmo/",
  root: "./live",
  build: {
    outDir: "../dist/live",
  },
  server: {
    open: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "live/src"),
      "@lib": resolve(__dirname, "lib"),
    },
  },
});
