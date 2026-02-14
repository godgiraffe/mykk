# Claude Code 中使用 MCP 調用 Codex

> **來源**: [@discountifu](https://x.com/discountifu/status/2019639215714386119)
>
> **日期**: Fri Feb 06 05:08:06 +0000 2026
>
> **標籤**: `Claude` `Codex` `MCP` `AI工具` `命令列`

---

## Claude Code 中使用 MCP 調用 Codex 模型簡短筆記

本篇筆記介紹如何透過一行命令在 Claude Code 環境中使用 MCP (Model Control Plane) 調用 Codex 模型，讓使用者能更便捷地配置與使用 Codex。

**核心觀點：**

使用 MCP 可以簡化 Codex 模型的調用流程。

**操作步驟：**

將以下命令複製到 Claude Code 的命令列並執行：

```
claude mcp add codex -s user -- codex -m gpt-5.3-codex -c model_reasoning_effort="high" mcp-server
```

**命令解析：**

*   `claude mcp add codex`:  指示 Claude 使用 MCP 添加 Codex 模型。
*   `-s user`: 指定作用域為使用者。
*   `-- codex`: 分隔符，表明之後的參數屬於 Codex 模型。
*   `-m gpt-5.3-codex`:  指定使用的 Codex 模型為 `gpt-5.3-codex`。
*   `-c model_reasoning_effort="high"`:  配置模型的推理工作量等級為 "high"。
*   `mcp-server`:  指定 MCP 伺服器。

**總覽/重點表：**

| 功能           | 說明                                                                    |
|----------------|-------------------------------------------------------------------------|
| 調用模型       | 使用一行命令透過 MCP 在 Claude Code 中調用 Codex 模型。                   |
| 模型選擇       | 可指定 Codex 的模型版本 (例如: `gpt-5.3-codex`)。                        |
| 模型配置       | 可設定模型參數，例如推理工作量等級 (`model_reasoning_effort`)。          |
| 簡化流程       | 相較於傳統方法，使用 MCP 簡化了模型配置和調用流程。                          |
| 适用情境 | 想快速在 Claude Code 环境下启用 Codex 模型。|

