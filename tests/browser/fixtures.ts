import { test as base, chromium, expect, type Page, type TestInfo } from "@playwright/test";
import { gpuArgs } from "./gpu.mjs";

export type Backend = "webgl" | "webgpu";
export type GizmoType = "sphere" | "cube" | "rounded-cube";

export type Harness = {
  page: Page;
  backend: Backend;
  /** Console errors and warnings, and uncaught page errors, since the page opened. */
  errors: string[];
  /** Evaluates `P.<expression>` in the harness page. */
  P: <T = unknown>(expression: string) => Promise<T>;
};

/** Records a measured value on the test and prints it, so CI logs carry the baseline numbers. */
export const measured = (info: TestInfo, value: unknown) => {
  const description = JSON.stringify(value);
  info.annotations.push({ type: "measured", description });
  console.log(`[${info.project.name}] ${info.title}: ${description}`);
};

/** Opens `perf/harness.html` for the project's backend and waits for the harness. */
export const test = base.extend<{ open: (params?: Record<string, string>) => Promise<Harness> }>({
  // WebGPU pages get a browser of their own: on Linux SwiftShader a page that submits a destroyed
  // buffer (P Finding 1) leaves the browser's WebGPU instance unusable for every later page.
  page: async ({ page, baseURL, viewport, hasTouch }, use, info) => {
    if (info.project.name !== "webgpu") return use(page);
    const browser = await chromium.launch({ args: gpuArgs });
    const own = await (await browser.newContext({ baseURL, viewport, hasTouch })).newPage();
    await use(own);
    await browser.close();
  },
  open: async ({ page }, use, testInfo) => {
    const backend = testInfo.project.name as Backend;
    await use(async (params = {}) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (process.env.GATE_VERBOSE) console.log(`[page ${m.type()}] ${m.text()}`);
        // Driver performance notes (ANGLE on SwiftShader: "GPU stall due to ReadPixels") come from the probes' readback, not the library.
        if ((m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message")) errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(`/perf/harness.html?${new URLSearchParams({ backend, type: "cube", ...params })}`);
      await page.waitForFunction("window.READY === true", null, { timeout: 30_000 });
      testInfo.annotations.push({ type: "adapter", description: await page.evaluate<string>("P.env().gpu") });
      if (backend === "webgpu") {
        const isWebGPU = await page.evaluate("P.env().webgpuBackend");
        expect(isWebGPU, "WebGPURenderer fell back to WebGL: no WebGPU adapter").toBe(true);
      }
      return { page, backend, errors, P: (expression) => page.evaluate(`P.${expression}`) };
    });
  },
});

export { expect };
