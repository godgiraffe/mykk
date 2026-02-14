# Knowledge Base 知識庫

## 路徑結構

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

## 檔名規則

- 流水號三位數遞增：`001-`, `002-`, ...
- slug 用小寫英文 + 連字號：`orderbook-factors-hft`
- 完整範例：`001-orderbook-factors-hft.md`

## 文章模板

```markdown
# 標題（繁體中文）

> **來源**: [作者/出處](URL)
> **日期**: YYYY-MM-DD
> **標籤**: `tag1` `tag2` `tag3`

---

（正文內容，依主題自由組織章節）
```

## 輸入處理

| 輸入類型 | 處理方式 |
|----------|----------|
| URL 連結 | 用 agent-browser 抓取內容，整理後歸檔 |
| 文字內容 | 直接格式化整理歸檔 |
| 圖片 | 存入 `assets/{category}/`，文章內用 `../assets/category/file` 相對路徑引用 |

## 分類管理

- 新主題 → 建立新資料夾 + 更新 `index.md` 索引表
- 分類名用小寫英文 + 連字號（如 `quant-trading`）
- 現有分類能涵蓋就不另開新的

## 整理原則

- 保留原始來源與作者資訊
- 內容用繁體中文整理（專有名詞/公式保留原文）
- 加總覽表方便快速查閱
- 不過度改寫，忠於原意

## 知識庫查詢

當使用者提問涉及以下主題時，先搜尋 knowledge-base/ 目錄的相關文章作為參考：

| 主題 | 搜尋路徑 |
|------|----------|
| 量化交易、盤口分析、套利 | `knowledge-base/quant-trading/` |
| 加密貨幣投資、週期策略 | `knowledge-base/crypto-investing/` |
| DeFi、LP 策略、協議操作 | `knowledge-base/defi/` |
| AI 工具、Claude Code | `knowledge-base/ai-tools/` |
| 個人理財、投資入門 | `knowledge-base/personal-finance/` |
| 軟體工程、開發流程 | `knowledge-base/software-engineering/` |

搜尋方式：使用 Grep 搜尋關鍵字，讀取相關文章後結合知識庫內容回答。
