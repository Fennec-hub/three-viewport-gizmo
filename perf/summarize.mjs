import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync(process.argv[2] || 'results.json'));
const f2 = (x) => (x == null ? '-' : (+x).toFixed(2));
const us = (s) => (s ? `${(s.mean * 1000).toFixed(1)}/${(s.p95 * 1000).toFixed(0)}/${(s.max * 1000).toFixed(0)}` : '-');
const mem = (s) => JSON.stringify(s.memory) + ` prog=${s.programs ?? `${s.pipelines}p/${s.vertexShaders}v/${s.fragmentShaders}f`}`;
for (const [k, v] of Object.entries(r.runs)) {
  if (v.failed) { console.log('##', k, 'FAILED', v.failed); continue; }
  const f = v.first, i = f.inventory, T = v.timing;
  console.log(`\n## ${k} gpu=${v.env.gpu} webgpuBackend=${v.env.webgpuBackend} errors=${v.errors.length}`);
  console.log(`inventory: objects=${i.objects} drawables=${i.drawables} geometries=${i.geometries} materials=${i.materials} textureObjects=${i.textureObjects} sources=${i.textureSources} tris=${i.sceneTriangles} atlas=${i.atlas ? `${i.atlas.width}x${i.atlas.height} mip=${i.atlas.generateMipmaps}` : '-'}`);
  console.log(`cold: construct=${f2(f.constructMs)}ms firstRender cpu=${f2(f.firstRenderCpuMs)} synced=${f2(f.firstRenderSyncedMs)} second=${f2(f.secondRenderCpuMs)}`);
  console.log(`  base ${mem(f.base)} | afterFirst draws=${f.afterFirst.draws} tris=${f.afterFirst.triangles} ${mem(f.afterFirst)}`);
  if (f.hover) console.log(`  firstHover cpu=${f2(f.hover.firstHoverRenderCpuMs)} synced=${f2(f.hover.firstHoverRenderSyncedMs)} second=${f2(f.hover.secondHoverRenderCpuMs)} ${mem(f.hover.after)}`);
  if (v.firstWarmed) { const w = v.firstWarmed; console.log(`  warmed: compileAsync=${f2(w.compileMs)} firstRender cpu=${f2(w.firstRenderCpuMs)} synced=${f2(w.firstRenderSyncedMs)} firstHover=${f2(w.hover.firstHoverRenderCpuMs)}`); }
  console.log(`timing µs mean/p95/max: construct(ms)=${f2(T.construct.mean)} idle=${us(T.idle)} empty=${us(T.emptyPass)} main=${us(T.mainScene)} anim=${us(T.animating)} drag h=${us(T.dragging?.handler)} r=${us(T.dragging?.render)} hover h=${us(T.hover?.handler)} r=${us(T.hover?.render)} (hc=${T.hover?.hoverchanges}) update=${us(T.update)}`);
  if (v.setCycle) { const s = v.setCycle; console.log(`set(): ${f2(s.set.mean)}ms firstRenderAfter=${f2(s.firstRenderAfterSet.mean)}ms | before ${mem(s.before)} | after20 ${mem(s.afterSets)} | afterDispose ${mem(s.afterDispose)}`); }
  console.log(`multi: base ${mem(v.multi.base)} -> ` + v.multi.out.map((o) => `${f2(o.firstRenderCpuMs)}ms ${mem(o)}`).join(' | '));
  console.log(`gpu-inclusive ms: syncOnly=${f2(v.gpu.syncOnly.mean)} empty=${f2(v.gpu.empty.mean)} gizmo=${f2(v.gpu.gizmo.mean)} (p95 ${f2(v.gpu.gizmo.p95)})`);
  for (const [p, a] of Object.entries(v.alloc || {})) console.log(`alloc ${p}: ${JSON.stringify(a.bytesPerCall)} top: ${a.top.slice(0, 8).map(([n, b]) => `${n}=${b}`).join(', ')}`);
  for (const [p, a] of Object.entries(v.cpu || {})) console.log(`cpu ${p}: ${JSON.stringify(a.usPerCall)} top: ${a.top.slice(0, 9).map(([n, b]) => `${n}=${b}`).join(', ')}`);
}
for (const [k, v] of Object.entries(r.canvasScaling || {})) console.log(`${k}: syncOnly=${f2(v.syncOnly.mean)} empty=${f2(v.empty.mean)} gizmo=${f2(v.gizmo.mean)} cpuIdle=${us(v.cpuIdle)}`);
for (const [k, v] of Object.entries(r.extra || {})) console.log(k, JSON.stringify(v));
