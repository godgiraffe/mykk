# Claude Code 對話壓縮功能的陷阱與最佳實踐

> **來源**: [@Pluvio9yte](https://x.com/Pluvio9yte/status/1988901677651329495) | [原文連結](https://github.com/Pluviobyte/Claude-No-Compact)
>
> **日期**: 
>
> **標籤**: `Claude Code` `上下文管理` `工作流程優化`

---

> **來源**: [@Pluvio9yte (雪踏烏雲)](https://twitter.com/Pluvio9yte)  
> **日期**: 2026-02-17  
> **標籤**: `claude-code` `context-management` `best-practices` `compact`

---

你的專案很有可能毀在了 Claude Code 的壓縮（Compact）功能上。

Claude Code 的「對話壓縮」（compact）功能會導致非常嚴重的上下文腐爛，並且壓縮次數越多，上下文越臃腫，丟失的關鍵資訊越多，壓縮次數會更加頻繁，最終毀掉你的專案。

## 最佳實踐方案

### 1. 主動複製上下文，讓 Gemini 製作交接簡報

由於交接簡報過長，建議將簡報內容整理後放到 GitHub 倉庫中。

每次 `/clear` 後，都需要發送工作交接簡報。

### 2. 手動管理上下文

不要依賴自動壓縮（compact），要手動 `/clear` + 重載重要資訊。

**方法**：
- 讓 Claude 把當前狀態寫成一個 `.md` 檔案，這樣內容清晰可見，也不會被過度總結
- `/clear` 清空上下文後，再讓 Claude 重新讀取這個 md 檔案繼續工作

### 3. 創建「人物角色（persona）」來更容易察覺上下文腐爛

- 一開始給 Claude 一個帶戲劇性的個性（例如模仿某位著名工程師）
- 當 Claude 不再保持這個風格 → 說明上下文已經腐爛，需要重置

### 4. 任務拆分成更小步驟

把大工作流程拆成小任務，每個任務執行完就清理上下文,清理完成後再繼續下一步。

這樣能夠避免堆積大量歷史導致腐爛，這也是為什麼推薦 spec 規範開發的原因。
