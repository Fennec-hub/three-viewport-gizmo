/**
 * Screenshot matrix (R17): gizmo type × six up axes × two backends (the backend is the project), on the built docs
 * site's Matrix page (`/matrix/?type=&backend=&up=`, D1), found by role and name. Each cell waits for its stage to
 * leave `aria-busy` and compares against the committed reference for the platform.
 */
import { existsSync } from "node:fs";
import { expect, test } from "./fixtures";
import { sitePort } from "./playwright.config";

const types = ["sphere", "cube", "rounded-cube"] as const;
const ups = ["+x", "-x", "+y", "-y", "+z", "-z"] as const;
const renderer = { webgl: "WebGL", webgpu: "WebGPU" } as const;
const built = existsSync(new URL("../../site/out/matrix/index.html", import.meta.url));

for (const type of types) {
  for (const up of ups) {
    test(`matrix ${type} up ${up}`, async ({ page }, info) => {
      test.skip(!built && !process.env.CI, "Build the docs site first (:docs writes site/out)");
      expect(built, "CI builds the docs site before the browser gate").toBe(true);
      const backend = info.project.name as keyof typeof renderer;
      const errors: string[] = [];
      page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && !m.text().includes("GL Driver Message") && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(String(e)));
      const query = new URLSearchParams({ type, backend, up });
      await page.goto(`http://127.0.0.1:${sitePort}/three-viewport-gizmo/matrix/?${query}`);
      const axis = `${up[0] === "-" ? "−" : "+"}${up[1].toUpperCase()}`;
      const stage = page.getByRole("group", { name: `${renderer[backend]}, ${axis} up, ${type} gizmo` });
      await expect(stage).toHaveAttribute("aria-busy", "false", { timeout: 30_000 });
      // The stage's own notes sit beside its group (Next's empty route announcer is an alert too).
      const notes = stage.locator("..");
      await expect(notes.getByRole("alert")).toHaveCount(0);
      // WebGPU cells must draw through WebGPU, not the renderer's WebGL 2 fallback.
      await expect(notes.getByText("WebGPU is unavailable")).toHaveCount(0);
      await page.waitForTimeout(300);
      await expect(stage).toHaveScreenshot(`${type}-up-${up[0] === "-" ? "neg" : "pos"}${up[1]}.png`);
      expect(errors).toEqual([]);
    });
  }
}
