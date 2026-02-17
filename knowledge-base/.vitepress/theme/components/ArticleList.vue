<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";

const { theme, page } = useData();

// 從當前頁面路徑取得分類名稱
const currentCategory = computed(() => {
  const path = page.value.relativePath; // e.g. "ai-tools/index.md"
  const match = path.match(/^([^/]+)\//);
  return match ? match[1] : "";
});

// 從 sidebar 資料中找到當前分類的文章列表
const articles = computed(() => {
  const sidebar = theme.value.sidebar;
  if (!Array.isArray(sidebar)) return [];

  for (const group of sidebar) {
    const items = group.items || [];
    // 檢查 items 中是否有屬於當前分類的連結
    const hasMatch = items.some((item: any) =>
      item.link?.startsWith(`/${currentCategory.value}/`)
    );
    if (hasMatch) {
      // 按編號倒序排列（最新在前）
      return [...items].sort((a: any, b: any) => {
        const numA = parseInt(a.link?.match(/\/(\d+)-/)?.[1] || "0", 10);
        const numB = parseInt(b.link?.match(/\/(\d+)-/)?.[1] || "0", 10);
        return numB - numA;
      });
    }
  }
  return [];
});
</script>

<template>
  <div class="article-list">
    <div v-if="articles.length === 0" class="empty">尚無文章</div>
    <ul v-else>
      <li v-for="article in articles" :key="article.link">
        <a :href="article.link">{{ article.text }}</a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.article-list ul {
  list-style: none;
  padding: 0;
}

.article-list li {
  padding: 8px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.article-list li:last-child {
  border-bottom: none;
}

.article-list a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}

.article-list a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.empty {
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
