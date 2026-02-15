# Claude Code 使用小記 2：四個月高強度開發實戰

> **來源**: [@_cosine_x](https://x.com/_cosine_x/status/1997610174044098666) | [原文連結](https://blog.cosine.ren/post/my-claude-code-record-2)
>
> **日期**: Sun Dec 07 10:12:33 +0000 2025
>
> **標籤**: `Claude Code` `AI 輔助編程` `開發工作流`

---

# Claude Code 使用小記 2：四個月高強度開發實戰

> **來源**: [@_cosine_x (cosine)](https://blog.cosine.ren/post/my-claude-code-record-2)
> **日期**: 2025-12-07
> **標籤**: `claude-code` `ai-coding` `plan-mode` `skills` `happy-client`

---

## 核心觀點

作者在 4 個月高強度使用 Claude Code 後，總結出：

> 每月 $100 的 Claude Code Max 帶來的輔助價值，遠超這個價格本身。即使公司後續不再報銷，也會自費繼續訂閱。

## 使用數據

- **近 30 天消耗**: $743 Token
- **主要項目**: 從零到一構建 Swift 原生音視頻 APP（已接近上架階段）
- **團隊規模**: 數位前端和後端工程師協作
- **訂閱方案**: Claude Code Max ($100/月，公司報銷)

## 工具對比

| 工具 | 主要用途 | 體驗評價 |
|------|----------|----------|
| **Claude Code** | 主力開發工具 | Opus 4.5 發布後很少失望，速度與質量兼具 |
| **Codex** | 慢工出細活 | 體驗不錯但太慢，$20 特別容易限額 |
| **Cursor** | Tab 補全 | Agent 功能已很少使用 |

## Plan Mode 工作流

### 1. 學習項目結構

```bash
> 我需要對這個項目進行學習，學習其整體結構與核心實現，
  輸出一系列 md 文檔在 docs 文件夾下供我參考。
```

**流程**：
1. Plan Mode 會詢問細節問題
2. 確認後進行追問補充
3. 選擇自動接受或手動允許 edit（有 git 管理建議自動接受）
4. 生成學習文檔（質量足夠初學者了解，但仍需以代碼為準）

### 2. 新功能從 0 到 1

1. **規劃階段**: 使用 Plan Mode 生成「變更計劃（哪些文件、改動點、預期 diff）」，先不寫代碼
2. **Review 與補充**: 補充模型可能忽略的細節
3. **代碼生成**: 按計劃生成代碼，落到本地跑編譯與最小樣例
4. **自檢**: 要求模型列出潛在失敗場景、邊界條件和建議測試用例
5. **打磨與提交**: 小改動、對接打磨後 Commit

### 3. Bugfix

1. 喂給模型報錯日志/最小複現工程
2. 讓模型列出「定位假說清單、驗證步驟、最小改動方案」
3. 實現、自檢

### 4. 重構/遷移

1. Plan Mode 描述重構需求，生成文檔計劃
2. 讓模型先寫 codemod，只在小部分上試跑
3. 觀察 diff，定義切分點和隨時可回滾的邊界
4. 分批推進，進行回歸測試

## Skills 自定義技能

### 什麼是 Skills？

Skills 是 Claude 可動態加載的指令、腳本和資源集合，用於提升特定任務表現，幫助 Claude 重複執行標準化任務。

### 安裝與使用

```bash
# 註冊 GitHub 存儲庫為插件市場
/plugin marketplace add anthropics/skills

# 安裝 document-skills
/plugin install document-skills@anthropic-agent-skills
```

使用時只需提及技能名稱，例如：
```
使用 PDF 技能從 path/to/some-file.pdf 中提取表單字段
```

### 創建自定義 Skill

1. 包含 `SKILL.md` 文件，含 YAML 格式的前置信息與任務指令
2. 前置信息需包含：`name`（唯一標識符）和 `description`（功能與使用說明）
3. 可使用 `plugin-dev` 技能輔助創建：

```bash
/plugin marketplace add anthropics/claude-code
/plugin install plugin-dev@claude-code-plugins
```

觸發詞："create a skill", "add a skill to plugin", "write a new skill"

### 推薦的官方 Skills

| Skill | 用途 |
|-------|------|
| `algorithmic-art` | 利用 p5.js 製作算法藝術 |
| `brand-guidelines` | 應用 Anthropic 官方品牌顏色和字體 |
| `canvas-design` | 創作精美的 .png 和 .pdf 格式視覺作品 |
| `doc-coauthoring` | 引導結構化的文檔協作工作流程 |
| `frontend-design` | 前端設計技能（作者常用） |

### 前端設計技能安裝

```bash
/plugin marketplace add anthropics/claude-code
/plugin install frontend-design@claude-code-plugins
```

更多官方 Skills：[claude-code/plugins](https://github.com/anthropics/claude-code/tree/main/plugins)

## 模型選型策略

| 場景 | 選型原則 | 推薦模型 |
|------|----------|----------|
| 重要的架構設計/大重構 | 質量優先 | 強模型 |
| 批量生成測試/樣例 | 成本優先 | 便宜模型 |
| 讀 log / 寫小腳本/摘要 | 速度優先 | 更快模型 |
| Spec 驅動開發 | 小模型生成 PRD + 大模型實現 | Plan Mode + 強模型 |

## Happy 移動客戶端

### 什麼是 Happy？

免費開源的 Claude Code 移動客戶端，可以手機或平板隨時隨地訪問家裡或服務器上的 Claude Code。

- **官網**: [happy.engineering](https://happy.engineering/docs/use-cases/hemingway-technique/)
- **特色**: 端到端加密、無縫工作流

### 海明威技巧 (Hemingway Technique)

> 歐內斯特·海明威在寫作時使用了一個聰明的技巧。他會說到一半就停下來，或者在他知道接下來要說什麼的時候停下來。這樣第二天再開始寫就容易多了。

**實踐應用**：
1. 晚上躺在床上運行自定義的睡前任務
2. 設置 `~/.claude/agents/bedtime.md` 文件，查找簡單的任務
3. 描述功能或問題，花 5 分鐘和 Claude 一起規劃
4. 方案批準後，Claude 開始實施，人去睡覺
5. 早上醒來收到通知："4 個文件待審核，新增 237 行代碼"

### 自部署

注重隱私可自部署 Happy Server 遠程操控 Claude Code 及 Codex，[官方教程](https://happy.engineering/)。

### 版本更新（2025.12.11）

Happy CLI 0.11.2 自帶版本沒有 Opus 4.5，可手動更新：

```bash
cd $(npm root -g)/happy-coder && npm install @anthropic-ai/claude-code@latest --save
```

## FAQ

### Q：我該如何知道哪個模型編程性能最好？

A：[WebDev Leaderboard | LMArena](https://lmarena.ai/) 可作為參考，但更多還是要靠自己對性能、成本的考慮。

### Q：什麼時候不要用 AI？

A：技術債務極重、邏輯到處亂飛的大型老項目，不能直接"給我實現 XXX"。可以用它先梳理一遍老項目的坑，並自己加以補充，再進行實現。

## 推薦閱讀

| 文章 | 核心主題 |
|------|----------|
| [從「寫代碼」到「驗代碼」](https://mp.weixin.qq.com/s/xxx) | 哪些任務交給 AI 最划算、如何讓項目更 AI 友好、驗證流程設計 |
| [Migrating 6000 React tests using AI Agents and ASTs](https://example.com) | 使用 AI 進行重構遷移的教科書式文章 |
| [我使用 Claude Code 開發 Rolldown 的體驗](https://example.com) | 在複雜項目中高強度使用 Claude Code 的經驗分享 |
| [周報 #102 - 我是如何使用 AI 的](https://example.com) | 在開發、文檔和日程管理中高頻使用 AI 工具 |
| [談談 AI 編程工具的進化與 Vibe Coding](https://example.com) | "氛圍編程" vs Context Coding 的區分與實踐 |
| [How to Fix Any Bug](https://example.com) | 在 vibe coding 中如何調試問題 |
| [How to write a great agents.md](https://example.com) | GitHub 分析 2500+ 倉庫歸納的 agents.md 寫法 |
| [OpenSpec 使用心得](https://example.com) | OpenSpec 驅動開發實踐 |
| [Writing a good CLAUDE.md](https://example.com) | 如何寫出清晰高效的 CLAUDE.md |

## 作者思考

> 從這個階段開始，水平一般的程序員的數量會開始減少直到消亡，這個過程與其說是 AI 搶走了工作飯碗，不如說是被優秀的程序員搶走了工作飯碗，並且這兩者的收入在這個階段的差距也會不斷加大。

> 在 AI 的加持下，一個編程水平一般的程序員，如果有不錯的商業嗅覺，加上一定的營銷能力，創造的商業價值遠比在社會分工中當個螺丝钉要大的多。

> 過去可能需要很多人相互協作才能完成的工作，利用 AI 的槓桿可以大大的縮減工作時間和人員規模，未來的獨立開發和小規模的團隊協作一定會變得更加主流。
