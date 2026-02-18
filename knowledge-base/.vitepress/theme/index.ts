import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import { h } from "vue";
import ArticleList from "./components/ArticleList.vue";
import LatestArticles from "./components/LatestArticles.vue";
import ArticleReaction from "./components/ArticleReaction.vue";
import LikedArticles from "./components/LikedArticles.vue";
import DislikedArticles from "./components/DislikedArticles.vue";
import ReactionArticles from "./components/ReactionArticles.vue";

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-after": () => h(ArticleReaction),
    });
  },
  enhanceApp({ app }) {
    app.component("ArticleList", ArticleList);
    app.component("LatestArticles", LatestArticles);
    app.component("LikedArticles", LikedArticles);
    app.component("DislikedArticles", DislikedArticles);
    app.component("ReactionArticles", ReactionArticles);
  },
} satisfies Theme;
