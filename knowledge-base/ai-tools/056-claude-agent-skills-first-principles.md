# Claude Agent Skills：第一性原理深度解析

> **來源**: [@Stephen4171127](https://x.com/Stephen4171127/status/1992968594502668497) | [原文連結](https://skills.deeptoai.com/zh/docs/ai-ml/claude-agent-skills-first-principles-deep-dive)
>
> **日期**: Mon Nov 24 14:48:35 +0000 2025
>
> **標籤**: `Claude Skills` `提示詞工程` `Agent 架構`

---

> **來源**: [熊布朗 (@Stephen4171127)](https://twitter.com/Stephen4171127)
> **日期**: 2025-02-17
> **標籤**: `Claude Code` `Agent Skills` `AI 工具` `提示詞工程`

---

## 背景

作者使用 Claude Code 的 Skills 功能，僅用一句話「發布 xxxx(URL)」就完成了文章的自動發布流程，包含三種語言翻譯、圖片處理、自動製作封面等完整工作。以下是該系統的深度解析。

## Claude Agent Skills 核心原理

### 基本定義

Claude Skills 是一種**基於提示詞的元工具架構**，通過專門的指令注入來擴展 LLM 能力。與傳統函數調用或代碼執行不同，Skills 通過**提示詞擴展**和**上下文修改**來改變 Claude 處理後續請求的方式，而無需編寫可執行代碼。

### Skills 不是什麼

- **不是可執行代碼**：不會運行 Python 或 JavaScript
- **不是硬編碼系統提示詞**：存在於 API 請求結構的獨立部分
- **不是函數調用**：背後沒有 HTTP 服務器或函數調用

### Skills 是什麼

**Skills 是專門的提示詞模板**，將特定領域的指令注入到對話上下文中。當一個 Skill 被調用時：

1. 修改**對話上下文**（注入指令提示詞）
2. 修改**執行上下文**（更改工具權限，可能切換模型）
3. 擴展為詳細提示詞，為 Claude 解決特定問題做準備

## Skill 選擇機制

### 工作原理

當用戶發送請求時，Claude 收到三樣東西：

1. 用戶消息
2. 可用工具（Read、Write、Bash 等）
3. **Skill 工具**（包含所有可用 Skills 的格式化列表）

**關鍵特點**：

- **純 LLM 推理**：代碼層面沒有算法路由或意圖分類
- **無嵌入或分類器**：不使用嵌入、分類器或模式匹配
- **無關鍵字匹配**：沒有正則表達式或基於 ML 的意圖檢測
- **Transformer 決策**：決策完全發生在 Claude 的推理過程中

Claude 閱讀 Skills 列表，使用其原生語言理解能力將用戶意圖與 Skill 描述進行匹配。

### 術語區分

| 術語 | 定義 |
|------|------|
| **Skill 工具**（大寫 S） | 管理所有 Skills 的元工具，與 Read、Write、Bash 並列 |
| **skills**（小寫 s） | 單個 Skills，如 pdf、skill-creator、internal-comms |

## Skills vs 傳統工具對比

| 方面 | 傳統工具 | Skills |
|------|----------|---------|
| **執行模型** | 同步、直接 | 提示詞擴展 |
| **目的** | 執行特定操作 | 指導複雜工作流 |
| **返回值** | 即時結果 | 對話上下文 + 執行上下文變更 |
| **示例** | Read、Write、Bash | internal-comms、skill-creator |
| **並發性** | 通常安全 | 非並發安全 |
| **類型** | 各種 | 始終為 "prompt" |
| **消息角色** | assistant → tool_use<br>user → tool_result | assistant → tool_use Skill<br>user → tool_result<br>user → skill prompt（注入！） |
| **複雜性** | 簡單（3-4 條消息） | 複雜（5-10+ 條消息） |
| **Token 開銷** | 最小（約 100 tokens） | 顯著（每輪約 1,500+ tokens） |

## 構建 Agent Skills

### 核心概念

**Skill = 提示詞模板 + 對話上下文注入 + 執行上下文修改 + 可選的數據文件和 Python 腳本**

### 文件結構

```
my-skill/
├── SKILL.md          # 核心提示詞和指令
├── scripts/          # 可執行的 Python/Bash 腳本
├── references/       # 加載到上下文中的文檔
└── assets/           # 模板和二進制文件
```

### SKILL.md 結構

```markdown
┌─────────────────────────────────────┐
│ 1. YAML Frontmatter (Metadata)      │ ← 配置
│ ---                                 │
│ name: skill-name                    │
│ description: Brief overview         │
│ allowed-tools: "Bash, Read"         │
│ version: 1.0.0                      │
│ ---                                 │
├─────────────────────────────────────┤
│ 2. Markdown Content (Instructions)  │ ← Claude 的提示詞
│                                     │
│ Purpose explanation                 │
│ Detailed instructions               │
│ Examples and guidelines             │
│ Step-by-step procedures             │
└─────────────────────────────────────┘
```

## SKILL.md Frontmatter 字段詳解

### 必需字段

#### name（必需）
Skill 的名稱，在 Skill Tool 中用作 `command`。

#### description（必需）
Skill 功能的簡要摘要，**這是 Claude 用來確定何時調用 Skill 的主要信號**。

範例：
```yaml
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
```

清晰、面向行動的語言有助於 Claude 將用戶意圖與 Skill 能力匹配。

### 可選字段

#### allowed-tools（可選）
定義 Skill 可以在沒有用戶批准的情況下使用哪些工具。格式為逗號分隔的字符串。

**範例**：
```yaml
# ✅ skill-creator 允許多個工具
allowed-tools: "Read,Write,Bash,Glob,Grep,Edit"

# ✅ 僅特定 git 命令
allowed-tools: "Bash(git status:*),Bash(git diff:*),Bash(git log:*),Read,Grep"

# ✅ 僅文件操作
allowed-tools: "Read,Write,Edit,Glob,Grep"

# ❌ 不必要的表面積（安全風險）
allowed-tools: "Bash,Read,Write,Edit,Glob,Grep,WebSearch,Task,Agent"
```

**重點**：只包含 Skill 實際需要的工具，避免造成安全風險。

#### model（可選）
定義 Skill 使用的模型。默認繼承用戶會話中的當前模型。

```yaml
model: "claude-opus-4-20250514"  # 使用特定模型
model: "inherit"                 # 使用會話的當前模型（默認）
```

#### when_to_use（未記錄字段）
⚠️ **重要警告**：此字段在代碼庫中廣泛出現，但**未在任何官方 Anthropic 文檔中記錄**。

當前實現方式：
```javascript
function formatSkill(skill) {
  let description = skill.whenToUse 
    ? `${skill.description} - ${skill.whenToUse}` 
    : skill.description;
  return `"${skill.name}": ${description}`;
}
```

**建議**：依賴詳細的 `description` 字段，避免在生產 Skills 中使用 `when_to_use`。

#### version、disable-model-invocation、mode（可選）

| 字段 | 類型 | 用途 |
|------|------|------|
| **version** | 字符串 | 版本控制元數據（如 "1.0.0"） |
| **disable-model-invocation** | 布爾值 | 阻止 Claude 自動調用，僅允許用戶通過 `/skill-name` 手動調用 |
| **mode** | 布爾值 | 標記為「模式命令」，在列表頂部特殊顯示（適用於 debug-mode、expert-mode 等） |

## SKILL.md 提示詞內容結構

### 推薦結構

```markdown
---
# Frontmatter 在此處
---

# [簡短目的陳述 - 1-2 句]

## 概述
[此 Skill 的功能、何時使用、提供什麼]

## 先決條件
[所需工具、文件或上下文]

## 指令

### 步驟 1：[第一個操作]
[命令式指令]
[如需要，提供示例]

### 步驟 2：[下一個操作]
[命令式指令]

### 步驟 3：[最後操作]
[命令式指令]

## 輸出格式
[如何構建結果]

## 錯誤處理
[失敗時該做什麼]

## 示例
[具體使用示例]

## 資源
[如果捆綁，引用 scripts/、references/、assets/]
```

### 最佳實踐

| 原則 | 說明 |
|------|------|
| **長度限制** | 保持在 5,000 字以下（約 800 行），避免壓倒性上下文 |
| **語言風格** | 使用命令式語言（"分析代碼以..."）而非第二人稱（"您應該分析..."） |
| **外部引用** | 引用外部文件獲取詳細內容，而非嵌入所有內容 |
| **路徑使用** | 使用 `{baseDir}` 作為路徑，永遠不要硬編碼絕對路徑 |

**路徑範例**：
```markdown
❌ Read /home/user/project/config.json
✅ Read {baseDir}/config.json
```

## 捆綁資源目錄詳解

### 為什麼捆綁資源？

保持 SKILL.md 簡潔（5,000 字以下）可防止壓倒 Claude 的上下文窗口。捆綁資源實現**漸進式披露**：

1. 披露 Frontmatter：最小化（名稱、描述、許可證）
2. 如果選擇 Skill，加載 SKILL.md：全面但專注
3. 在執行時加載輔助資源、參考和腳本

### scripts/ 目錄

**用途**：包含 Claude 通過 Bash 工具運行的可執行代碼。

**適用場景**：
- 複雜的多步驟操作
- 數據轉換
- API 交互
- 任何需要精確邏輯的任務

**範例**（skill-creator）：
```markdown
從頭開始創建新 Skill 時，始終運行 `init_skill.py` 腳本。

用法：
```scripts/init_skill.py <skill-name> --path <output-directory>```

腳本功能：
- 在指定路徑創建 Skill 目錄
- 生成帶有適當 frontmatter 和 TODO 占位符的 SKILL.md 模板
- 創建示例資源目錄：scripts/、references/ 和 assets/
```

執行時 Claude 會運行：`python {baseDir}/scripts/init_skill.py`

### references/ 目錄

**用途**：存儲 Claude 在引用時讀入其上下文的文檔。

**適用場景**：
- 詳細文檔
- 大型模式庫
- 檢查清單
- API schemas
- 任何對於 SKILL.md 來說太冗長但對任務必要的文本內容

**範例**（mcp-creator）：
```markdown
#### 1.4 學習框架文檔

**加載並閱讀以下參考文件：**
- **MCP 最佳實踐：** [📋 查看最佳實踐](./reference/mcp_best_practices.md)

**對於 Python 實現，還要加載：**
- **Python SDK 文檔：** 使用 WebFetch 加載 `https://raw.githubusercontent.com/...`
- [🐍 Python 實現指南](./reference/python_mcp_server.md)
```

執行時 Claude 會運行：`Read({baseDir}/references/mcp_best_practices.md)`

### assets/ 目錄

**用途**：包含 Claude 按路徑引用但**不加載到上下文中**的模板和二進制文件。

**適用場景**：
- HTML/CSS 模板
- 圖像
- 二進制文件
- 配置模板
- Claude 通過路徑操作而不是讀入上下文的任何文件

**範例**：
```markdown
使用 {baseDir}/assets/report-template.html 的模板作為報告結構。
引用 {baseDir}/assets/diagram.png 的架構圖。
```

### references/ vs assets/ 關鍵區別

| 特性 | references/ | assets/ |
|------|-------------|---------|
| **處理方式** | 通過 Read 工具加載到 Claude 上下文中 | 僅按路徑引用，不加載到上下文 |
| **內容類型** | 文本內容（Markdown、JSON、文檔） | 模板、二進制文件、圖像、配置 |
| **Token 消耗** | 會消耗上下文 tokens | 不消耗 tokens |
| **範例** | 10KB Markdown 文件會消耗 tokens | 10KB HTML 模板不會消耗 tokens |

## 常見 Skill 模式

### 模式 1：腳本自動化

**用例**：需要多個命令或確定性邏輯的複雜操作

```markdown
在目標目錄上運行 scripts/analyzer.py：
`python {baseDir}/scripts/analyzer.py --path "$USER_PATH" --output report.json`
解析生成的 `report.json` 並呈現發現。

所需工具：
allowed-tools: "Bash(python {baseDir}/scripts/*:*), Read, Write"
```

### 模式 2：讀取 - 處理 - 寫入

**用例**：文件轉換和數據處理

```markdown
## 處理工作流
1. 使用 Read 工具讀取輸入文件
2. 根據格式解析內容
3. 按照規範轉換數據
4. 使用 Write 工具寫入輸出
5. 報告完成並提供摘要

所需工具：
allowed-tools: "Read, Write"
```

### 模式 3：搜索 - 分析 - 報告

**用例**：代碼庫分析和模式檢測

```markdown
## 分析過程
1. 使用 Grep 查找相關代碼模式
2. 讀取每個匹配的文件
3. 分析漏洞
4. 生成結構化報告

所需工具：
allowed-tools: "Grep, Read"
```

### 模式 4：命令鏈執行

**用例**：具有依賴關係的多步驟操作

```markdown
執行分析管道：
npm install && npm run lint && npm test
報告每個階段的結果。

所需工具：
allowed-tools: "Bash(npm install:*), Bash(npm run:*), Read"
```

## 高級模式

### 向導式多步驟工作流

**用例**：需要在每個步驟進行用戶輸入的複雜流程

```markdown
## 工作流

### 步驟 1：初始設置
1. 詢問用戶項目類型
2. 驗證先決條件是否存在
3. 創建基本配置
在繼續之前等待用戶確認。

### 步驟 2：配置
1. 呈現配置選項
2. 要求用戶選擇設置
3. 生成配置文件
在繼續之前等待用戶確認。

### 步驟 3：初始化
1. 運行初始化腳本
2. 驗證設置成功
3. 報告結果
```

### 基於模板的生成

**用例**：從 assets/ 中存儲的模板創建結構化輸出

```markdown
## 生成過程
1. 從 {baseDir}/assets/template.html 讀取模板
2. 解析用戶需求
3. 填充模板占位符：
   - <TITLE> → 用戶提供的名稱
   - <SUMMARY> → 生成的摘要
   - <DATE> → 當前日期
4. 將填充的模板寫入輸出文件
5. 報告完成
```

### 迭代細化

**用例**：需要多次傳遞並逐漸加深深度的流程

```markdown
## 迭代分析

### 第 1 遍：廣泛掃描
1. 搜索整個代碼庫以查找模式
2. 識別高級問題
3. 對發現進行分類

### 第 2 遍：深度分析
對於每個高級問題：
1. 讀取完整的文件上下文
2. 分析根本原因
3. 確定嚴重性

### 第 3 遍：建議
對於每個發現：
1. 研究最佳實踐
2. 生成特定修復
3. 估計工作量

呈現包含所有發現和建議的最終報告。
```

### 上下文聚合

**用例**：從多個來源組合信息以建立全面理解

```markdown
## 上下文收集
1. 讀取項目 README.md 以獲取概述
2. 分析 package.json 以獲取依賴關係
3. Grep 代碼庫以查找特定模式
4. 檢查 git 歷史記錄以獲取最近的更改
5. 將發現綜合成連貫的摘要
```

## Agent Skills 內部架構

### Skill 工具元工具架構

Skill 工具是管理所有 Skills 的**元工具**，與傳統工具有本質區別：

```javascript
Pd = {
  name: "Skill",  // 工具名稱常量：$N = "Skill"
  inputSchema: {
    command: string  // 例如，"pdf"、"skill-creator"
  },
  outputSchema: {
    success: boolean,
    commandName: string
  },
  
  // 🔑 關鍵字段：這生成 Skills 列表
  prompt: async () => fN2(),  // 動態提示詞生成器
  
  // 驗證和執行
  validateInput: async (input, context) => { /* 5 個錯誤代碼 */ },
  checkPermissions: async (input, context) => { /* allow/deny/ask */ },
  call: async *(input, context) => { /* yields messages + context modifier */ }
}
```

### 動態提示詞生成器

**關鍵機制**：`prompt` 字段使用**動態提示詞生成器**，在運行時聚合所有可用 Skills 的名稱和描述。

**實現漸進式披露**：
1. 僅將最小元數據（Skill 名稱和描述）加載到 Claude 初始上下文
2. 提供足夠信息讓模型決定哪個 Skill 匹配用戶意圖
3. 完整 Skill 提示詞僅在 Claude 做出選擇後才加載
4. 防止上下文膨脹，同時保持可發現性

```javascript
async function fN2() {
  let A = await atA(),
      { modeCommands: B, limitedRegularCommands: Q } = vN2(A),
      G = [...B, ...Q].map((W) => W.userFacingName()).join(", ");
  
  l(`Skills and commands included in Skill tool: ${G}`);
  
  let Z = A.length - B.length,
      Y = nS6(B),
      J = aS6(Q, Z);
  
  return `Execute a skill within the main conversation...`;
}
```

## Skills 發現與加載

Claude Code 從多個來源掃描 Skills：

| 來源 | 路徑 |
|------|------|
| **用戶設置** | `~/.config/claude/skills/` |
| **項目設置** | `.claude/skills/` |
| **插件提供** | 插件目錄 |
| **內置 Skills** | 系統內置 |

## 漸進式披露原則

構建 Skills 最重要的概念是**漸進式披露**——只顯示足夠的信息來幫助 agents 決定下一步做什麼，然後在需要時揭示更多細節。

**披露流程**：
1. **Frontmatter**：最小化（名稱、描述、許可證）
2. **如果選擇 Skill**，加載 SKILL.md：全面但專注
3. **執行時**加載輔助資源、參考和腳本

## 總結

Claude Agent Skills 系統通過以下機制實現強大的可擴展性：

1. **元工具架構**：Skill 工具作為所有 Skills 的容器和調度程序
2. **提示詞注入**：Skills 通過修改對話上下文和執行上下文來改變 Claude 行為
3. **漸進式披露**：分階段加載信息，避免上下文膨脹
4. **純 LLM 推理**：無算法路由，完全依賴 Claude 的語言理解能力
5. **資源捆綁**：通過 scripts/、references/、assets/ 實現功能擴展

這種設計使 Skills 成為專門的提示詞模板系統，而非傳統的代碼執行工具，從而實現了更靈活、更強大的 AI Agent 能力擴展。
