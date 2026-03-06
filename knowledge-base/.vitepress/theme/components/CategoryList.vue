<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { data as allArticles } from "../../data/articles.data";
import { categoryCatalog } from "../../data/category-meta";
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

const totalCount = computed(() => (allArticles || []).length);

const resolvedArticles = computed(() =>
  (allArticles || []).map((article) => ({
    ...article,
    effectiveStatus: resolveCurationStatus(article.url, article.curationStatus, curationMap.value),
  })),
);

const rows = computed(() =>
  categoryCatalog.map((c) => ({
    ...c,
    total: resolvedArticles.value.filter((a) => a.category === c.slug).length,
    curated: resolvedArticles.value.filter(
      (a) => a.category === c.slug && a.effectiveStatus === "curated",
    ).length,
    inbox: resolvedArticles.value.filter(
      (a) => a.category === c.slug && a.effectiveStatus === "inbox",
    ).length,
    archive: resolvedArticles.value.filter(
      (a) => a.category === c.slug && a.effectiveStatus === "archive",
    ).length,
    link: `/${c.slug}/`,
  }))
);

onMounted(() => {
  syncCuration();
  unsubscribe = subscribeCuration(syncCuration);
});

onBeforeUnmount(() => {
  unsubscribe();
});
</script>

<template>
  <div class="category-header">
    <span class="total-count">共 {{ totalCount }} 篇，首頁與精選流以 curated 為主</span>
  </div>
  <table class="category-table">
    <thead>
      <tr>
        <th>分類</th>
        <th>說明</th>
        <th class="count-col">精選</th>
        <th class="count-col">待審</th>
        <th class="count-col">封存</th>
        <th class="count-col">總數</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.slug">
        <td><a :href="withBase(row.link)">{{ row.name }}</a></td>
        <td>{{ row.desc }}</td>
        <td class="count-col highlight">{{ row.curated }}</td>
        <td class="count-col">{{ row.inbox }}</td>
        <td class="count-col">{{ row.archive }}</td>
        <td class="count-col">{{ row.total }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.category-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}

.total-count {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  margin: 16px 0;
}

.category-table th,
.category-table td {
  padding: 10px 14px;
  border: 1px solid var(--vp-c-divider);
  text-align: left;
}

.category-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.category-table tr:hover td {
  background: var(--vp-c-bg-soft);
}

.category-table a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.category-table a:hover {
  text-decoration: underline;
}

.count-col {
  text-align: right;
  white-space: nowrap;
  color: var(--vp-c-text-2);
  width: 72px;
}

.highlight {
  color: #0d7758;
  font-weight: 700;
}
</style>
