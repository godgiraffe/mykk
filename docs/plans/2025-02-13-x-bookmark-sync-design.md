# X 書籤自動歸檔系統 設計文件

> **日期**: 2025-02-13
> **狀態**: 待實作

---

## 目標

自動化從 X (Twitter) 書籤抓取內容，整理成知識庫文章並歸檔。取代目前手動貼連結的工作流程。

## 使用流程

1. 手動執行 `bun run sync`
2. 腳本自動抓取所有 X 書籤
3. 逐一處理：抓取內容 → AI 分類 → 生成 markdown → 下載圖片
4. 成功歸檔後自動從 X 移除書籤
5. 輸出處理報告

## 技術棧

- **Runtime**: Bun + TypeScript
- **API**: X API v2 (OAuth 2.0)
- **AI**: Claude API（內容摘要 + 自動分類）
- **瀏覽器抓取**: agent-browser（抓取推文中的連結內容）

## 認證機制

### OAuth 2.0 流程

- **認證資訊**: Client ID + Client Secret
- **初次設定** (`bun run setup`):
  1. 啟動本地 server (localhost:3000)
  2. 生成授權 URL 並開啟瀏覽器
  3. 使用者登入 X 並授權
  4. Callback 接收 authorization code
  5. 交換取得 Access Token + Refresh Token
  6. 儲存到 `.env`
- **日常使用**:
  - 自動使用儲存的 Access Token
  - Token 過期時用 Refresh Token 自動更新

### 安全性

- `.env` 不進 git（已在 `.gitignore`）
- 只存取使用者自己的書籤
- 最小權限原則（Read + Write bookmark only）

## 專案結構

```
x-bookmark-sync/
├── src/
│   ├── auth.ts                 # OAuth 2.0 認證 + Token 管理
│   ├── fetch-bookmarks.ts      # 從 X API 抓取書籤
│   ├── process-content.ts      # 抓取連結內容（agent-browser）
│   ├── classify-article.ts     # AI 自動分類
│   ├── generate-markdown.ts    # 生成知識庫文章
│   ├── handle-images.ts        # 圖片下載與處理
│   ├── cleanup-bookmarks.ts    # 從 X 移除已處理書籤
│   └── report.ts               # 生成處理報告
├── main.ts                     # 主要執行入口（bun run sync）
├── setup.ts                    # 初次認證入口（bun run setup）
├── .env                        # API keys（不進 git）
├── package.json
└── tsconfig.json
```

## 資料處理流程

### 1. 抓取書籤 (fetch-bookmarks.ts)

```
GET /2/users/:id/bookmarks
├─ 處理分頁（pagination_token）
└─ 回傳：[{ id, text, url, author, created_at, media }]
```

### 2. 逐一處理 (process-content.ts)

對每個書籤：
- 推文本身有長文 → 直接使用
- 推文包含外部連結 → 用 agent-browser 抓取完整內容

### 3. AI 分類 (classify-article.ts)

- 使用 Claude API 分析內容主題
- 判斷分類：對應現有 category（crypto-investing / defi / quant-trading / lifestyle）
- 若無匹配 → 建議新分類
- 生成 slug（英文簡稱）
- 提取關鍵標籤

### 4. 生成文章 (generate-markdown.ts)

- 讀取該分類現有文章，計算下一個流水號
- 生成檔名：`{NNN}-{slug}.md`
- 套用知識庫模板格式（來源、日期、標籤、正文）

### 5. 圖片處理 (handle-images.ts)

- **來源**: 推文圖片（X API）+ 連結內容圖片（agent-browser）
- **儲存位置**: `knowledge-base/assets/{category}/{NNN}-{slug}-{index}.{ext}`
- **支援格式**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **引用方式**: `![描述](../assets/{category}/{filename})`
- **篩選**: 保留有資訊價值的圖（圖表、截圖），跳過裝飾性圖片

### 6. 清理書籤 (cleanup-bookmarks.ts)

- 成功歸檔 → `DELETE /2/users/:id/bookmarks/:tweet_id`
- 失敗 → 保留在 X 書籤，記錄到錯誤日誌

### 7. 處理報告 (report.ts)

```
同步報告 - 2025-02-13
━━━━━━━━━━━━━━━━━━━━
成功：12 篇
失敗：1 篇（連結無法存取）
━━━━━━━━━━━━━━━━━━━━
詳細：
✅ 003-pendle-yt-entry → defi
✅ 007-ten-btc-philosophy → crypto-investing
❌ https://x.com/xxx/status/123 → 連結已刪除
```

## 錯誤處理

| 錯誤情境 | 處理方式 |
|----------|----------|
| Token 過期 | 自動用 Refresh Token 更新 |
| 連結無法存取 | 保留書籤，記錄錯誤 |
| AI 無法分類 | 放入 `uncategorized/` 資料夾 |
| 圖片下載失敗 | 用 placeholder 標記，繼續處理文字 |
| API rate limit | 等待後重試 |
| 重複內容 | 比對 URL 跳過已存在的文章 |

## 環境變數 (.env)

```
X_CLIENT_ID=
X_CLIENT_SECRET=
X_ACCESS_TOKEN=
X_REFRESH_TOKEN=
ANTHROPIC_API_KEY=
```
