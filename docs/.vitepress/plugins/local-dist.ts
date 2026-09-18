import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/** Built ESM bundle + source map emitted by root `npm run build`. */
const DIST_FILES = ['three-viewport-gizmo.js', 'three-viewport-gizmo.js.map'] as const;

function getRepoRootFromPlugin(importMetaUrl: string): string {
  // docs/.vitepress/plugins/this-file -> repo root (three hops up)
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), '..', '..', '..');
}

function readDist(importMetaUrl: string, filename: (typeof DIST_FILES)[number]): Buffer {
  const full = path.join(getRepoRootFromPlugin(importMetaUrl), 'dist', filename);
  return fs.readFileSync(full);
}

function requestMatchesDistAsset(urlPath: string): (typeof DIST_FILES)[number] | null {
  if (urlPath.endsWith('/dist/three-viewport-gizmo.js.map')) {
    return 'three-viewport-gizmo.js.map';
  }

  if (urlPath.endsWith('/dist/three-viewport-gizmo.js')) {
    return 'three-viewport-gizmo.js';
  }

  return null;
}

/**
 * Serves the library's built `dist/` over the same URL the sample importmaps use,
 * without relying on a stale jsdelivr snapshot of the fork.
 *
 * - **Dev:** middleware reads from the repo-root `dist/` (must exist after `npm run build`).
 * - **Build:** copies each file into the Rollup output so VitePress ships them next to the site.
 */
export const threeViewportGizmoLocalDistPlugin = (): Plugin => {
  const importMetaUrl = import.meta.url;

  /** Dedupe when the same Rollup run targets multiple output dirs; cleared each `buildStart`. */
  let emittedDirsForBuild = new Set<string>();

  return {
    name: 'three-viewport-gizmo-local-dist',

    buildStart() {
      emittedDirsForBuild = new Set<string>();
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const urlPath = req.url?.split('?')[0] ?? '';
        const asset = requestMatchesDistAsset(urlPath);

        if (asset === null) {
          next();
          return;
        }

        try {
          const body = readDist(importMetaUrl, asset);
          res.setHeader(
            'Content-Type',
            asset.endsWith('.map')
              ? 'application/json; charset=utf-8'
              : 'application/javascript; charset=utf-8'
          );
          res.end(body);
        } catch {
          next();
        }
      });
    },

    generateBundle(outputOptions, _bundle, isWrite) {
      if (!isWrite) return;

      const dirKey = outputOptions.dir ?? '__no_dir__';

      if (emittedDirsForBuild.has(dirKey)) return;

      emittedDirsForBuild.add(dirKey);

      for (const name of DIST_FILES) {
        try {
          this.emitFile({
            type: 'asset',
            fileName: `dist/${name}`,
            source: readDist(importMetaUrl, name),
          });
        } catch {
          // Missing root `dist/` (e.g. unexpected Rollup auxiliary pass); skip silently
        }
      }
    },
  };
};
