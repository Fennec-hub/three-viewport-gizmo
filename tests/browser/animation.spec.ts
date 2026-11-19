import { expect, test } from "@playwright/test";

test("cube clicks animate twice around the controls target without Clock warnings", async ({ page }, testInfo) => {
  const diagnostics: string[] = [];
  page.on("pageerror", error => diagnostics.push(error.message));
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) diagnostics.push(message.text());
  });
  await page.goto("http://127.0.0.1:4281/tests/browser/");
  await expect(page.getByRole("status")).toHaveText("Renderer ready");
  const radius = await page.evaluate(() => {
    const f = (window as any).fixture;
    return f.camera.position.distanceTo(f.target);
  });
  // Read-only projection locates each actual cube face; only pointer events select it.
  for (const [axis, count] of [["x", 1], ["y", 2]] as const) {
    if (count === 2) {
      // Reveal the next face through the consumer's ordinary OrbitControls interaction.
      await page.mouse.move(240, 200);
      await page.mouse.down();
      await page.mouse.move(400, 260, { steps: 12 });
      await page.mouse.up();
      await expect.poll(() => page.evaluate(() => {
        const f = (window as any).fixture;
        return f.camera.position.clone().sub(f.target).normalize().y;
      })).toBeGreaterThan(0.1);
    }
    const point = await page.evaluate(axis => {
      const f = (window as any).fixture;
      const vector = f.gizmo._intersections.find((object: any) => object.position[axis] > 0 && object.position.length() === object.position[axis]).position.clone();
      const projected = vector.project(f.gizmo._camera);
      const rect = document.querySelector("#gizmo")!.getBoundingClientRect();
      return { x: rect.left + (projected.x + 1) * rect.width / 2, y: rect.top + (1 - projected.y) * rect.height / 2 };
    }, axis);
    await page.mouse.move(point.x, point.y);
    await expect(page.locator("#gizmo")).toHaveCSS("cursor", "pointer");
    await expect.poll(() => page.evaluate(axis => {
      const focus = (window as any).fixture.gizmo._focus;
      return focus?.position.clone().normalize().toArray();
    }, axis)).toEqual(axis === "x" ? [1, 0, 0] : [0, 1, 0]);
    await page.mouse.click(point.x, point.y);
    await expect.poll(() => page.evaluate(() => (window as any).fixture.events.end)).toBe(count);
    const settled = await page.evaluate(() => {
      const f = (window as any).fixture;
      return { direction: f.camera.position.clone().sub(f.target).normalize().toArray(), radius: f.camera.position.distanceTo(f.target), enabled: f.controls.enabled, starts: f.events.start };
    });
    expect(settled.direction[axis === "x" ? 0 : 1]).toBeCloseTo(1, 5);
    expect(settled.radius).toBeCloseTo(radius, 8);
    expect(settled.enabled).toBe(true);
    // Pointer-down and the ensuing orientation flight each emit the existing start event.
    expect(settled.starts).toBe(count * 2);
  }
  await page.screenshot({ path: testInfo.outputPath("settled-cube.png") });
  expect(diagnostics).toEqual([]);
});
