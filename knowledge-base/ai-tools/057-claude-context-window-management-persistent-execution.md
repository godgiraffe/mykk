# Claude 上下文視窗管理與持續執行

> **來源**: [@kieranklaassen](https://x.com/kieranklaassen/status/1992478858025820469) | [原文連結](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
>
> **日期**: Sun Nov 23 06:22:32 +0000 2025
>
> **標籤**: `Claude Code` `Prompt工程` `上下文管理`

---

> **來源**: [@kieranklaassen](https://twitter.com/kieranklaassen)
> **日期**: 2026-02-17
> **標籤**: `Claude` `context-window` `prompt-engineering` `ai-tools`

---

## 核心技巧

在 Claude Code 的系統提示詞中加入這段話，可以解鎖跨無限上下文的持續執行能力：

```
Your context window will be automatically compacted as it approaches its limit. Never stop tasks early due to token budget concerns. Always complete tasks fully, even if the end of your budget is approaching.
```

## 為什麼需要這個提示詞

Claude 的上下文感知能力使它在完成任務時過於保守。當 Claude 意識到上下文視窗即將耗盡時，會傾向提早結束任務。透過這個提示詞，可以讓 Claude 理解系統會自動壓縮上下文，因此不需要因為 token 預算而中斷工作。

## 上下文感知與多視窗工作流

### 上下文感知機制

Claude Opus 4.6 和 Claude 4.5 系列模型具備**上下文感知**（context awareness）功能，能在對話過程中追蹤剩餘的上下文視窗（即 "token 預算"）。這使 Claude 能夠更有效地執行任務和管理上下文。

### 管理上下文限制

如果你在支援上下文壓縮或允許儲存上下文到外部檔案的 agent 框架中使用 Claude（例如 Claude Code），建議在提示詞中加入以下資訊：

```
Your context window will be automatically compacted as it approaches its limit, allowing you to continue working indefinitely from where you left off. Therefore, do not stop tasks early due to token budget concerns. As you approach your token budget limit, save your current progress and state to memory before the context window refreshes. Always be as persistent and autonomous as possible and complete tasks fully, even if the end of your budget is approaching. Never artificially stop any task early regardless of the context remaining.
```

否則，Claude 可能會在接近上下文限制時自然嘗試結束工作。記憶工具（memory tool）與上下文感知功能搭配使用，可實現無縫的上下文轉換。

## 跨多個上下文視窗的任務執行

### 首次上下文視窗策略

對於跨越多個上下文視窗的任務：

1. **為第一個上下文視窗使用不同的提示詞**：使用第一個上下文視窗建立框架（撰寫測試、建立設置腳本），然後在後續的上下文視窗中迭代待辦清單

2. **讓模型以結構化格式撰寫測試**：要求 Claude 在開始工作前建立測試，並以結構化格式追蹤（例如 `tests.json`）。這能提升長期迭代能力

3. **提醒 Claude 測試的重要性**：
   ```
   It is unacceptable to remove or edit tests because this could lead to missing or buggy functionality.
   ```

4. **設置生活品質工具**：鼓勵 Claude 建立設置腳本（例如 `init.sh`）來優雅地啟動伺服器、執行測試套件和 linter。這能避免從新的上下文視窗繼續時重複工作

### 重新開始 vs 壓縮

當上下文視窗被清除時，考慮使用全新的上下文視窗而非使用壓縮。Claude 的最新模型在從本地檔案系統發現狀態方面非常有效。在某些情況下，你可能想利用這一點而不是壓縮。

**明確指定如何開始**：
- "Call pwd; you can only read and write files in this directory."
- "Review progress.txt, tests.json, and the git logs."
- "Manually run through a fundamental integration test before moving on to implementing new features."

### 提供驗證工具

隨著自主任務長度增加，Claude 需要在沒有持續人類反饋的情況下驗證正確性。像 Playwright MCP server 或用於測試 UI 的 computer use 功能等工具很有幫助。

### 鼓勵完整使用上下文

提示 Claude 在繼續下一步之前有效地完成元件：

```
This is a very long task, so it may be beneficial to plan out your work clearly. It's encouraged to spend your entire output context working on the task - just make sure you don't run out of context with significant uncommitted work. Continue working systematically until you have completed this task.
```

## 狀態管理最佳實踐

### 結構化與非結構化格式

1. **使用結構化格式儲存狀態資料**：追蹤結構化資訊（如測試結果或任務狀態）時，使用 JSON 或其他結構化格式，幫助 Claude 理解架構需求

2. **使用非結構化文字記錄進度筆記**：自由格式的進度筆記適合追蹤一般進度和上下文

3. **使用 git 追蹤狀態**：Git 提供已完成工作的日誌和可恢復的檢查點。Claude 的最新模型在使用 git 跨多個會話追蹤狀態方面表現特別出色

4. **強調增量進度**：明確要求 Claude 追蹤進度並專注於增量工作

範例提示詞：
```
After completing a section, update progress.txt with what you've accomplished and what remains to be done.
```

## 溝通風格變化

Claude 最新模型相比先前版本具有更簡潔自然的溝通風格：

- **更直接、更有根據**：提供基於事實的進度報告，而非自我慶祝的更新
- **更對話化**：稍微更流暢和口語化，較不機械
- **較不囉嗦**：可能跳過詳細摘要以提高效率，除非有提示要求

這種溝通風格準確反映已完成的工作，沒有不必要的闡述。

### 平衡詳細程度

Claude 的最新模型傾向於效率，可能在使用工具後跳過口頭摘要，直接跳到下一個動作。雖然這創造了流暢的工作流程，但你可能希望更了解其推理過程。

如果你希望 Claude 在工作時提供更新：

```
After completing a task that involves tool use, provide a quick summary of the work you've done.
```

## 工具使用模式

### 明確的指令

Claude 的最新模型經過訓練，能精確遵循指令，並受益於明確指示使用特定工具。如果你說「can you suggest some changes」，Claude 有時會提供建議而非實作——即使進行變更可能是你的本意。

要讓 Claude 採取行動，需要更明確：

❌ **模糊**：「Can you change the function name to snake case?」
✅ **明確**：「Rename the `calculateTotal` function to `calculate_total` in src/utils.ts」

### 預設行為設定

**要讓 Claude 預設更主動地採取行動**，可以在系統提示詞中加入：

```xml
<default_to_action>
By default, implement changes rather than only suggesting them. If the user's intent is unclear, infer the most useful likely action and proceed, using tools to discover any missing details instead of guessing. Try to infer the user's intent about whether a tool call (e.g., file edit or read) is intended or not, and act accordingly.
</default_to_action>
```

**要讓模型預設更保守**，較不容易直接跳入實作，只在被要求時採取行動：

```xml
<do_not_act_before_instructions>
Do not jump into implementation or change files unless clearly instructed to make changes. When the user's intent is ambiguous, default to providing information, doing research, and providing recommendations rather than taking action. Only proceed with edits, modifications, or implementations when the user explicitly requests them.
</do_not_act_before_instructions>
```

### 工具觸發調整

Claude Opus 4.5 和 Claude Opus 4.6 對系統提示詞的回應比先前模型更敏感。如果你的提示詞是為了減少工具或技能的觸發不足而設計，這些模型現在可能會過度觸發。

修正方法是減弱激進的語言。從「CRITICAL: You MUST use this tool when...」改為更正常的提示詞，如「Use this tool when...」。

## 自主性與安全性的平衡

沒有指導的情況下，Claude Opus 4.6 可能採取難以逆轉或影響共享系統的行動，例如刪除檔案、強制推送或發布到外部服務。

如果你希望 Claude Opus 4.6 在採取潛在風險行動前確認，在提示詞中加入指導：

```
Consider the reversibility and potential impact of your actions. You are encouraged to take local, reversible actions like editing files or running tests, but for actions that are hard to reverse, affect shared systems, or could be destructive, ask the user before proceeding.

Examples of actions that warrant confirmation:
- Destructive operations: deleting files or branches, dropping database tables, rm -rf
- Hard to reverse operations: git push --force, git reset --hard, amending published commits
- Operations visible to others: pushing code, commenting on PRs/issues, sending messages, modifying shared infrastructure

When encountering obstacles, do not use destructive actions as a shortcut. For example, don't bypass safety checks (e.g. --no-verify) or discard unfamiliar files that may be in-progress work.
```

## 過度思考與過度徹底

Claude Opus 4.6 在前期探索上做得比先前模型多得多，特別是在較高的 effort 設定下。這項初期工作通常有助於優化最終結果，但模型可能在沒有提示的情況下收集大量上下文或追蹤多個研究線索。

### 調整徹底性

如果你的提示詞先前鼓勵模型更徹底，應該針對 Claude Opus 4.6 調整該指導：

1. **用更有針對性的指令取代全面性預設**：不要使用「Default to using [tool]」，而是加入「Use [tool] when it would enhance your understanding of the problem」這樣的指導

2. **移除過度提示**：在先前模型中觸發不足的工具現在可能會適當觸發。像「If in doubt, use [tool]」這樣的指令會導致過度觸發

3. **使用 effort 作為後備**：如果 Claude 繼續過度積極，使用較低的 effort 設定

### 控制思考 token

在某些情況下，Claude Opus 4.6 可能會進行大量思考，這會增加思考 token 並降低回應速度。如果這種行為不理想，你可以加入明確指令來限制其推理，或者降低 effort 設定以減少整體思考和 token 使用量。

```
When you're deciding how to approach a problem, choose an approach and commit to it. Avoid revisiting decisions unless you encounter new information that directly contradicts your reasoning. If you're weighing two approaches, pick one and see it through. You can always course-correct later if the chosen approach fails.
```
