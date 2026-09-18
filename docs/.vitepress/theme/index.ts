// .vitepress/theme/index.ts
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Layout from "../components/Layout.vue";
import IframeContainer from "../components/IframeContainer.vue";
import RendererToggle from "../components/RendererToggle.vue";
import "./style.css";
import { OhVueIcon } from "./icons";

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("IframeContainer", IframeContainer);
    app.component("RendererToggle", RendererToggle);
    app.component("v-icon", OhVueIcon);
  },
} satisfies Theme;
