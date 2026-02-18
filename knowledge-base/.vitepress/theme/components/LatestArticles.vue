<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as allArticles } from "../../data/articles.data";

const latestArticles = computed(() => {
  const seen: Record<string, number> = {};
  const first = [];
  const overflow = [];
  for (const article of allArticles || []) {
    const count = seen[article.category] || 0;
    if (count < 2) {
      first.push(article);
      seen[article.category] = count + 1;
    } else {
      overflow.push(article);
    }
  }
  return [...first, ...overflow].slice(0, 12);
});
</script>

<template>
  <div class="latest-articles">
    <div class="latest-header">
      <h2>最新文章</h2>
      <span class="total-count">共 {{ allArticles.length }} 篇</span>
    </div>
    <div class="article-cards">
      <a
        v-for="article in latestArticles"
        :key="article.url"
        :href="withBase(article.url)"
        class="article-card"
      >
        <span class="article-category">{{
          article.categoryName || article.category
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

.latest-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.latest-articles h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 0;
  border-bottom: none;
}

.total-count {
  font-size: 13px;
  color: var(--vp-c-text-3);
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
