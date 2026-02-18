# Claude Code 完整指南：工作流程與最佳實踐

> **來源**: [@Yangyixxxx](https://x.com/Yangyixxxx/status/1960353275271901523) | [原文連結](https://code.claude.com/docs)
>
> **日期**: 
>
> **標籤**: `Claude Code` `開發工具` `AI 編程助手`

---

根據你的指示，我現在為你整理這篇關於 Claude Code 的文章。這篇內容包含了推文和官方文檔的綜合資訊。

---

> **來源**: [@Yangyixxxx (Yangyi)](https://x.com/Yangyixxxx) + [Claude Code Docs](https://docs.code.claude.com/)  
> **日期**: 2026-02-18  
> **標籤**: `Claude Code` `工作流程` `最佳實踐` `AI 編程` `開發工具`

---

## 高性能 CLAUDE.md 結構指南

撰寫 CLAUDE.md 時應遵循以下原則以優化 token 使用和效果：

- **保持在 2,000 字符以內**以優化 token 使用
- **只包含可操作的具體指導原則**
- **使用 MUST/SHOULD/SHOULD NOT 層次結構**來明確優先級
- **記錄常見失敗模式和示例**避免重複錯誤
- **包含長時運行命令的超時規範**

## Claude Code 概述

Claude Code 是一個具備 agent 能力的編程工具，能夠讀取你的程式碼庫、編輯檔案、執行命令，並與開發工具整合。可在終端機、IDE、桌面應用程式和瀏覽器中使用。

### 核心能力

Claude Code 是一個由 AI 驅動的編程助手，幫助你建構功能、修復錯誤並自動化開發任務。它理解整個程式碼庫，可以跨多個檔案和工具來完成工作。

## 安裝與開始使用

### 終端機 CLI（推薦）

功能完整的 CLI，可直接在終端機中使用 Claude Code，編輯檔案、執行命令、管理整個專案。

**安裝方式：**

**macOS、Linux、WSL：**
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows PowerShell：**
```powershell
irm https://claude.ai/install.ps1 | iex
```

**Windows CMD：**
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

原生安裝會自動在背景更新到最新版本。

**Homebrew（不會自動更新）：**
```bash
brew install --cask claude-code
# 需定期執行更新
brew upgrade claude-code
```

**WinGet（不會自動更新）：**
```cmd
winget install Anthropic.ClaudeCode
# 需定期執行更新
winget upgrade Anthropic.ClaudeCode
```

**啟動：**
```bash
cd your-project
claude
```

首次使用時會提示登入。

### VS Code 擴充功能

提供內聯差異檢視、@-mentions、計畫審查和對話歷史記錄，直接整合在編輯器中。

在 Extensions 視圖中搜尋 "Claude Code"（Mac: `Cmd+Shift+X`，Windows/Linux: `Ctrl+Shift+X`）。

安裝後，開啟 Command Palette（Mac: `Cmd+Shift+P`，Windows/Linux: `Ctrl+Shift+P`），輸入 "Claude Code"，選擇 "Open in New Tab"。

### 桌面應用程式

獨立應用程式，可在 IDE 或終端機之外執行 Claude Code。視覺化審查差異、並行執行多個 session、啟動雲端 session。

下載安裝：
- macOS（Intel 和 Apple Silicon）
- Windows（x64）
- Windows ARM64（僅支援遠端 session）

需要付費訂閱。

### 網頁版

在瀏覽器中執行 Claude Code，無需本地設定。啟動長時間執行的任務並稍後檢查、處理本地沒有的 repo、或並行執行多個任務。

可在桌面瀏覽器和 Claude iOS 應用程式中使用。訪問 [claude.ai/code](https://claude.ai/code) 開始使用。

### JetBrains IDE 外掛

支援 IntelliJ IDEA、PyCharm、WebStorm 等 JetBrains IDE，提供互動式差異檢視和選擇上下文共享。

從 JetBrains Marketplace 安裝 Claude Code 外掛並重啟 IDE。

## 主要使用場景

### 自動化繁瑣工作

Claude Code 處理那些耗時的日常任務：為未測試的程式碼撰寫測試、修復整個專案的 lint 錯誤、解決合併衝突、更新依賴項、撰寫發布說明。

```bash
claude "write tests for the auth module, run them, and fix any failures"
```

### 建構功能和修復錯誤

用自然語言描述你想要的功能。Claude Code 會規劃方法、跨多個檔案撰寫程式碼，並驗證其正常運作。

對於錯誤，貼上錯誤訊息或描述症狀。Claude Code 會追蹤整個程式碼庫中的問題、識別根本原因並實作修復。

### 建立 commits 和 pull requests

Claude Code 直接與 git 整合。它會 stage 變更、撰寫 commit 訊息、建立分支並開啟 pull requests。

```bash
claude "commit my changes with a descriptive message"
```

在 CI 中，可以透過 GitHub Actions 或 GitLab CI/CD 自動化程式碼審查和 issue 分類。

### 透過 MCP 連接你的工具

Model Context Protocol (MCP) 是一個開放標準，用於將 AI 工具連接到外部資料來源。透過 MCP，Claude Code 可以：

- 讀取 Google Drive 中的設計文件
- 更新 Jira 中的 tickets
- 從 Slack 提取資料
- 使用你自己的自訂工具

### 使用 instructions、skills 和 hooks 自訂

**CLAUDE.md：** 在專案根目錄新增的 markdown 檔案，Claude Code 會在每個 session 開始時讀取。用於設定編程標準、架構決策、偏好的函式庫和審查檢查清單。

**自訂 slash 命令：** 建立可重複使用的工作流程，團隊可以共享，如 `/review-pr` 或 `/deploy-staging`。

**Hooks：** 在 Claude Code 操作之前或之後執行 shell 命令，例如每次檔案編輯後自動格式化，或 commit 前執行 lint。

### 執行 agent 團隊和建構自訂 agents

產生多個 Claude Code agents 同時處理任務的不同部分。一個主 agent 協調工作、分配子任務並合併結果。

對於完全自訂的工作流程，Agent SDK 讓你建構自己的 agents，由 Claude Code 的工具和能力驅動，完全控制編排、工具存取和權限。

### 使用 CLI 進行 pipe、腳本和自動化

Claude Code 是可組合的，遵循 Unix 哲學。可以將日誌導入、在 CI 中執行，或與其他工具串連：

```bash
# 監控日誌並獲得警報
tail -f app.log | claude -p "Slack me if you see any anomalies"

# 在 CI 中自動化翻譯
claude -p "translate new strings into French and raise a PR for review"

# 跨檔案批次操作
git diff main --name-only | claude -p "review these changed files for security issues"
```

### 隨時隨地工作

Sessions 不綁定單一介面。可以在不同環境間移動工作：

- 在網頁版或 iOS 應用程式啟動長時間執行的任務，然後用 `/teleport` 拉到終端機
- 用 `/desktop` 將終端機 session 移交給桌面應用程式進行視覺化差異審查
- 從團隊聊天路由任務：在 Slack 中 @Claude 提及一個錯誤報告，然後獲得一個 pull request

## 跨平台使用

每個介面都連接到相同的 Claude Code 引擎，因此你的 CLAUDE.md 檔案、設定和 MCP 伺服器在所有介面上都能使用。

除了終端機、VS Code、JetBrains、桌面和網頁環境之外，Claude Code 還整合了 CI/CD、聊天和瀏覽器工作流程：

| 需求 | 最佳選項 |
|------|----------|
| 在本地啟動任務，在行動裝置上繼續 | 網頁版或 Claude iOS 應用程式 |
| 自動化 PR 審查和 issue 分類 | GitHub Actions 或 GitLab CI/CD |
| 從 Slack 路由錯誤報告到 pull requests | Slack 整合 |
| 除錯即時網頁應用程式 | Chrome 擴充功能 |
| 為自己的工作流程建構自訂 agents | Agent SDK |

## 後續步驟

安裝 Claude Code 後，以下指南可幫助你深入了解：

- **Quickstart：** 演練你的第一個真實任務，從探索程式碼庫到提交修復
- **最佳實踐和常見工作流程：** 提升使用技巧
- **設定：** 為你的工作流程自訂 Claude Code
- **疑難排解：** 常見問題的解決方案
- **code.claude.com：** 示範、定價和產品詳情
