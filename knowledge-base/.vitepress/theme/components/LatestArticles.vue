<script setup lang="ts">
import { computed } from "vue";
import { data as allArticles } from "../../data/articles.data";

const categoryNames: Record<string, string> = {
  "ai-tools": "AI 工具與應用",
  "crypto-investing": "加密貨幣投資",
  defi: "DeFi 策略與安全",
  "quant-trading": "量化交易",
  dev: "軟體開發",
  lifestyle: "生活與效率",
};

const latestArticles = computed(() => allArticles.slice(0, 10));
</script>

<template>
  <div class="latest-articles">
    <h2>最新文章</h2>
    <div class="article-cards">
      <a
        v-for="article in latestArticles"
        :key="article.url"
        :href="article.url"
        class="article-card"
      >
        <span class="article-category">{{
          categoryNames[article.category] || article.category
        }}</span>
        <span class="article-title">{{ article.title }}</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.latest-articles {
  margin: 24px 0 40px;
}

.latest-articles h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
  border-bottom: none;
}

.article-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.article-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: all 0.2s;
}

.article-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.article-category {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.article-title {
  color: var(--vp-c-text-1);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
