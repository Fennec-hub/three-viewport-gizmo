// Runs perf/harness.html in headless Chromium on the gate's GPU and writes perf/out/results.json.
// Usage: node perf/run.mjs [out.json]. Env: PERF_N (calls per scenario, default 3000),
// PERF_FULL=1 adds the canvas-size and MSAA pass-time table; GIZMO_GPU and GIZMO_BACKENDS as in tests/browser/gpu.mjs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';
import { backends, gpu, gpuArgs } from '../tests/browser/gpu.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [outFile = path.join(here, 'out', 'results.json')] = process.argv.slice(2);
const server = await createServer({ configFile: path.join(here, '../tests/browser/vite.config.ts'), server: { port: 0, host: '127.0.0.1' } });
await server.listen();
const base = `http://127.0.0.1:${server.httpServer.address().port}/perf/harness.html`;

const browser = await chromium.launch({ headless: true, args: [...gpuArgs, '--enable-precise-memory-info', '--js-flags=--expose-gc', '--disable-renderer-backgrounding', '--disable-background-timer-throttling'] });
const N = Number(process.env.PERF_N ?? 3000);
const WARM = Math.min(300, N);
const open = async (params) => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
  await page.goto(`${base}?${new URLSearchParams(params)}`);
  await page.waitForFunction('window.READY === true', null, { timeout: 30000 });
  return { page, errors, cdp: await page.context().newCDPSession(page) };
};
const byUrl = (url) => (url.includes('/lib/') ? 'gizmo' : url.includes('/node_modules/three/') ? 'three' : url.includes('/perf/harness.js') ? 'harness' : url ? 'other' : 'native');

/** Bytes allocated per call, attributed to the script that allocated them (sampling heap profiler, GC-collected objects included). */
const heapPhase = async ({ page, cdp }, expr, n) => {
  await page.evaluate('gc()');
  await cdp.send('HeapProfiler.startSampling', { samplingInterval: 64, includeObjectsCollectedByMajorGC: true, includeObjectsCollectedByMinorGC: true });
  await page.evaluate(expr);
  const { profile } = await cdp.send('HeapProfiler.stopSampling');
  const groups = {}, fns = {};
  const walk = (node) => {
    const who = byUrl(node.callFrame.url);
    groups[who] = (groups[who] || 0) + node.selfSize;
    if (node.selfSize) { const k = `${who}:${node.callFrame.functionName || '(anonymous)'}:${node.callFrame.lineNumber + 1}`; fns[k] = (fns[k] || 0) + node.selfSize; }
    node.children.forEach(walk);
  };
  walk(profile.head);
  const per = (v) => Math.round(v / n);
  return { bytesPerCall: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, per(v)])), top: Object.entries(fns).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => [k, per(v)]) };
};
/** CPU self time per call by script (sampling profiler, 100 µs interval). */
const cpuPhase = async ({ page, cdp }, expr, n) => {
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
  await cdp.send('Profiler.start'); await page.evaluate(expr);
  const { profile } = await cdp.send('Profiler.stop');
  const dt = profile.timeDeltas, idOf = new Map(profile.nodes.map((x) => [x.id, x]));
  const groups = {}, fns = {};
  profile.samples.forEach((id, i) => {
    const node = idOf.get(id), who = byUrl(node.callFrame.url), us = dt[i] || 0;
    const name = node.callFrame.functionName;
    if (name === '(idle)' || name === '(program)' && false) return;
    groups[who] = (groups[who] || 0) + us;
    const k = `${who}:${name || '(anonymous)'}:${node.callFrame.lineNumber + 1}`; fns[k] = (fns[k] || 0) + us;
  });
  const per = (v) => Math.round((v / n) * 10) / 10;
  return { usPerCall: Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, per(v)])), top: Object.entries(fns).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => [k, per(v)]) };
};

const results = { meta: { date: new Date().toISOString(), node: process.version, cpu: os.cpus()[0].model, os: `${os.type()} ${os.release()}`, chromium: browser.version(), gpu, N, library: `@taulabs/three-viewport-gizmo ${JSON.parse(fs.readFileSync(path.join(here, '../package.json'))).version} (lib/ from source)` }, runs: {} };
const types = ['sphere', 'cube', 'rounded-cube', 'viewhelper'];
for (const backend of backends) {
  for (const type of types) {
    const key = `${backend}/${type}`; const out = (results.runs[key] = {});
    try {
      // 1. cold page: construction, inventory, first frame, first hover
      let s = await open({ backend, type });
      out.env = await s.page.evaluate('P.env()');
      out.first = await s.page.evaluate('P.first(false)');
      out.errors = s.errors; await s.page.close();
      if (type !== 'viewhelper') { s = await open({ backend, type }); out.firstWarmed = await s.page.evaluate('P.first(true)'); await s.page.close(); }
      // 2. uninstrumented timings
      s = await open({ backend, type });
      const ev = (e) => s.page.evaluate(e);
      const T = (out.timing = {});
      T.construct = await ev('P.construct(30)');
      await ev('P.prepIdle()'); await ev(`P.idle(${WARM})`);
      T.idle = await ev(`P.idle(${N})`); T.emptyPass = await ev(`P.emptyPass(${N})`); T.mainScene = await ev(`P.mainScene(${N})`);
      if (type !== 'viewhelper') {
        await ev('P.prepAnimating()'); await ev(`P.animating(${WARM})`); T.animating = await ev(`P.animating(${N})`);
        await ev('P.prepDragging()'); await ev(`P.dragging(${WARM})`); T.dragging = await ev(`P.dragging(${N})`); await ev('P.endDragging()');
        await ev('P.prepHover()'); await ev(`P.hover(${WARM})`); T.hover = await ev(`P.hover(${N})`);
        await ev('P.prepUpdate()'); await ev(`P.update(${WARM})`); T.update = await ev(`P.update(${N})`);
        out.setCycle = await ev('P.setCycle(20)');
      }
      out.multi = await ev('P.multi(4)');
      await ev('P.prepGpu()'); await ev('P.gpu(50, "gizmo")');
      out.gpu = { syncOnly: await ev('P.gpu(300, "none")'), empty: await ev('P.gpu(300, "empty")'), gizmo: await ev('P.gpu(300, "gizmo")') };
      out.errors.push(...s.errors); await s.page.close();
      // 3. allocation attribution
      s = await open({ backend, type }); const A = (out.alloc = {}); const e2 = (e) => s.page.evaluate(e);
      await e2('P.prepIdle()'); await e2(`P.idle(${WARM})`); A.idle = await heapPhase(s, `P.idle(${N})`, N);
      if (type !== 'viewhelper') {
        await e2('P.prepAnimating()'); await e2(`P.animating(${WARM})`); A.animating = await heapPhase(s, `P.animating(${N})`, N);
        await e2('P.prepDragging()'); await e2(`P.dragging(${WARM})`); A.dragging = await heapPhase(s, `P.dragging(${N})`, N); await e2('P.endDragging()');
        await e2('P.prepHover()'); await e2(`P.hover(${WARM})`); A.hover = await heapPhase(s, `P.hover(${N})`, N);
        await e2('P.prepUpdate()'); await e2(`P.update(${WARM})`); A.update = await heapPhase(s, `P.update(${N})`, N);
      }
      await s.page.close();
      // 4. CPU attribution
      s = await open({ backend, type }); const C = (out.cpu = {}); const e3 = (e) => s.page.evaluate(e);
      await e3('P.prepIdle()'); await e3(`P.idle(${WARM})`); C.idle = await cpuPhase(s, `P.idle(${N})`, N);
      if (type !== 'viewhelper') {
        await e3('P.prepAnimating()'); await e3(`P.animating(${WARM})`); C.animating = await cpuPhase(s, `P.animating(${N})`, N);
        await e3('P.prepHover()'); await e3(`P.hover(${WARM})`); C.hover = await cpuPhase(s, `P.hover(${N})`, N);
      }
      await s.page.close();
    } catch (error) { out.failed = String(error).slice(0, 500); }
    console.log(key, out.failed ?? 'ok', JSON.stringify(out.timing?.idle), out.errors?.slice(0, 3));
  }
}
// GPU-inclusive pass time vs canvas size and MSAA (cube only; report, not budget)
results.canvasScaling = {};
if (process.env.PERF_FULL === '1') for (const backend of backends) for (const [w, h] of [[800, 600], [2560, 1440]]) for (const aa of ['1', '0']) {
  const s = await open({ backend, type: 'cube', w, h, aa });
  await s.page.evaluate('P.prepGpu()'); await s.page.evaluate('P.gpu(50, "gizmo")');
  results.canvasScaling[`${backend}/${w}x${h}/aa=${aa}`] = { syncOnly: await s.page.evaluate('P.gpu(300, "none")'), empty: await s.page.evaluate('P.gpu(300, "empty")'), gizmo: await s.page.evaluate('P.gpu(300, "gizmo")'), cpuIdle: await s.page.evaluate('P.idle(1000)') };
  await s.page.close();
}
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
await browser.close(); await server.close();
console.log('wrote', outFile);
