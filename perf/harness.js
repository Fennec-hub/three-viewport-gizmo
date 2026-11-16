// Measurement and browser-gate harness for @taulabs/three-viewport-gizmo, served from source by
// tests/browser/vite.config.ts. Moved in from the Tau performance audit (2.3.0 @ bed9a3c).
const q = new URLSearchParams(location.search);
const backend = q.get('backend') || 'webgl';
const type = q.get('type') || 'cube';
const W = +(q.get('w') || 800), H = +(q.get('h') || 600);
const aa = q.get('aa') !== '0';
const THREE = backend === 'webgpu' ? await import('three/webgpu') : await import('three');
const { ViewportGizmo } = await import('@lib/index');
const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
const { ViewHelper } = await import('three/addons/helpers/ViewHelper.js');

const wrap = document.getElementById('wrap');
wrap.style.width = W + 'px'; wrap.style.height = H + 'px';
const renderer = backend === 'webgpu' ? new THREE.WebGPURenderer({ antialias: aa }) : new THREE.WebGLRenderer({ antialias: aa });
renderer.setPixelRatio(1); renderer.setSize(W, H); wrap.appendChild(renderer.domElement);
if (backend === 'webgpu') { await renderer.init(); renderer.backend.device.lost.then((i) => console.error(`WebGPU device lost: ${i.reason} ${i.message}`)); }
renderer.info.autoReset = false;

const scene = new THREE.Scene();
scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ color: 0x4488cc })));
const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
camera.position.set(3, 2, 4); camera.lookAt(0, 0, 0);
const emptyScene = new THREE.Scene();
const emptyCamera = new THREE.PerspectiveCamera();

const now = () => performance.now();
const sync = async () => {
  if (backend === 'webgpu' && renderer.backend.device) await renderer.backend.device.queue.onSubmittedWorkDone();
  else renderer.getContext().finish();
};
const summarize = (a) => {
  const s = [...a].sort((x, y) => x - y), n = s.length;
  const r = (v) => Math.round(v * 10000) / 10000;
  return { n, mean: r(s.reduce((x, y) => x + y, 0) / n), p50: r(s[n >> 1]), p95: r(s[Math.floor(n * 0.95)]), max: r(s[n - 1]) };
};
const snap = () => {
  const i = renderer.info, o = { memory: { ...i.memory } };
  o.draws = backend === 'webgl' ? i.render.calls : i.render.drawCalls;
  o.triangles = i.render.triangles; o.lines = i.render.lines;
  if (backend === 'webgl') o.programs = i.programs.length;
  else if (renderer._pipelines) {
    const p = renderer._pipelines;
    o.pipelines = p.caches.size; o.vertexShaders = p.programs.vertex.size; o.fragmentShaders = p.programs.fragment.size;
  }
  return o;
};
const make = (opts = {}) => {
  if (type === 'viewhelper') {
    const h = new ViewHelper(camera, renderer.domElement);
    h.render2 = () => h.render(renderer);
    return h;
  }
  // `up` is a signed axis such as `+z`, `-x` or `y`; 3.0 takes the label up as a vector.
  const up = q.get('up');
  const axis = up && new THREE.Vector3().setComponent('xyz'.indexOf(up.at(-1)), up.startsWith('-') ? -1 : 1);
  const triad = q.get('triad') === '1' ? { triad: { enabled: true } } : {};
  const g = new ViewportGizmo(camera, renderer, { type, container: wrap, ...(axis ? { up: axis } : {}), ...triad, ...opts });
  g.render2 = () => g.render();
  return g;
};
const rootOf = (g) => g.root ?? g;
const elementOf = (g) => g.domElement;
const inventory = (g) => {
  const geos = new Set(), mats = new Set(), texs = new Set(), srcs = new Set();
  let objects = 0, drawables = 0, tris = 0, atlas = null;
  const addMat = (m) => { if (!m) return; mats.add(m); if (m.map) { texs.add(m.map); srcs.add(m.map.source); const im = m.map.image; if (im && !atlas) atlas = { width: im.width, height: im.height, generateMipmaps: m.map.generateMipmaps, minFilter: m.map.minFilter, anisotropy: m.map.anisotropy, colorSpace: m.map.colorSpace }; } };
  rootOf(g).traverse((o) => {
    objects++;
    if (o.geometry) {
      drawables++; geos.add(o.geometry);
      if (o.visible && (o.isMesh || o.isSprite)) { const ge = o.geometry; tris += (ge.index ? ge.index.count : ge.attributes.position.count) / 3 * (ge.isInstancedBufferGeometry ? ge.instanceCount : 1); }
    }
    addMat(o.material); addMat(o.userData?.idleMaterial); addMat(o.userData?.hoverMaterial);
  });
  const flags = {};
  rootOf(g).traverse((o) => { if (!o.geometry) return; const m = o.material; const k = `${o.type}|${m.type}|transparent=${m.transparent}|depthTest=${m.depthTest}|depthWrite=${m.depthWrite}|toneMapped=${m.toneMapped}|side=${m.side}|renderOrder=${o.renderOrder}|frustumCulled=${o.frustumCulled}|matrixAutoUpdate=${o.matrixAutoUpdate}`; flags[k] = (flags[k] || 0) + 1; });
  return { objects, drawables, geometries: geos.size, materials: mats.size, textureObjects: texs.size, textureSources: srcs.size, sceneTriangles: tris, atlas, flags };
};

let g = null;
/** A structural set(): a new `onMaterial` rebuilds the scene with the same look (3.0 skips a set() that changes nothing). */
const rebuild = (x) => x.set({ onMaterial: (material) => material });
const fresh = (opts) => { if (g) g.dispose(); g = make(opts); for (let i = 0; i < 30; i++) g.render2(); return g; };
const centre = () => { const r = elementOf(g).getBoundingClientRect(); return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, size: r.width }; };
const loop = async (n, body) => {
  const a = new Float64Array(n);
  for (let i = 0; i < n; i++) { const t = now(); body(i); a[i] = now() - t; if (i % 100 === 99) await sync(); }
  return summarize(a);
};

window.P = {
  env: () => ({ backend, type, W, H, aa, dpr: devicePixelRatio, isolated: crossOriginIsolated, rev: THREE.REVISION, webgpuBackend: backend === 'webgpu' ? !!renderer.backend.isWebGPUBackend : null, samples: renderer.samples ?? null, ua: navigator.userAgent, gpu: (() => { try { if (backend === 'webgl') { const gl = renderer.getContext(); const e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : null; } const inf = renderer.backend.device?.adapterInfo; return inf ? `${inf.vendor} ${inf.architecture} ${inf.description}` : null; } catch (e) { return String(e); } })() }),

  async first(warm) {
    renderer.render(scene, camera); await sync();
    const base = snap();
    let t = now(); g = make(); const constructMs = now() - t;
    const inv = inventory(g);
    let compileMs = null;
    if (warm && type !== 'viewhelper') { t = now(); await g.compile(); compileMs = now() - t; }
    const afterCompile = snap();
    renderer.info.reset(); t = now(); g.render2(); const firstRenderCpuMs = now() - t; await sync(); const firstRenderSyncedMs = now() - t;
    const afterFirst = snap();
    renderer.info.reset(); t = now(); g.render2(); const secondRenderCpuMs = now() - t; await sync();
    const steady = snap();
    let hover = null;
    if (type !== 'viewhelper') {
      const { cx, cy, size } = centre(); let hit = false;
      g.addEventListener('hoverchange', (e) => { if (e.hovered) hit = true; });
      for (let i = 0; i < 400 && !hit; i++) { const a = i * 0.37, r = (i / 400) * size * 0.45; elementOf(g).dispatchEvent(new PointerEvent('pointermove', { clientX: cx + r * Math.cos(a), clientY: cy + r * Math.sin(a) })); }
      t = now(); g.render2(); const firstHoverRenderCpuMs = now() - t; await sync(); const firstHoverRenderSyncedMs = now() - t;
      t = now(); g.render2(); const secondHoverRenderCpuMs = now() - t; await sync();
      hover = { hit, firstHoverRenderCpuMs, firstHoverRenderSyncedMs, secondHoverRenderCpuMs, after: snap() };
    }
    return { base, constructMs, compileMs, afterCompile, inventory: inv, firstRenderCpuMs, firstRenderSyncedMs, secondRenderCpuMs, afterFirst, steady, hover };
  },

  async construct(n) { // construct + dispose without rendering
    const a = [];
    for (let i = 0; i < n; i++) { const t = now(); const x = make(); a.push(now() - t); x.dispose(); }
    return summarize(a);
  },

  prepIdle() { fresh(); },
  idle: (n) => loop(n, () => g.render2()),
  mainScene: (n) => loop(n, () => renderer.render(scene, camera)),
  emptyPass: (n) => loop(n, () => { // an empty three pass in the same 128px rect, same clear flags
    const ac = renderer.autoClear, acc = renderer.autoClearColor;
    renderer.autoClear = true; renderer.autoClearColor = false;
    renderer.setViewport(W - 128, 0, 128, 128); renderer.render(emptyScene, emptyCamera); renderer.setViewport(0, 0, W, H);
    renderer.autoClear = ac; renderer.autoClearColor = acc;
  }),

  prepAnimating() { fresh(); g.set({ speed: 1e-6, animated: true }); g.lookFrom(new THREE.Vector3(1, 0.2, 0.1)); let c = 0; g.addEventListener('change', () => c++); g.__changes = () => c; },
  animating: (n) => loop(n, () => g.render2()),

  prepDragging() { fresh(); const { cx, cy } = centre(); elementOf(g).dispatchEvent(new PointerEvent('pointerdown', { clientX: cx, clientY: cy, pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, bubbles: true })); },
  async dragging(n) {
    const { cx, cy } = centre(); const h = new Float64Array(n), r = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      const e = new PointerEvent('pointermove', { clientX: cx + 20 + (i % 40), clientY: cy + 15 + ((i >> 3) % 10), pointerId: 1, pointerType: 'mouse', isPrimary: true, bubbles: true });
      let t = now(); elementOf(g).dispatchEvent(e); h[i] = now() - t;
      t = now(); g.render2(); r[i] = now() - t;
      if (i % 100 === 99) await sync();
    }
    return { handler: summarize(h), render: summarize(r) };
  },
  endDragging() { elementOf(g).dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, pointerType: 'mouse', isPrimary: true, button: 0, bubbles: true })); },

  prepHover() { fresh(); let c = 0; g.addEventListener('hoverchange', () => c++); g.__hc = () => c; },
  async hover(n) {
    const { cx, cy, size } = centre(); const h = new Float64Array(n), r = new Float64Array(n); const c0 = g.__hc();
    for (let i = 0; i < n; i++) {
      const a = i * 0.11, rad = size * (0.1 + 0.35 * ((i % 97) / 97));
      const e = new PointerEvent('pointermove', { clientX: cx + rad * Math.cos(a), clientY: cy + rad * Math.sin(a), pointerId: 1, pointerType: 'mouse', isPrimary: true });
      let t = now(); elementOf(g).dispatchEvent(e); h[i] = now() - t;
      t = now(); g.render2(); r[i] = now() - t;
      if (i % 100 === 99) await sync();
    }
    return { handler: summarize(h), render: summarize(r), hoverchanges: g.__hc() - c0, after: snap() };
  },

  prepUpdate() { fresh(); },
  update: (n) => loop(n, () => g.update()),

  async setCycle(n) {
    fresh(); await sync(); const before = snap(); const s = [], r = [];
    for (let i = 0; i < n; i++) { let t = now(); rebuild(g); s.push(now() - t); t = now(); g.render2(); r.push(now() - t); await sync(); }
    const afterSets = snap();
    g.dispose(); g = null; renderer.render(scene, camera); await sync();
    // three's Sprite geometry is module-level and shared by every Sprite: the sphere's sprites upload it, nobody may
    // dispose it (I6; 2.3.0 did, P Finding 1), so it is not the gizmo's to free.
    const afterDispose = snap();
    if (type === 'sphere') afterDispose.memory.geometries -= 1;
    return { set: summarize(s), firstRenderAfterSet: summarize(r), before, afterSets, afterDispose };
  },

  async multi(k) {
    if (g) { g.dispose(); g = null; }
    renderer.render(scene, camera); await sync(); const base = snap(); const gs = [];
    const out = [];
    for (let i = 0; i < k; i++) { const x = make(); gs.push(x); const t = now(); x.render2(); const ms = now() - t; await sync(); out.push({ firstRenderCpuMs: ms, ...snap() }); }
    gs.forEach((x) => x.dispose());
    return { base, out };
  },

  prepGpu() { fresh(); },
  async gpu(n, which) { // CPU submit + wait for the GPU to finish, per pass
    const a = new Float64Array(n);
    for (let i = 0; i < n; i++) { const t = now(); if (which === 'gizmo') g.render2(); else if (which === 'empty') { const ac = renderer.autoClear, acc = renderer.autoClearColor; renderer.autoClear = true; renderer.autoClearColor = false; renderer.setViewport(W - 128, 0, 128, 128); renderer.render(emptyScene, emptyCamera); renderer.setViewport(0, 0, W, H); renderer.autoClear = ac; renderer.autoClearColor = acc; } await sync(); a[i] = now() - t; }
    return summarize(a);
  },
};

// --- targeted probes ---
const c2d = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
/**
 * RGBA pixels of the canvas rectangle (x, y, w, h), read in the task that rendered it. WebGPU copies the
 * canvas texture to a buffer: on Linux SwiftShader, drawing a WebGPU canvas into a 2D canvas reads black.
 */
const readPixels = async (x, y, w, h) => {
  if (backend === 'webgl') { c2d.canvas.width = W; c2d.canvas.height = H; c2d.drawImage(renderer.domElement, 0, 0); return c2d.getImageData(x, y, w, h).data; }
  const { device, context } = renderer.backend;
  const texture = context.getCurrentTexture();
  const bytesPerRow = Math.ceil((w * 4) / 256) * 256;
  const buffer = device.createBuffer({ size: bytesPerRow * h, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
  const encoder = device.createCommandEncoder();
  encoder.copyTextureToBuffer({ texture, origin: { x, y } }, { buffer, bytesPerRow }, [w, h]);
  device.queue.submit([encoder.finish()]);
  await buffer.mapAsync(GPUMapMode.READ);
  const src = new Uint8Array(buffer.getMappedRange()), out = new Uint8ClampedArray(w * h * 4), bgra = texture.format.startsWith('bgra');
  for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
    const i = row * bytesPerRow + col * 4, o = (row * w + col) * 4;
    out[o] = src[i + (bgra ? 2 : 0)]; out[o + 1] = src[i + 1]; out[o + 2] = src[i + (bgra ? 0 : 2)]; out[o + 3] = src[i + 3];
  }
  buffer.unmap(); buffer.destroy();
  return out;
};
Object.assign(window.P, {
  /** Does the gizmo's depth clear reach outside its rectangle? A far red quad drawn after it must stay hidden behind the box. */
  async depthProbe(scissor) {
    if (!g) g = make();
    const far = new THREE.Scene();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    quad.position.copy(camera.position).multiplyScalar(-1); quad.lookAt(camera.position); far.add(quad);
    const run = async (withGizmo) => {
      renderer.setScissorTest(!!scissor); if (scissor) renderer.setScissor(0, 0, W, H);
      renderer.autoClear = true; renderer.render(scene, camera);
      if (withGizmo) { g.update(); g.render2(); }
      renderer.autoClear = false; renderer.render(far, camera); renderer.autoClear = true;
      const read = readPixels(W / 2, H / 2, 1, 1); renderer.setScissorTest(false);
      const d = await read;
      return [d[0], d[1], d[2]];
    };
    return { centreWithoutGizmo: await run(false), centreWithGizmo: await run(true) };
  },
  /** Lit pixels inside the gizmo's rectangle. */
  async gizmoPixels(x) {
    const o = x || g; renderer.autoClear = true; renderer.render(scene, camera); o.render2();
    const r = elementOf(o).getBoundingClientRect(); const d = await readPixels(r.left, r.top, r.width, r.height); let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 8 || d[i + 1] > 8 || d[i + 2] > 8) n++;
    return n;
  },
  step(name) {
    if (name === 'make') { g = make(); }
    if (name === 'set') { rebuild(g); }
    if (name === 'second') { window.g2 = make({ placement: 'bottom-left' }); window.g2.render2(); }
    if (name === 'disposeSecond') { window.g2.dispose(); }
    if (name === 'remake') { g.dispose(); g = make(); }
    return true;
  },
  render3: async () => { for (let i = 0; i < 3; i++) { renderer.render(scene, camera); g.render2(); await sync(); } return P.gizmoPixels(); },
});

// --- browser gate (tests/browser) ---
const events = { start: 0, change: 0, end: 0 };
let demandFrames = 0;
let demandEndFrame = null;
Object.assign(window.P, {
  /** A gizmo that the gate drives with real input, an OrbitControls on the canvas, and event counts. */
  gate(position) {
    if (position) { camera.position.fromArray(position); camera.lookAt(0, 0, 0); }
    g = make();
    const controls = new OrbitControls(camera, renderer.domElement);
    g.attachControls(controls);
    for (const type of Object.keys(events)) g.addEventListener(type, () => events[type]++);
    const frame = () => { renderer.render(scene, camera); g.render2(); requestAnimationFrame(frame); };
    frame();
    return true;
  },
  /** A render-on-demand host: no loop; one frame per `invalidate`, batched per animation frame (K5). */
  demand(position) {
    if (position) { camera.position.fromArray(position); camera.lookAt(0, 0, 0); }
    g = make();
    for (const type of Object.keys(events)) g.addEventListener(type, () => events[type]++);
    // `end` fires inside the frame whose render() writes the last pose, after the host drew its scene.
    g.addEventListener('end', () => { demandEndFrame = demandFrames; });
    let queued = false;
    const draw = () => { queued = false; demandFrames++; renderer.render(scene, camera); g.render2(); };
    g.addEventListener('invalidate', () => { if (!queued) { queued = true; requestAnimationFrame(draw); } });
    draw();
    return true;
  },
  demandFrames: () => demandFrames,
  demandEndFrame: () => demandEndFrame,
  rect: () => { const r = elementOf(g).getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; },
  canvasRect: () => { const r = renderer.domElement.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; },
  events: () => ({ ...events }),
  pose: () => ({ position: camera.position.toArray(), quaternion: camera.quaternion.toArray(), distance: camera.position.length() }),
  /** Texture count and bytes by three's own accounting (WebGPU only reports bytes). */
  memory: () => ({ textures: renderer.info.memory.textures, texturesSize: renderer.info.memory.texturesSize ?? null }),
  /** Hovers every target: turns to each face's side, then sweeps synthetic moves over the element (counts, not input, are under test). */
  hoverAll() {
    const { cx, cy, size } = centre();
    for (const d of [[1, 0.3, 0.2], [-1, 0.3, 0.2], [0.2, 1, 0.3], [0.2, -1, 0.3], [0.2, 0.3, 1], [0.2, 0.3, -1]]) {
      g.lookFrom(new THREE.Vector3(...d), { animated: false }); g.render2();
      for (let i = 0; i < 1200; i++) { const a = i * 0.11, r = size * 0.48 * ((i % 300) / 300); elementOf(g).dispatchEvent(new PointerEvent('pointermove', { clientX: cx + r * Math.cos(a), clientY: cy + r * Math.sin(a) })); if (i % 20 === 0) g.render2(); }
    }
    g.render2();
    return true;
  },
});
window.READY = true;
