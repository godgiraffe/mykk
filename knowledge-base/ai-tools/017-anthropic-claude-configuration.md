# Anthropic Claude 配置與使用指南

> **來源**: [@bozhou_ai](https://x.com/bozhou_ai/status/2014618745332003183)
> **日期**: Fri Jan 23 08:38:33 +0000 2026
> **標籤**: `Anthropic` `Claude` `AI開發` `黑客松` `插件`

---

## Anthropic Claude 配置與使用指南

本文介紹在 Anthropic 黑客松中使用 Claude 的配置方法，重點在於如何利用插件簡化設置流程，並介紹開發、測試與程式碼審查的常用指令。

### 快速上手：重點總覽

| 步驟 | 動作 | 說明 |
|---|---|---|
| 1 | 安裝插件 | 使用插件方式安裝，簡化配置流程。指令：`/plugin marketplace add affaan-m/everything-claude-code` 和 `/plugin install everything-claude-code@everything-claude-code`。 |
| 2 | 初始化環境變數 | 執行 `/setup-pm` 初始化環境變數。 |
| 3 | 複製配置 | 將 hooks 和 MCP 複製到對應位置，注意 MCP 的 Token 配置。 |
| 4 | 開發流程 | 使用 `/plan`、`/tdd`、`/e2e`、`/code-review`、`/build-fix`、`/learn` 等指令進行開發、測試和程式碼審查。 |

### 安裝 Claude

#### 方式一：使用插件 (推薦)

推薦使用插件方式安裝，可大幅簡化配置流程：

```
/plugin marketplace add affaan-m/everything-claude-code
/plugin install everything-claude-code@everything-claude-code
```

#### 方式二：複製程式碼

另一種方式是手動複製程式碼，將 agents、skills、command、rules 等資料夾內容複製到專案目錄或 `.claude` 目錄下。

### 初始化環境變數

安裝完成後，執行以下指令初始化環境變數：

```
/setup-pm
```

### 配置 Hooks 和 MCP

1.  **Hooks 配置:** 將 `hooks/hooks.json` 中的 `hooks` 複製到 `~/.claude/settings.json`。建議安裝 `tmux` 環境。
2.  **MCP 配置:** 將所需的 MCP 伺服器從 `mcp-configs/mcp-servers.json` 複製到 `~/.claude.json`。 注意，許多 MCP 需要配置 Token，但通常我們用不到所有 MCP。建議保持原先的配置，避免過多 MCP 佔用上下文。

### 開發流程

以下指令可協助完成開發流程：

*   `/plan`:  進行規劃，說明需求。
*   `/tdd`:  使用 TDD (Test-Driven Development) 模式進行開發。
*   `/e2e`:  生成 end-to-end 測試程式碼 (可選，簡單功能可省略)。
*   `/code-review`:  進行程式碼審查。
*   `/build-fix`:  編譯並檢查 bug。
*   `/learn`:  在會話中提取可復用的模式或技能。

### 進階調整

掌握上述命令後，可開始逐步調整 Claude 的配置，例如修改 rules、agents、skills 等，以符合自身需求。

