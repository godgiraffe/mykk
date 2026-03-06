import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import ArticleList from "./components/ArticleList.vue";
import LatestArticles from "./components/LatestArticles.vue";
import ArticleCuration from "./components/ArticleCuration.vue";
import CategoryList from "./components/CategoryList.vue";
import CurationWorkspace from "./components/CurationWorkspace.vue";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-after": () => h(ArticleCuration),
    });
  },
  enhanceApp({ app }) {
    app.component("ArticleList", ArticleList);
    app.component("LatestArticles", LatestArticles);
    app.component("CategoryList", CategoryList);
    app.component("CurationWorkspace", CurationWorkspace);
  },
} satisfies Theme;
