<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { withBase } from "vitepress";
import { data as allArticles, type ArticleData } from "../../data/articles.data";
import { categoryCatalog } from "../../data/category-meta";
import {
  clearAllCuration,
  clearCuration,
  getCurationMap,
  resolveCurationStatus,
  setCuration,
  subscribeCuration,
  type CurationMap,
  type CurationStatus,
} from "../composables/useCuration";

type WorkspaceMode = "review" | "curated" | "archive";
type SortMode = "priority" | "date" | "title";

const props = withDefaults(
  defineProps<{
    mode?: WorkspaceMode;
    limit?: number;
  }>(),
  {
    mode: "review",
    limit: 48,
  },
);

const curationMap = ref<CurationMap>({});
const selectedCategory = ref("all");
const sortMode = ref<SortMode>(props.mode === "review" ? "priority" : "date");
const visibleCount = ref(props.limit);
let unsubscribe = () => {};

const statusLabels: Record<CurationStatus, string> = {
  inbox: "待審",
  curated: "精選",
  archive: "封存",
};

const statusToneClass: Record<CurationStatus, string> = {
  inbox: "tone-blue",
  curated: "tone-green",
  archive: "tone-amber",
};

function syncCuration() {
  curationMap.value = getCurationMap();
}

const resolvedArticles = computed(() =>
  allArticles.map((article) => {
    const localEntry = curationMap.value[article.url];
    const effectiveStatus = resolveCurationStatus(
      article.url,
      article.curationStatus,
      curationMap.value,
    );

    return {
      ...article,
      effectiveStatus,
      hasLocalOverride: Boolean(localEntry),
      decisionUpdatedAt: localEntry?.updatedAt ?? "",
    };
  }),
);

const stats = computed(() => {
  return resolvedArticles.value.reduce(
    (acc, article) => {
      acc.total += 1;
      acc[article.effectiveStatus] += 1;
      return acc;
    },
    { total: 0, inbox: 0, curated: 0, archive: 0 },
  );
});

const categoryOptions = computed(() => {
  const counts = new Map<string, number>();
  for (const article of resolvedArticles.value) {
    const matchesMode =
      props.mode === "review"
        ? article.effectiveStatus === "inbox"
        : article.effectiveStatus === props.mode;
    if (!matchesMode) continue;

    counts.set(article.category, (counts.get(article.category) ?? 0) + 1);
  }

  const catalogEntries = categoryCatalog
    .map((category) => ({
      ...category,
      count: counts.get(category.slug) ?? 0,
    }))
    .filter((category) => category.count > 0);

  const knownSlugs = new Set(categoryCatalog.map((category) => category.slug));
  const dynamicEntries = [...counts.entries()]
    .filter(([slug, count]) => count > 0 && !knownSlugs.has(slug))
    .map(([slug, count]) => ({
      slug,
      name: slug,
      desc: "未納入主要分類的內容",
      count,
    }));

  return [...catalogEntries, ...dynamicEntries];
});

function compareArticles(a: ArticleData, b: ArticleData, sort: SortMode): number {
  if (sort === "title") return a.title.localeCompare(b.title, "zh-Hant");

  if (sort === "date") {
    const parsedA = a.date ? Date.parse(a.date) : 0;
    const parsedB = b.date ? Date.parse(b.date) : 0;
    const timeA = Number.isNaN(parsedA) ? 0 : parsedA;
    const timeB = Number.isNaN(parsedB) ? 0 : parsedB;
    if (timeB !== timeA) return timeB - timeA;
  }

  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  if (b.number !== a.number) return b.number - a.number;
  return a.category.localeCompare(b.category);
}

const filteredArticles = computed(() => {
  const targetStatus = props.mode === "review" ? "inbox" : props.mode;

  return resolvedArticles.value
    .filter((article) => article.effectiveStatus === targetStatus)
    .filter((article) => selectedCategory.value === "all" || article.category === selectedCategory.value)
    .sort((a, b) => compareArticles(a, b, sortMode.value));
});

const visibleArticles = computed(() => filteredArticles.value.slice(0, visibleCount.value));

function updateStatus(url: string, status: CurationStatus) {
  setCuration(url, status);
}

function restoreDefault(url: string) {
  clearCuration(url);
}

function loadMore() {
  visibleCount.value += props.limit;
}

function exportLocalDecisions() {
  if (typeof window === "undefined") return;

  const payload = {
    exportedAt: new Date().toISOString(),
    counts: stats.value,
    decisions: curationMap.value,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `curation-export-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function resetLocalDecisions() {
  if (typeof window === "undefined") return;
  if (!window.confirm("確定要清空目前瀏覽器裡的 curation 覆寫嗎？")) return;
  clearAllCuration();
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
  <div class="workspace">
    <section v-if="mode === 'review'" class="dashboard">
      <div class="hero-copy">
        <p class="eyebrow">Editorial Pipeline</p>
        <h2>先看最值得判斷的文章，不要把力氣花在全量掃描。</h2>
        <p class="deck">
          待審區按 AI priority 排序。你可以先從高分文章開始做正向收藏，再把低信號內容封存。
        </p>
      </div>

      <div class="stats">
        <div class="stat-card">
          <span>全部</span>
          <strong>{{ stats.total }}</strong>
        </div>
        <div class="stat-card tone-blue">
          <span>待審</span>
          <strong>{{ stats.inbox }}</strong>
        </div>
        <div class="stat-card tone-green">
          <span>精選</span>
          <strong>{{ stats.curated }}</strong>
        </div>
        <div class="stat-card tone-amber">
          <span>封存</span>
          <strong>{{ stats.archive }}</strong>
        </div>
      </div>

      <div class="actions">
        <button class="secondary" @click="exportLocalDecisions">匯出本地決策</button>
        <button class="secondary danger" @click="resetLocalDecisions">清空本地覆寫</button>
      </div>
    </section>

    <section class="filters">
      <label>
        分類
        <select v-model="selectedCategory">
          <option value="all">全部分類</option>
          <option
            v-for="category in categoryOptions"
            :key="category.slug"
            :value="category.slug"
          >
            {{ category.name }} ({{ category.count }})
          </option>
        </select>
      </label>

      <label>
        排序
        <select v-model="sortMode">
          <option value="priority">Priority</option>
          <option value="date">日期</option>
          <option value="title">標題</option>
        </select>
      </label>
    </section>

    <section v-if="visibleArticles.length === 0" class="empty-state">
      <h3>這個區目前是空的。</h3>
      <p>你可以先去待審清單做第一次分類，或切換別的分類篩選。</p>
    </section>

    <section v-else class="card-grid">
      <article v-for="article in visibleArticles" :key="article.url" class="curation-card">
        <div class="card-topline">
          <span :class="['status-pill', statusToneClass[article.effectiveStatus]]">
            {{ statusLabels[article.effectiveStatus] }}
          </span>
          <span class="meta-chip">{{ article.categoryName }}</span>
          <span class="meta-chip">P{{ article.priorityScore }}</span>
          <span v-if="article.date" class="meta-chip">{{ article.date }}</span>
        </div>

        <a :href="withBase(article.url)" class="title-link">
          {{ article.title }}
        </a>

        <p class="summary">{{ article.summary || article.excerpt }}</p>

        <div class="score-row">
          <span>實用 {{ article.usefulnessScore }}</span>
          <span>新穎 {{ article.noveltyScore }}</span>
          <span>常青 {{ article.evergreenScore }}</span>
        </div>

        <p class="note">{{ article.curationNote }}</p>

        <div v-if="article.tags.length > 0" class="tag-row">
          <span v-for="tag in article.tags.slice(0, 4)" :key="tag" class="tag-chip">
            {{ tag }}
          </span>
        </div>

        <div class="footer">
          <span class="source">{{ article.sourceLabel }}</span>
          <div class="decision-buttons">
            <button
              :class="['mini-button', { active: article.effectiveStatus === 'curated' }]"
              @click="updateStatus(article.url, 'curated')"
            >
              精選
            </button>
            <button
              :class="['mini-button', { active: article.effectiveStatus === 'inbox' }]"
              @click="updateStatus(article.url, 'inbox')"
            >
              待審
            </button>
            <button
              :class="['mini-button', { active: article.effectiveStatus === 'archive' }]"
              @click="updateStatus(article.url, 'archive')"
            >
              封存
            </button>
            <button
              v-if="article.hasLocalOverride"
              class="ghost-button"
              @click="restoreDefault(article.url)"
            >
              還原
            </button>
          </div>
        </div>
      </article>
    </section>

    <div v-if="visibleArticles.length < filteredArticles.length" class="load-more">
      <button class="secondary" @click="loadMore">
        再載入 {{ Math.min(limit, filteredArticles.length - visibleArticles.length) }} 篇
      </button>
    </div>
  </div>
</template>

<style scoped>
.workspace {
  margin-top: 20px;
}

.dashboard {
  padding: 28px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top left, rgba(15, 157, 116, 0.16), transparent 32%),
    radial-gradient(circle at bottom right, rgba(62, 123, 255, 0.18), transparent 28%),
    linear-gradient(160deg, rgba(11, 18, 28, 0.03), rgba(11, 18, 28, 0.07)),
    var(--vp-c-bg-soft);
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
}

.hero-copy h2 {
  margin: 0;
  max-width: 780px;
  font-size: clamp(24px, 4vw, 34px);
  line-height: 1.1;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.deck {
  max-width: 720px;
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.stat-card {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.stat-card span {
  display: block;
  color: var(--vp-c-text-3);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
  line-height: 1;
}

.tone-blue {
  background: rgba(62, 123, 255, 0.12);
}

.tone-green {
  background: rgba(15, 157, 116, 0.12);
}

.tone-amber {
  background: rgba(185, 99, 47, 0.14);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 24px 0 18px;
}

.filters label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.filters select {
  min-width: 180px;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.curation-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 76%, transparent);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent), var(--vp-c-bg-soft);
  box-shadow: 0 16px 40px -28px rgba(15, 23, 42, 0.35);
}

.card-topline,
.score-row,
.tag-row,
.footer,
.decision-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.status-pill,
.meta-chip,
.tag-chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill {
  color: #16315f;
}

.meta-chip {
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-2);
}

.title-link {
  color: var(--vp-c-text-1);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
}

.title-link:hover {
  color: var(--vp-c-brand-1);
}

.summary {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.note {
  margin: -4px 0 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.6;
}

.score-row {
  color: var(--vp-c-text-3);
  font-size: 12px;
  letter-spacing: 0.02em;
}

.tag-chip {
  background: rgba(62, 123, 255, 0.1);
  color: #244ec7;
}

.footer {
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
}

.source {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.mini-button,
.secondary,
.ghost-button {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
}

.mini-button.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.secondary:hover,
.mini-button:hover,
.ghost-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.danger:hover {
  border-color: var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}

.ghost-button {
  background: transparent;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.empty-state {
  padding: 28px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 18px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}

.empty-state h3 {
  margin: 0 0 6px;
}

@media (max-width: 960px) {
  .stats,
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard,
  .curation-card {
    padding: 18px;
  }

  .footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
