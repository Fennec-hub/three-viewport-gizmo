// .vitepress/theme/index.js
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import IframeContainer from "../components/IframeContainer.vue";
import "./style.css";
import { OhVueIcon } from "./icons";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("IframeContainer", IframeContainer);
    app.component("v-icon", OhVueIcon);
  },
} satisfies Theme;
