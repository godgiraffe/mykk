import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ArticleList from "./components/ArticleList.vue";
import LatestArticles from "./components/LatestArticles.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("ArticleList", ArticleList);
    app.component("LatestArticles", LatestArticles);
  },
} satisfies Theme;
