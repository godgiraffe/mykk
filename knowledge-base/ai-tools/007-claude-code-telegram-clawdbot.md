# 用 Agent SDK 把 Claude Code 變成免費加強版 Clawdbot

> **來源**: [@YukerX (Yuker)](https://x.com/YukerX/status/2015649479387722160) | [原文連結](https://x.com/i/article/2015502993685356544)
>
> **日期**: 2026-01-26
>
> **標籤**: `Claude Code` `Agent SDK` `Telegram Bot` `Clawdbot`

---

## 總覽

| 比較項目 | Clawdbot | Claude Code + Agent SDK |
|----------|----------|-------------------------|
| 功能 | Claude Code 能做的它都能做 | 更強大、更靈活 |
| 靈活性 | 受限於平台 | 完全自訂 |
| 資料主權 | 第三方託管 | 完全自主 |
| 額外費用 | 付費服務 | 零額外成本（使用現有 Claude 訂閱） |
| 互動方式 | Telegram 對話 | Telegram 對話 |

## 核心概念

Clawdbot 是一個基於 Telegram 的 Claude Code 介面，讓你在手機上就能使用 Claude Code 的功能。但透過 Agent SDK，你可以自己打造一個功能更強的版本。

### 架構設計

```
Telegram 使用者 → Telegram Bot 程式 → Claude Code (Agent SDK)
```

Bot 程式本身只是一個「信差」（messenger），負責：
- 接收 Telegram 訊息
- 傳遞給 Claude Code Agent SDK
- 將 Agent 的回應傳回 Telegram

所有的「智慧」都來自 Claude Code，Bot 只處理訊息的轉發。

## 相比 Clawdbot 的優勢

### 1. 終極靈活性

- 可以自訂任何行為與回應邏輯
- 可以整合你自己的工具與 API
- 可以存取你的本地檔案系統

### 2. 資料主權

- 所有對話與資料都在你自己的機器上
- 不經過任何第三方伺服器
- 完全掌控你的資料流向

### 3. 零額外成本

- 只需要現有的 Claude 訂閱（Max plan）
- 不需要額外付費給 Clawdbot
- Telegram Bot API 免費使用

## 建置教學

### 步驟一：建立專案

```bash
bun init telegram-claude-bot
cd telegram-claude-bot
bun add @anthropic-ai/claude-agent-sdk
```

### 步驟二：建立 Telegram Bot

1. 在 Telegram 中找到 **@BotFather**
2. 發送 `/newbot` 指令
3. 依照提示設定 Bot 名稱
4. 取得 Bot Token（格式：`123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`）

### 步驟三：撰寫 Bot 程式

建立 `bot.mjs` 檔案，使用 `@anthropic-ai/claude-agent-sdk` 套件：

```javascript
import { ClaudeAgent } from '@anthropic-ai/claude-agent-sdk';

// 初始化 Telegram Bot
// 連接 Claude Code Agent SDK
// 設定訊息轉發邏輯
```

核心邏輯：

1. 監聽 Telegram 訊息事件
2. 將使用者訊息傳給 Agent SDK
3. 等待 Agent 回應
4. 將回應格式化後傳回 Telegram

### 步驟四：啟動 Bot

```bash
node bot.mjs
```

## 展示功能

透過這個自建的 Bot，你可以在 Telegram 上執行：

### YouTube MP3 下載

直接在 Telegram 對話中貼上 YouTube 連結，Bot 會：
- 呼叫 Claude Code 執行下載指令
- 將 MP3 檔案傳回 Telegram

### 檔案傳輸

- 在手機端上傳檔案到伺服器
- 從伺服器下載檔案到手機
- Bot 作為檔案傳輸的橋樑

### Skill 使用

- 呼叫 Claude Code 的 Skill 功能
- 在 Telegram 中觸發複雜的自動化流程

### 行事曆排程

- 透過自然語言建立行程
- 與日曆系統整合
- 在 Telegram 中管理排程

## 適用場景

- 出門在外時需要操作伺服器
- 手機上快速執行開發任務
- 不想打開電腦但需要 AI 協助
- 建立個人化的 AI 助理入口
