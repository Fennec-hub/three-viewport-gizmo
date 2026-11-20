import type { ViteUserConfig } from "vitest/config";
import base from "../../../vitest.config";

/** Runs only the fixture recorder; see `recordHitFixture.ts`. */
const config: ViteUserConfig = { ...base, test: { ...base.test, include: ["lib/interaction/__fixtures__/recordHitFixture.ts"] } };

export default config;
