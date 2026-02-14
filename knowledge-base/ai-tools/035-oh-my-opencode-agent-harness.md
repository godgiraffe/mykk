# Oh My OpenCode：高性能多代理開發框架

> **來源**: [@geekbb](https://x.com/geekbb/status/2001541372256620796) | [原文連結](https://github.com/code-yeongyu/oh-my-opencode)
>
> **日期**: 
>
> **標籤**: `AI代理` `開發工具` `生產力提升`

---

```markdown
## 專案簡介

Oh My OpenCode 是一套專為 OpenCode（開源的 Claude Code 替代品）設計的高性能插件系統。作者投入超過 24,000 美元的 Token 費用開發，旨在提供「打了雞血的編程體驗」，被描述為「生產力核彈」。

## 核心特色

### 多代理協作架構

| 代理名稱 | 模型 | 專責領域 |
|---------|------|----------|
| **Sisyphus** | Claude Opus 4.5 High | 主控代理，協調整體工作流 |
| **Hephaestus** | GPT 5.2 Codex Medium | 自主深度工作，目標導向執行 |
| **Oracle** | GPT 5.2 Medium | 架構設計、除錯診斷 |
| **Frontend Engineer** | Gemini 3 Pro | 前端開發與 UI/UX |
| **Librarian** | Claude Sonnet 4.5 | 文檔專家、程式碼庫探索 |
| **Explore** | Claude Haiku 4.5 | 快速程式碼庫探索（使用 Contextual Grep） |

### 並行工作流

- **真正的平行開發**：一個代理寫後端時，另一個代理可同步開發前端
- **主代理協調**：Sisyphus 作為團隊領導，分配任務並整合成果
- **輕量化上下文管理**：主代理不親自搜尋檔案，而是委派更快、更便宜的模型並行處理

## 🪄 魔法關鍵字：ultrawork

不想讀文檔？只需在提示詞中加入 `ultrawork`（或縮寫 `ulw`），系統會自動：

1. 分析專案結構
2. 蒐集上下文
3. 探索外部原始碼
4. **持續執行直到任務 100% 完成**

所有功能（平行代理、背景任務、深度探索）會自動啟用。

## Hephaestus：自主深度工作者

> **靈感來源**：AmpCode 的 deep mode —— 先徹底研究，再果斷行動

### 設計哲學

Hephaestus（希臘神話中的鍛造之神）象徵「正統工匠精神」：

- **目標導向**：給定目標即可，無需詳細步驟指示
- **行動前探索**：寫程式前會先啟動 2-5 個平行探索/文檔代理
- **端到端完成**：不會半途而廢，必定執行到 100% 並提供驗證證據
- **模式匹配**：搜尋現有程式碼庫以匹配專案風格，避免生成「AI 廢料」
- **外科手術式精準**：只做必要修改，不過度工程化

## 主要功能清單

### 開發工具集成

- ✅ **完整 LSP 支援**：自動依檔案啟用 LSP、Linters、Formatters
- ✅ **AstGrep 支援**：用於重構與模式匹配
- ✅ **互動式終端**：Tmux 整合
- ✅ **精選 MCP（Model Context Protocol）**：
  - Exa（網頁搜尋）
  - Context7（官方文檔）
  - Grep.app（GitHub 程式碼搜尋）

### 自動化機制

- ✅ **Todo 延續執行器**：強制代理完成未完事項，避免半途放棄
- ✅ **註解檢查器**：防止 AI 生成過多註解，保持程式碼與人類寫法無異
- ✅ **Claude Code 相容層**：支援 Command、Agent、Skill、MCP、Hook（PreToolUse、PostToolUse、UserPromptSubmit、Stop）

### 代理工作流範例

```text
Sisyphus 不會親自搜尋檔案
    ↓
派發背景任務給更快的模型並行處理
    ↓
需要 UI 時委派給 Gemini 3 Pro
    ↓
遇到瓶頸時呼叫 GPT 5.2 尋求策略支援
    ↓
處理開源框架時，衍生子代理即時解析原始碼與文檔
    ↓
檢查註解：要麼有充分理由，要麼刪除
    ↓
綁定 TODO 清單：未完成前會強制回到「推石頭」模式
```

## 安裝方式

### 給人類

複製以下提示詞給你的 LLM 代理（Claude Code、AmpCode、Cursor 等）：

```
Install and configure oh-my-opencode by following the instructions here:
https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/docs/guide/installation.md
```

或直接閱讀[安裝指南](https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/master/docs/guide/installation.md)。

### 給 LLM 代理

可以直接向 AI 提問：

```
請閱讀這份 README，告訴我它與其他代理工具有何不同？為什麼這真的很好？
https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/refs/heads/dev/README.md
```

## 使用者評價精選

| 使用者 | 評價 |
|--------|------|
| **Arthur Guiot** | 「讓我取消了 Cursor 訂閱。開源社群正在發生不可思議的事。」 |
| **B（量化研究員）** | 「如果 Claude Code 用 7 天完成人類 3 個月的工作，Sisyphus 用 1 小時就能完成。它會一直執行直到任務完成，是真正有紀律的代理。」 |
| **Jacob Ferrari** | 「用 Oh My OpenCode 一天內處理了 8000 個 eslint 警告。」 |
| **James Hargis** | 「我用 Ohmyopencode 和 ralph loop 一夜之間將一個 45,000 行的 Tauri app 轉成 SaaS 網頁應用。早上醒來發現網站大部分都能運作了！」 |
| **苔硯 (Kokesuzuri)** | 「還無法完全表達它有多棒，但開發體驗已經達到完全不同的維度。」 |
| **Henning Kilset** | 「你們應該把這整合進核心並招募他。說真的，這東西真的、真的、真的很好。」 |

## 重要警告

### 安全提醒：假冒網站

- ⚠️ **ohmyopencode.com 是假冒網站**，與本專案無關
- ✅ **官方下載點**：https://github.com/code-yeongyu/oh-my-opencode/releases
- ⚠️ 該假冒網站付費牆後的內容無法驗證，**切勿下載或提供付款資訊**
- ✅ OhMyOpenCode 是**免費開源**專案

### Claude OAuth 存取限制（2026 年 1 月更新）

**TL;DR：**

- Q：我能使用 oh-my-opencode 嗎？  
  **A：可以。**
  
- Q：我能用 Claude Code 訂閱來使用嗎？  
  **A：技術上可行，但作者不建議使用。**

**完整說明：**

- Anthropic 已限制第三方 OAuth 存取，理由是違反服務條款（ToS）
- 社群中存在偽裝 Claude Code OAuth 請求簽章的插件
- 這些工具可能有效，但使用者需自行承擔 ToS 風險
- **本專案不對使用非官方工具產生的問題負責**，也沒有自訂實作這些 OAuth 系統

## 社群與資源

- **Discord 社群**：加入與貢獻者和使用者交流
- **Twitter 更新**：@justsisyphus（原作者帳號 @code-yeongyu 誤遭停用後的官方更新帳號）
- **GitHub**：關注 @code-yeongyu 查看更多專案

## 專案願景

> 我們正在構建 Sisyphus 的完整產品化版本，定義前沿代理的未來。  
> [加入等候名單](候補連結)

---

★ Insight ─────────────────────────────────────

**1. 多代理系統的真正價值在於「分工明確 + 並行執行」**  
Sisyphus 不是單純堆疊多個 LLM，而是為每個代理分配專精領域（架構設計、前端、文檔探索等），並透過主控代理協調。這類似企業的「敏捷團隊」模式：前端與後端同步開發，QA 同步測試，而不是瀑布式等待。

**2. 「強制完成機制」解決 LLM 的致命弱點**  
LLM 常見問題是「半途而廢」或「假裝完成」。Todo Continuation Enforcer 和 Hephaestus 的「100% 驗證證據」設計，強制代理必須真正執行到底並提供可驗證的輸出，而非僅輸出「任務完成」。

**3. 輕量化上下文管理是性能關鍵**  
讓主代理派發「背景任務」給更便宜、更快的模型（如 Haiku），而非自己搜尋檔案，這種設計避免主代理的 context window 被無關資訊污染，保持推理效率。這也是為何 Librarian 和 Explore 使用較小模型的原因。

─────────────────────────────────────────────────
```
