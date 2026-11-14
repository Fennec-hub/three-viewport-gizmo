import { describe, expect, it } from "vitest";
import { optionsFallback } from "../options/optionsFallback.js";

describe("optionsFallback resolution", () => {
  it("defaults to 64 for a sphere and 128 for a cube, and keeps a given value", () => {
    expect(optionsFallback({ type: "sphere" }).resolution).toBe(64);
    expect(optionsFallback({ type: "cube" }).resolution).toBe(128);
    expect(optionsFallback({ type: "sphere", resolution: 256 }).resolution).toBe(256);
    expect(optionsFallback({ type: "cube", resolution: 32 }).resolution).toBe(32);
  });
});
