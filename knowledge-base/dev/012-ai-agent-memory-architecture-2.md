# AI Agent 記憶架構實戰 II：三層記憶系統讓 Agent 越用越聰明

> **來源**: [@xxx111god](https://x.com/xxx111god/status/2023521632673763473) | [原文連結](https://x.com/i/article/2023516920029605888)
>
> **日期**: Mon Feb 16 22:15:27 +0000 2026
>
> **標籤**: `AI Agent` `記憶管理` `系統架構`

---

AI Agent 記憶架構實戰 II：三層記憶系統讓 Agent 越用越聰明

## 問題：AI 每次醒來都是白紙

不管你用 Claude、OpenClaw 還是別的，session 結束就清空。下次來，它什麼都不記得。

不設計 memory 系統，用越久越傻。因為它永遠在重新認識你。

## 我的三層 Memory 架構

直接抄這個結構就行：

```markdown
MEMORY.md           ← 長期記憶（精華，常駐加載）
memory/YYYY-MM-DD.md    ← 每日日誌（原始流水帳）
SESSION-STATE.md    ← 工作緩衝區（防壓縮遺失）
```

### 第一層：每日日誌

`memory/2026-02-16.md` 這種格式。每天一個檔案，發生什麼記什麼。不精煉，不整理，先倒進去。

作用：原始素材。回溯的時候有據可查。

### 第二層：MEMORY.md 長期記憶

這是精華。定期從日誌裡提煉：

- 你的偏好（「我喜歡簡潔的回覆」）
- 重要決策（「用 X 方案，因為 Y」）
- 踩過的坑（「Z 不能這麼搞」）
- 關鍵資訊（帳號、專案狀態）

Agent 每次啟動先讀這個檔案。相當於它的「人格」和「記憶」。

### 第三層：SESSION-STATE.md 工作緩衝區

這個救過我好幾次。

長對話會被壓縮，重要細節可能被壓沒。SESSION-STATE.md 記錄目前任務狀態，壓縮後第一件事讀它。

內容範例：

```
目前任務：寫 memory 架構文章
狀態：Draft 2 修改中
待確認：是否加程式碼範例
```

## 記憶優先級：P0/P1/P2

不是所有東西都值得永久保留。我用優先級標籤：

```markdown
[P0] 我的時區是 US Eastern     ← 永不過期
[P1][2026-02-16] 正在寫文章專案  ← 90天後歸檔
[P2][2026-02-16] 今天試了新工具  ← 30天後歸檔
```

寫個腳本每天跑一次，過期的自動移到 `memory/archive/`。MEMORY.md 保持精簡。

## 安全隔離：哪些記憶不該共享

MEMORY.md 只在主 session（1:1 對話）載入。群聊不載入。

為什麼？裡面有個人資訊、專案細節、帳號偏好。群裡可能有別人，不能洩露。

規則：頻道隔離對話，但不是所有記憶都該跨頻道共享。

## 幾個救命技巧

### 1. 壓縮前主動 flush

對話變長時，讓 agent 把關鍵狀態寫進 SESSION-STATE.md。壓縮來了也不丟。

### 2. 語義搜尋召回

記憶多了找不到？用 memory_search。問「之前 trading 那個決定」，它從幾十個檔案裡找相關內容。

### 3. 知識複利

每週花 10 分鐘，從日誌裡提煉精華到 MEMORY.md。日誌是素材，MEMORY.md 是結論。

### 4. Skill = 程序性記憶

重複的工作流寫成 Skill 檔案。下次匹配到任務自動載入，不用每次解釋。

## 自動化：讓 Agent 自己打掃

手動整理記憶太累。我寫了兩個自動化：

### 1. memory-janitor.py — 自動歸檔過期記憶

每天凌晨跑一次，掃描 MEMORY.md：

- P1 超過 90 天 → 移到 memory/archive/
- P2 超過 30 天 → 移到 memory/archive/
- P0 永不動

MEMORY.md 自動保持精簡，不用手動清理。

### 2. 知識複利 — 日誌自動提煉

每天檢查昨天的日誌，自動提煉核心洞察：

- 決策和結論
- 成功的方案
- 失敗的教訓

提煉完標記 `<!-- compounded -->`，重要的同步到 MEMORY.md。

日誌是原始素材，insights 是蒸餾後的精華。

架構圖：

```
每日日誌 ──→ 知識複利 ──→ insights/月度檔案
↓
重大洞察
↓
MEMORY.md ←── janitor 自動清理過期
```

## 直接可用的檔案模板

### MEMORY.md 模板

```markdown
# MEMORY.md - Long-Term Memory

## About [Your Name]
- [P0] 時區：XX
- [P0] 偏好：簡潔回覆，不要廢話
- [P0] 溝通方式：Telegram

## Active Projects
- [P1][日期] 專案名：狀態

## Key Decisions
- [P1][日期] 決定了 X，因為 Y

## Lessons Learned
- [P0] 不要在沒備份的情況下改設定
```

### SESSION-STATE.md 模板

```markdown
# SESSION-STATE.md - Working Buffer

## Current Task
[目前在做什麼]

## Context
[重要背景，壓縮後需要恢復的資訊]

## Pending
- [ ] 待確認項
```

## 效果

用了這套架構一個月：

- Agent 記得我的偏好，不用每次重複
- 專案上下文不丟，跨天繼續
- 壓縮不怕，關鍵資訊有備份
- 記憶自動清理，不會越來越臃腫

## 結論

養 agent 不是配個 API key 就完事。

AI 的本質是根據已知的內容輸出一個機率分佈，完善的記憶管理，決定了 AI 輸出的機率分佈的範圍和準度。

怎麼管理它的 memory，決定它能幫你做到什麼程度。

把這套結構複製過去，或者直接丟給你的 agent 讓它自己改。
