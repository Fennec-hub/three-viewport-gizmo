import { defineConfig } from "vite";
import { resolve } from "node:path";

// Run the same public pointer journey against the peer minimum and modern Three.js.
const three = resolve("node_modules", process.env.TEST_THREE_PACKAGE ?? "three");
export default defineConfig({
  optimizeDeps: { entries: ["tests/browser/index.html"] },
  resolve: {
    alias: [
      { find: /^three$/, replacement: resolve(three, "build/three.module.js") },
      { find: "three/addons", replacement: resolve(three, "examples/jsm") },
      { find: "three", replacement: three },
    ],
  },
});
