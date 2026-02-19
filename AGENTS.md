# AGENTS.md

此檔案提供 AI agent 在此專案中執行任務的操作規程。

## 新增文章（手動歸檔）

1. 確認目標分類（6 個固定分類，見 CLAUDE.md）
2. 計算流水號：`ls knowledge-base/{category}/ | grep -E '^[0-9]+' | sort | tail -1`
3. 建立 `knowledge-base/{category}/{NNN}-{slug}.md`，使用標準模板
4. 若有圖片：存入 `knowledge-base/assets/{category}/`，MD 內用 `../assets/{category}/file` 引用
5. Build 確認：`bun run docs:build`（避免圖片路徑錯誤導致 CI 失敗）
6. Commit 並 push

## 修改首頁 LatestArticles 顯示邏輯

- 演算法在 `knowledge-base/.vitepress/theme/components/LatestArticles.vue`
- 目前：每分類最多 2 篇，兩段式遍歷補滿 12 篇
- 排序來源：`articles.data.ts`（`number` 降序，各分類獨立計數）

## 修改分類表格 CategoryList

- 元件：`knowledge-base/.vitepress/theme/components/CategoryList.vue`
- `categories` 陣列 hardcode 分類 metadata，篇數從 `articles.data` 動態計算
- 新增分類時同步更新（見 MEMORY.md 的 checklist）

## 修改反應系統（按讚/倒讚）

- 共用邏輯在 `ReactionArticles.vue`，`LikedArticles`/`DislikedArticles` 是薄殼
- localStorage 操作集中在 `useReactions.ts`（含 SSR guard）
- 儲存格式：`{ "/category/NNN-slug.html": "like" | "dislike" }`

## x-bookmark-sync 疑難排解

| 症狀 | 原因 | 解法 |
|------|------|------|
| 抓不到書籤 | X cookies 過期 | 更新 `.env` 的 `X_AUTH_TOKEN` 和 `X_CT0` |
| Claude 分類失敗 | `claude` CLI 未登入 | `claude` 互動登入 |
| 圖片下載失敗 | 推文圖片需 auth | 跳過圖片，移除 MD 內的圖片引用 |
| 重複處理 | 進度檔損壞 | 檢查 `.sync-progress.json`，手動加入 tweetId |

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
