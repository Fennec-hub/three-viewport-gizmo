import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";
import { backends, gpu, gpuArgs } from "./gpu.mjs";

const port = Number(process.env.GIZMO_GATE_PORT ?? 4179);
/** The built docs site (`:docs` writes `site/out`), served for the screenshot matrix on the next port. */
export const sitePort = port + 1;
const site = existsSync(new URL("../../site/out/matrix/index.html", import.meta.url));

export default defineConfig({
  testDir: "../..",
  outputDir: "../../test-results/browser",
  // The JSON report feeds the CI job summary: perf/check.mjs reports the budget's test-browser rows from it.
  reporter: [["list"], ...(process.env.CI ? ([["github"]] as const) : []), ["json", { outputFile: "../../perf/out/browser.json" }]],
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: gpuArgs },
  },
  // Lanes outside tests/browser add cases under lib/__tests__/browser (I2, S1); those specs pick their
  // own backend, so they run once, in the first project.
  projects: backends.map((name, i) => ({
    name,
    metadata: { gpu },
    testMatch: i === 0 ? ["tests/browser/**/*.spec.ts", "lib/__tests__/browser/**/*.spec.ts"] : "tests/browser/**/*.spec.ts",
  })),
  // The screenshot matrix's references are per GPU and platform: `metal-darwin` (reference GPU), `swiftshader-linux` (CI).
  snapshotPathTemplate: `{testDir}/tests/browser/__screenshots__/${gpu}-{platform}/{projectName}/{arg}{ext}`,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.002 } },
  webServer: [
    {
      command: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${port}`,
      cwd: "../..",
      url: `http://127.0.0.1:${port}/perf/harness.html`,
      reuseExistingServer: !process.env.CI,
    },
    ...(site
      ? [
          {
            command: `npx vite preview --config tests/browser/vite.config.ts --outDir site/out --base /three-viewport-gizmo/ --host 127.0.0.1 --port ${sitePort} --strictPort`,
            cwd: "../..",
            url: `http://127.0.0.1:${sitePort}/three-viewport-gizmo/matrix/`,
            reuseExistingServer: !process.env.CI,
          },
        ]
      : []),
  ],
});
