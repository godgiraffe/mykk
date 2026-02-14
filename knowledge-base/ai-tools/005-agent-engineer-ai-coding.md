# AI Agent 工程師如何用 AI 寫生產級程式碼

> **來源**: [@yan5xu](https://x.com/yan5xu/status/2021162107170095186) | [原文連結](https://x.com/i/article/2021137228463022080)
>
> **日期**: 2026-02-10
>
> **標籤**: `AI編碼` `Agent` `Claude Code` `HANDOFF` `Sub-Agent` `Worktree`

---

## 總覽

| 主題 | 核心概念 |
|------|----------|
| Context 管理 | Context 是 Agent 的生命線，用 HANDOFF 取代 compress |
| Sub-Agent | 透過檔案通訊協議擴展 context window |
| Worktree 隔離 | 並行任務互不干擾 |
| 多 Repo 工作區 | 給 Agent 全局視角 |
| 協作模式轉變 | 從 pair programming 轉為 Tech Lead + Developer 模式 |
| 自我驗證能力 | 測試、日誌、CLI 工具全套授權 |
| 開源專案 | [Code Relay](https://github.com/yan5xu/code-relay) |

## Context 是 Agent 的生命線

Agent 的效能取決於它能「記住」多少上下文。Context window 就是 Agent 的工作記憶，一旦溢出或被壓縮，Agent 就會失去對任務的理解。

### HANDOFF 取代 Compress

傳統的 compress（壓縮上下文）會造成資訊遺失。HANDOFF 機制則是在任務切換時建立結構化的狀態快照（state snapshot），確保：

- 關鍵決策脈絡被完整保留
- 任務狀態可精確還原
- 新的 Agent session 能從斷點繼續

HANDOFF 本質上是一份精心設計的交接文件，讓 Agent 接手時不需要重新理解整個專案。

## Sub-Agent 擴展 Context Window

單一 Agent 的 context window 有限，Sub-Agent 透過檔案通訊協議（file-based communication protocol）突破這個限制：

- 主 Agent 將子任務委派給 Sub-Agent
- Sub-Agent 完成後，以 **4 行摘要** 回傳結果
- 主 Agent 只需消化摘要，不需載入完整執行細節
- 等同於把 context window 「分散式擴展」

這種模式讓複雜任務可以被拆解為多個獨立的小任務，每個 Sub-Agent 都有完整的 context 來處理自己的部分。

## Worktree 隔離並行任務

Git Worktree 讓同一個 repository 可以同時 checkout 多個分支到不同目錄：

- 每個 Agent 在獨立的 worktree 中工作
- 並行開發不會互相干擾
- 避免分支切換帶來的 context 混亂
- 適合同時處理多個 feature 或 bugfix

## 多 Repo 工作區結構

將相關的多個 repository 組織在同一個工作區中，給 Agent 全局視角：

- Agent 可以同時看到前端、後端、共用函式庫
- 跨 repo 的依賴關係一目了然
- 修改影響範圍可以被完整評估

## 從 Pair Programming 到 Tech Lead 模式

人類與 AI 的協作模式正在轉變：

| 舊模式（Pair Programming） | 新模式（Tech Lead + Developer） |
|---|---|
| 人類逐行指導 AI | 人類定義需求與標準 |
| 即時互動、同步工作 | 透過 Issues / PRs 非同步溝通 |
| 人類是 driver 或 navigator | 人類是 Tech Lead，AI 是 Developer |
| 關注實作細節 | 關注架構與品質把關 |

透過 Issues 描述需求、PRs 審核成果，人類可以更高效地管理多個 Agent 同時工作。

## 給 Agent 完整的自我驗證能力

要讓 Agent 真正自主，必須給它完整的工具鏈：

- **測試框架**：讓 Agent 自己跑測試驗證修改
- **日誌存取**：透過 AWS CLI 等工具查看執行日誌
- **CLI 工具**：資料庫操作、部署指令等
- **完整權限**：Agent 需要足夠的權限才能自主除錯

## Boot Sequence 與 SCOPE 控制

### Boot Sequence

Agent 的自我啟動流程，讓它在開始工作前自動：

- 讀取專案文件與規範
- 理解當前程式碼狀態
- 載入相關上下文

### SCOPE 控制

精確控制 Agent 的寫入權限範圍：

- 限定 Agent 只能修改特定目錄或檔案
- 防止意外修改不相關的程式碼
- 在安全的範圍內給予最大自主權

## 開源專案：Code Relay

以上所有實踐已開源為 **[Code Relay](https://github.com/yan5xu/code-relay)**，包含：

- 一組 Markdown / YAML 檔案
- 相容 Cline、Claude Code、OpenCode、Windsurf 等工具
- 可直接整合到現有專案中使用

Code Relay 不是一個框架，而是一套可攜帶的 Agent 工作協議，讓任何支援的 AI coding 工具都能受益。
