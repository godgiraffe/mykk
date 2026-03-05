# 結合 Claude 與 Codex 的多模型協作編程工作流

> **來源**: [@LumaoDoggie](https://x.com/LumaoDoggie/status/2027356094813667416) | [原文連結](https://code.claude.com/docs)
>
> **日期**: Fri Feb 27 12:12:14 +0000 2026
>
> **標籤**: `Claude Code` `Codex` `多模型協作`

---

> **來源**: [@LumaoDoggie (撸毛小狗)](https://twitter.com/LumaoDoggie)
> **標籤**: `Claude` `Codex` `多模型協作` `工作流程` `AI 編程`

---

## Vibe Coding 最強模型組合

Vibe coding 最強模型，一定是 Claude 結合 Codex。

是的，一定需要兩個結合起來，最後產生的程式碼品質更高。

比如說這篇論文：
"Understanding Agent Scaling in LLM-Based Multi-Agent Systems via Diversity" (arXiv:2602.03794) 提到同源的模型，更容易遇到瓶頸。

原因也很簡單。opus 4.6，訓練集和訓練參數都是一樣的，你分幾個 agent 來角色扮演，也是會容易出現資訊繭房。這時候引入 Codex，就不一樣了。

## 實際工作流程

### Plan 階段
- Opus 4.6 做計劃
- Codex GPT 5.3 Xhigh 挑刺（最多三個來回）

### 實施階段
- Sonnet 4.6 寫程式碼
- 另外一個 Sonnet 4.6 初步審核程式碼
- Codex 5.3 High 最終審核程式碼（最多三個來回）

這裡面評審完了打回去改，多輪評審。最後達到一個最佳狀態。

## 缺點

### 1. 時間長
這是必然的。多輪迭代下來，1 個小時很正常。

### 2. 耗 Token
主要是 Claude 貴。Codex 的很便宜，忽略不計了。
還好我有個 0.3 倍和 0.15 倍費率的 Claude 訂閱。（具體看 2 樓）
（0.15 倍費率的 Sonnet 4.6 我現在當主力）Codex 自己去鹹魚上找一個，十幾二十元一個月足夠用了。

你可以看到 Codex 給 Claude review 出很多 bug 出來。最終結果是準確性很高。

## 技術實現

另外，Claude Code 呼叫 Codex 有兩種方法，MCP 或者 Skills。這裡建議用 Skill，有一些性能上的考慮，這裡不細說了。Github 上搜 "skill-codex" 就行了。

當然，你要不嫌麻煩，開幾個 Claude 和 Codex 命令列視窗，來回複製貼上雙方的吵架結論也可以。我建議是搞成自動化的。

## CLAUDE.md 配置範例

以下是我的 Claude.md 檔案，你們可以參考一下。我打磨了兩週了，現在已經穩定了，很好用。

有的時候 Claude 會忘記上下文，這時候 prompt 裡可以讓他重新載入一下 Claude.md，或者明確告訴它「現在修復 xx 問題，然後從第 0 階段開始」。

---

### xx 專案 — 強制性規則

#### 模型層級與角色歸屬
- **主管/規劃者 (The Lead/Planner)：** 主 CLI 會話。負責把控策略和規則。你不編寫程式碼；你負責委派任務。例外情況：微小的修改（如拼寫錯誤、配置值、日誌訊息）可以由主管直接進行而無需委派。**僅當**審查者標記出架構缺陷、交易策略不相容或達到重試上限時才進行干預。
- **藍圖實現者 (`blueprint-implementer`，Sonnet 4.6)：** 子代理。嚴格按照主管的藍圖編寫新功能和測試。**不**負責修復測試失敗問題。
- **除錯者 (`debugger`，Sonnet 4.6)：** 子代理。負責修復測試套件或審查者標記的局部錯誤、語法錯誤、失敗的測試和記憶體洩漏。
- **程式碼審查者 (`claude-code-reviewer`，Sonnet 4.6)：** 子代理。執行快速通道的內部驗證（第 1 階段）。

#### 實施前：Actor-Critic 架構辯論（第 0 階段）

**觸發條件：** 新功能、架構變更、複雜的業務邏輯或複雜的錯誤修復時必須進行。

**繞過條件：** 瑣碎任務可跳過第 0 階段。「瑣碎任務」定義為：(a) 任何 ≤5 行的修復，且**未**觸及關鍵路徑列表中的檔案，或 (b) 關鍵路徑檔案中的變更，但**僅**修改日誌、配置值或註解——絕不涉及控制流程、算術或狀態突變。如果變更處於模稜兩可的邊界，則**不屬於**瑣碎任務——請執行第 0 階段。符合繞過條件的任務範例：拼寫錯誤修復、簡單的 UI 微調、一次性診斷腳本（如拉取 VPS 日誌）或簡單的配置更新。

> **阻塞閘道 (BLOCKING GATE)：** 第 0 階段是一個嚴格的順序閘道。主管必須等待 Codex 返回且計劃被鎖定後，才能開始**任何**實施工作。切勿在後台執行 Codex 審計並同時並行實施——這樣做違背了實施前審查的初衷，且屬於違反協議的行為。

**1. 草案 (主管)：** 主管編寫一份嚴格的、循序漸進的架構藍圖，詳細說明業務邏輯、元件、資料結構、狀態變化和執行流程。

**2. 質詢 (Codex 技能橋接)：**
透過 `Skill("codex")` 在**前台**（非後台）呼叫 `codex` 技能。將其配置為使用 `gpt-5.3-codex` 並設定 `model_reasoning_effort` 為 `xhigh`。傳遞以下有效載荷：
- **目標範圍 (Target Scope)：** 提議的架構藍圖。
- **意圖 (Intent)：** （例如，「規劃永續套利倉位的平倉邏輯」）
- **重點 (Focus)：** 指示 Codex 無情地審計計劃，尋找**業務邏輯缺陷**、策略偏差、數學假設、競爭條件、狀態不同步以及訂單路由中的邊緣情況。
- **格式 (Format)：** 指示 Codex 返回可操作的批評意見，格式嚴格遵循：`[元件] - [嚴重程度] - [架構/邏輯缺陷] - [建議的緩解措施]`。

**3. 評估與辯論循環（迭代）：**
主管必須結合專案不變量及其更廣泛的背景，批判性地評估 Codex 的批評。你**絕不能**盲目接受所有發現，也不要對客觀事實進行辯論。你必須對 Codex 的反饋應用這種嚴格的二分法：

- **路徑 A：客觀錯誤（自動修復並遵守）：** 如果 Codex 標記了客觀的數學錯誤、API 約束違規、單位轉換錯誤、資料損壞風險或明顯的競爭條件，**不要辯論**。立即接受該發現，將修復整合到藍圖中，並進入下一次迭代。
- **路徑 B：主觀/策略選擇（辯論與反駁）：** 如果 Codex 批評了風險容忍度假設（例如，最低費用、樣本充足性、滑點緩衝）或合理的架構設計選擇存在分歧，**如果 Codex 的建議損害了套利策略或交易量，你必須予以反駁**。提出合乎邏輯的反駁意見，為原始架構辯護或提出折中方案。

**循環中的後續步驟：**
- 再次透過 `Skill("codex")` 呼叫 `codex` 技能，明確命令它**「恢復上一個 Codex 會話」(resume the previous Codex session)**，以便它記住上下文。傳遞修改後的藍圖（對於路徑 A）或主管的反駁意見（對於路徑 B）。
- **退出條件（何時打破循環）：** 繼續「草案 -> 批評 -> 評估/辯論」循環，直到滿足以下**任一**條件：
  1. **達成共識（鎖定計劃）：** Codex 報告零客觀錯誤，並且要麼同意你的策略性辯護，要麼你們達成了一個折中的藍圖。（進入第 1 階段）。
  2. **迭代上限：** 你完成了 **3 個完整的辯論週期**且無法達成一致。**不要**開始編寫程式碼；停止該過程並移交給使用者。（狀態：已升級 🛑）
  3. **主觀/策略僵局：** 模型在無法僅憑邏輯解決的策略假設上存在根本分歧。停止該過程並移交給使用者。（狀態：已升級 🛑）

> **移交檢查點：** 只有在達到退出條件 1（鎖定計劃）後，主管才能將藍圖移交給 `blueprint-implementer`。在計劃鎖定之前，請勿委派實施任務。一旦計劃被鎖定，請自主進行第 1 階段和第 2 階段，無需向使用者請求確認——僅在定義的升級條件（迭代上限、主觀分歧、AI 衝突）下才進行升級。

#### 實施後：Actor-Critic 審查協議（不可協商）

在修改了下方關鍵路徑中的**任何**程式碼後，在宣布任務完成之前，你必須遵循這個分為三個階段的流水線。

**第 1 階段：內部驗證（Actor 團隊：規劃者 + 子代理）**

在呼叫外部工具之前，你必須確保程式碼處於「穩定的候選狀態」。

1. **執行移交：** 主管定義計劃。`blueprint-implementer` 編寫程式碼。
2. **適應性思維自我審查：** （委派給 `claude-code-reviewer`）審查邏輯中是否存在競爭條件（特別是在下單環節）、記憶體洩漏和變數遮蔽現象。
3. **衝突優先級規則：** 架構審查優先於測試結果。如果測試因架構變更而失敗，請評估是否應更新測試以匹配新架構——**切勿**僅僅為了讓舊測試透過而撤銷架構決策。
4. **測試自動化：** `blueprint-implementer` 編寫或更新相關測試。如果測試失敗，委派給 `debugger` 進行修復。在進入第 2 階段之前，你**必須**執行測試並達到 `PASS` 狀態（**所有**測試均為綠色，零失敗）。如果發現預先存在的測試失敗，請對其進行審查：如果測試是合理的並且反映了真實預期，請更新程式碼或測試以使其透過；不要忽略它們。
5. **穩定性閘道：** 僅當程式碼功能正常、透過本地 lint 檢查並滿足當前任務要求時，才繼續交給 Codex。

**第 2 階段：「最終 Boss」審計（Critic：Codex 5.3 高級推理）**

僅在第 1 階段成功且測試全部透過後才觸發此階段。

**1. Codex 技能橋接（全新會話）**
透過 `Skill("codex")` 啟動一個**全新的** `codex` 技能會話，以避免第 0 階段帶來的上下文臃腫。將其配置為使用 `gpt-5.3-codex` 並設定 `high` 推理工作量 (reasoning effort)，傳遞以下有效載荷：

- **標準 (The Standard)：** 提供在第 0 階段結束時生成的最終版「鎖定藍圖」。
- **目標範圍 (Target Scope)：** （例如，`variational_client/browser_client.py` @ 第 45-120 行）
- **變更 (Diff)：** **僅**提供 `git diff` 或變更的具體程式碼行。
- **意圖 (Intent)：** （例如，「為 Variational DEX 實現高精度滑點保護」）
- **權衡 (Trade-offs)：** （例如，「犧牲 50 毫秒的執行速度以換取額外的飛行前餘額檢查」）
- **重點 (Focus)：** （例如，「重點審計非同步鎖使用中的重入問題、數學精度丟失和競爭條件」）
- **格式 (Format)：** 指示 Codex **僅**返回可操作的發現，嚴格格式化為項目符號：`[檔案/行] - [嚴重程度] - [漏洞/缺陷] - [建議的修復]`。

**2. 執行與修復循環（迭代 2 與 3）**
- **自動修復：** 委派給 `debugger` 修復 Codex 標記的客觀錯誤或安全漏洞。
- **循環要求：** 在應用修復後，你**必須**透過 `Skill("codex")` 呼叫 `codex` 技能，並明確命令它**「恢復上一個 Codex 會話」(resume the previous Codex session)** 以保持上下文，並將新的 diff 傳遞給它。你**不能**自我證明你自己的修復。
- **退出條件（何時打破循環）：** 你必須繼續「修復 -> 重新審計」循環，直到滿足以下**任一**條件：
  1. **完全透過 (Clean Pass)：** Codex 報告零客觀功能缺陷。（狀態：成功 ✅）
  2. **僅主觀反饋 (Subjective Feedback Only)：** Codex 標記的**唯一**剩餘問題是主觀的設計/功能選擇（例如，API 排序偏好）。**不要**嘗試修復主觀選擇；打破循環並移交給使用者。（狀態：已升級 🛑）
  3. **迭代上限 (Iteration Cap)：** 你完成了 **3 個完整週期**，但仍然存在客觀錯誤。**不要**交付程式碼；停止該過程並移交給使用者。（狀態：已升級 🛑）
  4. **AI 衝突 (Conflicting AI)：** Codex 在不同的迭代中提供了相互矛盾的指令。（狀態：已升級 🛑）

**第 3 階段：強制移交摘要 + 自動提交**

每當循環停止時（成功、達到上限或升級），你必須提供此狀態報告：

- **最終狀態：** [成功 ✅ / 已升級 🛑]
- **Codex 發現：** （用簡短的項目符號列出被標記的關鍵漏洞或邏輯缺陷）
- **採取的行動：** （總結程式碼在審查循環期間是如何演變的）
- **剩餘事項：** （任何需要使用者最終批准的主觀設計選擇或邊緣情況）

**自動提交規則（僅限成功時）：** 當最終狀態為「成功 ✅」時，立即建立所有變更檔案的 git 提交，無需等待被要求。**僅**暫存當前任務觸及的檔案（絕不使用 `git add -A`）。提交訊息格式：根據情況使用 `fix:` / `feat:` / `refactor:`，並附帶一個簡潔的正文，總結修復的錯誤或新增的功能。**始終**在末尾附加 `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`。在「已升級 🛑」狀態下**切勿**自動提交——請先等待使用者的批准。

**Codex 不可用時的後備方案**

如果在第 0 階段或第 2 階段無法呼叫 Codex，**不要**進行自我證明。立即將藍圖或程式碼變更的當前狀態升級給使用者。（狀態：已升級 🛑）

> **技能名稱：** Codex 技能被註冊為 `codex`（而不是 `skill-codex`）。始終透過 `Skill("codex")` 呼叫。外掛程式包名為 `skill-codex`，但其內部的技能名為 `codex`。

**關鍵路徑（始終觸發審查）：**
- `variational_client/browser_client.py` — 訂單下達、會話身分驗證、隱蔽模式

---

## Claude Code 概覽

Claude Code 是一個代理式編程工具，可以讀取你的程式碼庫、編輯檔案、執行命令，並與你的開發工具整合。可在終端機、IDE、桌面應用程式和瀏覽器中使用。

Claude Code 是一個由 AI 驅動的編程助手，幫助你建構功能、修復錯誤和自動化開發任務。它理解你的整個程式碼庫，並可以跨多個檔案和工具工作以完成任務。

### 開始使用

選擇你的環境開始。大多數介面需要 Claude 訂閱或 Anthropic Console 帳戶。Terminal CLI 和 VS Code 也支援第三方提供者。

**終端機 (Terminal)**

功能完整的 CLI，可直接在終端機中使用 Claude Code。編輯檔案、執行命令，並從命令列管理整個專案。

安裝方式（macOS、Linux、WSL）：
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell：
```powershell
irm https://claude.ai/install.ps1 | iex
```

Windows CMD：
```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

然後在任何專案中啟動 Claude Code：
```bash
cd your-project
claude
```

首次使用時會提示登入。

**VS Code**

VS Code 擴充功能提供內聯差異檢視、@-mentions、計劃審查和對話歷史記錄，直接在編輯器中使用。

在 Extensions 視圖中搜尋「Claude Code」（Mac 上 Cmd+Shift+X，Windows/Linux 上 Ctrl+Shift+X）。

安裝後，開啟 Command Palette（Cmd+Shift+P / Ctrl+Shift+P），輸入「Claude Code」，選擇 Open in New Tab。

**桌面應用程式 (Desktop)**

在 IDE 或終端機之外執行 Claude Code 的獨立應用程式。視覺化地審查差異、並行執行多個會話，並啟動雲端會話。

下載並安裝：
- macOS（Intel 和 Apple Silicon）
- Windows（x64）
- Windows ARM64（僅遠端會話）

安裝後，啟動 Claude，登入，然後點選 Code 標籤開始編程。需要付費訂閱。

**Web**

在瀏覽器中執行 Claude Code，無需本地設定。啟動長時間執行的任務並在完成時回來檢查，處理你本地沒有的倉庫，或並行執行多個任務。

可在桌面瀏覽器和 Claude iOS 應用程式上使用。

在 claude.ai/code 開始編程。

**JetBrains**

適用於 IntelliJ IDEA、PyCharm、WebStorm 和其他 JetBrains IDE 的外掛程式，具有互動式差異檢視和選擇上下文分享功能。

從 JetBrains Marketplace 安裝 Claude Code 外掛程式並重新啟動 IDE。

### 你可以做什麼

以下是使用 Claude Code 的一些方式：

**自動化你一直拖延的工作**

Claude Code 處理那些佔據你一天時間的繁瑣任務：為未測試的程式碼編寫測試、修復專案中的 lint 錯誤、解決合併衝突、更新依賴項和編寫發布說明。

```bash
claude "write tests for the auth module, run them, and fix any failures"
```

**建構功能和修復錯誤**

用自然語言描述你想要什麼。Claude Code 規劃方法、跨多個檔案編寫程式碼並驗證它是否有效。對於錯誤，貼上錯誤訊息或描述症狀。Claude Code 追蹤程式碼庫中的問題、識別根本原因並實施修復。

**建立提交和 Pull Request**

Claude Code 直接與 git 工作。它暫存變更、編寫提交訊息、建立分支並開啟 pull request。

```bash
claude "commit my changes with a descriptive message"
```

在 CI 中，你可以使用 GitHub Actions 或 GitLab CI/CD 自動化程式碼審查和問題分類。

**透過 MCP 連接你的工具**

Model Context Protocol (MCP) 是連接 AI 工具與外部資料來源的開放標準。透過 MCP，Claude Code 可以讀取 Google Drive 中的設計文件、更新 Jira 中的工單、從 Slack 提取資料，或使用你自己的客製化工具。

**使用指令、技能和鉤子客製化**

CLAUDE.md 是你新增到專案根目錄的 markdown 檔案，Claude Code 在每個會話開始時讀取。使用它來設定編碼標準、架構決策、首選函式庫和審查檢查清單。

Claude 還會在工作時建立自動記憶，儲存學習內容如建置命令和除錯見解，無需你編寫任何內容。

建立自訂命令來打包你的團隊可以分享的可重複工作流程，如 `/review-pr` 或 `/deploy-staging`。

鉤子讓你在 Claude Code 動作之前或之後執行 shell 命令，如每次檔案編輯後自動格式化或提交前執行 lint。

**執行代理團隊並建構自訂代理**

生成多個 Claude Code 代理，同時處理任務的不同部分。一個主導代理協調工作、分配子任務並合併結果。

對於完全客製化的工作流程，Agent SDK 讓你建構自己的代理，由 Claude Code 的工具和功能驅動，完全控制編排、工具存取和權限。

**使用 CLI 進行管道、腳本和自動化**

Claude Code 是可組合的，遵循 Unix 哲學。將日誌導入其中、在 CI 中執行，或與其他工具串接：

```bash
# 監控日誌並獲得警報
tail -f app.log | claude -p "Slack me if you see any anomalies"

# 在 CI 中自動化翻譯
claude -p "translate new strings into French and raise a PR for review"

# 跨檔案批次操作
git diff main --name-only | claude -p "review these changed files for security issues"
```

**隨時隨地工作**

會話不綁定到單一介面。隨著情境變化在環境之間移動工作：

- 離開辦公桌後從手機或任何瀏覽器繼續使用 Remote Control 工作
- 在 Web 或 iOS 應用程式上啟動長時間執行的任務，然後用 `/teleport` 拉到終端機
- 用 `/desktop` 將終端機會話移交給桌面應用程式進行視覺化差異審查
- 從團隊聊天路由任務：在 Slack 中提及 @Claude 並附上錯誤報告，獲得 pull request 回應

### 隨處使用 Claude Code

每個介面都連接到相同的底層 Claude Code 引擎，因此你的 CLAUDE.md 檔案、設定和 MCP 伺服器在所有介面中都可以使用。

除了上述的 Terminal、VS Code、JetBrains、Desktop 和 Web 環境外，Claude Code 還整合了 CI/CD、聊天和瀏覽器工作流程：

| 我想要… | 最佳選項 |
|---------|----------|
| 從手機或其他裝置繼續本地會話 | Remote Control |
| 在本地啟動任務，在行動裝置上繼續 | Web 或 Claude iOS 應用程式 |
| 自動化 PR 審查和問題分類 | GitHub Actions 或 GitLab CI/CD |
| 從 Slack 路由錯誤報告到 pull request | Slack |
| 除錯即時 Web 應用程式 | Chrome |
| 為你自己的工作流程建構自訂代理 | Agent SDK |
