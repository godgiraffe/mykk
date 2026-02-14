# AI 程式設計工作流：多 Agent 協作模式

> **來源**: [@jolestar](https://x.com/jolestar/status/2002918725125820839)
>
> **日期**: Mon Dec 22 01:46:51 +0000 2025
>
> **標籤**: `Agent工作流` `AI編程` `自動化開發`

---

# AI 程式設計工作流：多 Agent 協作模式

> **來源**: [@jolestar](https://twitter.com/jolestar)  
> **標籤**: `AI-Coding` `Multi-Agent` `Workflow` `GitHub-Integration`

---

## 核心概念

一套基於三角協作的 AI 輔助開發工作流，透過產品經理 Agent、編碼 Agent、審查 Agent 的角色分工，實現需求分析、編碼實作、程式碼審查的自動化循環。

## 工作流程

### 角色分工

| 角色 | 職責 | 關鍵特性 |
|------|------|----------|
| **產品經理 Agent** | 需求討論、架構設計、任務拆分 | 不執行具體編碼，保持全局視角，上下文不易填滿 |
| **Coder Agent** | 接收 Issue、編寫程式碼、提交 PR | 充足權限，避免中途申請權限中斷流程 |
| **Reviewer Agent** | 審查 PR、提供修改建議 | 可用專門 Agent 或 GitHub Copilot |

### 執行步驟

1. **需求分析與拆分**
   - 在 Agent 窗口與產品經理 Agent 討論需求與架構
   - 拆分複雜功能為多個子 issue
   - 轉換成可執行的需求說明，寫入 GitHub issue

2. **編碼實作**
   - 啟動 Coder Agent，分配一個 GitHub issue
   - 給予充足權限，要求完成程式碼並提交 PR
   - 避免中途權限申請造成流程中斷

3. **程式碼審查**
   - Reviewer Agent 審查提交的 PR
   - 產生審查結果與修改建議

4. **修復與合併**
   - 將 PR 連結與審查結果回饋給 Coder Agent
   - Coder Agent 根據審查意見修復問題
   - 審查通過後合併程式碼

5. **循環執行**
   - 繼續下一個 issue
   - 若 issue 間無依賴關係可並行處理

## 實施挑戰

### 權限管理兩難

- **問題**: Coder Agent 若給予任意權限，可能因命令錯誤刪除專案外檔案
- **結果**: 有時仍需確認權限而卡住流程

### 審查標記精確度

- **問題**: Reviewer Agent 不太會使用 GitHub inline review comment
- **影響**: 無法精確標記程式碼行，直接輸出評論與 Coder Agent 配合會有問題

### API 回應截斷

- **問題**: 讓 Agent 拉取 PR review comments 時，MCP 接口回應過長會被截斷
- **影響**: 經常無法取得完整的審查意見

## 自動化解決方案

作者開發了自動化工具來解決上述問題：

- 將 Coding Agent 裝在容器中執行
- 與 GitHub Action 整合
- 實現上述流程的完全自動化

---

★ Insight ─────────────────────────────────────
**多 Agent 協作的核心設計原則**
- **上下文隔離**: 產品經理 Agent 不執行具體任務，保持全局視角不被細節污染
- **權限平衡**: 給予 Coder Agent 充足權限以流暢執行，但需容器隔離防止誤操作
- **工具整合**: 善用 GitHub API + MCP + Container 打通 Agent 與開發工具鏈的協作界面
─────────────────────────────────────────────────
