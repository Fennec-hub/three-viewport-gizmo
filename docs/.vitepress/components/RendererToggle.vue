<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

export type RendererChoice = "webgl" | "webgpu";

function readRendererChoice(): RendererChoice {
  if (typeof window === "undefined") return "webgl";

  const renderer = new URLSearchParams(window.location.search).get(
    "renderer"
  );
  return renderer === "webgpu" ? "webgpu" : "webgl";
}

const mode = ref<RendererChoice>(readRendererChoice());

function refreshFromUrl() {
  mode.value = readRendererChoice();
}

function syncUrl(next: RendererChoice) {
  const url = new URL(window.location.href);
  url.searchParams.set("renderer", next);
  window.history.replaceState({}, "", url.toString());
  refreshFromUrl();
  window.dispatchEvent(new Event("vp-renderer-change"));
}

function setWebGl() {
  syncUrl("webgl");
}

function setWebGpu() {
  syncUrl("webgpu");
}

onMounted(() => {
  refreshFromUrl();
  window.addEventListener("popstate", refreshFromUrl);
  window.addEventListener("vp-renderer-change", refreshFromUrl);
});

onUnmounted(() => {
  window.removeEventListener("popstate", refreshFromUrl);
  window.removeEventListener("vp-renderer-change", refreshFromUrl);
});
</script>

<template>
  <div class="renderer-toggle" aria-label="Sample renderer">
    <span class="renderer-toggle__label">Samples</span>
    <button
      type="button"
      class="renderer-toggle__btn"
      :aria-pressed="mode === 'webgl'"
      @click="setWebGl"
    >
      WebGL
    </button>
    <button
      type="button"
      class="renderer-toggle__btn"
      :aria-pressed="mode === 'webgpu'"
      @click="setWebGpu"
    >
      WebGPU
    </button>
  </div>
</template>

<style scoped>
.renderer-toggle {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.renderer-toggle__label {
  opacity: 0.8;
  white-space: nowrap;
}

.renderer-toggle__btn {
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.2rem 0.55rem;
  cursor: pointer;
  line-height: 1.2;
  font-size: 0.75rem;
}

.renderer-toggle__btn[aria-pressed="true"] {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-2);
}

.renderer-toggle__btn:focus-visible {
  outline: 2px solid var(--vp-c-brand);
  outline-offset: 1px;
}
</style>
