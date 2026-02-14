# 在 Claude Code 中透過 MCP 優雅呼叫 Codex

> **來源**: [@discountifu (大夢想家迪士尼)](https://x.com/discountifu/status/2021887568875598183) | [原文連結](https://x.com/i/article/2021886118573273088)
>
> **日期**: 2026-02-12
>
> **標籤**: `Claude Code` `Codex` `MCP` `工具整合`

---

## 總覽

| 項目 | 說明 |
|------|------|
| 目標 | 在 Claude Code 內直接呼叫 Codex CLI |
| 方法 | 透過 MCP（Model Context Protocol）整合 |
| 設定 | 一行指令完成 |
| 優勢 | 結合兩者優點，無需在工具間切換 |

## 問題背景

### Codex CLI 的局限

Codex CLI 雖然推理能力強，但有幾個明顯的短板：

- **原始的 CLI 互動體驗**：介面簡陋，操作不夠流暢
- **Sandbox 有 bug**：沙箱環境偶爾出現執行問題
- **執行限制多**：某些操作被限制，影響實際使用

### Claude Code 的優勢

相比之下，Claude Code 的生態系統更加完善：

- **支援 MCP**：Model Context Protocol 讓工具整合變得簡單
- **支援 Plugin**：可擴展的插件系統
- **支援 Skill**：可定義與複用的技能模組
- **支援 Agent 擴展**：Sub-Agent、Team 等進階功能

結論：把 Codex 作為 Claude Code 的一個 MCP 工具來使用，取兩者之長。

## 一行指令設定

```bash
claude mcp add codex -s user -- codex -m gpt-5.3-codex -c model_reasoning_effort="high" mcp-server
```

### 參數詳解

| 參數 | 說明 |
|------|------|
| `claude mcp add` | Claude Code 的 MCP 管理指令，用於新增 MCP server |
| `codex` | MCP server 的名稱（自訂，方便後續引用） |
| `-s user` | scope 設為 `user`，表示全域配置（非僅限當前專案） |
| `--` | 分隔符，後面是實際執行的指令 |
| `codex` | 啟動 Codex CLI |
| `-m gpt-5.3-codex` | 指定使用的模型為 `gpt-5.3-codex` |
| `-c model_reasoning_effort="high"` | 設定推理努力程度為 `high`（最高品質推理） |
| `mcp-server` | 以 MCP server 模式啟動 Codex |

### Scope 選項

- `-s user`：全域配置，所有專案都能使用
- `-s project`：僅限當前專案
- 建議使用 `user` 級別，一次設定到處可用

## 驗證設定

設定完成後，透過以下指令確認：

```bash
# 列出所有已設定的 MCP server
claude mcp list

# 查看特定 MCP server 的詳細資訊
claude mcp get codex
```

確認 `codex` 出現在列表中，且配置正確。

## 使用方式

在 Claude Code 對話中，透過 `/mcp` 指令即可呼叫 Codex：

- Claude Code 會將任務委派給 Codex MCP server
- Codex 使用 `gpt-5.3-codex` 模型執行任務
- 結果回傳給 Claude Code 繼續處理

### 實際應用場景

- **交叉驗證**：讓 Codex 審核 Claude Code 的程式碼
- **多模型協作**：Claude 負責架構，Codex 負責特定模組
- **推理增強**：對於需要深度推理的任務，委派給 Codex 處理

## 為什麼這很優雅

傳統做法需要：
1. 在 Claude Code 中完成部分工作
2. 手動複製上下文到 Codex CLI
3. 在 Codex 中完成另一部分
4. 再手動把結果帶回 Claude Code

透過 MCP 整合後：
1. 在 Claude Code 中工作
2. 需要 Codex 時直接呼叫
3. 結果自動回傳
4. 全程不離開 Claude Code

一切都在同一個工作環境中完成，零上下文切換成本。
