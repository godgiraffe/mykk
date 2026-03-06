<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
type SortMode = "priority" | "date" | "title" | "updated";
type QuickFilter = "all" | "high-priority" | "overrides" | "source-linked";
type ResolvedArticle = ArticleData & {
  effectiveStatus: CurationStatus;
  hasLocalOverride: boolean;
  decisionUpdatedAt: string;
  searchIndex: string;
};

const HIGH_PRIORITY_THRESHOLD = 74;

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

const modeCopy: Record<
  WorkspaceMode,
  {
    eyebrow: string;
    title: string;
    deck: string;
  }
> = {
  review: {
    eyebrow: "Review Lane",
    title: "先處理最值得判斷的文章，把注意力花在高訊號內容。",
    deck:
      "待審區以 priority 為核心。你可以用搜尋、快速篩選和本地覆寫提示，把決策節奏拉快。",
  },
  curated: {
    eyebrow: "Curated Shelf",
    title: "把真正值得留在首頁的內容整理成穩定的精選層。",
    deck:
      "這裡適合檢查精選內容是否仍然夠強、分類是否平衡，以及哪些本地調整還沒回寫到 repo。",
  },
  archive: {
    eyebrow: "Archive Lane",
    title: "封存區不是垃圾桶，而是把低信號內容移出主要閱讀路徑。",
    deck:
      "在封存區你可以快速複查誤判內容，或集中清理那些僅存在於本地覆寫的決策。",
  },
};

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

const curationMap = ref<CurationMap>({});
const selectedCategory = ref("all");
const defaultSortMode = computed<SortMode>(() =>
  props.mode === "review" ? "priority" : "updated",
);
const sortMode = ref<SortMode>(defaultSortMode.value);
const searchQuery = ref("");
const quickFilter = ref<QuickFilter>("all");
const visibleCount = ref(props.limit);
const searchInput = ref<HTMLInputElement | null>(null);
let unsubscribe = () => {};

function syncCuration() {
  curationMap.value = getCurationMap();
}

function normalizeSearch(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseTime(value: string) {
  const parsed = value ? Date.parse(value) : Number.NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDisplayDate(value: string) {
  if (!value) return "未標日期";

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;

  return new Intl.DateTimeFormat("zh-Hant", {
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function formatUpdatedAt(value: string) {
  if (!value) return "未記錄";

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;

  return new Intl.DateTimeFormat("zh-Hant", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function priorityBand(score: number) {
  if (score >= 82) return "High Signal";
  if (score >= 68) return "Worth Reviewing";
  return "Lower Signal";
}

function isTextInputTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (
    event.key !== "/" ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    isTextInputTarget(event.target)
  ) {
    return;
  }

  event.preventDefault();
  searchInput.value?.focus();
}

const targetStatus = computed<CurationStatus>(() =>
  props.mode === "review" ? "inbox" : props.mode,
);

const resolvedArticles = computed<ResolvedArticle[]>(() =>
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
      searchIndex: normalizeSearch(
        [
          article.title,
          article.summary,
          article.excerpt,
          article.categoryName,
          article.sourceLabel,
          article.tags.join(" "),
          article.curationNote,
        ].join(" "),
      ),
    };
  }),
);

const stats = computed(() => {
  return resolvedArticles.value.reduce(
    (acc, article) => {
      acc.total += 1;
      acc.overrides += Number(article.hasLocalOverride);
      acc.currentLane += Number(article.effectiveStatus === targetStatus.value);
      acc[article.effectiveStatus] += 1;
      return acc;
    },
    { total: 0, currentLane: 0, overrides: 0, inbox: 0, curated: 0, archive: 0 },
  );
});

const modeArticles = computed(() =>
  resolvedArticles.value.filter((article) => article.effectiveStatus === targetStatus.value),
);

const categoryOptions = computed(() => {
  const counts = new Map<string, number>();

  for (const article of modeArticles.value) {
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

const quickFilterOptions = computed(() => [
  { value: "all" as const, label: "全部", count: modeArticles.value.length },
  {
    value: "high-priority" as const,
    label: "高 Priority",
    count: modeArticles.value.filter((article) => article.priorityScore >= HIGH_PRIORITY_THRESHOLD)
      .length,
  },
  {
    value: "overrides" as const,
    label: "本地覆寫",
    count: modeArticles.value.filter((article) => article.hasLocalOverride).length,
  },
  {
    value: "source-linked" as const,
    label: "有延伸連結",
    count: modeArticles.value.filter((article) => Boolean(article.sourceExternalUrl)).length,
  },
]);

function compareArticles(a: ResolvedArticle, b: ResolvedArticle, sort: SortMode) {
  if (sort === "updated") {
    const delta = parseTime(b.decisionUpdatedAt) - parseTime(a.decisionUpdatedAt);
    if (delta !== 0) return delta;
  }

  if (sort === "title") {
    return a.title.localeCompare(b.title, "zh-Hant");
  }

  if (sort === "date") {
    const delta = parseTime(b.date) - parseTime(a.date);
    if (delta !== 0) return delta;
  }

  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  if (b.number !== a.number) return b.number - a.number;
  return a.category.localeCompare(b.category, "zh-Hant");
}

function matchesQuickFilter(article: ResolvedArticle) {
  switch (quickFilter.value) {
    case "high-priority":
      return article.priorityScore >= HIGH_PRIORITY_THRESHOLD;
    case "overrides":
      return article.hasLocalOverride;
    case "source-linked":
      return Boolean(article.sourceExternalUrl);
    default:
      return true;
  }
}

function matchesSearch(article: ResolvedArticle) {
  const query = normalizeSearch(searchQuery.value);
  if (!query) return true;

  return query.split(" ").every((token) => article.searchIndex.includes(token));
}

const filteredArticles = computed(() =>
  modeArticles.value
    .filter((article) => selectedCategory.value === "all" || article.category === selectedCategory.value)
    .filter(matchesQuickFilter)
    .filter(matchesSearch)
    .sort((a, b) => compareArticles(a, b, sortMode.value)),
);

const visibleArticles = computed(() => filteredArticles.value.slice(0, visibleCount.value));

const filtersActive = computed(
  () =>
    selectedCategory.value !== "all" ||
    sortMode.value !== defaultSortMode.value ||
    quickFilter.value !== "all" ||
    searchQuery.value.trim().length > 0,
);

const stagedCount = computed(
  () => filteredArticles.value.filter((article) => article.hasLocalOverride).length,
);

const resultSummary = computed(() => {
  if (modeArticles.value.length === 0) return "本區目前沒有文章";
  if (filteredArticles.value.length === modeArticles.value.length) {
    return `顯示本區全部 ${filteredArticles.value.length} 篇`;
  }
  return `篩出 ${filteredArticles.value.length} / ${modeArticles.value.length} 篇`;
});

watch([selectedCategory, sortMode, searchQuery, quickFilter, () => props.mode], () => {
  visibleCount.value = props.limit;
});

function updateStatus(url: string, status: CurationStatus) {
  setCuration(url, status);
}

function restoreDefault(url: string) {
  clearCuration(url);
}

function resetFilters() {
  selectedCategory.value = "all";
  sortMode.value = defaultSortMode.value;
  quickFilter.value = "all";
  searchQuery.value = "";
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
  window.addEventListener("keydown", onGlobalKeydown);
});

onBeforeUnmount(() => {
  unsubscribe();
  window.removeEventListener("keydown", onGlobalKeydown);
});
</script>

<template>
  <div class="workspace">
    <section class="dashboard">
      <div class="dashboard-top">
        <div class="hero-copy">
          <p class="eyebrow">{{ modeCopy[mode].eyebrow }}</p>
          <h2>{{ modeCopy[mode].title }}</h2>
          <p class="deck">{{ modeCopy[mode].deck }}</p>
        </div>

        <div class="dashboard-actions">
          <p class="shortcut-tip">按 `/` 可直接聚焦搜尋</p>
          <div class="actions">
            <button class="secondary" @click="exportLocalDecisions">匯出本地決策</button>
            <button class="secondary danger" @click="resetLocalDecisions">清空本地覆寫</button>
          </div>
        </div>
      </div>

      <div class="stats">
        <div class="stat-card tone-ink">
          <span>本區</span>
          <strong>{{ stats.currentLane }}</strong>
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
        <div class="stat-card tone-slate">
          <span>本地覆寫</span>
          <strong>{{ stats.overrides }}</strong>
        </div>
      </div>
    </section>

    <section class="control-shell">
      <div class="control-grid">
        <label class="field field-search">
          <span class="field-label">搜尋</span>
          <div class="search-input-shell">
            <span class="search-shortcut">/</span>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="search"
              placeholder="標題、摘要、標籤、來源"
            />
            <button v-if="searchQuery" class="ghost-inline" @click="searchQuery = ''">清除</button>
          </div>
        </label>

        <label class="field">
          <span class="field-label">分類</span>
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

        <label class="field">
          <span class="field-label">排序</span>
          <select v-model="sortMode">
            <option value="priority">Priority</option>
            <option value="updated">最近調整</option>
            <option value="date">日期</option>
            <option value="title">標題</option>
          </select>
        </label>

        <button v-if="filtersActive" class="secondary subtle" @click="resetFilters">重設篩選</button>
      </div>

      <div class="filter-row">
        <div class="chip-group">
          <button
            v-for="option in quickFilterOptions"
            :key="option.value"
            :class="['chip-filter', { active: quickFilter === option.value }]"
            @click="quickFilter = option.value"
          >
            <span>{{ option.label }}</span>
            <strong>{{ option.count }}</strong>
          </button>
        </div>

        <div class="result-meta">
          <span>{{ resultSummary }}</span>
          <span v-if="stagedCount > 0">其中 {{ stagedCount }} 篇含本地覆寫</span>
        </div>
      </div>
    </section>

    <section v-if="visibleArticles.length === 0" class="empty-state">
      <h3>這個區目前沒有符合條件的文章。</h3>
      <p>你可以清掉篩選條件，或切換到其他分類與狀態查看。</p>
    </section>

    <section v-else class="card-grid">
      <article
        v-for="article in visibleArticles"
        :key="article.url"
        :class="['curation-card', { 'has-override': article.hasLocalOverride }]"
      >
        <div class="card-head">
          <div class="headline-stack">
            <div class="card-topline">
              <span :class="['status-pill', statusToneClass[article.effectiveStatus]]">
                {{ statusLabels[article.effectiveStatus] }}
              </span>
              <span class="meta-chip">{{ article.categoryName }}</span>
              <span class="meta-chip">#{{ article.number }}</span>
              <span class="meta-chip">P{{ article.priorityScore }}</span>
              <span v-if="article.date" class="meta-chip">{{ formatDisplayDate(article.date) }}</span>
            </div>

            <a :href="withBase(article.url)" class="title-link">
              {{ article.title }}
            </a>
          </div>

          <div class="priority-block">
            <span>Priority</span>
            <strong>{{ article.priorityScore }}</strong>
            <em>{{ priorityBand(article.priorityScore) }}</em>
          </div>
        </div>

        <p class="summary">{{ article.summary || article.excerpt }}</p>

        <div class="score-grid">
          <div class="score-card">
            <div class="score-label">
              <span>實用</span>
              <strong>{{ article.usefulnessScore }}</strong>
            </div>
            <div class="score-bar">
              <span :style="{ width: `${article.usefulnessScore}%` }" />
            </div>
          </div>

          <div class="score-card">
            <div class="score-label">
              <span>新穎</span>
              <strong>{{ article.noveltyScore }}</strong>
            </div>
            <div class="score-bar">
              <span :style="{ width: `${article.noveltyScore}%` }" />
            </div>
          </div>

          <div class="score-card">
            <div class="score-label">
              <span>常青</span>
              <strong>{{ article.evergreenScore }}</strong>
            </div>
            <div class="score-bar">
              <span :style="{ width: `${article.evergreenScore}%` }" />
            </div>
          </div>
        </div>

        <div class="note-box">
          <div class="state-row">
            <span
              :class="[
                'state-pill',
                article.hasLocalOverride
                  ? 'state-override'
                  : article.hasCommittedCuration
                    ? 'state-committed'
                    : 'state-default',
              ]"
            >
              {{
                article.hasLocalOverride
                  ? "本地覆寫"
                  : article.hasCommittedCuration
                    ? "已寫入 repo"
                    : "沿用預設"
              }}
            </span>

            <span class="state-copy">
              <template v-if="article.hasLocalOverride">
                最後更新 {{ formatUpdatedAt(article.decisionUpdatedAt) }}，尚未回寫 repo
              </template>
              <template v-else>
                預設狀態：{{ statusLabels[article.curationStatus] }}
              </template>
            </span>
          </div>

          <p class="note-label">Curation Note</p>
          <p class="note">{{ article.curationNote }}</p>
        </div>

        <div v-if="article.tags.length > 0" class="tag-row">
          <span v-for="tag in article.tags.slice(0, 5)" :key="tag" class="tag-chip">
            {{ tag }}
          </span>
        </div>

        <div class="footer">
          <div class="footer-links">
            <span class="source">{{ article.sourceLabel }}</span>
            <a :href="withBase(article.url)" class="text-link">閱讀文章</a>
            <a
              v-if="article.sourceTweetUrl"
              :href="article.sourceTweetUrl"
              class="text-link"
              target="_blank"
              rel="noreferrer"
            >
              原推文
            </a>
            <a
              v-if="article.sourceExternalUrl"
              :href="article.sourceExternalUrl"
              class="text-link"
              target="_blank"
              rel="noreferrer"
            >
              延伸連結
            </a>
          </div>

          <div class="decision-buttons">
            <button
              :class="['mini-button', 'curated', { active: article.effectiveStatus === 'curated' }]"
              :aria-pressed="article.effectiveStatus === 'curated'"
              @click="updateStatus(article.url, 'curated')"
            >
              精選
            </button>
            <button
              :class="['mini-button', 'inbox', { active: article.effectiveStatus === 'inbox' }]"
              :aria-pressed="article.effectiveStatus === 'inbox'"
              @click="updateStatus(article.url, 'inbox')"
            >
              待審
            </button>
            <button
              :class="['mini-button', 'archive', { active: article.effectiveStatus === 'archive' }]"
              :aria-pressed="article.effectiveStatus === 'archive'"
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
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 20px;
}

.dashboard,
.control-shell,
.curation-card,
.empty-state {
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 76%, transparent);
  box-shadow: 0 24px 64px -48px rgba(15, 23, 42, 0.45);
}

.dashboard {
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(15, 157, 116, 0.18), transparent 32%),
    radial-gradient(circle at bottom right, rgba(62, 123, 255, 0.2), transparent 28%),
    linear-gradient(140deg, rgba(255, 255, 255, 0.12), rgba(15, 23, 42, 0.02)),
    var(--vp-c-bg-soft);
}

.dashboard-top {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.hero-copy {
  max-width: 780px;
}

.hero-copy h2 {
  margin: 0;
  font-size: clamp(26px, 4vw, 38px);
  line-height: 1.08;
}

.eyebrow,
.field-label,
.note-label {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.deck {
  max-width: 740px;
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

.dashboard-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  min-width: 240px;
}

.shortcut-tip {
  margin: 0;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.stat-card {
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.58);
}

.stat-card span {
  display: block;
  color: var(--vp-c-text-3);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
  line-height: 1;
}

.tone-blue {
  background: rgba(62, 123, 255, 0.14);
  color: #244ec7;
}

.tone-green {
  background: rgba(15, 157, 116, 0.14);
  color: #0d7758;
}

.tone-amber {
  background: rgba(185, 99, 47, 0.16);
  color: #9f4f1d;
}

.tone-ink {
  background: rgba(15, 23, 42, 0.08);
  color: var(--vp-c-text-1);
}

.tone-slate {
  background: rgba(117, 130, 147, 0.14);
  color: #475569;
}

.control-shell {
  position: sticky;
  top: var(--vp-nav-height, 64px);
  z-index: 8;
  padding: 18px;
  border-radius: 24px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 88%, transparent);
  backdrop-filter: blur(18px);
}

.control-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(180px, 0.7fr)) auto;
  gap: 12px;
  align-items: end;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-search {
  min-width: 0;
}

.search-input-shell,
.field select {
  min-height: 48px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 88%, transparent);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.search-input-shell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
}

.search-shortcut {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.search-input-shell input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: 14px;
}

.field select {
  width: 100%;
  padding: 0 12px;
}

.ghost-inline,
.mini-button,
.secondary,
.ghost-button {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.ghost-inline {
  padding: 6px 10px;
}

.secondary.subtle {
  align-self: flex-end;
}

.filter-row,
.chip-group,
.card-topline,
.tag-row,
.footer,
.footer-links,
.decision-buttons,
.state-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.filter-row {
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
}

.chip-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 88%, transparent);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
}

.chip-filter strong {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-1);
  font-size: 12px;
}

.chip-filter.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px 14px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

.curation-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 100%;
  padding: 20px;
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 32%),
    var(--vp-c-bg-soft);
}

.curation-card.has-override {
  border-color: rgba(15, 157, 116, 0.24);
  box-shadow: 0 28px 72px -56px rgba(15, 157, 116, 0.45);
}

.card-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.headline-stack {
  min-width: 0;
}

.status-pill,
.meta-chip,
.tag-chip,
.state-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.meta-chip {
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-2);
}

.title-link {
  display: inline-block;
  margin-top: 4px;
  color: var(--vp-c-text-1);
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  text-decoration: none;
}

.title-link:hover,
.text-link:hover {
  color: var(--vp-c-brand-1);
}

.priority-block {
  flex: none;
  min-width: 104px;
  padding: 11px 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.05);
  text-align: right;
}

.priority-block span {
  display: block;
  color: var(--vp-c-text-3);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.priority-block strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
  line-height: 1;
}

.priority-block em {
  display: block;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-style: normal;
}

.summary {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.score-card {
  padding: 12px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.04);
}

.score-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.score-label strong {
  color: var(--vp-c-text-1);
}

.score-bar {
  height: 7px;
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.score-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f9d74, #3e7bff);
}

.note-box {
  padding: 14px;
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-bg) 74%, transparent);
}

.state-copy {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.state-override {
  background: rgba(15, 157, 116, 0.14);
  color: #0d7758;
}

.state-committed {
  background: rgba(62, 123, 255, 0.14);
  color: #244ec7;
}

.state-default {
  background: rgba(117, 130, 147, 0.14);
  color: #475569;
}

.note {
  margin: 8px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
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

.footer-links {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.source {
  color: var(--vp-c-text-3);
}

.text-link {
  color: inherit;
  text-decoration: none;
}

.decision-buttons {
  justify-content: flex-end;
}

.mini-button.active {
  transform: translateY(-1px);
}

.mini-button.active.inbox {
  border-color: #3e7bff;
  background: rgba(62, 123, 255, 0.12);
  color: #244ec7;
}

.mini-button.active.curated {
  border-color: #0f9d74;
  background: rgba(15, 157, 116, 0.14);
  color: #0d7758;
}

.mini-button.active.archive {
  border-color: #b9632f;
  background: rgba(185, 99, 47, 0.14);
  color: #9f4f1d;
}

.ghost-button {
  background: transparent;
}

.secondary:hover,
.mini-button:hover,
.ghost-button:hover,
.ghost-inline:hover,
.chip-filter:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.danger:hover {
  border-color: var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}

.load-more {
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 32px;
  border-radius: 22px;
  background: var(--vp-c-bg-soft);
}

.empty-state h3 {
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
  color: var(--vp-c-text-2);
}

@media (max-width: 1100px) {
  .dashboard-top,
  .footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-actions,
  .actions,
  .decision-buttons {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .control-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 820px) {
  .score-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .control-shell {
    position: static;
  }

  .control-grid {
    grid-template-columns: 1fr;
  }

  .card-head {
    flex-direction: column;
  }

  .priority-block {
    width: 100%;
    text-align: left;
  }
}

@media (max-width: 640px) {
  .dashboard,
  .control-shell,
  .curation-card,
  .empty-state {
    padding: 18px;
  }

  .title-link {
    font-size: 20px;
  }
}
</style>
