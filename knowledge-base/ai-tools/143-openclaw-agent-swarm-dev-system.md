# AI 代理編排系統：一人開發團隊的完整工作流程

> **來源**: [@elvissun](https://x.com/elvissun/status/2025920521871716562) | [原文連結](https://x.com/i/article/2025654698590748672)
>
> **日期**: Mon Feb 23 13:07:46 +0000 2026
>
> **標籤**: `Claude Code` `AI 代理編排` `開發自動化`

---

> **來源**: [Elvis (@elvissun)](https://twitter.com/elvissun)
> **日期**: 2026-03-05
> **標籤**: `AI-Agents` `OpenClaw` `Codex` `Claude-Code` `工作流程` `自動化` `一人公司`

---

## OpenClaw + Codex/Claude Code Agent Swarm：一人開發團隊的完整設置

我不再直接使用 Codex 或 Claude Code 了。

我使用 OpenClaw 作為編排層。我的編排者 Zoe 負責生成代理、撰寫提示詞、為每個任務選擇正確的模型、監控進度，並在 PR 準備好合併時透過 Telegram 通知我。

過去 4 週的實證成果：

- **單日 94 次提交**。這是我最高產的一天——我參加了 3 場客戶會議，完全沒有打開編輯器。平均每天約 50 次提交。

- **30 分鐘內 7 個 PR**。從想法到生產環境的速度極快，因為編碼和驗證大多是自動化的。

- **提交 → MRR**：我在一個真實的 B2B SaaS 產品上使用這個系統——結合創辦人主導的銷售模式，當天就能交付大多數功能請求。速度將潛在客戶轉化為付費客戶。

我的 git 歷史記錄看起來像是剛雇用了一個開發團隊。實際上只是我從管理 Claude Code，變成管理一個 OpenClaw 代理，它再管理一群其他 Claude Code 和 Codex 代理。

成功率：系統幾乎一次完成所有小型到中型任務，無需任何干預。

成本：Claude 每月約 $100，Codex 每月 $90，但你可以從 $20 開始。

為什麼這比直接使用 Codex 或 Claude Code 更好：

> Codex 和 Claude Code 對你的業務幾乎沒有上下文。

它們只看到代碼，看不到業務的全貌。

OpenClaw 改變了這個局面。它作為你和所有代理之間的編排層——它保存了我所有的業務上下文（客戶資料、會議記錄、過去的決策、什麼有效、什麼失敗了）在我的 Obsidian vault 裡，並將歷史上下文轉化為每個編碼代理的精確提示詞。代理專注於代碼，編排者保持在高層策略層面。

系統的高層運作方式如下：

上週 Stripe 寫了一篇關於他們的背景代理系統「Minions」的文章——由中央編排層支持的並行編碼代理。我意外地建立了同樣的東西，但它在我的 Mac mini 上本地運行。

在我告訴你如何設置之前，你應該知道為什麼需要代理編排器。

## 為什麼單一 AI 無法兩者兼顧

上下文視窗是零和遊戲。你必須選擇放入什麼。

填入代碼 → 沒有空間給業務上下文。填入客戶歷史 → 沒有空間給代碼庫。這就是為什麼雙層系統有效：每個 AI 都載入它確切需要的東西。

OpenClaw 和 Codex 有截然不同的上下文：

透過上下文專業化，而不是透過不同的模型。

## 完整的 8 步工作流程

讓我演示一個上週的真實案例。

### 步驟 1：客戶請求 → 與 Zoe 確定範圍

我與一位代理客戶進行了通話。他們想在團隊中重複使用已經設置好的配置。

通話後，我與 Zoe 討論了這個需求。因為我所有的會議記錄都會自動同步到我的 Obsidian vault，我這邊完全不需要解釋。我們一起確定了功能範圍——最後決定建立一個模板系統，讓他們可以保存和編輯現有的配置。

然後 Zoe 做三件事：

1. 增加額度以立即解除客戶封鎖——她有管理 API 存取權限
2. 從生產資料庫拉取客戶配置——她有唯讀的生產資料庫存取權限（我的 Codex 代理永遠不會有這個權限）來檢索他們現有的設置，這會被包含在提示詞中
3. 生成一個 Codex 代理——帶著包含所有上下文的詳細提示詞

### 步驟 2：生成代理

每個代理都有自己的 worktree（隔離分支）和 tmux 會話：

```bash
# 建立 worktree + 生成代理
git worktree add ../feat-custom-templates -b feat/custom-templates origin/main
cd ../feat-custom-templates && pnpm install

tmux new-session -d -s "codex-templates" \
  -c "/Users/elvis/Documents/GitHub/medialyst-worktrees/feat-custom-templates" \
  "$HOME/.codex-agent/run-agent.sh templates gpt-5.3-codex high"
```

代理在 tmux 會話中運行，透過腳本進行完整的終端日誌記錄。

我們這樣啟動代理：

```bash
# Codex
codex --model gpt-5.3-codex \
  -c "model_reasoning_effort=high" \
  --dangerously-bypass-approvals-and-sandbox \
  "Your prompt here"

# Claude Code  
claude --model claude-opus-4.5 \
  --dangerously-skip-permissions \
  -p "Your prompt here"
```

我以前使用 `codex exec` 或 `claude -p`，但最近切換到 tmux：

tmux 好太多了，因為任務中途重新導向非常強大。代理走錯方向了？不要殺掉它：

```bash
# 走錯方向：
tmux send-keys -t codex-templates "Stop. Focus on the API layer first, not the UI." Enter

# 需要更多上下文：
tmux send-keys -t codex-templates "The schema is in src/types/template.ts. Use that." Enter
```

任務會被追蹤在 `.clawdbot/active-tasks.json` 中：

```json
{
  "id": "feat-custom-templates",
  "tmuxSession": "codex-templates",
  "agent": "codex",
  "description": "Custom email templates for agency customer",
  "repo": "medialyst",
  "worktree": "feat-custom-templates",
  "branch": "feat/custom-templates",
  "startedAt": 1740268800000,
  "status": "running",
  "notifyOnComplete": true
}
```

完成時，它會更新 PR 編號和檢查項目（步驟 5 會詳細說明）：

```json
{
  "status": "done",
  "pr": 341,
  "completedAt": 1740275400000,
  "checks": {
    "prCreated": true,
    "ciPassed": true,
    "claudeReviewPassed": true,
    "geminiReviewPassed": true
  },
  "note": "All checks passed. Ready to merge."
}
```

### 步驟 3：迴圈監控

一個 cron 工作每 10 分鐘運行一次來照看所有代理。這基本上是一個改進版的 Ralph Loop，稍後會詳細說明。

但它不會直接輪詢代理——那樣會很昂貴。相反，它運行一個腳本來讀取 JSON 註冊表並檢查：

```bash
.clawdbot/check-agents.sh
```

這個腳本 100% 確定性且極度節省 token：

- 檢查 tmux 會話是否存活
- 檢查追蹤分支上的開放 PR
- 透過 `gh cli` 檢查 CI 狀態
- 如果 CI 失敗或有重大審查反饋，自動重新生成失敗的代理（最多 3 次嘗試）
- 只在需要人工注意時發出警報

我不會盯著終端。系統會告訴我什麼時候該看。

### 步驟 4：代理建立 PR

代理提交、推送，並透過 `gh pr create --fill` 開啟 PR。此時我不會收到通知——單獨的 PR 還不算完成。

完成的定義（你的代理知道這點非常重要）：

- PR 已建立
- 分支已同步到 main（沒有合併衝突）
- CI 通過（lint、類型檢查、單元測試、E2E）
- Codex 審查通過
- Claude Code 審查通過
- Gemini 審查通過
- 包含截圖（如果有 UI 變更）

### 步驟 5：自動化程式碼審查

每個 PR 都會被三個 AI 模型審查。它們會發現不同的問題：

- **Codex Reviewer** — 在邊緣案例方面表現出色。進行最徹底的審查。捕捉邏輯錯誤、缺失的錯誤處理、競態條件。誤報率非常低。

- **Gemini Code Assist Reviewer** — 免費且非常有用。捕捉其他代理錯過的安全問題、可擴展性問題。並提出具體的修復建議。安裝它是理所當然的。

- **Claude Code Reviewer** — 大多數時候沒用——傾向於過度謹慎。很多「考慮添加...」的建議通常是過度工程。我會跳過所有內容，除非標記為關鍵。它很少單獨發現關鍵問題，但會驗證其他審查者標記的內容。

三者都會直接在 PR 上發布評論。

### 步驟 6：自動化測試

我們的 CI 管道運行大量自動化測試：

- Lint 和 TypeScript 檢查
- 單元測試
- E2E 測試
- 針對預覽環境的 Playwright 測試（與生產環境相同）

我上週添加了一個新規則：如果 PR 更改了任何 UI，必須在 PR 描述中包含截圖。否則 CI 失敗。這大幅縮短了審查時間——我可以準確看到發生了什麼變化，無需點擊預覽。

### 步驟 7：人工審查

現在我收到 Telegram 通知：「PR #341 準備好審查了。」

到這個時候：

- CI 通過
- 三個 AI 審查者批准了代碼
- 截圖顯示了 UI 變更
- 所有邊緣案例都記錄在審查評論中

我的審查需要 5-10 分鐘。許多 PR 我不讀代碼就合併——截圖顯示了我需要的一切。

### 步驟 8：合併

PR 合併。一個每日 cron 工作會清理孤立的 worktree 和任務註冊 JSON。

## Ralph Loop V2

這本質上是 Ralph Loop，但更好。

Ralph Loop 從記憶中提取上下文、生成輸出、評估結果、保存學習。但大多數實作在每個週期運行相同的提示詞。提煉的學習改進了未來的檢索，但提示詞本身保持靜態。

我們的系統不同。當代理失敗時，Zoe 不會只是用相同的提示詞重新生成它。她會用完整的業務上下文來審視失敗，並找出如何解除封鎖：

- 代理上下文不足？「只專注於這三個文件。」
- 代理走錯方向？「停止。客戶想要 X，不是 Y。這是他們在會議中說的。」
- 代理需要澄清？「這是客戶的電子郵件和他們公司的業務。」

Zoe 照看代理直到完成。她擁有代理沒有的上下文——客戶歷史、會議記錄、我們之前嘗試過什麼、為什麼失敗。她使用這些上下文在每次重試時撰寫更好的提示詞。

但她也不會等我分配任務。她會主動尋找工作：

- 早上：掃描 Sentry → 發現 4 個新錯誤 → 生成 4 個代理來調查和修復
- 會議後：掃描會議記錄 → 標記客戶提到的 3 個功能請求 → 生成 3 個 Codex 代理
- 晚上：掃描 git log → 生成 Claude Code 來更新變更日誌和客戶文件

我在客戶會議後散步。回來看到 Telegram：「7 個 PR 準備好審查了。3 個功能，4 個錯誤修復。」

當代理成功時，模式會被記錄。「這個提示詞結構對計費功能有效。」「Codex 需要預先提供類型定義。」「始終包含測試文件路徑。」

獎勵信號是：CI 通過、所有三個程式碼審查通過、人工合併。任何失敗都會觸發迴圈。隨著時間推移，Zoe 會撰寫更好的提示詞，因為她記得什麼被發布了。

## 選擇正確的代理

並非所有編碼代理都相同。快速參考：

**Codex** 是我的主力。後端邏輯、複雜的錯誤、多文件重構、任何需要跨代碼庫推理的事情。它較慢但徹底。我在 90% 的任務中使用它。

**Claude Code** 更快，更擅長前端工作。它也有較少的權限問題，所以非常適合 git 操作。（我以前更常使用它來驅動日常工作，但 Codex 5.3 現在更好更快）

**Gemini** 有不同的超能力——設計敏感度。對於美觀的 UI，我會先讓 Gemini 生成一個 HTML/CSS 規格，然後把它交給 Claude Code 在我們的元件系統中實作。Gemini 設計，Claude 建構。

Zoe 為每個任務選擇正確的代理，並在它們之間路由輸出。計費系統錯誤給 Codex。按鈕樣式修復給 Claude Code。新儀表板設計從 Gemini 開始。

## 如何設置

將這整篇文章複製到 OpenClaw 並告訴它：「為我的代碼庫實作這個代理群設置。」

它會讀取架構、建立腳本、設置目錄結構，並配置 cron 監控。10 分鐘內完成。

沒有課程要賣給你。

## 沒人預期的瓶頸

這是我現在遇到的上限：RAM。

每個代理需要自己的 worktree。每個 worktree 需要自己的 `node_modules`。每個代理運行建構、類型檢查、測試。五個代理同時運行意味著五個並行的 TypeScript 編譯器、五個測試運行器、五組載入記憶體的依賴項。

我的 16GB Mac Mini 在 4-5 個代理時就會達到上限，開始交換記憶體——而且我需要幸運它們不會同時嘗試建構。

所以我買了一台配備 128GB RAM 的 Mac Studio M4 Max（$3,500）來驅動這個系統。它會在 3 月底到貨，我會分享它是否值得。

## 接下來：一人百萬美元公司

從 2026 年開始，我們將看到大量一人百萬美元公司。對於那些了解如何建構遞迴自我改進代理的人來說，槓桿是巨大的。

這就是它的樣子：一個 AI 編排器作為你的延伸（就像 Zoe 對我一樣），將工作委派給處理不同業務功能的專門代理。工程。客戶支援。營運。行銷。每個代理專注於它擅長的事情。你保持雷射般的專注和完全的控制。

下一代創業家不會雇用 10 人團隊來做一個人用正確的系統就能做到的事。他們會這樣建構——保持小規模、快速行動、每日發布。

現在有太多 AI 生成的低質量內容。太多關於代理和「任務控制」的炒作，卻沒有建構任何真正有用的東西。華麗的展示，沒有實際效益。

我試圖做相反的事：少炒作，多記錄建構實際業務。真實的客戶、真實的收入、發布到生產環境的真實提交，以及真實的損失。

我在建構什麼？Agentic PR——一家一人公司，挑戰企業 PR 現有業者。幫助新創公司獲得媒體報導的代理，無需 $10k/月的保留費。

如果你想看我能走多遠，跟著我。
