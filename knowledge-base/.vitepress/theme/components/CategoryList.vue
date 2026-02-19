<script setup lang="ts">
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as allArticles } from "../../data/articles.data";

const categories = [
  { slug: "ai-tools",        name: "AI 工具與應用",  desc: "AI 工具、Claude Code、Prompt 工程、AI 開發與安全" },
  { slug: "crypto-investing", name: "加密貨幣投資",  desc: "加密貨幣投資哲學、週期生存、心態管理" },
  { slug: "defi",            name: "DeFi 策略與安全", desc: "DeFi 策略、LP、套利、智能合約安全" },
  { slug: "quant-trading",   name: "量化交易",       desc: "量化交易、市場微觀結構、高頻交易" },
  { slug: "dev",             name: "軟體開發",       desc: "開發工具、程式語言、軟體工程、知識管理" },
  { slug: "lifestyle",       name: "生活與效率",     desc: "旅遊、理財、生產力、娛樂、自我成長" },
];

const totalCount = computed(() => (allArticles || []).length);

const rows = computed(() =>
  categories.map((c) => ({
    ...c,
    count: (allArticles || []).filter((a) => a.category === c.slug).length,
    link: `/${c.slug}/`,
  }))
);
</script>

<template>
  <div class="category-header">
    <span class="total-count">共 {{ totalCount }} 篇</span>
  </div>
  <table class="category-table">
    <thead>
      <tr>
        <th>分類</th>
        <th>說明</th>
        <th class="count-col">篇數</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.slug">
        <td><a :href="withBase(row.link)">{{ row.name }}</a></td>
        <td>{{ row.desc }}</td>
        <td class="count-col">{{ row.count }} 篇</td>
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
  width: 80px;
}
</style>
