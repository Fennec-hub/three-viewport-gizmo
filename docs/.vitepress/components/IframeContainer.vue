<template>
  <ClientOnly>
    <div class="iframe-wrapper">
      <div class="controls">
        <a :href="fullUrl" target="_blank" title="Open in New Tab">
          <v-icon name="fa-external-link-alt" />
        </a>
        <a :href="sourceURL" target="_blank" title="Source code">
          <v-icon name="fa-code" />
        </a>
        <button @click="toggleFullScreen" :title="isFullScreen ? 'Exit Full Screen' : 'Full Screen'">
          <v-icon name="fa-expand" />
        </button>
      </div>

      <div class="responsive-container" :style="{ paddingBottom: aspectRatioPadding }">
        <iframe ref="iframeRef" :src="fullUrl" :class="{ 'full-screen': isFullScreen }" loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const { url, aspectRatio = '16/9' } = defineProps<{
  url: string,
  aspectRatio?: string
}>()

const iframeRef = ref<HTMLIFrameElement>();
const isFullScreen = ref(false)

/** Bump when docs `?renderer=` changes (toggle or nav) — `history.replaceState` does not reload. */
const rendererEpoch = ref(0)

function buildSamplesUrl(): string {
  if (typeof window === 'undefined') return ''

  const origin = window.location.origin
  const combined = `${origin}/three-viewport-gizmo/samples/${url}`
  if (!url.startsWith('webgpu.html')) {
    return combined
  }
  const renderer = new URLSearchParams(window.location.search).get('renderer') === 'webgpu' ? 'webgpu' : 'webgl'
  const sep = url.includes('?') ? '&' : '?'
  return `${combined}${sep}renderer=${renderer}`
}

const sourceURL = computed(() => `https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/${url}`)

const fullUrl = computed(() => {
  void rendererEpoch.value
  return buildSamplesUrl()
})

// Convert aspect ratio to a percentage for padding-bottom
const aspectRatioPadding = computed(() => {
  const [width, height] = aspectRatio.split('/').map(Number);
  return `${(height / width) * 100}%`;
});

const bumpIframeUrl = (): void => {
  rendererEpoch.value += 1
}

// Handle fullscreen changes
const onFullScreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullScreenChange)
  window.addEventListener('popstate', bumpIframeUrl)
  window.addEventListener('vp-renderer-change', bumpIframeUrl)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullScreenChange)
  window.removeEventListener('popstate', bumpIframeUrl)
  window.removeEventListener('vp-renderer-change', bumpIframeUrl)
})

// Toggle fullscreen
const toggleFullScreen = async (): Promise<void> => {
  if (!document.fullscreenElement) {
    try {
      await iframeRef.value!.requestFullscreen()
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err)
    }
  } else if (document.exitFullscreen) {
    await document.exitFullscreen()
  }
}
</script>

<style scoped lang="postcss">
.iframe-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 2em 0;

  &:hover {
    & .controls {
      display: flex;
    }
  }
}

.responsive-container {
  position: relative;
  width: 100%;
  height: 0;
  overflow: hidden;
  background: transparent;
}

iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: transparent;

  &.full-screen {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
}

.controls {
  position: absolute;
  inset-block-end: 0.5em;
  inset-inline-end: 0.5em;
  display: none;
  gap: 1em;
  z-index: 10;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
  backdrop-filter: blur(4px);

  & button,
  & a {
    background: #2229;
    border: 0;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    text-decoration: none;
    transition: all 0.2s ease;

    &:hover {
      background: #222;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    }
  }
}
</style>
