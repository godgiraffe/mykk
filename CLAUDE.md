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
- `.vitepress/config.ts`：站台設定（base path `/mykk/`、zh-TW 語系、本地搜尋）
- `.vitepress/sidebar.ts`：從目錄結構自動生成側邊欄（掃描 markdown 標題，排除 index.md）
- `.vitepress/theme/`：自定義主題，全域註冊 `ArticleList`、`LatestArticles` 元件
- `.vitepress/data/articles.data.ts`：用 `createContentLoader` 掃描所有文章供首頁使用
- 6 個分類目錄（各含 `index.md` 分類首頁）+ `assets/` 圖片目錄

### x-bookmark-sync/ — X 書籤自動歸檔工具
TypeScript 工具，透過 `bird` CLI 抓取 X 書籤 → Gemini AI 分類摘要 → 生成 markdown 存入 knowledge-base。

核心流程：`main.ts` → `fetch-bookmarks.ts` → `process-content.ts` → `classify-article.ts`（Claude AI）→ `generate-markdown.ts`

需要 `.env` 設定 `X_AUTH_TOKEN`、`X_CT0`（X cookies 每 1-2 週過期需更新）。使用 Claude CLI (`claude -p`) 進行 AI 分類與文章生成。

### CI/CD
- `.github/workflows/deploy.yml`：push 到 main 時自動部署（僅 knowledge-base 相關檔案變更時觸發）

---

## Knowledge Base 知識庫

### 路徑結構

```
knowledge-base/
├── index.md               # 首頁（VitePress hero layout + 分類索引）
├── .vitepress/
│   ├── config.ts          # VitePress 設定
│   ├── sidebar.ts         # 自動生成側邊欄
│   └── public/            # 靜態資源（如需要）
├── assets/                # 圖片等附件，子資料夾對應分類
│   └── {category}/
└── {category}/            # 主題分類資料夾
    └── {NNN}-{slug}.md    # 文章（流水號-英文簡稱）
```

### 檔名規則

- 流水號三位數遞增：`001-`, `002-`, ...
- slug 用小寫英文 + 連字號：`orderbook-factors-hft`
- 完整範例：`001-orderbook-factors-hft.md`

### 文章模板

```markdown
# 標題（繁體中文）

> **來源**: [作者/出處](URL)
> **日期**: YYYY-MM-DD
> **標籤**: `tag1` `tag2` `tag3`

---

（正文內容，依主題自由組織章節）
```

### 輸入處理

| 輸入類型 | 處理方式 |
|----------|----------|
| URL 連結 | 用 agent-browser 抓取內容，整理後歸檔 |
| 文字內容 | 直接格式化整理歸檔 |
| 圖片 | 存入 `assets/{category}/`，文章內用 `../assets/category/file` 相對路徑引用 |

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

- 現有分類能涵蓋就不另開新的
- 真的需要新分類 → 建立新資料夾 + 更新 `index.md` 索引表
- 分類名用小寫英文 + 連字號

### 整理原則

- 保留原始來源與作者資訊
- 內容用繁體中文整理（專有名詞/公式保留原文）
- 加總覽表方便快速查閱
- 不過度改寫，忠於原意

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
