/**
 * Chromium flags for the GPU the gate runs on, shared by Playwright and perf/run.mjs.
 * `metal`: the real GPU on macOS. `swiftshader`: Chromium's software adapter for WebGL
 * (ANGLE) and WebGPU (Dawn on SwiftShader Vulkan), the Linux CI choice of the D16 spike.
 */
export const gpu = process.env.GIZMO_GPU ?? (process.platform === "darwin" ? "metal" : "swiftshader");

const flags = {
  metal: ["--enable-gpu", "--use-angle=metal", "--enable-unsafe-webgpu"],
  swiftshader: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-unsafe-webgpu",
    "--use-webgpu-adapter=swiftshader",
    // Without SwiftShader Vulkan the GPU process has no Vulkan on a GitHub Linux runner, cannot make
    // the WebGPU canvas swap chain and destroys the device on the first present (tests/browser/spike-webgpu.mjs).
    "--use-vulkan=swiftshader",
    "--enable-features=Vulkan",
  ],
};

export const gpuArgs = flags[gpu];
if (!gpuArgs) throw new Error(`GIZMO_GPU must be ${Object.keys(flags).join(" or ")}, not ${gpu}`);

export const backends = (process.env.GIZMO_BACKENDS ?? "webgl,webgpu").split(",");
