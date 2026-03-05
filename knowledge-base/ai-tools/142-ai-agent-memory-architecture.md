# AI Agent 記憶系統架構實踐指南

> **來源**: [@xxx111god](https://x.com/xxx111god/status/2026449632214020286) | [原文連結](https://x.com/i/article/2026418317058256898)
>
> **日期**: Wed Feb 25 00:10:16 +0000 2026
>
> **標籤**: `AI Agent` `記憶系統` `系統設計`

---

我會將這篇文章整理成繁體中文的知識庫格式，保留所有細節和結構。

---

> **來源**: [@xxx111god (Jason Zuo)](https://x.com/xxx111god)
> **標籤**: `AI-Agent` `記憶系統` `架構設計` `開源專案`

---

這一個多月一直在改進 AI Agent 的記憶系統。

寫了不少分享，看了不少架構，學了不少方案：

• Stanford Generative Agents 的 reflection 機制

• 字節 OpenViking 的 L0/L1/L2 分層

• @lijiuer92 的 Memory 終極指南

今天開源分享一下目前跑穩的架構。

不用向量資料庫，不用 Mem0，純檔案系統 + 自動 TTL + LLM 壓縮。

## Part 1: 基礎框架（入門必看）

### 問題：AI 每次醒來都是白紙

不管你用 Claude、GPT 還是別的，session 結束就清空。下次來，它什麼都不記得。

不設計 memory 系統，用越久越傻。因為它永遠在重新認識你。

### 最簡三層結構

```markdown
MEMORY.md              ← 長期記憶（精華，每次啟動必讀）
memory/YYYY-MM-DD.md   ← 每日日誌（流水帳，原始素材）
SESSION-STATE.md       ← 工作緩衝（防壓縮遺失）
```

這就是最小可用版本。直接抄就能跑。

**第一層：每日日誌**

`memory/2026-02-24.md` 這種格式。每天一個檔案，發生什麼記什麼。

不用精煉，不用整理，先倒進去。回溯的時候有據可查。

**第二層：MEMORY.md 長期記憶**

這是精華。定期從日誌裡提煉：

• 你的偏好（「我喜歡簡潔的回覆」）

• 重要決策（「用 X 方案，因為 Y」）

• 踩過的坑（「Z 不能這麼搞」）

• 關鍵資訊（帳號、專案狀態）

Agent 每次啟動先讀這個檔案。相當於它的「人格」和「記憶」。

**第三層：SESSION-STATE.md 工作緩衝**

這個救過我好幾次。

長對話會被壓縮，重要細節可能被壓沒。SESSION-STATE.md 記錄當前任務狀態，壓縮後第一件事讀它。

```markdown
當前任務：寫 memory 架構文章
狀態：Draft 4 修改中
待確認：multi-agent 部分要不要展開
```

基礎框架就這麼多。如果你剛開始玩 Agent，先把這三層跑起來。下面是進階內容。

## Part 2: 完整架構（規模化方案）

跑了一個月之後，三層結構開始出問題：

• MEMORY.md 越來越長，token 爆炸

• 日誌堆積，不知道哪些該刪

• 重複踩坑，因為教訓沒系統記錄

於是升級到這套架構。

### 架構圖

兩個核心改進：

1. HOT/COLD 分區 — MEMORY.md 保持精簡，細節放 cold storage

2. 自動化腳本 — TTL 過期 + 日誌壓縮，不用手動維護

### 機制一：P0/P1/P2 + TTL

所有條目帶優先級標籤：

```markdown
**About Jason [P0]**
• [P0] Timezone: US Eastern (UTC-5)
• [P0] 溝通語言：中英混合
**Active Projects [P1]**
• [P1][2026-02-06] TaxSnap Pro 專案進行中
• [P1][2026-02-13] Mac Mini 遷移完成
**Temp Notes [P2]**
• [P2][2026-02-20] 下週要測試的功能
```

**TTL 規則：**

• P0 永久重要 → 永不過期

• P1 中期相關 → 90 天後過期

• P2 臨時備忘 → 30 天後過期

**Q1/Q2/Q3 判斷框架：**

• Q1: 下次醒來不看這條，會做錯事嗎？ → P0

• Q2: 某天可能需要查這條嗎？ → P1

• Q3: 以上都不是？ → 留日誌，不進 MEMORY.md

`memory-janitor.py` 每天 4 AM 自動掃描，過期的移到 archive/。

### 機制二：L0/L1/L2 分層

借鑑字節 OpenViking 的思路：

L0 (.abstract)：目錄概覽，每次先讀

L1 (insights/, lessons/)：提煉的模式和教訓，按需召回

L2 (YYYY-MM-DD.md)：每日完整日誌，深挖時讀

```
memory/
├── .abstract           # L0: 目錄概覽 (~100 tokens)
├── insights/           # L1: 提煉的模式
│   ├── .abstract
│   └── 2026-02.md
├── lessons/            # L1: 踩坑記錄
│   ├── .abstract
│   ├── operational-lessons.jsonl
│   └── trading-lessons.jsonl
├── 2026-02-24.md       # L2: 每日原始日誌
└── archive/            # 過期歸檔
```

90% 的查詢只需要 L0 + L1，省 token。

### 機制三：Lessons 學習系統

Memory 不只是存東西，還要從錯誤中學習。

operational-lessons.jsonl 範例：

```json
{"date":"2026-02-24","category":"cron","lesson":"cron job 必須加 flock + timeout，否則進程堆積","severity":"high"}
{"date":"2026-02-24","category":"image","lesson":"Read 工具不發送圖片，必須用 send-telegram-image.sh","severity":"critical"}
```

**怎麼用：**

• 高風險操作前 → `memory_search` 自動檢索相關 lessons

• 出錯後 → 記錄 lesson，下次不再犯

關鍵：lessons 是可執行的記憶，不只是「記住」，而是「會用」。

### 機制四：memory-compounding（核心）

靈感來自史丹佛 Generative Agents 論文的 "reflection" 機制。

**核心思路：**每天的 L2 日誌 → LLM 提取模式 → 寫入 L1 insights。日誌可以刪，洞察留下來。

**兩階段執行：**

Sub-agent 執行流程：

1. `--extract DATE` → 讀取日誌，生成 LLM prompt

2. LLM 提取 6 個強制 section

3. 寫入 `insights/YYYY-MM.md`

4. `--done DATE` → 標記完成

**強制 6 Section（踩了很多坑才定下來的）：**

1. Session Intent：今天想幹什麼（幫助理解上下文）

2. Files Modified：改了哪些檔案（最容易漏的，必須強制）

3. Decisions Made：做了什麼決策（決策邏輯要留下）

4. Lessons Learned：學到什麼（避免重複踩坑）

5. Patterns：發現什麼規律（累積領域知識）

6. Open Items：還有什麼沒做（下次繼續）

**壓縮比：**大概 10:1。一天 2000 字的日誌 → 200 字的 insights。

## Part 3: Multi-Agent 記憶共享

跑多個 Agent 之後，又有新問題：記憶怎麼共享？

我跑了三個 Agent：

• Main Agent：日常溝通、任務調度

• Writer Agent：內容創作（X、小紅書）

• Trader Agent：Stock、BTC、Kalshi 交易

我的方案：通過 shared/ 目錄共享核心記憶，隔離對話和角色。

### 架構

shared/ 目錄結構：

```
shared/
├── MEMORY.md          # 共享記憶（關於 Jason 的資訊，所有 agent 都該知道）
├── SOUL-BASE.md       # 共享原則（通信規則、安全規則、通用原則）
└── lessons/           # 共享教訓（任何 agent 踩的坑，其他 agent 都能看到）
    ├── operational-lessons.jsonl
    └── trading-lessons.jsonl
```

### 為什麼這樣設計

**共享該共享的：**

• MEMORY.md — Jason 的偏好、時區、帳號，所有 agent 都該知道

• Lessons — Main 踩的坑，Writer 和 Trader 也要避免

• SOUL-BASE.md — 通用原則（別洩露資料、怎麼通信）

**隔離該隔離的：**

• SOUL.md — Writer 是內容創作者，Trader 是交易員，角色不同

• 對話記憶 — Writer 不需要知道 Trader 的交易對話

• SESSION-STATE.md — 各自的工作狀態

**實際效果：**Main Agent 記錄了一個教訓（比如「cron 必須加 flock」），Writer 和 Trader 下次做類似操作前會自動檢索到。

### 跨 Agent 通信

Agent 之間不直接讀對方的對話記憶。需要協作時：

• 通過 shared/ 目錄共享資訊

• 通過 sessions_send 發訊息

• 通過 Telegram 群組 topic

記憶共享，對話隔離。

## 實戰資料

跑了兩個月：

• MEMORY.md 大小：穩定 ~120 行（janitor 自動控制）

• 檢索準確率：「上次怎麼做的」類問題，體感準確率在 90%

• 成本：零（純檔案系統）

• 最大收益：能直接看 Agent 記住了什麼，出問題能 debug

## 問題和缺陷

誠實說，這套系統不完美：

**高嚴重性：**

• Files Modified 漏記：加了強制 section 緩解

• insights 質量不穩定：依賴 LLM 提取

**中低嚴重性：**

• archive 幾乎不查：有 search，但使用率低，可能需要配合 qmd

• lessons 格式不統一：有 schema 但執行鬆散，會繼續迭代

開源的目的之一就是讓大家幫忙改進。

## 開源檔案

```
├── memory-janitor.py      # TTL 自動清理
├── memory-compounding.py  # 日誌→洞察
├── MEMORY.md              # 模板
├── lessons/               # 教訓儲存結構
└── SKILL.md               # Q1/Q2/Q3 決策框架
```

需要的評論區找我，或者直接看 GitHub：

https://github.com/jzOcb/ai-agent-memory

**我之前寫的相關文章：**

• [AI Agent 記憶管理實戰：三層架構 + 自動歸檔](https://x.com/xxx111god/status/2023838143045136557)

• [P0/P1/P2 怎麼判斷？](https://x.com/xxx111god/status/2022098871006998843)

• [OpenViking 實戰分享](https://x.com/xxx111god/status/2023838143045136557)

**參考資料：**

• Stanford Generative Agents 論文

• 字節 OpenViking 專案

• [@lijiuer92 Memory 終極指南](https://x.com/lijiuer92/status/2025678747509391664)

**作者：Jason**

十年經驗初級程式設計師，新晉 AI Agent 愛好者。

👉 @xxx111god
