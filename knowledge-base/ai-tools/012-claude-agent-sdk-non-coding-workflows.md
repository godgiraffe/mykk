# 使用 Claude Agent SDK 打造非程式碼工作流程

> **來源**: [@donvito](https://x.com/donvito/status/2009252378017689947) | [原文連結](https://x.com/i/article/2009248193532628992)
>
> **日期**: 
>
> **標籤**: `Claude Agent SDK` `多代理系統` `工作流程自動化`

---

## 核心概念

作者探索使用 Claude Agent SDK（驅動 Claude Code 的底層框架）來建立**非程式碼工作流程**，作為 CrewAI 和 LangChain 等代理框架的輕量級替代方案。

透過結合 **MCP（Model Context Protocol）** 和 **子代理（Sub-Agents）**，可以快速組合出複雜的自動化流程，從資料擷取、翻譯、網頁生成到社群媒體內容創作。

---

## 基礎範例：新聞研究 + 翻譯

### 工作流程

1. 使用 **Firecrawl MCP** 擷取最新 AI 新聞
2. 主代理自動整理並寫入 Markdown 檔案
3. 委派給 **translator-agent** 翻譯成韓文
4. 輸出兩份檔案：`ai_news_en.md` 和 `ai_news_ko.md`

### 關鍵設計

```python
# 1. 定義翻譯子代理
translator_agent = AgentDefinition(
    description="Translate content between languages",
    prompt="You are an expert language translator.",
    tools=["Read", "Edit", "Bash", "Grep"],
    model="sonnet"
)

# 2. 設定主代理選項
options = ClaudeAgentOptions(
    model="glm-4.6",
    system_prompt="You are an expert news researcher.",
    mcp_servers={"firecrawl_mcp": firecrawl_mcp},
    agents={"translator-agent": translator_agent}
)

# 3. 執行工作流程
async for message in query(
    prompt="Research latest AI news → Write to markdown → Translate to Korean",
    options=options
):
    print(message)
```

---

## 進階範例：完整新聞處理流程

### 多個子代理分工

| 代理名稱 | 職責 | 輸出 |
|---------|------|------|
| **主代理** | 研究主題、協調工作流程 | 原始新聞 Markdown |
| **translator-agent** | 多語言翻譯 | 韓文版 Markdown |
| **highlights-extractor-agent** | 提取重點摘要 | 精華版 Markdown |
| **website-developer-agent** | 生成網頁展示 | HTML 檔案 |
| **social-media-creator-agent** | 創作社群貼文 | LinkedIn/Twitter 貼文 |

### 單一指令完成所有任務

```python
prompt = """
1. Research latest flood control projects and DPWH news in Philippines
2. Write to markdown with source URLs
3. Translate to Korean (translator-agent)
4. Extract highlights (highlights-extractor-agent)
5. Create HTML webpage (website-developer-agent)
6. Generate social media posts (social-media-creator-agent)
"""
```

一次執行產生：
- 原文新聞 `.md`
- 韓文翻譯 `.md`
- 重點摘要 `.md`
- 網頁展示 `.html`
- 社群貼文 `.md`

---

## 兩大設計模式

### 1. MCP 作為資料層

- **角色**：類似 API 插件，讓代理能存取外部資料源
- **範例**：Firecrawl MCP 擷取網頁內容
- **優勢**：代理能執行真實世界的資料收集，不限於簡單提示

### 2. 子代理實現專業化

- **角色**：將特定任務委派給專門的小代理
- **範例**：翻譯、網頁開發、社群媒體創作
- **優勢**：避免硬編碼邏輯，保持工作流程彈性

---

★ Insight ─────────────────────────────────────
**為何選擇 Claude Agent SDK 而非 CrewAI/LangChain？**

1. **原生整合**：Tools、MCPs、Skills、Sub-agents 都是內建元件，無需從零組裝
2. **輕量快速**：適合快速驗證想法，避免複雜框架的學習成本
3. **模型彈性**：範例使用 GLM 4.6，但完美支援 Claude Haiku/Sonnet
─────────────────────────────────────────────────

---

## SDK 核心能力

| 元件 | 功能 |
|------|------|
| **Tools** | 內建工具（Read、Edit、Bash、Grep 等） |
| **MCPs** | 外部能力伺服器（如 Firecrawl） |
| **Skills** | 可重用的提示模板 |
| **Sub-agents** | 可委派的專業代理 |

這些元件與其他代理框架的功能等價，但整合在 Claude 生態系統內，開發體驗更流暢。

---

## 適用場景

- **文件自動化**：研究報告生成、多語言翻譯
- **內容創作**：社群媒體貼文、網頁開發
- **資料處理**：網頁爬蟲 + 資訊萃取 + 格式轉換
- **快速原型**：驗證自動化想法，無需建立複雜架構

---

## 總結比較

| 特性 | Claude Agent SDK | CrewAI/LangChain |
|------|-----------------|------------------|
| **學習曲線** | 低（基於 Claude 生態） | 中高（需理解框架設計） |
| **適用範圍** | 輕量工作流程 | 複雜多代理系統 |
| **整合難度** | 原生支援 MCP/Tools | 需自行串接 |
| **開發速度** | 快速驗證 | 結構化開發 |

**核心建議**：如果需要快速組合自動化流程且不涉及極複雜的代理協作，Claude Agent SDK 是更簡潔的選擇。
