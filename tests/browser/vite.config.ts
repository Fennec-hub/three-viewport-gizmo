import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = resolve(__dirname, "../..");

/**
 * Serves the library from source for the browser gate and the perf harness.
 * three.js is not pre-bundled, so `three`, `three/webgpu` and `three/addons/*`
 * all resolve to the one copy in `node_modules` and share `three.core.js`.
 */
export default defineConfig({
  root,
  logLevel: "warn",
  resolve: { alias: { "@lib": resolve(root, "lib") } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: {
    strictPort: true,
    // Cross-origin isolation gives performance.now() 5 µs resolution.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
