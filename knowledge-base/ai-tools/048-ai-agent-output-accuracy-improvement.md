# 如何有效提升 AI Agent 輸出準確率：從 40% 到 90%

> **來源**: [@xxx111god](https://x.com/xxx111god/status/2022352959133151433) | [原文連結](https://x.com/i/article/2022346145557512195)
>
> **日期**: Fri Feb 13 16:51:33 +0000 2026
>
> **標籤**: `Agent 規則` `Prompt 工程` `系統設計`

---

★ Insight ─────────────────────────────────────
這是一篇關於 AI Agent 規則設計的深度實戰經驗。作者發現：
1. **抽象規則命中率只有 40%**，但「具體流程 + 真實失敗經驗」可達 90%+
2. **Context Attention Budget**：規則文件超過 200 行，後半部分遵守率會大幅下降
3. **Markdown as Pseudo-Law**：把規則寫進輸出格式，用結構強制執行，而非依賴記憶
─────────────────────────────────────────────────

## 現實的底層邏輯是機率分布，AI Agent 也不例外

### 翻車現場

睡前讓 Agent 自己升級系統。

「update yourself」

「好的，正在升級...」

早上醒來，發現一晚上的定時任務全沒跑。

日誌裡一堆：

```
Error: Cannot find module './dist/gateway.js'
網關重啟中...
Error: Cannot find module './dist/gateway.js'
網關重啟中...
```

循環了一夜。升級失敗 → 崩潰 → 重啟 → 又崩潰。

我的 `AGENTS.md` 裡明明寫著：

```
## 升級規則
- 升級前檢查 git status
- 返回 skipped 要處理
- 不要只 pull 不編譯
```

它全部忽略了。一晚上白等。

---

之前我寫過一篇《4 層防禦體系》，核心觀點是：

**Markdown is Suggestion，Code is Law**

pre-commit hook 是法律——你 commit 不了就是 commit 不了。

`AGENTS.md` 是建議——Agent 可能聽，可能不聽。

今天這篇是那個觀點的延續：**當你沒法用程式碼的時候，怎麼讓 Markdown 盡量接近法律？**

---

## 命中率層級

之前的經驗告訴我，Markdown 的條例是不穩定的

但我發現一個例外：

**Markdown + 結構化失敗經驗 → 命中率可達 90%+**

不是所有 Markdown 都只有 40%。關鍵在於怎麼寫。

---

## 案例 1：升級失敗 → 自我修復

回到開頭那個翻車。

Agent 升級時返回了：

```markdown
{"status": "skipped", "reason": "dirty"}
```

它沒看這個返回值。直接跑 `git pull && restart`。

TypeScript 專案，只拉原始碼不編譯 = 崩潰。

**我的修復：把抽象規則改成具體流程**

```
## 自升級檢查清單
1. 升級返回 "skipped"？
   → 運行 git status --porcelain
   → 清理或 stash 髒檔案
   → 重試升級
2. 永遠不要只 git pull 就重啟
```

三天後，同樣的場景：

```
我：update yourself
返回值：{"status": "skipped", "reason": "dirty"}
```

這次 Agent 的反應不一樣了：

6 分鐘完成。我沒碰鍵盤。

```
$ git status --porcelain
?? skills/nano-banana-pro/*.png
$ mv *.png ~/drafts/
$ gateway.update.run
→ status: "ok"
```

**差別在哪？**

- **之前**：「升級要小心」→ 抽象指令 → Agent 會忘
- **之後**：if skipped → git status → clean → retry → 可執行流程 → Agent 能機械執行

---

## 案例 2：規則文件膨脹綜合症

我的 `AGENTS.md` 曾經有 426 行。

配置安全、密鑰管理、程式碼規範、進程管理、發帖規則、交易紀律...全寫在一個文件裡。

結果？Agent 開始選擇性遺忘。

**我做了個測試：**

- 前 50 行規則 → 遵守率 ~70%
- 50-200 行 → 遵守率 ~50%
- 200 行之後 → 遵守率 <30%

為什麼？

**Context 不是無限的**。128K 看起來很大，但塞太多，每條規則分到的「注意力」就被稀釋了。

這在學術上叫 **Attention Budget**——注意力是有預算的。

**我的修復：426 行 → 96 行**

怎麼做到的？把詳細規則移到 Skill 文件裡，`AGENTS.md` 只保留指標：

```
## 發帖規則
寫 X 回覆前，先讀 `x-draft` skill。
```

Agent 需要的時候才載入完整規則，不是一次性全塞進 context。

---

## 案例 3：檢查流程被靜默跳過

我建了一個 `x-content-checklist` skill，要求每次寫回覆前跑 24 條去 AI 味規則。

- **第一次測試**：成功。5 條 draft 都帶著 `Humanizer: ✅ 已檢查`。
- **兩小時後**：失敗。5 條 draft 全部跳過檢查，直接出內容。

為什麼？

**長對話會被壓縮**。OpenClaw 為了省 token，會把長對話總結成短摘要。

壓縮 = 總結 = 丟細節。

壓縮後的摘要裡只剩下 「skill created」，沒有 「must use before draft」。

規則存在，但沒到 Agent 眼前。

**我的修復：不依賴 context 記憶，依賴輸出格式強制**

```
## 輸出格式（強制）
每條 draft 必須包含這一行：
Humanizer: ✅ 已檢查
沒有這一行 → 系統不顯示發送按鈕
```

**Before（被跳過時）：**

```
Draft: 這個工具很好用，推薦大家試試
[✅ 發送] [❌ 取消]  ← 直接出按鈕，沒跑檢查
```

**After（強制格式後）：**

```
Draft: 笑死 這玩意兒我折騰倆月 現在離不開了
Humanizer: ✅ 已檢查
[✅ 發送] [❌ 取消]  ← 必須有 Humanizer 行才出按鈕
```

**規則寫在文件裡 → 可能被壓縮丟失。**

**規則寫在輸出格式裡 → 不輸出就沒法繼續。**

這就是把建議偽裝成 Code Law。

---

## 命中率公式

三個案例的共同點：

**命中率 = 具體程度 × 是否來自真實失敗**

- 「配置要小心」→ 具體程度低 + 無失敗經驗 = ~30% 命中率
- 「配置前備份」→ 具體程度中 + 無失敗經驗 = ~50% 命中率
- if skipped → git status → clean → retry → 具體程度高 + 真實失敗 = ~90% 命中率

**Agent 不需要通用智能。它需要的是你餵給它的結構化失敗經驗。**

---

## Checklist

下次寫規則之前，問自己：

```markdown
- [ ] **夠具體嗎？** 是 `if-then-else` 流程，還是抽象指令？
- [ ] **來自真實失敗嗎？** 還是你「覺得應該這樣」？
- [ ] **文件夠短嗎？** 超過 200 行就該拆了
- [ ] **有輸出格式強制嗎？** 規則不只寫在文件裡，還寫在輸出模板裡
- [ ] **會被壓縮丟掉嗎？** 核心規則要在每次會話都載入的文件裡
```

---

## 總結

回到那句話：**Markdown 是建議，程式碼是法律。**

但當你沒法寫程式碼的時候：

- 把建議寫成 if-then-else 流程 → 接近法律
- 讓建議來自真實翻車 → 接近法律
- 把建議寫進輸出格式 → 接近法律
- 把文件控制在 200 行以內 → 建議不被稀釋

**Agent 不需要變聰明。它需要的是你把建議偽裝成法律的技巧。**

---

## 相關閱讀

- [《4 層防禦體系》— 為什麼靠 Markdown 管 AI 不靠譜](https://x.com/xxx111god/status/2019095658599157849)
- [《Context Engineering》— 從 Prompt 到系統級上下文管理](https://x.com/xxx111god/status/2021975762383876099)
- [《Agent 記憶管理大法》— 從實戰出發重構 Agent 記憶架構](https://x.com/xxx111god/status/2021278572611060145)
