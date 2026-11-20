import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Invariant I7: `lib/orbit/` is pure three.js math. `../errors` is allowed for the coded INVALID_FRAME error; type-only
// imports erase. Sibling modules (`./frame`) are allowed.
const FILES = ["labelFrame.ts", "frame.ts", "targets.ts", "pose.ts", "transition.ts", "turn.ts"];

describe("lib/orbit imports", () => {
  it.each(FILES)("should import only three, ../errors and siblings at runtime in %s", (file) => {
    const source = readFileSync(path.join(__dirname, file), "utf8");
    const runtime = [...source.matchAll(/^import\s+(?!type\s)[^;]*?from\s+"([^"]+)"/gms)].map((match) => match[1]);
    const allowed = (specifier: string) => specifier === "three" || specifier === "../errors" || specifier.startsWith("./");
    expect(runtime.filter((specifier) => !allowed(specifier))).toEqual([]);
  });
});
