<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { data as allArticles } from "../../data/articles.data";
import {
  getCurationMap,
  resolveCurationStatus,
  subscribeCuration,
  type CurationMap,
} from "../composables/useCuration";

const curationMap = ref<CurationMap>({});
let unsubscribe = () => {};

function syncCuration() {
  curationMap.value = getCurationMap();
}

const resolvedArticles = computed(() =>
  (allArticles || []).map((article) => ({
    ...article,
    effectiveStatus: resolveCurationStatus(article.url, article.curationStatus, curationMap.value),
  })),
);

const curatedArticles = computed(() =>
  resolvedArticles.value.filter((article) => article.effectiveStatus === "curated"),
);

const reviewQueue = computed(() =>
  resolvedArticles.value.filter((article) => article.effectiveStatus === "inbox"),
);

const headline = computed(() =>
  curatedArticles.value.length > 0 ? "精選文章" : "建議先看的待審文章",
);

const latestArticles = computed(() => {
  const source = curatedArticles.value.length > 0 ? curatedArticles.value : reviewQueue.value;
  const seen: Record<string, number> = {};
  const first = [];
  const overflow = [];

  for (const article of source) {
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

onMounted(() => {
  syncCuration();
  unsubscribe = subscribeCuration(syncCuration);
});

onBeforeUnmount(() => {
  unsubscribe();
});
</script>

<template>
  <div class="latest-articles">
    <h2>{{ headline }}</h2>
    <div class="article-cards">
      <a
        v-for="article in latestArticles"
        :key="article.url"
        :href="withBase(article.url)"
        class="article-card"
      >
        <div class="article-meta">
          <span class="article-category">{{ article.categoryName || article.category }}</span>
          <span class="priority">P{{ article.priorityScore }}</span>
        </div>
        <span class="article-title">{{ article.title }}</span>
        <span class="article-summary">{{ article.summary || article.excerpt }}</span>
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
  flex-direction: column;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: all 0.2s;
}

.article-card:hover {
  border-color: var(--vp-c-brand-1);
  background-color: var(--vp-c-bg-soft);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.article-title {
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 700;
}

.priority {
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.article-summary {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
