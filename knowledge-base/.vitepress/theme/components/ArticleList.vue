<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData, withBase } from "vitepress";
import { data as allArticles } from "../../data/articles.data";
import {
  getCurationMap,
  resolveCurationStatus,
  subscribeCuration,
  type CurationMap,
  type CurationStatus,
} from "../composables/useCuration";

const { page } = useData();

const statusLabels: Record<CurationStatus, string> = {
  inbox: "待審",
  curated: "精選",
  archive: "封存",
};

const curationMap = ref<CurationMap>({});
let unsubscribe = () => {};

const currentCategory = computed(() => {
  const match = page.value.relativePath.match(/^([^/]+)\//);
  return match ? match[1] : "";
});

const articles = computed(() =>
  allArticles
    .filter((article) => article.category === currentCategory.value)
    .map((article) => ({
      ...article,
      effectiveStatus: resolveCurationStatus(article.url, article.curationStatus, curationMap.value),
    }))
    .sort((a, b) => {
      const statusOrder = { curated: 0, inbox: 1, archive: 2 };
      if (statusOrder[a.effectiveStatus] !== statusOrder[b.effectiveStatus]) {
        return statusOrder[a.effectiveStatus] - statusOrder[b.effectiveStatus];
      }
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
      return b.number - a.number;
    }),
);

function syncCuration() {
  curationMap.value = getCurationMap();
}

onMounted(() => {
  syncCuration();
  unsubscribe = subscribeCuration(syncCuration);
});

onBeforeUnmount(() => {
  unsubscribe();
});
</script>

<template>
  <div class="article-list">
    <div v-if="articles.length === 0" class="empty">尚無文章</div>
    <div v-else class="cards">
      <article v-for="article in articles" :key="article.url" class="card">
        <div class="topline">
          <span :class="['status', article.effectiveStatus]">
            {{ statusLabels[article.effectiveStatus] }}
          </span>
          <span class="meta">{{ article.date || `#${article.number}` }}</span>
          <span class="meta">P{{ article.priorityScore }}</span>
        </div>

        <a :href="withBase(article.url)" class="title">{{ article.title }}</a>
        <p class="summary">{{ article.summary || article.excerpt }}</p>
      </article>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: grid;
  gap: 12px;
}

.card {
  padding: 16px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}

.topline {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.status,
.meta {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status.inbox {
  background: rgba(62, 123, 255, 0.12);
  color: #244ec7;
}

.status.curated {
  background: rgba(15, 157, 116, 0.12);
  color: #0d7758;
}

.status.archive {
  background: rgba(185, 99, 47, 0.14);
  color: #9f4f1d;
}

.meta {
  background: rgba(15, 23, 42, 0.05);
  color: var(--vp-c-text-3);
}

.title {
  color: var(--vp-c-text-1);
  text-decoration: none;
  font-size: 18px;
  font-weight: 700;
  transition: color 0.2s;
}

.title:hover {
  color: var(--vp-c-brand-1);
}

.empty {
  color: var(--vp-c-text-3);
  font-style: italic;
}

.summary {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}
</style>
