import path from "node:path";
import type { NextConfig } from "next";

const basePath = "/three-viewport-gizmo";
// The site lives inside the library package and imports `lib/` from source, so the
// bundler root is the package root (one `node_modules`, one copy of three.js).
const root = path.resolve(import.meta.dirname, "..");

const config: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default config;
