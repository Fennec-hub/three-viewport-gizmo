<template>
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

    <div class="responsive-container">
      <iframe ref="iframeRef" :src="fullUrl" :class="{ 'full-screen': isFullScreen }" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const { url, aspectRatio = '16/9' } = defineProps<{
  url: string,
  aspectRatio?: string
}>()

const iframeRef = ref<HTMLIFrameElement>();
const isFullScreen = ref(false)

const sourceURL = computed(() => `https://https://github.com/Fennec-hub/three-viewport-gizmo/blob/main/docs/public/samples/${url}`)
const fullUrl = computed(() => `${window.location.origin}/three-viewport-gizmo/samples/${url}`);

// Handle fullscreen changes
const onFullScreenChange = () => {
  isFullScreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullScreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', onFullScreenChange)
})


// Toggle fullscreen
const toggleFullScreen = async () => {
  if (!document.fullscreenElement) {
    try {
      await iframeRef.value!.requestFullscreen()
    } catch (err) {
      console.error('Error attempting to enable fullscreen:', err)
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
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
  padding-block-end: calc(100% * (v-bind('aspectRatio')));
  /* Default 16:9 aspect ratio */
  overflow: hidden;
  background: transparent;

  /* Apply custom aspect ratio if provided */
  & :deep([style*="aspect-ratio"]) {
    padding-block-end: calc(100% * v-bind('aspectRatio'));
  }
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