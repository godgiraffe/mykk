# mykk

個人知識庫系統 — 自動從 X 書籤同步文章，透過 VitePress 瀏覽。

**線上閱讀**: https://godgiraffe.github.io/mykk/

## 架構

```
mykk/
├── knowledge-base/          # 知識庫內容（VitePress 網站）
│   ├── index.md             # 首頁
│   ├── .vitepress/          # VitePress 設定
│   ├── assets/              # 圖片附件
│   └── {category}/          # 各分類文章
├── x-bookmark-sync/         # X 書籤同步工具
└── .github/workflows/       # GitHub Pages 自動部署
```

## 快速開始

### 1. 瀏覽知識庫（本機）

```bash
bun install
bun run docs:dev
# 開啟 http://localhost:5173/mykk/
```

### 2. 同步 X 書籤到知識庫

#### 前置準備

1. 取得 **Gemini API Key**（免費）: https://aistudio.google.com/apikey

2. 取得 **X Cookie**:
   - 登入 [x.com](https://x.com)
   - 開啟 Chrome DevTools（F12）→ Application → Cookies → `https://x.com`
   - 複製以下兩個值：
     - `auth_token` → 填入 `X_AUTH_TOKEN`
     - `ct0` → 填入 `X_CT0`

3. 建立 `.env`:

```bash
cp x-bookmark-sync/.env.example x-bookmark-sync/.env
# 編輯 .env 填入上述三個值
```

#### 執行同步

```bash
cd x-bookmark-sync
bun install
bun run sync          # 同步所有書籤
bun run sync 5        # 只處理 5 筆
bun run sync --reset  # 清除進度（重新處理所有書籤）
```

同步流程：抓取 X 書籤 → Gemini AI 分類與整理 → 生成 markdown 文章 → 從 X 移除已處理書籤

#### Cookie 過期處理

> **X Cookie 大約每 1-2 週會過期。** 過期時同步會出現 `bird bookmarks 失敗` 的錯誤。

重新取得 Cookie 的步驟：

1. 到 [x.com](https://x.com) 確認已登入
2. F12 → Application → Cookies → `https://x.com`
3. 複製新的 `auth_token` 和 `ct0` 值
4. 更新 `x-bookmark-sync/.env`

**提示**: 如果看到 `403` 或 `Unauthorized` 錯誤，通常就是 Cookie 過期了。

## 知識庫分類

| 分類 | 說明 |
|------|------|
| quant-trading | 量化交易、市場微觀結構 |
| crypto-investing | 加密貨幣投資、週期策略 |
| defi | DeFi 策略、LP、協議操作 |
| ai-tools | AI 工具、Claude Code |
| personal-finance | 個人理財、投資入門 |
| software-engineering | 軟體工程、開發流程 |
| lifestyle | 旅遊攻略、生活技巧 |
| entertainment | 趣味專案 |

## 部署

推送到 `main` 分支後，GitHub Actions 會自動部署到 GitHub Pages。

手動構建：

```bash
bun run docs:build    # 產出在 knowledge-base/.vitepress/dist/
bun run docs:preview  # 預覽構建結果
```
