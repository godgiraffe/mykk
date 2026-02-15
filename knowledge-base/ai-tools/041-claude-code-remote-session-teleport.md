# Claude Code 遠端工作流程：在雲端與本機間切換

> **來源**: [@adocomplete](https://x.com/adocomplete/status/1998449649464819733) | [原文連結](https://twitter.com/adocomplete/status/1998449649464819733/video/1)
>
> **日期**: 
>
> **標籤**: `Claude Code` `遠端開發` `工作流程`

---

```markdown
## 功能概覽

Claude Code 提供遠端工作流程，讓你能在雲端與本機環境間靈活切換：

| 指令 | 功能 | 使用場景 |
|------|------|----------|
| `& your prompt` | 將任務送至 Claude Code 雲端背景執行 | 離開電腦前交付長時間任務 |
| `claude --teleport session_abc123` | 將雲端工作階段拉回本機終端繼續開發 | 回到辦公室/家中接手工作 |

## 工作流程

1. **送出任務到雲端**  
   使用 `&` 前綴將提示送至 Claude Code 網頁版，任務會在背景執行

2. **恢復工作階段**  
   透過 `--teleport` 命令加上 session ID，將雲端的工作階段拉回本機終端

3. **接續開發**  
   工作階段完整保留上下文，可在本機環境無縫繼續

## 使用場景

- **居家與辦公室協作**：在辦公室送出任務，回家後用 teleport 接手
- **行動工作**：外出時用網頁版交付任務，回到電腦前恢復終端環境
- **長時間背景任務**：不需保持本機終端開啟，讓雲端持續執行

---

> **來源**: [@adocomplete (Ado)](https://twitter.com/adocomplete) - Advent of Claude Day 9
```
