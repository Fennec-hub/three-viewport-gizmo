// Gzip bytes the gizmo adds to a minimal WebGL app and a minimal WebGPU app (budget row "gzip").
// Usage: node perf/bundle.mjs [out.json]. Builds four five-line apps with Vite and writes perf/out/bundle.json.
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, 'out', 'bundle');
const [outFile = path.join(here, 'out', 'bundle.json')] = process.argv.slice(2);
fs.mkdirSync(dir, { recursive: true });

const app = (three, Renderer, gizmo) => `import * as THREE from '${three}';
${gizmo ? "import { ViewportGizmo } from '@lib/index';" : ''}
const renderer = new THREE.${Renderer}(), camera = new THREE.PerspectiveCamera(), scene = new THREE.Scene();
scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial()));
${gizmo ? 'const gizmo = new ViewportGizmo(camera, renderer);' : ''}
renderer.setAnimationLoop(() => { renderer.render(scene, camera); ${gizmo ? 'gizmo.render();' : ''} });
`;

const gzip = async (name, source) => {
  const entry = path.join(dir, `${name}.js`);
  fs.writeFileSync(entry, source);
  const out = await build({
    configFile: false, logLevel: 'silent', root: dir,
    resolve: { alias: { '@lib': path.join(here, '../lib') } },
    build: { write: false, minify: true, rollupOptions: { input: entry } },
  });
  return [out].flat().flatMap((o) => o.output).filter((c) => c.type === 'chunk').reduce((n, c) => n + gzipSync(c.code).length, 0);
};

const result = {};
for (const [backend, three, Renderer] of [['webgl', 'three', 'WebGLRenderer'], ['webgpu', 'three/webgpu', 'WebGPURenderer']]) {
  const without = await gzip(`${backend}-app`, app(three, Renderer, false));
  const withGizmo = await gzip(`${backend}-app-gizmo`, app(three, Renderer, true));
  result[backend] = { without, withGizmo, added: withGizmo - without };
}
fs.writeFileSync(outFile, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result));
