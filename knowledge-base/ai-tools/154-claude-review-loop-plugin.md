# Claude Code 自動審稿插件 — claude-review-loop

> **來源**: [@QingQ77](https://x.com/QingQ77/status/2025955055359131998) | [原文連結](https://github.com/hamelsmu/claude-review-loop)
>
> **日期**: Mon Feb 23 15:25:00 +0000 2026
>
> **標籤**: `Claude Code` `自動審查` `代碼品質`

---

> **來源**: [@QingQ77 (Geek Lite)](https://x.com/QingQ77)
> **日期**: 2026-03-06
> **標籤**: `claude-code` `code-review` `automation` `codex`

---

## 簡介

claude-review-loop 是一個給 Claude Code 加上自動審稿人的插件。讓 AI 審 AI 寫的代碼，Claude 和 Codex 會自動進行代碼審查循環。

## 運作原理

當你使用 `/review-loop` 時，插件會創建一個兩階段的生命週期：

**任務階段**：你描述一個任務，Claude 實現它

**審查階段**：當 Claude 完成時，stop hook 會自動運行 Codex 進行獨立的代碼審查，然後要求 Claude 處理反饋

結果：每個任務在你接受更改之前都會得到獨立的第二意見。

## 審查覆蓋範圍

插件會根據專案類型生成最多 4 個平行的 Codex 子代理：

| 代理 | 是否總是運行 | 關注重點 |
|------|--------------|----------|
| Diff Review | 是 | git diff — 代碼品質、測試覆蓋率、安全性（OWASP top 10） |
| Holistic Review | 是 | 專案結構、文檔、AGENTS.md、代理框架、架構 |
| Next.js Review | 如果存在 next.config.* 或 package.json 中有 "next" | App Router、Server Components、快取、Server Actions、React 性能 |
| UX Review | 如果存在 app/、pages/、public/ 或 index.html | 透過 agent-browser 進行瀏覽器 E2E 測試、無障礙性、響應式設計 |

所有代理完成後，Codex 會去除重複的發現，並將單一的整合審查寫入 `reviews/review-<id>.md`。

## 系統需求

- Claude Code (CLI)
- jq — `brew install jq` (macOS) / `apt install jq` (Linux)
- Codex CLI — `npm install -g @openai/codex`

## Codex 多代理設置

此插件使用 Codex 多代理來運行平行的審查代理。`/review-loop` 命令會在首次使用時自動在 `~/.codex/config.toml` 中啟用它。

手動設置方式：

```toml
# ~/.codex/config.toml
[features]
multi_agent = true
```

## 安裝

從 CLI：

```bash
claude plugin marketplace add hamelsmu/claude-review-loop
claude plugin install review-loop@hamel-review
```

或從 Claude Code 會話內：

```
/plugin marketplace add hamelsmu/claude-review-loop
/plugin install review-loop@hamel-review
```

## 更新

```bash
claude plugin marketplace update hamel-review
claude plugin update review-loop@hamel-review
```

## 使用方式

### 開始審查循環

```
/review-loop Add user authentication with JWT tokens and test coverage
```

Claude 會實現任務。完成時，stop hook 會：

1. 運行 `codex exec` 進行獨立審查
2. 將發現寫入 `reviews/review-<id>.md`
3. 阻止 Claude 退出並要求它處理反饋

Claude 會處理它同意的項目，然後停止。

### 取消審查循環

```
/cancel-review
```

## 工作機制

插件使用 Stop hook — Claude Code 用於攔截代理退出的機制。

當 Claude 嘗試停止時：

1. hook 讀取狀態文件（`.claude/review-loop.local.md`）
2. 如果處於任務階段：運行 Codex，轉換到處理中（addressing），阻止退出
3. 如果處於處理階段：允許退出並清理

狀態追蹤於 `.claude/review-loop.local.md`（應加入 .gitignore）。
審查結果寫入 `reviews/review-<id>.md`。

## 文件結構

```
claude-review-loop/
├── .claude-plugin/
│   └── plugin.json          # 插件清單
├── commands/
│   ├── review-loop.md       # /review-loop 斜槓命令
│   └── cancel-review.md     # /cancel-review 斜槓命令
├── hooks/
│   ├── hooks.json           # Stop hook 註冊（900 秒超時）
│   └── stop-hook.sh         # 核心生命週期引擎
├── scripts/
│   └── setup-review-loop.sh # 參數解析、狀態文件創建
├── AGENTS.md                # 代理操作指南
├── CLAUDE.md                # 指向 AGENTS.md 的符號連結
└── README.md
```

## 配置

stop hook 超時在 `hooks/hooks.json` 中設置為 900 秒（15 分鐘）。如果你的 Codex 審查需要更長時間，請調整此設置。

### 環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| REVIEW_LOOP_CODEX_FLAGS | `--dangerously-bypass-approvals-and-sandbox` | 傳遞給 `codex` 的標誌。設置為 `--sandbox workspace-write` 以進行更安全的沙盒審查。 |

## 遙測

執行日誌會寫入 `.claude/review-loop.log`，包含時間戳、codex 退出碼和經過時間。此文件已加入 gitignore。

## 致謝

靈感來自 Ralph Wiggum 插件和 Ryan Carson 的複合工程循環（compound engineering loop）。
