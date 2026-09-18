<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import RendererToggle from "./RendererToggle.vue";

const { Layout } = DefaultTheme;
</script>

<template>
  <Layout>
    <template #nav-bar-content-after>
      <RendererToggle />
    </template>
  </Layout>
</template>
