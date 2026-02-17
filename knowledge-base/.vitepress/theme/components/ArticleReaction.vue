<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useData } from "vitepress";

const STORAGE_KEY = "article-reactions";
const { page } = useData();

type Reaction = "like" | "dislike";

const currentReaction = ref<Reaction | null>(null);

const articleUrl = computed(() => page.value.relativePath.replace(/\.md$/, ".html").replace(/^/, "/"));

function getReactions(): Record<string, Reaction> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveReaction(reaction: Reaction | null) {
  const reactions = getReactions();
  if (reaction) {
    reactions[articleUrl.value] = reaction;
  } else {
    delete reactions[articleUrl.value];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reactions));
}

function toggle(reaction: Reaction) {
  if (currentReaction.value === reaction) {
    currentReaction.value = null;
    saveReaction(null);
  } else {
    currentReaction.value = reaction;
    saveReaction(reaction);
  }
}

onMounted(() => {
  currentReaction.value = getReactions()[articleUrl.value] || null;
});
</script>

<template>
  <div class="article-reaction">
    <span class="label">這篇文章對你有幫助嗎？</span>
    <div class="buttons">
      <button
        :class="['btn', 'btn-like', { active: currentReaction === 'like' }]"
        @click="toggle('like')"
        aria-label="讚"
      >
        👍
      </button>
      <button
        :class="['btn', 'btn-dislike', { active: currentReaction === 'dislike' }]"
        @click="toggle('dislike')"
        aria-label="倒讚"
      >
        👎
      </button>
    </div>
  </div>
</template>

<style scoped>
.article-reaction {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 16px 0;
  border-top: 1px solid var(--vp-c-divider);
}

.label {
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.buttons {
  display: flex;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-mute);
}

.btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
</style>
