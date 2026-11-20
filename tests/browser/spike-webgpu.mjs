// D16 spike: which Chromium launch can present a WebGPU canvas and keep its device on this host
// (Linux CI lost the device on the first present with the Vulkan feature alone). Usage: node tests/browser/spike-webgpu.mjs
import http from 'node:http';
import { chromium } from '@playwright/test';

const server = http.createServer((_, res) => { res.writeHead(200, { 'content-type': 'text/html' }); res.end('<!doctype html>ok'); });
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;
const base = ['--enable-unsafe-webgpu', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--use-webgpu-adapter=swiftshader'];
const variants = {
  'Vulkan feature': { args: [...base, '--enable-features=Vulkan'] },
  'no Vulkan': { args: base },
  'vulkan=swiftshader': { args: [...base, '--use-vulkan=swiftshader', '--enable-features=Vulkan'] },
  'vulkan=swiftshader, no surface': { args: [...base, '--use-vulkan=swiftshader', '--enable-features=Vulkan', '--disable-vulkan-surface'] },
  'new headless, vulkan=swiftshader': { channel: 'chromium', args: [...base, '--use-vulkan=swiftshader', '--enable-features=Vulkan'] },
};
/** Presents a cleared WebGPU canvas for a few frames, then needs the device for async work. */
const probe = async () => {
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) return 'no adapter';
  const device = await adapter.requestDevice();
  let lost = null; device.lost.then((i) => { lost = i.message; });
  const canvas = document.body.appendChild(document.createElement('canvas'));
  const context = canvas.getContext('webgpu');
  context.configure({ device, format: navigator.gpu.getPreferredCanvasFormat(), usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
  try {
    for (let i = 0; i < 3; i++) {
      const encoder = device.createCommandEncoder();
      encoder.beginRenderPass({ colorAttachments: [{ view: context.getCurrentTexture().createView(), loadOp: 'clear', storeOp: 'store', clearValue: [0, 1, 0, 1] }] }).end();
      device.queue.submit([encoder.finish()]);
      await new Promise(requestAnimationFrame);
    }
    await device.queue.onSubmittedWorkDone();
    const b = device.createBuffer({ size: 16, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    await b.mapAsync(GPUMapMode.READ);
    return lost ? `lost: ${lost}` : `ok (${adapter.info.vendor} ${adapter.info.architecture})`;
  } catch (e) { return `${e.message}${lost ? ` (lost: ${lost})` : ''}`; }
};
for (const [name, opts] of Object.entries(variants)) {
    let out;
    try {
      const browser = await chromium.launch({ ...opts, args: opts.args });
      const page = await browser.newPage();
      await page.goto(url);
      out = await page.evaluate(probe);
      await browser.close();
    } catch (e) { out = `launch failed: ${String(e).split('\n')[0]}`; }
    console.log(`D16 spike | ${name} | ${out}`);
}
server.close();
