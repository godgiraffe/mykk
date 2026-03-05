# Claude Code 進階工作流程完全指南

> **來源**: [@affaanmustafa](https://x.com/affaanmustafa/status/2014040193557471352) | [原文連結](https://x.com/i/article/2013394667602354176)
>
> **日期**: Wed Jan 21 18:19:35 +0000 2026
>
> **標籤**: `Claude Code` `工作流程優化` `提示工程`

---

> **來源**: [@affaanmustafa (cogsec)](https://x.com/affaanmustafa)
> **日期**: 2026 年（根據文中引用的日期推估）
> **標籤**: `Claude Code` `工作流程` `AI 開發` `最佳實踐`

---

在「[Claude Code 完全指南速查版](https://x.com/affaanmustafa/status/2012378465664745795?s=20)」中，我介紹了基礎設定：skills 和 commands、hooks、subagents、MCPs、plugins，以及構成有效 Claude Code 工作流程的配置模式。那是一份設定指南和基礎架構。

這份長篇指南深入探討將高效會話與浪費會話區分開來的技術。如果你還沒讀過[速查指南](https://x.com/affaanmustafa/status/2012378465664745795?s=20)，請先回去設定好你的配置。以下內容假設你已經配置好 skills、agents、hooks 和 MCPs 並正常運作。

本文主題：token 經濟學、記憶持久化、驗證模式、並行化策略，以及建立可重用工作流程的複合效應。這些是我在 10 個多月的日常使用中精煉出的模式，它們決定了你是在第一小時內就遭受 context rot 困擾，還是能維持數小時的高效會話。

速查和長篇文章中涵蓋的所有內容都可以在 GitHub 上找到：[everything-claude-code](https://github.com/affaan-m?tab=repositories)

## Context & Memory Management（上下文與記憶管理）

要在會話之間共享記憶，最好的方法是使用一個 skill 或 command 來總結並檢查進度，然後將其保存到 `.claude` 資料夾中的 `.tmp` 檔案，並在會話結束前持續追加。第二天它可以使用該檔案作為上下文，從你離開的地方繼續。為每個會話建立新檔案，這樣你就不會將舊上下文污染到新工作中。最終你會有一個大資料夾的會話日誌 - 只需將它備份到有意義的地方或刪除你不需要的會話對話。

Claude 建立一個總結當前狀態的檔案。檢查它，如有需要要求編輯，然後重新開始。對於新對話，只需提供檔案路徑。這在你接近上下文限制並需要繼續複雜工作時特別有用。這些檔案應包含 - 哪些方法有效（有證據證實）、哪些嘗試的方法無效、哪些方法尚未嘗試以及還有什麼要做。

**策略性清除上下文**：

一旦你設定好計劃並清除上下文（現在 Claude Code 的計劃模式中的預設選項），你就可以按照計劃工作。當你累積了大量與執行不再相關的探索上下文時，這很有用。對於策略性壓縮，禁用自動壓縮。在邏輯間隔手動壓縮，或建立一個為你執行或根據某些定義的標準提出建議的 skill。

**[Strategic Compact Skill](https://github.com/affaan-m/everything-claude-code/tree/main/skills/strategic-compact)（策略性壓縮技能）**：

```bash
#!/bin/bash
# Strategic Compact Suggester
# 在 PreToolUse 上執行，在邏輯間隔建議手動壓縮
#
# 為什麼手動優於自動壓縮：
# - 自動壓縮發生在任意點，通常在任務中途
# - 策略性壓縮在邏輯階段保留上下文
# - 在探索後、執行前壓縮
# - 在完成里程碑後、開始下一個前壓縮

COUNTER_FILE="/tmp/claude-tool-count-$$"
THRESHOLD=${COMPACT_THRESHOLD:-50}

# 初始化或遞增計數器
if [ -f "$COUNTER_FILE" ]; then
  count=$(cat "$COUNTER_FILE")
  count=$((count + 1))
  echo "$count" > "$COUNTER_FILE"
else
  echo "1" > "$COUNTER_FILE"
  count=1
fi

# 達到閾值後建議壓縮
if [ "$count" -eq "$THRESHOLD" ]; then
  echo "[StrategicCompact] 已達到 $THRESHOLD 次工具呼叫 - 如果正在轉換階段，考慮 /compact" >&2
fi
```

將其掛鉤到 Edit/Write 操作的 PreToolUse - 當你累積了足夠的上下文可能有助於壓縮時，它會提醒你。

**進階：動態系統提示注入**

我正在試用的一個模式是：不要僅僅將所有內容放在 CLAUDE.md（使用者範圍）或 `.claude/rules/`（專案範圍）中（每次會話都會載入），而是使用 CLI 標誌動態注入上下文。

```bash
claude --system-prompt "$(cat memory.md)"
```

這讓你可以更精確地控制何時載入什麼上下文。你可以根據正在處理的內容，為每個會話注入不同的上下文。

**為什麼這比 @ 檔案引用重要**：

當你使用 `@memory.md` 或將某些內容放在 `.claude/rules/` 中時，Claude 在對話期間透過 Read 工具讀取它 - 它以工具輸出的形式出現。當你使用 `--system-prompt` 時，內容在對話開始前就被注入到實際的系統提示中。

區別在於指令層級。系統提示內容的權威性高於使用者訊息，使用者訊息的權威性高於工具結果。對於大多數日常工作，這是微不足道的。但對於嚴格的行為規則、專案特定約束或你絕對需要 Claude 優先考慮的上下文 - 系統提示注入確保它被適當加權。

**實際設定**：

一個有效的方法是利用 `.claude/rules/` 作為你的基準專案規則，然後為你可以切換的特定場景上下文建立 CLI 別名：

```bash
# 日常開發
alias claude-dev='claude --system-prompt "$(cat ~/.claude/contexts/dev.md)"'

# PR 審查模式
alias claude-review='claude --system-prompt "$(cat ~/.claude/contexts/review.md)"'

# 研究/探索模式
alias claude-research='claude --system-prompt "$(cat ~/.claude/contexts/research.md)"'
```

**[系統提示上下文範例檔案](https://github.com/affaan-m/everything-claude-code/tree/main/contexts)**：

- dev.md 專注於實作
- review.md 專注於程式碼品質/安全性
- research.md 專注於行動前的探索

再次強調，對於大多數事情，使用 `.claude/rules/context1.md` 和直接將 `context1.md` 附加到你的系統提示之間的差異是微不足道的。CLI 方法更快（無需工具呼叫）、更可靠（系統級權威）、token 效率稍高。但這是一個小優化，對許多人來說，這帶來的額外開銷超過了其價值。

**進階：記憶持久化 Hooks**

有些人們不知道或知道但實際上沒有真正利用的 hooks 有助於記憶：

```plaintext
SESSION 1                              SESSION 2
─────────                              ─────────

[Start]                                [Start]
   │                                      │
   ▼                                      ▼
┌──────────────┐                    ┌──────────────┐
│ SessionStart │ ◄─── reads ─────── │ SessionStart │◄── 載入先前
│    Hook      │     nothing yet    │    Hook      │    上下文
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       ▼                                   ▼
   [Working]                           [Working]
       │                               (informed)
       ▼                                   │
┌──────────────┐                           ▼
│  PreCompact  │──► 在總結前       [Continue...]
│    Hook      │    保存狀態
└──────┬───────┘
       │
       ▼
   [Compacted]
       │
       ▼
┌──────────────┐
│  Stop Hook   │──► 持久化到 ──────────►
│ (session-end)│    ~/.claude/sessions/
└──────────────┘
```

- **PreCompact Hook**：在上下文壓縮發生前，將重要狀態保存到檔案
- **SessionComplete Hook**：在會話結束時，將學習內容持久化到檔案
- **SessionStart Hook**：在新會話時，自動載入先前的上下文

**[記憶持久化 Hooks](https://github.com/affaan-m/everything-claude-code/tree/main/hooks/memory-persistence/)**：

```json
{
  "hooks": {
    "PreCompact": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/pre-compact.sh"
      }]
    }],
    "SessionStart": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/session-start.sh"
      }]
    }],
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/hooks/memory-persistence/session-end.sh"
      }]
    }]
  }
}
```

這些的作用：

- **pre-compact.sh**：記錄壓縮事件，用壓縮時間戳更新活動會話檔案
- **session-start.sh**：檢查最近的會話檔案（過去 7 天），通知可用的上下文和學到的 skills
- **session-end.sh**：用模板建立/更新每日會話檔案，追蹤開始/結束時間

將這些串聯起來，無需手動干預即可實現跨會話的持續記憶。這建立在文章 1 的 hook 類型（PreToolUse、PostToolUse、Stop）之上，但專門針對會話生命週期。

## Continuous Learning / Memory（持續學習/記憶）

我們談到了以更新 codemaps 的形式進行持續記憶更新，但這也適用於其他事情，例如從錯誤中學習。如果你不得不多次重複提示，而 Claude 遇到相同的問題或給你之前聽過的回應，這對你適用。

很可能你需要發出第二個提示來「重新導向」並校準 Claude 的羅盤。這適用於任何此類場景 - 這些模式必須附加到 skills 中。

現在你可以簡單地告訴 Claude 記住它或將其添加到你的規則中來自動執行此操作，或者你可以有一個 skill 來準確執行此操作。

**問題**：浪費 tokens、浪費上下文、浪費時間，你的皮質醇飆升，因為你沮喪地對 Claude 大喊不要做某事，而你在之前的會話中已經告訴它不要這樣做了。

**解決方案**：當 Claude Code 發現一些非平凡的東西 - 一種除錯技術、一種解決方法、某些專案特定模式 - 它將該知識保存為新的 skill。下次出現類似問題時，該 skill 會自動載入。

**[持續學習 Skill](https://github.com/affaan-m/everything-claude-code/tree/main/skills/continuous-learning)**：

為什麼我使用 Stop hook 而不是 UserPromptSubmit？UserPromptSubmit 在你發送的每條訊息上執行 - 這是很多額外開銷，為每個提示增加延遲，坦白說對於這個目的來說是過度的。Stop 在會話結束時執行一次 - 輕量級，在會話期間不會減慢你的速度，並評估完整的會話而不是零碎的。

**安裝**：

```bash
# 複製到 skills 資料夾
git clone https://github.com/affaan-m/everything-claude-code.git ~/.claude/skills/everything-claude-code

# 或者只取得 continuous-learning skill
mkdir -p ~/.claude/skills/continuous-learning
curl -sL https://raw.githubusercontent.com/affaan-m/everything-claude-code/main/skills/continuous-learning/evaluate-session.sh > ~/.claude/skills/continuous-learning/evaluate-session.sh
chmod +x ~/.claude/skills/continuous-learning/evaluate-session.sh
```

**[Hook 配置](https://github.com/affaan-m/everything-claude-code/tree/main/hooks)**：

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
          }
        ]
      }
    ]
  }
}
```

這使用 Stop hook 在每個提示上執行啟動器腳本，評估會話是否有值得提取的知識。該 skill 也可以透過語義匹配啟動，但 hook 確保一致的評估。

Stop hook 在你的會話結束時觸發 - 腳本分析會話以尋找值得提取的模式（錯誤解決方案、除錯技術、解決方法、專案特定模式等），並將它們保存為可重用的 skills 在 `~/.claude/skills/learned/` 中。

**使用 /learn 手動提取**：

你不必等到會話結束。該 repo 還包含一個 `/learn` command，你可以在會話中解決了一些非平凡的東西時立即執行。它提示你立即提取模式，起草一個 skill 檔案，並在保存前要求確認。請參閱[這裡](https://github.com/affaan-m/everything-claude-code/tree/main/commands/learn.md)。

**會話日誌模式**：

該 skill 期望會話日誌在 `.tmp` 檔案中。模式是：`~/.claude/sessions/YYYY-MM-DD-topic.tmp` - 每個會話一個檔案，包含當前狀態、已完成的項目、阻礙、關鍵決策和下一個會話的上下文。範例會話檔案在 repo 的 [examples/sessions/](https://github.com/affaan-m/everything-claude-code/tree/main/examples/sessions) 中。

**其他自我改進記憶模式**：

@RLanceMartin 的一個方法涉及反思會話日誌以提煉使用者偏好 - 本質上建立一個「日記」，記錄什麼有效、什麼無效。每次會話後，反思 agent 提取什麼進展順利、什麼失敗、你做了什麼更正。這些學習更新一個在後續會話中載入的記憶檔案。

@alexhillman 的另一個方法是讓系統每 15 分鐘主動建議改進，而不是等待你注意到模式。agent 審查最近的互動，提出記憶更新，你批准或拒絕。隨著時間的推移，它從你的批准模式中學習。

## Token Optimization（Token 優化）

我從價格敏感的消費者或作為重度使用者經常遇到限制問題的人那裡收到很多問題。在 token 優化方面，你可以做一些技巧。

**主要策略：Subagent 架構**

主要是優化你使用的工具和 subagent 架構，設計為委派足以完成任務的最便宜模型以減少浪費。你在這裡有幾個選擇 - 你可以嘗試試錯並隨著你的進展進行調整。一旦你了解了什麼是什麼，你就可以委派給 Haiku，而不是委派給 Sonnet，而不是委派給 Opus。

**基準測試方法（更複雜）**：

另一種更複雜的方法是，你可以讓 Claude 設定一個基準測試，你有一個具有明確定義的目標和任務以及明確定義的計劃的 repo。在每個 git worktree 中，讓所有 subagents 都是一個模型。在任務完成時記錄 - 理想情況下在你的計劃和任務中。你至少需要使用每個 subagent 一次。

一旦你完成了完整的遍歷並且任務已從你的 Claude 計劃中勾選，停止並審核進度。你可以透過比較 diffs、建立在所有 worktrees 上統一的單元測試、整合測試和 E2E 測試來做到這一點。這將根據通過的案例與失敗的案例為你提供一個數值基準。如果所有測試都通過，你需要添加更多測試邊緣案例或增加測試的複雜性。這可能值得，也可能不值得，取決於這對你來說有多重要。

**模型選擇快速參考**：

對於 90% 的編碼任務，預設使用 Sonnet。當第一次嘗試失敗、任務跨越 5 個以上檔案、架構決策或安全關鍵程式碼時，升級到 Opus。當任務重複、指令非常清晰或在多 agent 設定中用作「worker」時，降級到 Haiku。坦白說，Sonnet 4.5 目前處於一個奇怪的位置，每百萬輸入 tokens 3 美元，每百萬輸出 tokens 15 美元，成本節省相對於 Opus 約為 66.7%，絕對來說這是一個不錯的節省，但相對而言對大多數人來說或多或少無關緊要。Haiku 和 Opus 組合最有意義，因為 Haiku vs Opus 的成本差異是 5 倍，而與 Sonnet 的價格差異是 1.67 倍。

在你的 agent 定義中，指定模型：

```yaml
---
name: quick-search
description: Fast file search
tools: Glob, Grep
model: haiku # Cheap and fast
---
```

**工具特定優化**：

考慮 Claude 最頻繁呼叫的工具。例如，用 mgrep 替換 grep - 在各種任務上，與傳統 grep 或 ripgrep（Claude 預設使用的）相比，平均有效 token 減少約一半。

**背景處理程序**：

在適用的情況下，如果你不需要 Claude 處理整個輸出並直接即時串流，在 Claude 之外執行背景處理程序。這可以透過 tmux 輕鬆實現（請參閱[速查指南](https://x.com/affaanmustafa/status/2012378465664745795?s=20)和 [Tmux Commands Reference](https://tmuxcheatsheet.com/)）。取得終端輸出，然後總結它或僅複製你需要的部分。這將節省大量輸入 tokens，這是成本的主要來源 - Opus 4.5 每百萬 tokens 5 美元，輸出是每百萬 tokens 25 美元。

**模組化程式碼庫的好處**：

擁有一個更模組化的程式碼庫，具有可重用的工具、函數、hooks 等 - 主檔案有數百行而不是數千行 - 有助於 token 優化成本和第一次就正確完成任務，這兩者是相關的。如果你必須多次提示 Claude，你就會消耗 tokens，特別是當它在非常長的檔案上反覆讀取時。你會注意到它必須進行大量工具呼叫才能完成讀取檔案。中途，它讓你知道檔案非常長，它將繼續讀取。在這個過程的某個地方，Claude 可能會丟失一些資訊。此外，停止和重新讀取會消耗額外的 tokens。這可以透過擁有更模組化的程式碼庫來避免。下面的例子 ->

```plaintext
root/
├── docs/                   # 全域文件
├── scripts/                # CI/CD 和建置腳本
├── src/
│   ├── apps/               # 入口點 (API, CLI, Workers)
│   │   ├── api-gateway/    # 將請求路由到模組
│   │   └── cron-jobs/      
│   │
│   ├── modules/            # 系統核心
│   │   ├── ordering/       # 自包含的「Ordering」模組
│   │   │   ├── api/        # 其他模組的公共介面
│   │   │   ├── domain/     # 業務邏輯與實體 (Pure)
│   │   │   ├── infrastructure/ # DB, External Clients, Repositories
│   │   │   ├── use-cases/  # 應用邏輯 (Orchestration)
│   │   │   └── tests/      # 單元和整合測試
│   │   │
│   │   ├── catalog/        # 自包含的「Catalog」模組
│   │   │   ├── domain/
│   │   │   └── ...
│   │   │
│   │   └── identity/       # 自包含的「Auth/User」模組
│   │       ├── domain/
│   │       └── ...
│   │
│   ├── shared/             # 每個模組使用的程式碼
│   │   ├── kernel/         # 基礎類別 (Entity, ValueObject)
│   │   ├── events/         # 全域事件匯流排定義
│   │   └── utils/          # 深度通用 helpers
│   │
│   └── main.ts             # 應用程式啟動
├── tests/                  # End-to-End (E2E) 全域測試
├── package.json
└── README.md
```

**精簡的程式碼庫 = 更便宜的 Tokens**：

這可能很明顯，但你的程式碼庫越精簡，你的 token 成本就越便宜。透過使用 skills 持續清理程式碼庫來識別死程式碼至關重要。此外，在某些時候,我喜歡瀏覽整個程式碼庫，尋找我注意到的或看起來重複的東西，手動將該上下文拼湊在一起，然後將其與 refactor skill 和 dead code skill 一起輸入 Claude。

**系統提示精簡（進階）**：

對於真正注重成本的人：Claude Code 的系統提示佔用約 18k tokens（約 200k 上下文的 9%）。這可以透過補丁減少到約 10k tokens，節省約 7,300 tokens（靜態開銷的 41%）。如果你想走這條路，請參閱 YK 的 [system-prompt-patches](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)，我個人不這樣做。

## Verification Loops and Evals（驗證迴圈和評估）

評估和 harness 調整 - 根據專案，你會想使用某種形式的可觀察性和標準化。

**可觀察性方法**：

一種方法是讓 tmux 處理程序掛鉤以在觸發 skill 時追蹤思考流和輸出。另一種方法是使用 PostToolUse hook 記錄 Claude 具體執行了什麼以及確切的變更和輸出是什麼。

**基準測試工作流程**：

將其與要求做同樣的事情但不使用 skill 並檢查輸出差異以進行基準相對效能比較：

```plaintext

                    [Same Task]
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │  Worktree A   │         │  Worktree B   │
    │  WITH skill   │         │ WITHOUT skill │
    └───────┬───────┘         └───────┬───────┘
            │                         │
            ▼                         ▼
       [Output A]                [Output B]
            │                         │
            └──────────┬──────────────┘
                       ▼
                  [git diff]
                       │
                       ▼
              ┌────────────────┐
              │ Compare logs,  │
              │ token usage,   │
              │ output quality │
              └────────────────┘
```

分叉對話，在其中一個中啟動一個沒有 skill 的新 worktree，最後拉出一個 diff，看看記錄了什麼。這與持續學習和記憶部分相關聯。

**評估模式類型**：

更進階的評估和迴圈協議在這裡進入。分為基於檢查點的評估和基於 RL 任務的持續評估。

```plaintext
CHECKPOINT-BASED                         CONTINUOUS
─────────────────                        ──────────

  [Task 1]                                 [Work]
     │                                        │
     ▼                                        ▼
  ┌─────────┐                            ┌─────────┐
  │Checkpoint│◄── verify                 │ Timer/  │
  │   #1    │    criteria                │ Change  │
  └────┬────┘                            └────┬────┘
       │ pass?                                │
   ┌───┴───┐                                  ▼
   │       │                            ┌──────────┐
  yes     no ──► fix ──┐                │Run Tests │
   │              │    │                │  + Lint  │
   ▼              └────┘                └────┬─────┘
  [Task 2]                                   │
     │                                  ┌────┴────┐
     ▼                                  │         │
  ┌─────────┐                          pass     fail
  │Checkpoint│                          │         │
  │   #2    │                           ▼         ▼
  └────┬────┘                        [Continue] [Stop & Fix]
       │                                          │
      ...                                    └────┘

最適合：有明確里程碑的              最適合：長會話
線性工作流程                        探索性重構
```

**基於檢查點的評估**：

- 在你的工作流程中設定明確的檢查點
- 在每個檢查點根據定義的標準驗證
- 如果驗證失敗，Claude 必須在繼續之前修復
- 適合有明確階段的線性工作流程

**持續評估**：

- 每 N 分鐘或在重大變更後執行
- 完整的測試套件、建置狀態、lint
- 立即報告回歸
- 在繼續之前停止並修復
- 適合長時間執行的會話

決定因素是你工作的性質。基於檢查點的評估適合具有明確階段的功能實作。持續評估適合探索性重構或沒有明確里程碑的維護。

我會說透過一些干預，驗證方法足以避免大多數技術債務。讓 Claude 在完成任務後透過執行 skills 和 PostToolUse hooks 進行驗證有助於此。持續更新 codemap 也有幫助，因為它保留了變更的日誌以及 codemap 如何隨時間演變，作為 repo 本身之外的真相來源。有了嚴格的規則，Claude 將避免建立隨機的 .md 檔案使一切雜亂，以及為類似程式碼建立重複檔案並留下死程式碼的荒地。

**[評分器類型（來自 Anthropic）](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)**：

**基於程式碼的評分器**：字串匹配、二進制測試、靜態分析、結果驗證。快速、便宜、客觀，但對有效變化很脆弱。

**基於模型的評分器**：評分準則評分、自然語言斷言、成對比較。靈活並處理細微差別，但非確定性且更昂貴。

**人工評分器**：SME 審查、眾包判斷、抽查抽樣。黃金標準品質，但昂貴且緩慢。

**關鍵指標**：

```plaintext
pass@k: k 次嘗試中至少有一次成功
        ┌─────────────────────────────────────┐
        │  k=1: 70%  k=3: 91%  k=5: 97%      │
        │  較高的 k = 更高的成功機率          │
        └─────────────────────────────────────┘

pass^k: 所有 k 次嘗試都必須成功
        ┌─────────────────────────────────────┐
        │  k=1: 70%  k=3: 34%  k=5: 17%      │
        │  較高的 k = 更難（一致性）          │
        └─────────────────────────────────────┘
```

當你只需要它工作並且任何驗證反饋都足夠時，使用 pass@k。當一致性至關重要並且你需要接近確定性的輸出一致性（在結果/品質/風格方面）時，使用 pass^k。

**建立評估路線圖（來自同一份 Anthropic 指南）**：

1. 盡早開始 - 從真實失敗中提取 20-50 個簡單任務
2. 將使用者報告的失敗轉換為測試案例
3. 編寫明確的任務 - 兩位專家應達成相同的判決
4. 建立平衡的問題集 - 測試行為應該和不應該發生的時候
5. 建立強大的 harness - 每次試驗都從乾淨的環境開始
6. 評分 agent 產生的內容，而不是它採取的路徑
7. 從許多試驗中閱讀記錄
8. 監控飽和度 - 100% 通過率意味著添加更多測試

## Parallelization（並行化）

在多 Claude 終端設定中分叉對話時，確保分叉和原始對話中的操作範圍定義明確。在程式碼變更方面，目標是最小的重疊。選擇彼此正交的任務以防止干擾的可能性。

**我偏好的模式**：

就我個人而言，我更喜歡主聊天處理程式碼變更，我所做的分叉是針對我對程式碼庫及其當前狀態的問題，或對外部服務進行研究，例如拉入文件、在 GitHub 上搜尋有助於任務的適用開源 repo，或其他有幫助的一般研究。

**關於任意終端數量**：

Boris @bcherny（建立 Claude Code 的傳奇人物）對並行化有一些我同意和不同意的提示。他建議過在本地執行 5 個 Claude 實例和 5 個上游實例。我建議不要像這樣設定任意的終端數量。終端的添加和實例的添加應該出於真正的必要性和目的。如果你可以使用腳本處理該任務，請使用腳本。如果你可以留在主聊天中並讓 Claude 在 tmux 中啟動一個實例並以這種方式在單獨的終端中串流它，那就這樣做。

你的目標真的應該是：你能用最少的並行化完成多少工作。

對於大多數新手，我甚至建議遠離並行化，直到你掌握只執行單個實例並在其中管理所有內容的竅門。我不是主張限制你自己 - 我是說要小心。大多數時候，即使是我也只使用總共 4 個左右的終端。我發現我通常能夠用只有 2 或 3 個 Claude 實例完成大多數事情。

**擴展實例時**：

如果你要開始擴展你的實例並且你有多個 Claude 實例在彼此重疊的程式碼上工作，你必須使用 git worktrees 並為每個實例制定一個非常明確的計劃。此外，為了在恢復會話時不會混淆或迷失哪個 git worktree 用於什麼（除了樹的名稱之外），使用 `/rename <name here>` 命名你所有的聊天。

**並行實例的 Git Worktrees**：

```bash
# 為並行工作建立 worktrees
git worktree add ../project-feature-a feature-a
git worktree add ../project-feature-b feature-b
git worktree add ../project-refactor refactor-branch

# 每個 worktree 都有自己的 Claude 實例
cd ../project-feature-a && claude
```

**好處**：

- 實例之間沒有 git 衝突
- 每個都有乾淨的工作目錄
- 容易比較輸出
- 可以在不同方法之間對同一任務進行基準測試

**級聯方法**：

執行多個 Claude Code 實例時，使用「級聯」模式組織：

- 在右側的新標籤頁中開啟新任務
- 從左到右掃描，從最舊到最新
- 保持一致的方向流
- 根據需要檢查特定任務
- 一次最多專注於 3-4 個任務 - 超過這個數量，心理負擔增加的速度會快於生產力

## Groundwork（基礎工作）

從頭開始時，實際的基礎很重要。這應該很明顯，但隨著複雜性和程式碼庫大小的增加，技術債務也會增加。如果你遵循一些規則，管理它非常重要且並不困難。除了為手頭的專案有效設定你的 Claude（請參閱速查指南）。

**兩實例啟動模式**：

對於我自己的工作流程管理（不是必需的但有幫助），我喜歡用 2 個開啟的 Claude 實例開始一個空的 repo。

**實例 1：腳手架 Agent**

- 將奠定腳手架和基礎工作
- 建立專案結構
- 設定配置（CLAUDE.md、rules、agents - 速查指南中的所有內容）
- 建立慣例
- 將骨架放置到位

**實例 2：深度研究 Agent**

- 連接到你所有的服務、網頁搜尋等
- 建立詳細的 PRD
- 建立架構 mermaid 圖表
- 編譯來自實際文件的實際片段的參考

你最少需要的開始是可以的 - 這種方式比每次使用 Context7 或輸入連結讓它抓取或使用 Firecrawl MCP 站點更快。當你已經深陷某事並且 Claude 明顯使用錯誤的語法或使用過時的函數或端點時，所有這些都有效。

**llms.txt 模式**：

如果可用，你可以在許多文件參考上找到 llms.txt，方法是在到達他們的文件頁面後執行 `/llms.txt`。這是一個例子：https://www.helius.dev/docs/llms.txt

這為你提供了一個乾淨的、LLM 優化的文件版本，你可以直接輸入給 Claude。

**哲學：建立可重用模式**

我完全支持 @omarsar0 的一個見解：「早期，我花時間建立可重用的工作流程/模式。建立起來很乏味，但隨著模型和 agent harnesses 的改進，這產生了瘋狂的複合效應。」

**值得投資的內容**：

- Subagents（速查指南）
- Skills（速查指南）
- Commands（速查指南）
- 規劃模式
- MCP 工具（速查指南）
- 上下文工程模式

**為什麼會複合（@omarsar0）**：「最好的部分是所有這些工作流程都可以轉移到其他 agents，如 Codex。」一旦建立，它們在模型升級中都有效。對模式的投資 > 對特定模型技巧的投資。

## Best Practices for Agents & Sub-Agents（Agents 和 Sub-Agents 的最佳實踐）

在速查指南中，我列出了 subagent 結構 - planner、architect、tdd-guide、code-reviewer 等。在這部分，我們專注於編排和執行層。

**Sub-Agent 上下文問題**：

Sub-agents 的存在是為了透過返回摘要而不是傾倒所有內容來節省上下文。但編排器具有 sub-agent 缺乏的語義上下文。sub-agent 只知道字面查詢，而不知道請求背後的目的/推理。摘要經常遺漏關鍵細節。

來自 @PerceptualPeak 的類比：「你的老闆派你去開會並要求一份摘要。你回來給他概述。十次中有九次，他會有後續問題。你的摘要不會包含他需要的一切，因為你沒有他擁有的隱含上下文。」

**迭代檢索模式**：

```plaintext
┌─────────────────┐
│  ORCHESTRATOR   │
│  (has context)  │
└────────┬────────┘
         │ 帶查詢 + 目標分派
         ▼
┌─────────────────┐
│   SUB-AGENT     │
│ (lacks context) │
└────────┬────────┘
         │ 返回摘要
         ▼
┌─────────────────┐      ┌─────────────┐
│   EVALUATE      │─no──►│  FOLLOW-UP  │
│   Sufficient?   │      │  QUESTIONS  │
└────────┬────────┘      └──────┬──────┘
         │ yes                  │
         ▼                      │ sub-agent
    [ACCEPT]              獲取答案
                                │
         ◄──────────────────────┘
              (最多 3 個週期)
```

要解決此問題，讓編排器：

- 評估每個 sub-agent 返回
- 在接受之前提出後續問題
- Sub-agent 回到來源，獲取答案，返回
- 迴圈直到足夠（最多 3 個週期以防止無限迴圈）

傳遞目標上下文，而不僅僅是查詢。在分派 subagent 時，包括特定查詢和更廣泛的目標。這有助於 subagent 優先考慮在其摘要中包含的內容。

**模式：具有順序階段的編排器**

```markdown
Phase 1: RESEARCH (use Explore agent)

- 收集上下文
- 識別模式
- 輸出：research-summary.md

Phase 2: PLAN (use planner agent)

- 閱讀 research-summary.md
- 建立實作計劃
- 輸出：plan.md

Phase 3: IMPLEMENT (use tdd-guide agent)

- 閱讀 plan.md
- 先寫測試
- 實作程式碼
- 輸出：程式碼變更

Phase 4: REVIEW (use code-reviewer agent)

- 審查所有變更
- 輸出：review-comments.md

Phase 5: VERIFY (use build-error-resolver if needed)

- 執行測試
- 修復問題
- 輸出：完成或迴圈返回
```

**關鍵規則**：

1. 每個 agent 獲得一個明確的輸入並產生一個明確的輸出
2. 輸出成為下一階段的輸入
3. 永遠不要跳過階段 - 每個都增加價值
4. 在 agents 之間使用 `/clear` 保持上下文新鮮
5. 將中間輸出儲存在檔案中（不僅僅是記憶體）

**Agent 抽象層級列表（來自 @menhguin）**：

**Tier 1：直接增益（易於使用）**

- Subagents - 防止上下文腐爛和臨時特化的直接增益。有用程度是多 agent 的一半，但複雜性要小得多
- Metaprompting -「我花 3 分鐘提示一個 20 分鐘的任務。」直接增益 - 提高穩定性並理智檢查假設
- 在開始時向使用者詢問更多 - 通常是增益，儘管你必須在計劃模式中回答問題

**Tier 2：高技能門檻（更難用好）**

- 長期執行的 agents - 需要理解 15 分鐘任務 vs 1.5 小時 vs 4 小時任務的形狀和權衡。需要一些調整，顯然是非常長的試錯
- 並行多 agent - 變化很大，只在高度複雜或良好分段的任務上有用。「如果 2 個任務需要 10 分鐘，而你花費任意數量的時間提示或天哪，合併變更，那是適得其反的」
- 基於角色的多 agent -「模型演變太快，硬編碼啟發式無法使用，除非套利非常高。」難以測試
- Computer use agents - 非常早期的範式，需要爭論。「你讓模型做一些一年前它們絕對不應該做的事情」

**結論**：從 Tier 1 模式開始。只有在你掌握了基礎知識並有真正需求時才升級到 Tier 2。

## Tips and Tricks（技巧和訣竅）

**有些 MCPs 是可替換的，會釋放你的上下文視窗**

方法如下。

對於版本控制（GitHub）、資料庫（Supabase）、部署（Vercel、Railway）等 MCPs - 這些平台中的大多數已經有強大的 CLI，MCP 本質上只是包裝。MCP 是一個不錯的包裝器，但它是有成本的。

要讓 CLI 在不實際使用 MCP（以及隨之而來的上下文視窗減少）的情況下更像 MCP 一樣運作，考慮將功能捆綁到 skills 和 commands 中。剝離 MCP 公開的使事情變得容易的工具，並將它們轉換為 commands。

範例：與其一直載入 GitHub MCP，不如建立一個 `/gh-pr` command，用你偏好的選項包裝 `gh pr create`。與其讓 Supabase MCP 吃掉上下文，不如建立直接使用 Supabase CLI 的 skills。功能相同，便利性相似，但你的上下文視窗被釋放出來用於實際工作。

這與我收到的其他一些問題有關。在過去幾天自從我發布原文以來，Boris 和 Claude Code 團隊在記憶管理和優化方面取得了很大進展，主要是透過 MCPs 的延遲載入，這樣它們就不會從一開始就吃掉你的視窗了。以前我會建議盡可能將 MCPs 轉換為 skills，透過兩種方式之一將功能卸載以執行 MCP：透過在那時啟用它（不太理想，因為你需要離開並恢復會話）或透過使用 CLI 類似物到 MCP（如果它們存在）的 skills，並讓 skill 成為它周圍的包裝器 - 本質上讓它作為偽 MCP。

有了延遲載入，上下文視窗問題大部分得到了解決。但 token 使用和成本並沒有以同樣的方式解決。CLI + skills 方法仍然是一種 token 優化方法，其結果可能與使用 MCP 的效果相當或接近。此外，你可以透過 CLI 而不是在上下文中執行 MCP 操作，這大大減少了 token 使用，特別適用於繁重的 MCP 操作，如資料庫查詢或部署。

## 影片？

正如你所建議的，我正在考慮製作一個影片與本文配套，涵蓋這些內容。

涵蓋一個**端到端專案**，利用兩篇文章的策略：

- 完整的專案設定，包含速查指南中的配置
- 長篇指南中的進階技術實際應用
- 即時 token 優化
- 實踐中的驗證迴圈
- 跨會話的記憶管理
- 兩實例啟動模式
- 使用 git worktrees 的並行工作流程
- 實際工作流程的截圖和錄製

我會看看我能做什麼。

## 參考資料

- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)（2026 年 1 月）
- Anthropic:「Claude Code Best Practices」（2025 年 4 月）
- Fireworks AI:「Eval Driven Development with Claude Code」（2025 年 8 月）
- [YK: 32 Claude Code Tips](https://agenticcoding.substack.com/p/32-claude-code-tips-from-basics-to)（2025 年 12 月）
- Addy Osmani:「My LLM coding workflow going into 2026」
- @PerceptualPeak: Sub-Agent Context Negotiation
- @menhguin: Agent Abstractions Tierlist
- @omarsar0: Compound Effects Philosophy
- [RLanceMartin: Session Reflection Pattern](https://rlancemartin.github.io/2025/12/01/claude_diary/)
- @alexhillman: Self-Improving Memory System
