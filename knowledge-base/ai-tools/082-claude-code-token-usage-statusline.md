# Claude Code 代幣使用量狀態列監控

> **來源**: [@iannuttall](https://x.com/iannuttall/status/1954272037976842547) | [原文連結](https://twitter.com/iannuttall/status/1954272037976842547/photo/1)
>
> **日期**: Sat Aug 09 20:02:17 +0000 2025
>
> **標籤**: `Claude Code` `開發工具` `代幣管理`

---

![](../assets/ai-tools/082-claude-code-token-usage-statusline-1.jpg)

## 功能說明

現在可以透過 `ccusage` 工具在 Claude Code 的新狀態列中追蹤代幣使用量。

## 設定方式

在 `~/.claude/settings.json` 中加入以下設定：

```json
{
  "statusLine": {
    "type": "command",
    "command": "bun x ccusage statusline"
  }
}
```

設定完成後，狀態列就會顯示 Claude Code 的代幣使用量資訊。

## 相關資源

- 工具來源：[@iannuttall (Ian Nuttall)](https://twitter.com/iannuttall)
