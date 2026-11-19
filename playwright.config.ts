import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  use: { channel: process.env.PW_BROWSER_CHANNEL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 720 } } },
    { name: "compact", use: { viewport: { width: 640, height: 480 } } },
  ],
  webServer: {
    command: "npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4281 --strictPort",
    url: "http://127.0.0.1:4281/tests/browser/",
    reuseExistingServer: false,
  },
});
