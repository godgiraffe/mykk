# mykk

個人知識庫系統。從 X 書籤抓內容、用 Claude 整理成 Markdown，再透過 VitePress 以可檢索、可策展的方式瀏覽。

線上閱讀：https://godgiraffe.github.io/mykk/

## 架構

```text
mykk/
├── knowledge-base/          # VitePress 知識庫網站
│   ├── review.md            # 待審工作台
│   ├── curated.md           # 精選內容
│   ├── archive.md           # 封存內容
│   ├── .vitepress/          # config / sidebar / data / theme
│   ├── assets/              # 圖片附件
│   └── {category}/          # 各分類文章
├── scripts/                 # curation apply / backfill CLI
├── x-bookmark-sync/         # X 書籤同步工具
└── .github/workflows/       # GitHub Pages 自動部署
```

## 快速開始

### 1. 本機瀏覽知識庫

```bash
bun install
bun run docs:dev
# http://localhost:5173/mykk/
```

### 2. 從 X 同步文章

前置準備：

1. 確認 `claude --version` 可執行，且 Claude CLI 已登入
2. 從 Chrome DevTools 取得 X cookies：
   - `auth_token` → `X_AUTH_TOKEN`
   - `ct0` → `X_CT0`
3. 建立設定檔：

```bash
cp x-bookmark-sync/.env.example x-bookmark-sync/.env
```

執行同步：

```bash
cd x-bookmark-sync
bun install
bun run sync
bun run sync 5
bun run sync --reset
```

同步流程：

```text
X 書籤
  -> bird CLI 抓書籤
  -> 展開 t.co / X Article / 外部連結
  -> Claude Haiku 分類、摘要、打分
  -> Claude Sonnet 整理正文
  -> 寫入 knowledge-base/{category}/{NNN}-{slug}.md
  -> 記錄 progress / unbookmark / git commit + push
```

## Curation Workflow

前台現在採三層內容流：

- `review`：待審文章，預設 `inbox`
- `curated`：真正想回頭重看的精選內容
- `archive`：低信號、重複、或暫時不再投入注意力的內容

文章 frontmatter 會包含：

- `summary`
- `curationStatus`
- `usefulnessScore`
- `noveltyScore`
- `evergreenScore`
- `priorityScore`
- `curationNote`

前台的 triage 操作先寫在瀏覽器 localStorage。若要把決策正式回寫到 repo：

```bash
bun run curation:apply ./path/to/curation-export.json
```

若要幫既有文章批次補 frontmatter 與 curation metadata：

```bash
bun run curation:backfill
```

## 知識庫分類

主要 6 類：

| 分類 | 說明 |
|------|------|
| `ai-tools` | AI 工具、Claude Code、Prompt 工程、AI 開發與安全 |
| `crypto-investing` | 加密貨幣投資哲學、週期生存、心態管理 |
| `defi` | DeFi 策略、LP、套利、智能合約安全 |
| `quant-trading` | 量化交易、市場微觀結構、高頻交易 |
| `dev` | 開發工具、程式語言、軟體工程、知識管理 |
| `lifestyle` | 旅遊、理財、生產力、娛樂、自我成長 |

fallback buckets：

- `uncategorized`
- `unknown`

這兩類不是主要 taxonomy，通常代表舊資料、低信號內容，或解析失敗時的回退結果。

## 常見維運

X Cookie 過期時，通常會出現 `bird bookmarks 失敗`、`403`、`Unauthorized`。更新 `x-bookmark-sync/.env` 內的 `X_AUTH_TOKEN` 與 `X_CT0` 即可。

建站檢查：

```bash
bun run docs:build
bun run docs:preview
```

最常見的 build 失敗原因是圖片引用錯誤，特別是文章中引用了不存在的 `../assets/...` 檔案。

## 部署

推送到 `main` 分支後，GitHub Actions 會在 `knowledge-base/**` 或 `package.json` 變更時自動重建 GitHub Pages。
