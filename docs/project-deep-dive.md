# mykk 專案深度導讀

> 產出日期：2026-02-25
> 更新日期：2026-03-06
> 範圍：`knowledge-base/`（前台知識庫）+ `x-bookmark-sync/`（內容同步器）+ curation scripts + CI/CD

## 1. 這個專案在做什麼

`mykk` 是一個「個人知識管理系統」，核心目標是把 X（Twitter）書籤內容半自動轉成可長期閱讀與檢索的知識庫網站。

它由兩個系統組成：

1. `x-bookmark-sync/`：內容 ingestion pipeline
- 從 X 書籤抓資料
- 解析連結內容
- 用 Claude 進行分類與整理
- 輸出 markdown 到 `knowledge-base/{category}/`

2. `knowledge-base/`：內容 delivery + curation system
- 用 VitePress 把 markdown 編成靜態網站
- 提供首頁、分類頁、文章頁
- 提供 `review / curated / archive` 工作流
- 支援 localStorage override + export JSON + repo 回寫

最終部署到 GitHub Pages：`https://godgiraffe.github.io/mykk/`

---

## 2. 整體資料流（Data Flow）

## 2.1 從 X 書籤到網站上線

```text
X Bookmarks
  -> bird CLI 讀取書籤 JSON
  -> 內容解析（X 內文 / t.co 展開 / 外部連結抓文）
  -> Claude Haiku 分類（category/slug/title/tags/summary/scores）
  -> Claude Sonnet 生成正文
  -> 寫入 knowledge-base/{category}/{NNN}-{slug}.md + frontmatter
  ->（可選）下載推文圖片到 knowledge-base/assets/{category}/
  -> 記錄進度 .sync-progress.json
  -> 從 X 移除已處理書籤
  -> git add/commit/push
  -> GitHub Actions 觸發 docs:build
  -> Deploy 到 GitHub Pages
```

## 2.2 前台讀取與渲染

```text
Markdown files
  -> createContentLoader("**/*.md") build-time 掃描
  -> 轉成 curation-aware articles.data
  -> 首頁元件（LatestArticles / CategoryList）使用
  -> review / curated / archive 工作台使用
  -> 分類頁元件（ArticleList）使用
```

## 2.3 Curation 資料流

```text
文章頁 triage / review 工作台操作
  -> localStorage['article-curation'] 寫入
     { "/category/NNN-slug.html": { status, updatedAt } }
  -> review / curated / archive 頁讀取 localStorage
  -> 對照 frontmatter 的正式狀態產生 effective status
  -> 匯出 JSON
  -> bun run curation:apply
  -> 回寫到 markdown frontmatter 的 curationStatus
```

---

## 3. 系統運作流程

## 3.1 `x-bookmark-sync` 執行流程

入口：`bun run sync [N] [--reset]`（`x-bookmark-sync/src/main.ts`）

1. 參數解析
- `--reset`：清空 `.sync-progress.json`
- `N`：限制本次最多處理幾筆

2. 啟動前檢查
- 讀 `.env`，需有 `X_AUTH_TOKEN`、`X_CT0`
- 驗證 `claude --version` 可執行
- 自動遷移舊版 progress（只有 tweetId 的紀錄）

3. 抓取書籤
- `bunx @steipete/bird bookmarks --json [--count N]`
- 轉成 internal `Bookmark` 結構

4. 逐筆處理（支援 Ctrl+C 優雅中斷）
- `processBookmarkContent()` 抓完整內容
- `classifyAndSummarize()` 做 AI 分類
- `generateArticle()` 產生 markdown 與圖片
- `markProcessed()` 寫進度
- `deleteBookmark()` 從 X 移除
- 筆與筆間隔 3 秒

5. 結束
- 印成功/失敗報告
- 若有成功，執行 `git add knowledge-base/` + commit + push
- 新文章會直接帶 `summary / curationStatus / usefulnessScore / noveltyScore / evergreenScore / priorityScore / curationNote`

## 3.2 `processBookmarkContent` 分支邏輯

1. 若 `bookmark.article` 存在
- 視為 X Article，直接 `bird read --json` 拉全文

2. 若有 t.co 連結
- 先 `HEAD` 展開短網址
- 若是 `x.com/twitter.com` 內部連結，改走 `bird read`
- 若是外部連結，`fetch` 網頁並粗抽純文字（最多 15,000 字元）

3. 若都失敗
- 回退到原推文文字

## 3.3 AI 分類與文章生成

`classify-article.ts`
- 要求 Claude 回傳 JSON：`category/slug/title/tags/summary/usefulnessScore/noveltyScore/evergreenScore/curationStatus/curationNote`
- 預設分類池是 6 類：`ai-tools`、`crypto-investing`、`defi`、`quant-trading`、`dev`、`lifestyle`
- JSON 解析失敗時 fallback：`uncategorized/tweet-{tweetId}`

`generate-markdown.ts`
- `sanitizePathSegment()` 防止路徑穿越
- `getNextNumber()` 每分類獨立遞增流水號
- 圖片下載到 `knowledge-base/assets/{category}/`
- Markdown 模板現在包含 YAML frontmatter + 來源 / 日期 / 標籤 / 正文

## 3.4 知識庫前台流程（VitePress）

`knowledge-base/.vitepress/data/articles.data.ts`
- Build 時掃 `**/*.md`
- 排除 `/review.html`、`/curated.html`、`/archive.html` 與 legacy `liked/disliked`
- 透過 `article-record.ts` 解析 frontmatter 與舊文章 fallback
- 排序規則：`date DESC` → `priorityScore DESC` → `number DESC`

`LatestArticles.vue`
- 若有 `curated`，優先顯示精選
- 若尚未精選，退回高 priority `inbox`
- 仍採每分類最多先取 2 篇，再用 overflow 補滿 12 篇

`CategoryList.vue`
- 類別 metadata 來自 `category-meta.ts`
- 顯示每類 `curated / inbox / archive / total`

`ArticleList.vue`
- 依當前路徑判斷分類
- 直接用 `articles.data` 過濾當前分類
- 依狀態優先級 + priority 排序

`ArticleCuration.vue` + `CurationWorkspace.vue`
- 文章頁與 review 工作台都可切換 `inbox / curated / archive`
- 支援匯出本地決策 JSON
- repo 正式狀態仍以文章 frontmatter 為準

---

## 4. 各流程細節與行為特徵

## 4.1 編號與歸檔規則

1. 編號是「每分類獨立」
- 例如 `defi/243-...` 不代表全站第 243 篇，只是 defi 類第 243 號

2. 重新處理同 tweet
- 會查 progress 拿舊 `category/filename`
- 嘗試刪舊檔
- 用舊號碼覆寫新檔（`replaceNumber`）

3. 若 AI 回傳新分類
- 會自動建立新資料夾並寫入文章
- 但不會自動建立該分類 `index.md`

## 4.2 Curation 系統細節

1. localStorage 是 override，不是 source of truth
- frontmatter `curationStatus` 才是正式狀態
- local override 只影響目前瀏覽器顯示

2. Key 格式與文章 URL 綁死
- `"/category/NNN-slug.html"`

3. 支援匯出與 repo 回寫
- `bun run curation:apply ./path/to/export.json`

4. 支援批次補 frontmatter
- `bun run curation:backfill`

## 4.3 CI/CD 觸發細節

`.github/workflows/deploy.yml` 只有這些變更才會觸發：

- `knowledge-base/**`
- `package.json`
- `.github/workflows/deploy.yml`

所以只改 `x-bookmark-sync/**` 不會自動部署。

---

## 5. 專案現況快照（實際掃描結果）

## 5.1 文章分類與數量（2026-03-06）

- `quant-trading`: 460
- `defi`: 245
- `crypto-investing`: 223
- `ai-tools`: 164
- `dev`: 102
- `lifestyle`: 26
- `uncategorized`: 9
- `unknown`: 1

內容文章總數：1230。

## 5.2 資產（圖片）分布

`assets/` 內以 `quant-trading`、`defi` 最多，表示內容來源很偏交易與 DeFi。

## 5.3 本機建置驗證

已執行：

```bash
bun run docs:build
```

結果：建置成功（約 50-60 秒），有 chunk size warning 與 syntax highlighting fallback warning，但不阻斷部署。

---

## 6. 補充觀察（重要）

以下是目前 repo 的一致性與維運風險點：

1. frontmatter 現在是內容治理基礎
- 新文章同步時會直接寫入
- 舊文章可用 `curation:backfill` 補齊

2. localStorage 與 repo 狀態是兩層
- 前台 triage 很快，但正式狀態仍需要 export + apply
- 這樣能兼顧靜態站架構與 repo versioning

3. `uncategorized` / `unknown` 仍存在
- 這些內容通常該優先封存或後續人工整理

4. 編號重複案例存在
- 例如 `ai-tools` 與 `crypto-investing` 各有同號不同 slug 檔案
- 這不會壞掉，但會讓「同分類同編號唯一」假設失效

5. 自動 git commit/push 風險
- 同步腳本執行完成會直接推送，若本地工作樹有其他未預期變更，操作風險較高

6. 測試保護網不足
- 目前幾乎無自動測試，主要靠 build 與手動檢查

---

## 7. 建議後續優化方向

1. 把 export JSON 回寫能力搬到前台
- 目前已可 export 和 CLI apply
- 若要全網頁化，可考慮 File System Access API

2. 補齊 category lifecycle
- 新分類自動建立 `knowledge-base/{category}/index.md`
- 同步更新 `category-meta.ts` 與分類 prompt

3. 強化同步安全
- 加 `--no-git` 模式（預設不 push）
- 僅在乾淨工作樹才允許自動 commit/push

4. 增加測試
- `articles.data` 過濾/排序測試
- `LatestArticles` 配額演算法測試
- `progress` 遷移測試

5. 補資料品質檢查工具
- 掃描重複編號、遺失圖片、無效連結
- pre-commit 或 CI 增加檢查步驟

---

## 8. 核心檔案索引（方便後續維護）

前台：
- `knowledge-base/.vitepress/config.ts`
- `knowledge-base/.vitepress/sidebar.ts`
- `knowledge-base/.vitepress/data/category-meta.ts`
- `knowledge-base/.vitepress/data/article-record.ts`
- `knowledge-base/.vitepress/data/articles.data.ts`
- `knowledge-base/.vitepress/theme/components/LatestArticles.vue`
- `knowledge-base/.vitepress/theme/components/CategoryList.vue`
- `knowledge-base/.vitepress/theme/components/ArticleList.vue`
- `knowledge-base/.vitepress/theme/components/ArticleCuration.vue`
- `knowledge-base/.vitepress/theme/components/CurationWorkspace.vue`
- `knowledge-base/.vitepress/theme/composables/useCuration.ts`
- `scripts/apply-curation-export.ts`
- `scripts/backfill-curation-frontmatter.ts`
- `scripts/curation-utils.ts`

同步器：
- `x-bookmark-sync/src/main.ts`
- `x-bookmark-sync/src/fetch-bookmarks.ts`
- `x-bookmark-sync/src/process-content.ts`
- `x-bookmark-sync/src/classify-article.ts`
- `x-bookmark-sync/src/generate-markdown.ts`
- `x-bookmark-sync/src/curation-frontmatter.ts`
- `x-bookmark-sync/src/claude-ai.ts`
- `x-bookmark-sync/src/progress.ts`
- `x-bookmark-sync/src/auth.ts`

部署：
- `.github/workflows/deploy.yml`
