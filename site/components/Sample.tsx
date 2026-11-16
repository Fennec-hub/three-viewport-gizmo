import { readFileSync } from "node:fs";
import path from "node:path";
import { Code } from "./Code";

/** `next build` type-checks every `.ts` sample here and bundles every `.css` one a page imports. */
const SAMPLES = path.join(process.cwd(), "site", "samples");

/**
 * Shows a file from `site/samples`, so the code on the page is the code the docs build compiled. Lines ending in
 * `// @hide` (the stand-ins for the reader's own camera, renderer and scene) are left out. Server components only.
 */
export function Sample({ file, label }: { file: string; label?: string }) {
  return <Code label={label ?? file}>{readSample(file)}</Code>;
}

/** A sample's source as the page shows it: without its `// @hide` lines. */
export function readSample(file: string) {
  return readFileSync(path.join(SAMPLES, file), "utf8")
    .split("\n")
    .filter((line) => !line.trimEnd().endsWith("// @hide"))
    .join("\n");
}

/** Fails the docs build when the readme's quickstart block is not `quickstart.ts` as the page shows it. */
export function assertReadmeQuickstart() {
  const readme = readFileSync(path.join(process.cwd(), "readme.md"), "utf8");
  if (!readme.includes("```ts\n" + readSample("quickstart.ts") + "```")) {
    throw new Error("readme.md: the quickstart block must equal site/samples/quickstart.ts without its // @hide lines");
  }
}
