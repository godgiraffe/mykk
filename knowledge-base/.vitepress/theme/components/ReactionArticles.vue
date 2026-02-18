<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { withBase } from "vitepress";
import { data as articles } from "../../data/articles.data";
import { STORAGE_KEY, getReactions, type Reaction } from "../composables/useReactions";

const props = defineProps<{
  reaction: Reaction;
}>();

const label = computed(() => (props.reaction === "like" ? "按讚" : "倒讚"));

interface ReactionArticle {
  title: string;
  url: string;
  category: string;
  categoryName: string;
}

const reactionUrls = ref<string[]>([]);

function loadReactions() {
  const reactions = getReactions();
  reactionUrls.value = Object.entries(reactions)
    .filter(([, v]) => v === props.reaction)
    .map(([k]) => k);
}

const reactionArticles = computed<ReactionArticle[]>(() => {
  return articles
    .filter((a) => reactionUrls.value.includes(a.url))
    .map((a) => ({
      title: a.title,
      url: a.url,
      category: a.category,
      categoryName: a.categoryName,
    }));
});

const groupedByCategory = computed(() => {
  const groups: Record<string, ReactionArticle[]> = {};
  for (const article of reactionArticles.value) {
    if (!groups[article.categoryName]) {
      groups[article.categoryName] = [];
    }
    groups[article.categoryName].push(article);
  }
  return groups;
});

function clearAll() {
  if (!confirm(`確定要清除所有${label.value}紀錄嗎？`)) return;
  const reactions = getReactions();
  for (const key of Object.keys(reactions)) {
    if (reactions[key] === props.reaction) {
      delete reactions[key];
    }
  }
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
  }
  loadReactions();
}

onMounted(() => {
  loadReactions();
});
</script>

<template>
  <div class="reaction-articles">
    <div v-if="reactionArticles.length === 0" class="empty">
      <p>還沒有{{ label }}的文章，去瀏覽文章並按個{{ label }}吧！</p>
    </div>

    <template v-else>
      <div class="header">
        <span class="count">共 {{ reactionArticles.length }} 篇</span>
        <button class="clear-btn" @click="clearAll">清除所有{{ label }}</button>
      </div>

      <div v-for="(items, category) in groupedByCategory" :key="category" class="category-group">
        <h3>{{ category }}</h3>
        <ul>
          <li v-for="article in items" :key="article.url">
            <a :href="withBase(article.url)">{{ article.title }}</a>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.reaction-articles {
  margin-top: 16px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.count {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.clear-btn {
  padding: 6px 12px;
  font-size: 13px;
  color: var(--vp-c-danger-1);
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  color: #fff;
  background: var(--vp-c-danger-1);
}

.category-group {
  margin-bottom: 24px;
}

.category-group h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--vp-c-text-1);
}

.category-group ul {
  list-style: none;
  padding: 0;
}

.category-group li {
  padding: 6px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.category-group li:last-child {
  border-bottom: none;
}

.category-group a {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 15px;
  transition: color 0.2s;
}

.category-group a:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.empty {
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
