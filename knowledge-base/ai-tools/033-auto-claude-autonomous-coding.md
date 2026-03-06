---
title: "Auto Claude：自主多階段 AI 編程框架"
date: "2025-12-21"
tags: 
  - "AI 編程"
  - "自動化開發"
  - "多智能體"
summary: "Auto Claude 是一個自主多智能體編程框架，能夠自動規劃、編寫和驗證軟體。它將 AI 編程提升到自動化層次，開發者只需描述目標，系統就會處理規劃、實作和驗證全流程。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 48
evergreenScore: 67
priorityScore: 68
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/rudrank/status/2002730622457122942"
  externalUrl: "https://github.com/AndyMik90/Auto-Claude"
  authorUsername: "rudrank"
---

# Auto Claude：自主多階段 AI 編程框架

> **來源**: [@rudrank](https://x.com/rudrank/status/2002730622457122942) | [原文連結](https://github.com/AndyMik90/Auto-Claude)
>
> **日期**: Sun Dec 21 13:19:23 +0000 2025
>
> **標籤**: `AI 編程` `自動化開發` `多智能體`

---

# Auto Claude：自主多智能體編程框架

> **來源**: [GitHub - AndyMik90/Auto-Claude](https://github.com/AndyMik90/Auto-Claude) / [@rudrank](https://twitter.com/rudrank)  
> **日期**: 2026-02-14  
> **標籤**: `ai-coding` `autonomous-agents` `claude-code` `workflow-automation`

---

## 專案概述

Auto Claude 是一個自主多智能體編程框架，能夠自動規劃、編寫和驗證軟體。它將 AI 編程提升到自動化層次，開發者只需描述目標，系統就會處理規劃、實作和驗證全流程。

## 核心特性

| 功能 | 說明 |
|------|------|
| **自主任務執行** | 只需描述目標，智能體自動處理規劃、實作、驗證 |
| **並行執行** | 最多支援 12 個智能體終端同時工作 |
| **隔離工作區** | 所有修改在 git worktree 中進行，主分支保持安全 |
| **自動驗證** | 內建 QA 循環，在提交前自動檢查問題 |
| **AI 輔助合併** | 整合回主分支時自動解決衝突 |
| **記憶層** | 智能體在多個 session 間保留學習，越用越聰明 |
| **版控整合** | 支援 GitHub/GitLab issue 導入、AI 調查、merge request 創建 |
| **專案管理整合** | 與 Linear 同步任務，追蹤團隊進度 |
| **跨平台** | 提供 Windows、macOS、Linux 原生桌面應用 |
| **自動更新** | 應用程式自動更新到最新版本 |

## 系統需求

1. **Claude Pro/Max 訂閱** - [訂閱連結](https://claude.ai/upgrade)
2. **Claude Code CLI** - `npm install -g @anthropic-ai/claude-code`
3. **Git 倉庫** - 專案必須初始化為 git repo

## 快速開始

```bash
# 1. 下載並安裝對應平台的應用程式
# 2. 開啟專案 - 選擇 git repository 資料夾
# 3. 連接 Claude - 應用會引導完成 OAuth 設定
# 4. 創建任務 - 描述要建構的功能
# 5. 觀察運作 - 智能體自動規劃、編碼、驗證
```

## 下載連結

### 穩定版本 (v2.7.5)

| 平台 | 下載連結 |
|------|----------|
| Windows | `Auto-Claude-2.7.5-win32-x64.exe` |
| macOS (Apple Silicon) | `Auto-Claude-2.7.5-darwin-arm64.dmg` |
| macOS (Intel) | `Auto-Claude-2.7.5-darwin-x64.dmg` |
| Linux (AppImage) | `Auto-Claude-2.7.5-linux-x86_64.AppImage` |
| Linux (Debian) | `Auto-Claude-2.7.5-linux-amd64.deb` |
| Linux (Flatpak) | `Auto-Claude-2.7.5-linux-x86_64.flatpak` |

### Beta 版本 (v2.7.6-beta.5)

⚠️ Beta 版本可能包含 bug 和破壞性變更

所有發布版本包含 SHA256 校驗碼和 VirusTotal 掃描結果以供安全驗證。

## 介面功能

### 1. Kanban 看板
- 視覺化任務管理，從規劃到完成全流程
- 創建任務並即時監控智能體進度

### 2. 智能體終端
- AI 驅動的終端，一鍵注入任務上下文
- 支援產生多個智能體並行工作

### 3. Roadmap 規劃
- AI 輔助功能規劃
- 競品分析和受眾定位

### 4. 其他功能
- **Insights** - 對話介面探索程式碼庫
- **Ideation** - 發現改進點、效能問題、安全漏洞
- **Changelog** - 從完成的任務自動生成發布說明

## CLI 使用方式

適用於無 GUI 環境、CI/CD 整合或純終端工作流程：

```bash
cd apps/backend

# 互動式創建 spec
python spec_runner.py --interactive

# 執行自主建構
python run.py --spec 001

# 審查並合併
python run.py --spec 001 --review
python run.py --spec 001 --merge
```

詳細文件參見 `guides/CLI-USAGE.md`

## 專案結構

```
Auto-Claude/
├── apps/
│   ├── backend/    # Python 智能體、specs、QA pipeline
│   └── frontend/   # Electron 桌面應用
├── guides/         # 額外文件
├── tests/          # 測試套件
└── scripts/        # 建構工具
```

## 安全機制

Auto Claude 採用三層安全模型：

1. **OS 沙盒** - Bash 指令在隔離環境執行
2. **檔案系統限制** - 操作限制在專案目錄內
3. **動態指令白名單** - 僅允許基於專案技術堆疊的核准指令

所有發布版本：
- 發布前經 VirusTotal 掃描
- 包含 SHA256 校驗碼
- macOS 版本經程式碼簽署

## 可用指令

| 指令 | 說明 |
|------|------|
| `npm run install:all` | 安裝後端和前端依賴 |
| `npm start` | 建構並執行桌面應用 |
| `npm run dev` | 開發模式運行（支援熱重載） |
| `npm run package` | 打包當前平台 |
| `npm run package:mac` | 打包 macOS 版本 |
| `npm run package:win` | 打包 Windows 版本 |
| `npm run package:linux` | 打包 Linux 版本 |
| `npm run package:flatpak` | 打包 Flatpak 版本 |
| `npm run lint` | 執行 linter |
| `npm test` | 執行前端測試 |
| `npm run test:backend` | 執行後端測試 |

## 開發貢獻

想從原始碼建構或參與貢獻？

- 參見 `CONTRIBUTING.md` 取得完整開發設定說明
- Linux 特定建構（Flatpak、AppImage）參見 `guides/linux.md`

## 授權條款

**AGPL-3.0** - GNU Affero General Public License v3.0

- Auto Claude 免費使用
- 若修改並散佈，或作為服務運行，程式碼必須以 AGPL-3.0 開源
- 閉源使用場景可取得商業授權

## 社群資源

- [Discord 社群](https://discord.gg/auto-claude)
- [GitHub Issues](https://github.com/AndyMik90/Auto-Claude/issues) - 回報 bug 或功能請求
- [Discussions](https://github.com/AndyMik90/Auto-Claude/discussions) - 提問討論

## 專案數據

- ⭐ 12k stars
- 🔱 1.7k forks  
- 👀 99 watching
- 👥 73+ contributors
- 📦 32 releases
- 🔤 語言組成：TypeScript 53.8%、Python 44.7%、其他 1.5%
