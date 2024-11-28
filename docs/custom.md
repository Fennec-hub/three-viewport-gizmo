---
layout: home
---

<script setup lang="ts">

import { ref, computed } from "vue";

const type = ref<"cube" | "sphere">("sphere");
const label = computed(() => type.value === "sphere" ? "⬜ Cube" : "⬤ Sphere");

const switchType = () => type.value = type.value === "sphere" ? "cube" : "sphere";

</script>

<button class="VPLink link" @click="switchType">Switch to type: <span>{{ label }}</span></button>
<IframeContainer :url="`config.html?type=${type}`" />

<style scoped>
  button {
    display: flex;
    margin: auto;
    padding: 0 1em;
    background: var(--vp-c-brand-3);
    border-radius: 1em;
  }

  span {
    padding: 0 0 0 0.5em;
    font-weight: 900;
  }
</style>
