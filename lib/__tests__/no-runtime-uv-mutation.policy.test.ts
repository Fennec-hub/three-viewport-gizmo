import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function walkTsFiles(dir: string, out: string[]): void {
  for (const ent of readdirSync(dir)) {
    if (ent === "__tests__") continue;
    const full = path.join(dir, ent);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkTsFiles(full, out);
    } else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) {
      out.push(full);
    }
  }
}

describe("no runtime material UV mutation (WebGPU atlas safety)", () => {
  it("never assigns map.offset/map.repeat directly on mesh/sprite materials", () => {
    const libRoot = path.join(__dirname, "..");
    const files: string[] = [];
    walkTsFiles(libRoot, files);

    const materialMapOffsetAssign = /\bmaterial\b\s*\.\s*map\s*\.\s*offset\s*[=;]/;
    const materialMapRepeatAssign = /\bmaterial\b\s*\.\s*map\s*\.\s*repeat\s*[=;]/;

    const offenders: string[] = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      if (materialMapOffsetAssign.test(src) || materialMapRepeatAssign.test(src)) {
        offenders.push(path.relative(libRoot, file));
      }
    }

    expect(offenders).toEqual([]);
  });
});
