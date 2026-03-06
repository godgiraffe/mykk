# AGENTS.md

此檔案提供 AI agent 在此專案中執行任務的操作規程。

## 新增文章（手動歸檔）

1. 確認目標分類（6 個主要分類定義在 `knowledge-base/.vitepress/data/category-meta.ts`）
2. 計算流水號：`ls knowledge-base/{category}/ | grep -E '^[0-9]+' | sort | tail -1`
3. 建立 `knowledge-base/{category}/{NNN}-{slug}.md`，使用含 frontmatter 的標準模板
4. 若有圖片：存入 `knowledge-base/assets/{category}/`，MD 內用 `../assets/{category}/file` 引用
5. Build 確認：`bun run docs:build`（避免圖片路徑錯誤導致 CI 失敗）
6. Commit 並 push

## Curation Workflow

- 主入口頁：`knowledge-base/review.md`、`knowledge-base/curated.md`、`knowledge-base/archive.md`
- 文章頁 triage 控制元件：`knowledge-base/.vitepress/theme/components/ArticleCuration.vue`
- 共用工作台：`knowledge-base/.vitepress/theme/components/CurationWorkspace.vue`
- localStorage 狀態集中在 `knowledge-base/.vitepress/theme/composables/useCuration.ts`
- localStorage 格式：`{ "/category/NNN-slug.html": { status: "inbox" | "curated" | "archive", updatedAt: ISOString } }`
- repo 正式狀態在文章 frontmatter 的 `curationStatus`
- 若有前台匯出的 JSON，要回寫 repo：`bun run curation:apply ./path/to/curation-export.json`
- 若要幫既有文章批次補 frontmatter / summary / scores：`bun run curation:backfill`

## 修改首頁 LatestArticles 顯示邏輯

- 演算法在 `knowledge-base/.vitepress/theme/components/LatestArticles.vue`
- 目前：優先顯示 `curated`；若沒有精選，退回高 priority `inbox`
- 分類分散邏輯仍是每分類最多先取 2 篇，再用 overflow 補滿 12 篇
- 排序來源：`knowledge-base/.vitepress/data/articles.data.ts`

## 修改分類表格 CategoryList

- 元件：`knowledge-base/.vitepress/theme/components/CategoryList.vue`
- 分類 metadata 來自 `knowledge-base/.vitepress/data/category-meta.ts`
- 表格顯示的是 `curated / inbox / archive / total` 分布
- 新增主要分類時，同步更新 `category-meta.ts` 與 `x-bookmark-sync/src/classify-article.ts`

## x-bookmark-sync 疑難排解

| 症狀 | 原因 | 解法 |
|------|------|------|
| 抓不到書籤 | X cookies 過期 | 更新 `.env` 的 `X_AUTH_TOKEN` 和 `X_CT0` |
| Claude 分類失敗 | `claude` CLI 未登入 | `claude` 互動登入 |
| 圖片下載失敗 | 推文圖片需 auth | 跳過圖片，移除 MD 內的圖片引用 |
| 重複處理 | 進度檔損壞 | 檢查 `.sync-progress.json`，手動加入 tweetId |
| curation export 套用失敗 | JSON 路徑或 URL 對不上 | 檢查 export 檔格式，確認 key 是 `/category/NNN-slug.html` |

## Build 失敗 debug 流程

```bash
bun run docs:build 2>&1 | grep -A3 "error"
```

最常見原因：某篇 MD 引用了 `../assets/` 下不存在的圖片。
找到後移除引用行，不需要保留 placeholder。

## CI/CD 觸發條件

`.github/workflows/deploy.yml` 僅在以下路徑有變更時觸發：
- `knowledge-base/**`
- `package.json`
- `.github/workflows/deploy.yml`

純改 `x-bookmark-sync/` 或 `CLAUDE.md` 不會觸發 GitHub Pages 重建。
需要強制觸發：`gh workflow run deploy.yml --repo godgiraffe/mykk`
