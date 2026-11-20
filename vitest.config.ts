import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["lib/**/*.test.ts", "lib/__tests__/**/*.test.ts"],
    setupFiles: ["lib/__tests__/setup.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "lib"),
    },
  },
});
