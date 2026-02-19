# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

**Package manager: Bun（永遠使用 bun，不用 npm）**

```bash
bun install                  # 安裝依賴
bun run docs:dev             # 開發伺服器 http://localhost:5173/mykk/
bun run docs:build           # 建置靜態網站 → knowledge-base/.vitepress/dist/
bun run docs:preview         # 預覽建置結果
```

**x-bookmark-sync（X 書籤同步工具）**：
```bash
cd x-bookmark-sync && bun install   # 安裝依賴
bun run sync                        # 同步所有書籤
bun run sync 5                      # 只處理 5 筆
bun run sync --reset                # 清除進度重新開始
```

## Architecture

本專案是**個人知識管理系統**，包含兩個主要部分：

### knowledge-base/ — VitePress 靜態文件網站

- **VitePress** 驅動，部署至 GitHub Pages（`https://godgiraffe.github.io/mykk/`）
- `base: "/mykk/"`，`ignoreDeadLinks: true`，本地搜尋（中文化介面）
- 導覽列：首頁 / 按讚文章（`/liked`）/ 按倒讚文章（`/disliked`）

**資料層**：`.vitepress/data/articles.data.ts`
- 用 `createContentLoader("**/*.md")` 掃描所有文章，Build time 執行
- 資料結構：`{ title, url, category, categoryName, number }`，`number` 從檔名流水號提取
- 排序：`number 降序 → category 字母序`（各分類獨立編號，不跨分類比較）

**側邊欄**：`.vitepress/sidebar.ts`
- 掃描分類目錄，從各 MD 第一行 `#` 標題提取文章名稱，`collapsed: true`

**主題元件**（全域註冊於 `theme/index.ts`，`doc-after` 插槽自動插入 `ArticleReaction`）：

| 元件 | 職責 |
|------|------|
| `LatestArticles` | 首頁最新文章，每分類取 2 篇（兩段式遍歷，確保共 12 篇） |
| `CategoryList` | 首頁分類總覽表，動態計算各分類篇數，右上角顯示全站總篇數 |
| `ArticleList` | 分類首頁文章列表 |
| `ArticleReaction` | 每篇文章底部 👍👎，寫入 localStorage，監聽 URL 變化 |
| `ReactionArticles` | 共用，接受 `reaction: "like" | "dislike"` prop，按分類分組顯示 |
| `LikedArticles` | 薄殼：`<ReactionArticles reaction="like" />` |
| `DislikedArticles` | 薄殼：`<ReactionArticles reaction="dislike" />` |

**反應系統**（`theme/composables/useReactions.ts`）：
- `STORAGE_KEY = "article-reactions"`
- `getReactions()` → `Record<string, "like" | "dislike">`（含 SSR guard 與 runtime 型別驗證）
- Key 格式：`/category/NNN-slug.html`（與 `createContentLoader` 回傳的 URL 一致）

### x-bookmark-sync/ — X 書籤自動歸檔工具

核心流程（`src/main.ts` 主程序）：

```
fetchAllBookmarks()          # bird CLI 抓取 X 書籤
  → processBookmarkContent() # 解析 t.co 短連結，取完整內容（bird read / fetch）
  → classifyAndSummarize()   # Claude Haiku 分類 → { category, slug, title, tags, summary }
  → generateArticle()        # 下載圖片 → Claude Sonnet 生成正文 → 寫入 MD
  → markProcessed()          # 記錄進度到 .sync-progress.json
  → deleteBookmark()         # 從 X 移除書籤
  → gitCommitAndPush()       # 自動 commit + push
```

各模組職責：

| 模組 | 職責 |
|------|------|
| `fetch-bookmarks.ts` | `bunx @steipete/bird` CLI 抓書籤；轉換 Bookmark 結構；支援刪除 |
| `process-content.ts` | t.co 短連結解析；X 內部用 bird read，外部用 fetch |
| `classify-article.ts` | Claude Haiku 分類，六個固定分類，回傳 slug/title/tags |
| `generate-markdown.ts` | 計算流水號、下載圖片、Claude Sonnet 生成文章、寫 MD |
| `claude-ai.ts` | `claude -p --model` CLI wrapper，支援 haiku/sonnet，3 次重試 |
| `progress.ts` | `.sync-progress.json` 進度追蹤，支援斷點續傳 |

`.env` 需要的環境變數：
```
X_AUTH_TOKEN=   # Chrome DevTools → Application → Cookies → x.com
X_CT0=          # 同上（每 1-2 週過期需更新）
```

### CI/CD
- `.github/workflows/deploy.yml`：push 到 main 且 `knowledge-base/**` 有變更時自動部署
- 也支援 `workflow_dispatch` 手動觸發

---

## Knowledge Base 知識庫

### 路徑結構

```
knowledge-base/
├── index.md               # 首頁（VitePress hero layout + CategoryList）
├── liked.md               # 按讚文章頁（<LikedArticles />）
├── disliked.md            # 按倒讚文章頁（<DislikedArticles />）
├── .vitepress/
│   ├── config.ts
│   ├── sidebar.ts
│   ├── data/articles.data.ts
│   └── theme/
│       ├── index.ts
│       ├── composables/useReactions.ts
│       └── components/
├── assets/{category}/     # 圖片，用相對路徑 ../assets/category/file 引用
└── {category}/
    ├── index.md           # 分類首頁（<ArticleList />）
    └── {NNN}-{slug}.md    # 文章（三位數流水號，各分類獨立計數）
```

### 文章模板

```markdown
# 標題（繁體中文）

> **來源**: [作者/出處](URL)
> **日期**: YYYY-MM-DD
> **標籤**: `tag1` `tag2` `tag3`

---

（正文）
```

### 分類管理

現有 6 個分類，優先歸入現有分類：

| 分類 | 說明 |
|------|------|
| `ai-tools` | AI 工具、Claude Code、Prompt 工程、AI 開發 |
| `crypto-investing` | 加密貨幣投資哲學、週期策略、心態管理 |
| `defi` | DeFi 策略、LP、協議操作、智能合約安全 |
| `quant-trading` | 量化交易、市場微觀結構、套利 |
| `dev` | 軟體開發、程式語言、開發工具、知識管理 |
| `lifestyle` | 生活技巧、個人理財、效率提升、娛樂 |

新增分類時：建立目錄 + `index.md`（含 `<ArticleList />`）+ 更新 `CategoryList.vue` 的 `categories` 陣列 + `articles.data.ts` 的 `categoryNames`。

### 知識庫查詢

當使用者提問涉及以下主題時，先搜尋 knowledge-base/ 目錄的相關文章作為參考：

| 主題 | 搜尋路徑 |
|------|----------|
| AI 工具、Claude Code、Prompt | `knowledge-base/ai-tools/` |
| 加密貨幣投資、週期策略 | `knowledge-base/crypto-investing/` |
| DeFi、LP 策略、智能合約 | `knowledge-base/defi/` |
| 量化交易、盤口分析、套利 | `knowledge-base/quant-trading/` |
| 軟體開發、程式語言、工具 | `knowledge-base/dev/` |
| 生活、理財、效率、娛樂 | `knowledge-base/lifestyle/` |

搜尋方式：使用 Grep 搜尋關鍵字，讀取相關文章後結合知識庫內容回答。
