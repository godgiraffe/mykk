# GPT 5.4 發布：1 百萬上下文窗口配置指南

> **來源**: [@berryxia](https://x.com/berryxia/status/2029702447736967216) | [原文連結](https://x.com/chongdashu/status/2029667206934503466/video/1)
>
> **日期**: 
>
> **標籤**: `GPT-5.4` `大上下文` `Codex 配置`

---

GPT 5.4 已發布，支援 1M 上下文窗口！

## 在 Codex 中啟用配置步驟

1. 編輯 `~/.codex/config.toml`
2. 設定 `model = "gpt-5.4"`
3. 設定 `model_context_window=1000000`
4. 設定 `model_auto_compact_token_limit=9000000`
5. 執行程式
6. 使用 `/statusline` 指令
7. 切換上下文窗口大小
