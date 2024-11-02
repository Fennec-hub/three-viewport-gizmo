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
      external: ["three"],
      output: {
        globals: { three: "THREE" },
      },
    },
    sourcemap: true,
  },
  plugins: [
    dts({
      insertTypesEntry: true,
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
