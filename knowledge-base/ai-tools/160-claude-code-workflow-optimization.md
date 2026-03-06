---
title: "Claude Code 5 個進階工作流優化技巧"
date: "2026-02-20"
tags: 
  - "Claude Code"
  - "工作流優化"
  - "自動化"
summary: "再次推薦 @DellAnnaLuca 的 5 個 Claude Code 進階技巧："
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 46
evergreenScore: 57
priorityScore: 58
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/runes_leo/status/2024721426755047813"
  externalUrl: "https://code.claude.com/docs"
  authorUsername: "runes_leo"
---

# Claude Code 5 個進階工作流優化技巧

> **來源**: [@runes_leo](https://x.com/runes_leo/status/2024721426755047813) | [原文連結](https://code.claude.com/docs)
>
> **日期**: Fri Feb 20 05:43:00 +0000 2026
>
> **標籤**: `Claude Code` `工作流優化` `自動化`

---

> **來源**: [@runes_leo (Leo)](https://x.com/runes_leo)
> **日期**: 2026-03-06
> **標籤**: `Claude Code` `工作流優化` `AI 協作` `自動化`

---

再次推薦 @DellAnnaLuca 的 5 個 Claude Code 進階技巧：

## 1️⃣ Self-improvement injection（自我改進注入）

設置 Hook，當 Tool Calls > 8 次時，強制 Claude 輸出一條優化建議（可複用 skill、記憶模式、工作流修復）

## 2️⃣ Skills audit（技能審查）

創建一個 skill 列出所有已安裝的 skills（項目級+全局），然後讓用戶選擇要審查哪些（簡潔性、清晰度、範圍重疊、token 效率）

## 3️⃣ Claude audit（Claude 審查）

創建一個 skill 讀取所有 CLAUDE.md 文件，檢查冗餘指令、冗長措辭、可遷移到 memory 的內容

## 4️⃣ Reflect（反思）

創建一個 skill 審查當前對話,分析任務、錯誤、用戶反饋，提取學習、創建 skill、改進 skill 的機會

## 5️⃣ Conditional prompt linter（條件式提示詞檢查）

設置 Hook，當提示詞 > 50 字時，讓 Claude 檢查期望結果是否清晰

---

這 5 條都是「讓 AI 幫你優化 AI 工作流」的實戰技巧，不需要複雜配置，直接把上面的一段話複製給 Claude Code 就能用。

原 thread 因為登錄牆很容易只看到第 1 條，建議收藏這條或者直接去看 @DellAnnaLuca 的完整 thread。

## 原作者詳細說明

@DellAnnaLuca 的第一條技巧完整說明：

**5 ADVANCED CLAUDE CODE TIPS I'VE BEEN USING**

**1) Self-improvement injection**

"Create a UserPromptSubmit hook (global settings). Script echoes: If 8+ tool calls, append one optimization hint (reusable skill, memory pattern, or workflow fix). One sentence. Skip if exploratory."

## Claude Code 功能參考

Claude Code 是一個 AI 驅動的程式碼助手，可以幫助你建構功能、修復 bug 並自動化開發任務。它理解整個程式碼庫，可以跨多個檔案和工具工作。

### 主要功能

**自動化繁瑣任務**：處理你一直拖延的工作，如為未測試的程式碼編寫測試、修復專案中的 lint 錯誤、解決合併衝突、更新依賴項以及撰寫發布說明。

**建構功能與修復 bug**：用自然語言描述需求，Claude Code 會規劃方法、跨多個檔案編寫程式碼並驗證是否有效。對於 bug，貼上錯誤訊息或描述症狀，Claude Code 會追蹤問題根源並實作修復。

**建立 commits 和 pull requests**：直接與 git 協作，暫存變更、撰寫 commit 訊息、建立分支並開啟 pull requests。在 CI 中，可以透過 GitHub Actions 或 GitLab CI/CD 自動化程式碼審查和問題分類。

**透過 MCP 連接工具**：Model Context Protocol (MCP) 是連接 AI 工具與外部資料來源的開放標準。Claude Code 可以讀取 Google Drive 中的設計文件、更新 Jira 中的 tickets、從 Slack 提取資料或使用自訂工具。

**使用指令、skills 和 hooks 自訂**：
- **CLAUDE.md**：放在專案根目錄的 markdown 檔案，設定編碼標準、架構決策、偏好的函式庫和審查清單
- **Auto memory**：Claude 在工作時自動儲存學習成果，如建構命令和除錯見解
- **自訂命令**：打包可重複使用的工作流，如 `/review-pr` 或 `/deploy-staging`
- **Hooks**：在 Claude Code 動作前後執行 shell 命令，如每次編輯檔案後自動格式化，或 commit 前執行 lint

**執行代理團隊**：生成多個 Claude Code 代理同時處理不同任務。主代理協調工作、分配子任務並合併結果。對於完全自訂的工作流，Agent SDK 讓你建構自己的代理。

**CLI 管道與自動化**：Claude Code 遵循 Unix 哲學，可組合使用。將日誌導入、在 CI 中執行或與其他工具串連。

### 跨平台使用

支援 Terminal、VS Code、Desktop app、Web、JetBrains，每個介面連接到相同的 Claude Code 引擎，CLAUDE.md 檔案、設定和 MCP 伺服器在所有平台上通用。也整合了 CI/CD、聊天和瀏覽器工作流，包括 Remote Control、GitHub Actions、GitLab CI/CD、Slack 和 Chrome 擴充功能。
