<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useData } from "vitepress";
import { data as allArticles, type ArticleData } from "../../data/articles.data";
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
  return resolveCurationStatus(article.value.url, article.value.curationStatus, curationMap.value);
});

const hasLocalOverride = computed(() => Boolean(article.value && curationMap.value[article.value.url]));

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
    <div class="heading">
      <div>
        <p class="eyebrow">Curation Desk</p>
        <h3>這篇文章要放去哪一層？</h3>
      </div>
      <div class="priority-chip">
        <span>AI Priority</span>
        <strong>{{ article.priorityScore }}</strong>
      </div>
    </div>

    <div class="controls">
      <button
        v-for="status in ['inbox', 'curated', 'archive']"
        :key="status"
        :class="['status-button', status, { active: effectiveStatus === status }]"
        @click="updateStatus(status as CurationStatus)"
      >
        {{ statusLabels[status as CurationStatus] }}
      </button>
    </div>

    <div class="meta">
      <span class="pill">{{ statusLabels[effectiveStatus] }}</span>
      <span class="meta-text">
        預設狀態：{{ statusLabels[article.curationStatus] }}
        <template v-if="article.hasCommittedCuration"> · 已寫入文章 metadata</template>
      </span>
      <button v-if="hasLocalOverride" class="reset-button" @click="restoreDefault">
        還原預設
      </button>
    </div>

    <p class="summary">{{ article.summary || article.excerpt }}</p>
    <p class="note">{{ article.curationNote }}</p>
  </div>
</template>

<style scoped>
.article-curation {
  margin-top: 36px;
  padding: 20px;
  border: 1px solid color-mix(in srgb, var(--vp-c-divider) 68%, transparent);
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(62, 155, 255, 0.14), transparent 34%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 55%),
    var(--vp-c-bg-soft);
}

.heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.eyebrow {
  margin: 0 0 4px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.heading h3 {
  margin: 0;
  font-size: 18px;
}

.priority-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  min-width: 92px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(12, 20, 31, 0.06);
  text-align: right;
}

.priority-chip span {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.priority-chip strong {
  font-size: 28px;
  line-height: 1;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.status-button {
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.status-button:hover {
  transform: translateY(-1px);
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

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(62, 123, 255, 0.12);
  color: #244ec7;
  font-size: 12px;
  font-weight: 700;
}

.meta-text {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.reset-button {
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 13px;
  cursor: pointer;
}

.summary {
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

.note {
  margin: 8px 0 0;
  color: var(--vp-c-text-3);
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 640px) {
  .heading {
    flex-direction: column;
  }

  .priority-chip {
    align-self: flex-start;
    min-width: auto;
    text-align: left;
  }

  .controls {
    grid-template-columns: 1fr;
  }
}
</style>
