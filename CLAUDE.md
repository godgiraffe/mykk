# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

**Package manager: Bun（永遠使用 bun，不用 npm）**

```bash
bun install
bun run docs:dev
bun run docs:build
bun run docs:preview
bun run curation:apply ./path/to/curation-export.json
bun run curation:backfill
```

**x-bookmark-sync（X 書籤同步工具）**

```bash
cd x-bookmark-sync && bun install
bun run sync
bun run sync 5
bun run sync --reset
```

## Architecture

本專案是個人知識管理系統，分成兩個主體：

### knowledge-base/ — VitePress 靜態知識庫

- 部署到 GitHub Pages：`https://godgiraffe.github.io/mykk/`
- `base: "/mykk/"`，本地搜尋開啟，中文化介面
- 導覽列：首頁 `/`、待審 `/review`、精選 `/curated`、封存 `/archive`

**資料層**

- `.vitepress/data/category-meta.ts`
  - 6 個主要分類的單一來源（slug / 中文名 / 描述）
- `.vitepress/data/article-record.ts`
  - frontmatter 與舊文章 fallback parsing 的核心
  - 輸出 `ArticleRecord`，含 `summary`、`curationStatus`、`priorityScore`、`curationNote`
- `.vitepress/data/articles.data.ts`
  - `createContentLoader("**/*.md")`
  - 排除首頁、分類首頁、review/curated/archive 與 legacy liked/disliked 頁
  - 排序：`date DESC -> priorityScore DESC -> number DESC -> category`

**主題元件**（`theme/index.ts` 會在 `doc-after` 插入 `ArticleCuration`）

| 元件 | 職責 |
|------|------|
| `LatestArticles` | 首頁先顯示 `curated`，若尚未精選則退回高 priority `inbox` |
| `CategoryList` | 顯示各主分類的精選 / 待審 / 封存分布 |
| `ArticleList` | 分類首頁文章列表，附帶 curation 狀態與 priority |
| `ArticleCuration` | 文章頁底部 triage 控制：待審 / 精選 / 封存 |
| `CurationWorkspace` | `review` / `curated` / `archive` 共用工作台 |

**Curation 系統**

- `theme/composables/useCuration.ts`
  - localStorage key：`article-curation`
  - 格式：`{ "/category/NNN-slug.html": { status, updatedAt } }`
  - 這是瀏覽器本地 override，不是 repo 的正式狀態
- `scripts/apply-curation-export.ts`
  - 吃前台匯出的 JSON，把 `curationStatus` 回寫到文章 frontmatter
- `scripts/backfill-curation-frontmatter.ts`
  - 幫既有文章批次補 frontmatter、摘要、分數與 curation note
- `scripts/curation-utils.ts`
  - curation scripts 共用的讀寫邏輯

### x-bookmark-sync/ — X 書籤同步器

主流程（`src/main.ts`）：

```text
fetchAllBookmarks()
  -> processBookmarkContent()
  -> classifyAndSummarize()
  -> generateArticle()
  -> markProcessed()
  -> deleteBookmark()
  -> gitCommitAndPush()
```

各模組：

| 模組 | 職責 |
|------|------|
| `fetch-bookmarks.ts` | 用 `bunx @steipete/bird` 抓書籤與 unbookmark |
| `process-content.ts` | 展開 t.co、抓 X Article、抓外部連結文字 |
| `classify-article.ts` | Claude Haiku 分類、摘要、產生 curation scores |
| `generate-markdown.ts` | Claude Sonnet 整理正文，寫入 Markdown + frontmatter |
| `curation-frontmatter.ts` | frontmatter builder / parser，供同步器與 scripts 共用 |
| `claude-ai.ts` | `claude -p --model` wrapper，含 retry |
| `progress.ts` | `.sync-progress.json` 斷點續跑 |

`.env` 只需要：

```bash
X_AUTH_TOKEN=
X_CT0=
```

## Knowledge Base

### 路徑結構

```text
knowledge-base/
├── index.md
├── review.md
├── curated.md
├── archive.md
├── liked.md              # legacy 說明頁
├── disliked.md           # legacy 說明頁
├── .vitepress/
│   ├── config.ts
│   ├── sidebar.ts
│   ├── data/
│   └── theme/
├── assets/{category}/
└── {category}/
    ├── index.md
    └── {NNN}-{slug}.md
```

### 文章格式

新文章與 backfill 後文章都應有 frontmatter：

```markdown
---
title: "標題"
date: "YYYY-MM-DD"
tags:
  - "tag1"
summary: "摘要"
curationStatus: "inbox"
usefulnessScore: 68
noveltyScore: 51
evergreenScore: 57
priorityScore: 61
curationNote: "審閱提示"
source:
  tweetUrl: "https://x.com/..."
  externalUrl: null
  authorUsername: "foo"
---

# 標題
```

### 分類管理

主要分類以 `.vitepress/data/category-meta.ts` 為準：

- `ai-tools`
- `crypto-investing`
- `defi`
- `quant-trading`
- `dev`
- `lifestyle`

`uncategorized` 與 `unknown` 是 fallback bucket，不是主要 taxonomy。

新增主要分類時需要同步更新：

1. `.vitepress/data/category-meta.ts`
2. `x-bookmark-sync/src/classify-article.ts` 的分類 prompt
3. `knowledge-base/{category}/index.md`

### 知識庫查詢

回答使用者問題時，先依主題搜尋對應分類文章，再組合答案：

| 主題 | 搜尋路徑 |
|------|----------|
| AI 工具、Claude Code、Prompt | `knowledge-base/ai-tools/` |
| 加密貨幣投資、週期策略 | `knowledge-base/crypto-investing/` |
| DeFi、LP、協議、安全 | `knowledge-base/defi/` |
| 量化交易、套利、盤口 | `knowledge-base/quant-trading/` |
| 軟體開發、程式語言、工具 | `knowledge-base/dev/` |
| 生活、理財、效率、娛樂 | `knowledge-base/lifestyle/` |

搜尋方式：用 `rg` 搜關鍵字，讀相關文章後整合回答。

## CI/CD

- `.github/workflows/deploy.yml` 只有在以下路徑變更時才會觸發 Pages 重建：
  - `knowledge-base/**`
  - `package.json`
  - `.github/workflows/deploy.yml`
- 純改 `x-bookmark-sync/**` 或 `CLAUDE.md` 不會自動部署
- 需要手動觸發時可用：`gh workflow run deploy.yml --repo godgiraffe/mykk`
