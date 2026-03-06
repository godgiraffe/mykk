<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData, withBase } from "vitepress";
import {
  data as allArticles,
  type ArticleData,
} from "../../data/articles.data";
import {
  clearCuration,
  getCurationMap,
  resolveCurationStatus,
  setCuration,
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

const statusToneClass: Record<CurationStatus, string> = {
  inbox: "tone-blue",
  curated: "tone-green",
  archive: "tone-amber",
};

const statusDeck: Record<CurationStatus, string> = {
  inbox: "留在 review pipeline，等你蒐集更多訊號後再決定是否精選或封存。",
  curated: "這篇會優先出現在首頁與分類列表前段，代表它值得被反覆看到。",
  archive:
    "這篇會保留資料，但不再占據主要閱讀入口，適合低信號或時效已過的內容。",
};

const curationMap = ref<CurationMap>({});
let unsubscribe = () => {};

const articleUrl = computed(() =>
  page.value.relativePath.replace(/\.md$/, ".html").replace(/^/, "/"),
);

const article = computed<ArticleData | undefined>(() =>
  allArticles.find((item) => item.url === articleUrl.value),
);

const effectiveStatus = computed<CurationStatus | null>(() => {
  if (!article.value) return null;
  return resolveCurationStatus(
    article.value.url,
    article.value.curationStatus,
    curationMap.value,
  );
});

const hasLocalOverride = computed(() =>
  Boolean(article.value && curationMap.value[article.value.url]),
);

const workspaceUrl = computed(() => {
  if (effectiveStatus.value === "curated") return withBase("/curated.html");
  if (effectiveStatus.value === "archive") return withBase("/archive.html");
  return withBase("/review.html");
});

const stateTitle = computed(() => {
  if (!article.value) return "";
  if (hasLocalOverride.value) return "目前是本地覆寫";
  if (article.value.hasCommittedCuration) return "目前狀態已寫入 repo";
  return "目前沿用文章預設值";
});

const stateCopy = computed(() => {
  if (!article.value || !effectiveStatus.value) return "";

  if (hasLocalOverride.value) {
    return `現在顯示為 ${statusLabels[effectiveStatus.value]}。這個判斷只存在目前瀏覽器，之後可透過匯出 JSON 再回寫 repo。`;
  }

  if (article.value.hasCommittedCuration) {
    return `frontmatter 已寫成 ${statusLabels[article.value.curationStatus]}，瀏覽器沒有額外覆寫。`;
  }

  return `目前沿用預設判斷 ${statusLabels[article.value.curationStatus]}，你可以直接在這裡調整。`;
});

function syncCuration() {
  curationMap.value = getCurationMap();
}

function updateStatus(status: CurationStatus) {
  if (!article.value) return;
  setCuration(article.value.url, status);
}

function restoreDefault() {
  if (!article.value) return;
  clearCuration(article.value.url);
}

function priorityBand(score: number) {
  if (score >= 82) return "優先處理";
  if (score >= 68) return "值得先看";
  return "可晚點看";
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
  <div v-if="article && effectiveStatus" class="article-curation">
    <div class="panel-top">
      <div class="heading">
        <p class="eyebrow">編修台</p>
        <h3>這篇文章要放去哪一層？</h3>
        <p class="deck">{{ statusDeck[effectiveStatus] }}</p>
      </div>

      <div class="priority-chip">
        <span>AI 優先度</span>
        <strong>{{ article.priorityScore }}</strong>
        <em>{{ priorityBand(article.priorityScore) }}</em>
      </div>
    </div>

    <div class="meta-row">
      <span :class="['pill', statusToneClass[effectiveStatus]]">
        {{ statusLabels[effectiveStatus] }}
      </span>
      <span class="pill muted">{{ article.categoryName }}</span>
      <span v-if="article.date" class="pill muted">{{ article.date }}</span>
      <span class="pill muted">{{ article.sourceLabel }}</span>
    </div>

    <div :class="['state-banner', { override: hasLocalOverride }]">
      <p class="state-title">{{ stateTitle }}</p>
      <p class="state-copy">{{ stateCopy }}</p>
    </div>

    <div class="controls">
      <button
        v-for="status in ['inbox', 'curated', 'archive']"
        :key="status"
        :class="[
          'status-button',
          status,
          { active: effectiveStatus === status },
        ]"
        :aria-pressed="effectiveStatus === status"
        @click="updateStatus(status as CurationStatus)"
      >
        {{ statusLabels[status as CurationStatus] }}
      </button>
    </div>

    <div class="detail-grid">
      <section class="detail-card">
        <p class="section-label">摘要</p>
        <p class="summary">{{ article.summary || article.excerpt }}</p>
        <p class="note-label">編輯備註</p>
        <p class="note">{{ article.curationNote }}</p>
      </section>

      <section class="detail-card signal-card">
        <p class="section-label">訊號</p>

        <div class="signal-row">
          <div class="signal-label">
            <span>實用</span>
            <strong>{{ article.usefulnessScore }}</strong>
          </div>
          <div class="signal-bar">
            <span :style="{ width: `${article.usefulnessScore}%` }" />
          </div>
        </div>

        <div class="signal-row">
          <div class="signal-label">
            <span>新穎</span>
            <strong>{{ article.noveltyScore }}</strong>
          </div>
          <div class="signal-bar">
            <span :style="{ width: `${article.noveltyScore}%` }" />
          </div>
        </div>

        <div class="signal-row">
          <div class="signal-label">
            <span>常青</span>
            <strong>{{ article.evergreenScore }}</strong>
          </div>
          <div class="signal-bar">
            <span :style="{ width: `${article.evergreenScore}%` }" />
          </div>
        </div>
      </section>
    </div>

    <div class="action-row">
      <button
        v-if="hasLocalOverride"
        class="action-button reset"
        @click="restoreDefault"
      >
        還原預設
      </button>
      <a :href="workspaceUrl" class="action-button">回工作台</a>
      <a
        v-if="article.sourceTweetUrl"
        :href="article.sourceTweetUrl"
        class="action-button"
        target="_blank"
        rel="noreferrer"
      >
        原推文
      </a>
      <a
        v-if="article.sourceExternalUrl"
        :href="article.sourceExternalUrl"
        class="action-button"
        target="_blank"
        rel="noreferrer"
      >
        延伸來源
      </a>
    </div>
  </div>
</template>

<style scoped>
.article-curation {
  margin-top: 36px;
  padding: 22px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
  border-radius: 24px;
  background:
    radial-gradient(
      circle at top left,
      rgba(62, 155, 255, 0.16),
      transparent 32%
    ),
    linear-gradient(140deg, rgba(255, 255, 255, 0.06), transparent 52%),
    var(--vp-c-bg-soft);
  box-shadow: 0 24px 60px -46px rgba(15, 23, 42, 0.42);
}

.panel-top {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.heading {
  max-width: 640px;
}

.eyebrow,
.section-label,
.note-label {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.heading h3 {
  margin: 4px 0 0;
  font-size: 24px;
  line-height: 1.15;
}

.deck {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.priority-chip {
  flex: none;
  min-width: 124px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.06);
  text-align: right;
}

.priority-chip span {
  display: block;
  color: var(--vp-c-text-3);
  font-size: 12px;
  letter-spacing: 0.04em;
}

.priority-chip strong {
  display: block;
  margin-top: 6px;
  font-size: 34px;
  line-height: 1;
}

.priority-chip em {
  display: block;
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-style: normal;
}

.meta-row,
.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.meta-row {
  margin-top: 16px;
}

.pill {
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.pill.muted {
  background: rgba(15, 23, 42, 0.06);
  color: var(--vp-c-text-2);
}

.tone-blue {
  background: rgba(62, 123, 255, 0.12);
  color: #244ec7;
}

.tone-green {
  background: rgba(15, 157, 116, 0.13);
  color: #0d7758;
}

.tone-amber {
  background: rgba(185, 99, 47, 0.14);
  color: #9f4f1d;
}

.state-banner {
  margin-top: 14px;
  padding: 14px 16px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 72%, transparent);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
}

.state-banner.override {
  border-color: rgba(15, 157, 116, 0.24);
  background: rgba(15, 157, 116, 0.08);
}

.state-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 700;
}

.state-copy {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.65;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 16px;
}

.status-button,
.action-button {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease;
}

.status-button {
  padding: 12px 14px;
  font-weight: 700;
}

.status-button:hover,
.action-button:hover {
  transform: translateY(-1px);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.status-button.active.inbox {
  border-color: #3e7bff;
  background: rgba(62, 123, 255, 0.12);
  color: #244ec7;
}

.status-button.active.curated {
  border-color: #0f9d74;
  background: rgba(15, 157, 116, 0.13);
  color: #0d7758;
}

.status-button.active.archive {
  border-color: #b9632f;
  background: rgba(185, 99, 47, 0.14);
  color: #9f4f1d;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  gap: 12px;
  margin-top: 16px;
}

.detail-card {
  padding: 16px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
}

.summary,
.note {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

.summary {
  margin-top: 10px;
}

.note {
  margin-top: 8px;
  font-size: 14px;
}

.note-label {
  margin-top: 16px;
}

.signal-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.signal-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.signal-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.signal-label strong {
  color: var(--vp-c-text-1);
}

.signal-bar {
  height: 7px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.signal-bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #0f9d74, #3e7bff);
}

.action-row {
  margin-top: 16px;
}

.action-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 13px;
  text-decoration: none;
}

.action-button.reset {
  color: var(--vp-c-danger-1);
}

.action-button.reset:hover {
  border-color: var(--vp-c-danger-1);
  color: var(--vp-c-danger-1);
}

@media (max-width: 860px) {
  .panel-top,
  .detail-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .priority-chip {
    text-align: left;
  }
}

@media (max-width: 640px) {
  .article-curation {
    padding: 18px;
  }

  .controls {
    grid-template-columns: 1fr;
  }
}
</style>
