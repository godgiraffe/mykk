# 實用的 Context 工程指南

> **來源**: [@jarrodwatts](https://x.com/jarrodwatts/status/2008495347115630701) | [原文連結](https://x.com/i/article/2001261223057485824)
>
> **日期**: 
>
> **標籤**: `Claude Code` `Context 優化` `Prompt 工程`

---

# 實用的 Context 工程指南

> **來源**: [@jarrodwatts (Jarrod Watts)](https://twitter.com/jarrodwatts)  
> **日期**: 2026-02-14  
> **標籤**: `claude-code` `context-engineering` `llm` `prompt-engineering` `workflow`

---

## 核心概念總覽

| 概念 | 說明 | 重要性 |
|------|------|--------|
| Context | 提供給 LLM 的所有資訊（提示詞、系統提示、對話歷史、工具呼叫等） | ⭐⭐⭐⭐⭐ |
| Context Window | Claude Code 的上下文視窗限制為 200k tokens | 實際可用僅約 120k |
| 80/20 法則 | 基礎設定已完成 80% 效果，進階技巧只是錦上添花 | 避免過度工程化 |
| 價值密度優先 | 目標是「最小化高訊號 tokens 集合」 | 核心原則 |

---

## AI Slop 不再是模型的錯

在黑盒系統如 Claude Code 中，**Context 是我們唯一能控制的輸入**。如何優化它成為提升 LLM 輸出品質的關鍵。

---

## Context 是什麼？

Context 指的是你向 LLM 發送訊息時提供的**所有資訊**，包括：

- 提示詞本身
- 系統提示 (System Prompts)
- 元資料 (Metadata)
- 先前的對話歷史
- LLM 的思考過程
- 工具呼叫與回應

### Context Window 的限制

- Claude Code 的 context window 限制為 **200k tokens**
- 實際可用空間更少：
  - 22.5% 保留空間
  - 10.2% 系統提示
  - MCP servers、Subagents、規則等佔用
  - **實際可用約 120k tokens**

更重要的是：**即使未達上限，context 越多，LLM 效能越下降**。

---

## 基礎設定：80% 的效果來自這裡

根據 80/20 法則，以下基礎操作已完成 80% 優化：

### 三步基礎設定

1. **升級方案**: `/upgrade` → Max Plan
2. **選擇模型**: `/model` → Opus 4.5  
3. **初始化專案**: `/init` → 建立專案說明檔

### 標準工作流程

```
1. 啟動 Plan Mode (Shift + Tab)
2. 要求 Claude 透過提問釐清模糊之處
3. 執行並精煉計畫
```

> **重點**: 建立 subagents、自訂指令、hooks、多代理協作雖然有趣，但**遠不如掌握基礎重要**。

---

## 實戰工作流程

### 對話範圍管理

每個新對話應有明確目標：

- ✅ "我想修復這個 bug"
- ✅ "我想建立這個 app 功能"

### 新專案的計畫策略

新專案可以有更廣的範圍，但需要：

1. **更長的計畫時間**
2. **更多的精煉迭代**
3. **持續讓 Claude 提問直到問題變得瑣碎**
4. **多次審查計畫**（架構、最佳實踐、安全風險、測試策略等）

**目標**: 在有模糊之處提供細節。

---

## 何時重置對話（以及如何重置）

### 繼續對話的時機

- ✅ 進展順利
- ✅ 後續任務與當前 context 相關
- ✅ 接近 context 上限時執行 `/compact` 或自動壓縮

### 重置對話的時機

當陷入「這很糟，請修正」→ 產出垃圾 → 「更糟了，你在想什麼？」→ 垃圾的循環時：

| 指令 | 用途 |
|------|------|
| `/rewind` | 回到對話中進展順利的時間點 |
| `/new` | 開新對話，精煉原始提示，加入「避免做什麼」的警告 |

> ⚠️ **不要嘗試在同一對話中恢復**，這不值得。

---

## 避免複雜度陷阱

### 核心原則

> "找到最小的高訊號 tokens 集合" — Anthropic

### 常見陷阱

- ❌ 過度使用 MCP servers 填充低訊號資料
- ❌ 盲目跟隨 𝕏 上的花俏設定
- ❌ 將 Bookmarks 的東西當作待辦事項

**記住**: 價值密度 > 複雜度

---

## MCP Servers：適時 Context 策略

### 推薦的 MCP Servers

| Server | 用途 |
|--------|------|
| **exa.ai** | AI 代理的網路搜尋 |
| **context7** | 即時文檔查詢 |
| **grep.app** | GitHub 程式碼搜尋 |

### Just-In-Time Context 策略

MCP servers 採用 Anthropic 提出的「**即時 context 策略**」：

- 代理在需要時自行使用工具查找資訊
- 類似自己查文檔和程式碼片段
- 有效但仍會消耗 context

---

## Subagents：節省 Context 的秘訣

### Subagents 的特性

- 擁有**獨立的 context window**
- 可使用**不同模型**（如 Sonnet 代替 Opus）

### 最佳實踐：Librarian Subagent

```
使用流程：
1. 主代理: "use librarian to research how to do X with Y library, and then implement Z"
2. Subagent 觸發（使用 Sonnet 模型）
3. 掃描開源專案和文檔
4. 返回濃縮摘要給主代理
```

**優勢**:
- 防止主 context 污染
- 使用更便宜的模型處理簡單任務
- Token 密集型操作不影響主代理

---

## Skills：引入專業化 Context

### Skills vs Subagents

| 特性 | Subagents | Skills |
|------|-----------|--------|
| Context | 獨立 context window | 帶入當前 context |
| 用途 | 委派任務給專門代理 | 引入專門提示詞 |
| 範例 | Librarian 研究員 | Frontend Designer |

### Frontend Designer Skill 範例

- 引入一段長提示詞
- 告訴 Claude 前端設計的 Dos & Don'ts
- 在需要時自動觸發

> **本質**: Skills 就是在適當時機將文字區塊引入 context。

---

## 關鍵要點

### 優化清單

- ✅ 優化**價值密度高的 context**
- ✅ 每次加入的資訊都應協助 LLM 回答下個請求
- ✅ 如果資訊無助益 → **不要繼續同一對話**
- ✅ 將 LLM 視為同事：提供簡潔優質資訊 + 給予工具自行查找

### 破除迷思

Twitter 上看到的花俏指令（subagents、MCPs、skills）：

- ❌ 不代表你落後
- ✅ 實際沒那麼複雜
- ✅ 專注基礎 > 追逐新功能

---

★ Insight ─────────────────────────────────────

**Context 工程的三層境界**：

1. **基礎層**（80% 效果）：Opus 4.5 + Plan Mode + `/init`
2. **效率層**：Subagents 分擔 token 密集任務（研究、文檔查詢）
3. **專業層**：Skills 引入領域知識、MCP Servers 即時查詢

**核心哲學**：像對待同事一樣對待 LLM — 給予簡潔、高訊號的資訊，並提供工具讓它自己找答案。複雜度不等於效果，**價值密度才是關鍵**。

─────────────────────────────────────────────────
