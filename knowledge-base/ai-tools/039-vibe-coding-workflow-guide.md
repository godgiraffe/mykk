# Vibe Coding 工作流指南 - Stanford 教學逐幀學習

> **來源**: [@SteinAmour](https://x.com/SteinAmour/status/1999701091538338337)
>
> **日期**: Sat Dec 13 04:41:07 +0000 2025
>
> **標籤**: `Vibe Coding` `開發工作流` `效率提升`

---

完美！我已經抓取了完整的課程網站內容。現在讓我整理成知識庫文章格式。

---

## Vibe Coding 工作流指南：Stanford CS146S 課程內容總覽

本文整理自 Stanford University CS146S: The Modern Software Developer 課程網站，這是一門專注於 AI 輔助開發的現代軟體工程課程。

### 什麼是 Vibe Coding？

Vibe Coding 是一種現代化的軟體開發工作流方法論，核心理念是：**軟體開發已從傳統的「0-1 程式碼創建」演變為「規劃 → AI 生成 → 修改 → 迭代」的循環工作流程**。

這種方法論強調：
- AI 工具不僅能提升開發者生產力，還能讓更廣泛的受眾參與軟體工程
- 掌握傳統軟體工程挑戰的理論基礎，同時善用前沿 AI 工具
- 整合最先進的 LLM 模型到複雜開發工作流中

### 課程架構與核心主題

| 週次 | 主題 | 核心內容 |
|------|------|----------|
| **Week 1** | LLM 與 AI 開發入門 | • LLM 運作原理<br>• 有效提示工程技巧<br>• 課程邏輯與基礎 |
| **Week 2** | Coding Agents 剖析 | • Agent 架構與組件<br>• 工具使用與函數調用<br>• MCP (Model Context Protocol) |
| **Week 3** | AI IDE | • 程式碼理解與上下文管理<br>• PRD for Agents<br>• IDE 整合與擴展 |
| **Week 4** | Coding Agent 模式 | • Agent 自主性管理<br>• 人機協作模式<br>• Claude Code 最佳實踐 |
| **Week 5** | 現代終端機 | • AI 增強的命令列介面<br>• 終端自動化與腳本<br>• Warp 開發實踐 |
| **Week 6** | AI 測試與安全 | • 安全 Vibe Coding<br>• 漏洞檢測歷史<br>• AI 生成測試套件 |
| **Week 7** | 現代軟體支援 | • AI 程式碼審查<br>• 除錯與診斷<br>• 智能文件生成 |
| **Week 8** | 自動化 UI/App 建構 | • 前端開發民主化<br>• 快速 UI/UX 原型與迭代 |
| **Week 9** | 部署後的 Agents | • AI 系統監控與可觀測性<br>• 自動化事件響應<br>• 問題分類與除錯 |
| **Week 10** | AI 軟體工程的未來 | • 軟體開發角色演變<br>• 新興 AI 編碼範式<br>• 產業趨勢與預測 |

### 關鍵工具與技術

#### 1. **Model Context Protocol (MCP)**
- Agent 架構的核心協議
- 統一的上下文管理標準
- 自定義 MCP Server 實作

#### 2. **AI IDE 工作流**
- **上下文管理**：如何處理大型程式碼庫
- **PRD for Agents**：用規格驅動開發
- **Long Context 挑戰**：Context Rot 問題與解決方案

#### 3. **Claude Code 模式**
- 管理 Agent 自主性層級
- 人機協作最佳實踐
- SuperClaude Framework 擴展

#### 4. **安全 Vibe Coding**
- Prompt Injection 防範
- SAST/DAST 工具整合
- OWASP Top Ten 應用
- AI 輔助漏洞檢測

### 產業講師陣容

課程邀請了頂尖 AI 開發工具公司的領導者：

| 講師 | 職位 | 公司 |
|------|------|------|
| Silas Alberti | Head of Research | Cognition (Devin) |
| Boris Cherney | Creator | Claude Code (Anthropic) |
| Zach Lloyd | CEO | Warp |
| Isaac Evans | CEO | Semgrep |
| Tomas Reimers | CPO | Graphite |
| Gaspar Garcia | Head of AI Research | Vercel |
| Mayank Agarwal & Milind Ganjoo | CTO & Technical Staff | Resolve |
| Martin Casado | General Partner | a16z |

### 學習重點與技能培養

#### **理論基礎**
- 深入理解 LLM 運作原理
- 掌握 Prompt Engineering 技術
- 學習 Agent 系統架構設計

#### **實踐技能**
- 建構自定義 MCP Server
- 使用 Claude Code/Warp 等 AI IDE
- 實施 AI 輔助測試與安全審查
- 端到端 App 快速原型開發

#### **工作流優化**
- 設計有效的 PRD 給 AI Agents
- 管理 Agent 自主性與人工干預平衡
- 建立 AI 程式碼審查流程
- 部署後監控與事件響應自動化

### 課程特色

**1. 語言無關性**
- 專注於跨語言通用的工具與實踐
- 範例主要使用 Python、JavaScript

**2. 高度實踐性**
- 每週實作作業（佔 15%）
- 最終專案（佔 80%）
- 預計每週投入 10-12 小時

**3. 即時更新**
- 每週更新課程內容以反映最新發展
- 產業講師分享最新實踐與工具

**4. 互動學習**
- 現場編碼實作課
- 與 AI 工具先驅對話
- 展示現代開發實踐的期末專案

### 必讀資源精選

#### **基礎理論**
- [Deep Dive into LLMs](https://www.youtube.com/watch?v=7xTGNNLPyMI)
- [Prompt Engineering Guide](https://www.promptingguide.ai/techniques)

#### **Agent 開發**
- [MCP Introduction](https://stytch.com/blog/model-context-protocol-introduction/)
- [Building a Coding Agent from Scratch](https://docs.google.com/presentation/d/11CP26VhsjnZOmi9YFgLlonzdib9BLyAlgc4cEvC5Fps/)

#### **工作流最佳實踐**
- [How Anthropic Uses Claude Code](https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [How FAANG Vibe Codes](https://x.com/rohanpaul_ai/status/1959414096589422619)

#### **安全與測試**
- [Finding Vulnerabilities with AI](https://semgrep.dev/blog/2025/finding-vulnerabilities-in-modern-web-apps-using-claude-code-and-openai-codex/)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)

### 關鍵洞察

**★ Vibe Coding 核心思維轉變 ─────────────────**

1. **從程式碼創建到規格驅動**：「Specs Are the New Source Code」—— 寫清楚 PRD 比寫程式碼更重要
2. **上下文即品質**：「Good Context Good Code」—— Agent 效能取決於提供的上下文品質
3. **Agent 管理新角色**：開發者從「寫程式碼的人」轉變為「管理 AI Agents 的人」

**──────────────────────────────────────**

### 適用對象

- 具備 CS111 等級程式設計經驗
- 建議修過 CS221/229（機器學習基礎）
- 想提升開發效率與工作流優化的開發者
- 對 AI 輔助開發工具感興趣的軟體工程師

### 學習路徑建議

1. **第一階段（Week 1-2）**：建立 LLM 與 Prompt Engineering 基礎
2. **第二階段（Week 3-5）**：掌握 AI IDE 與 Agent 協作模式
3. **第三階段（Week 6-7）**：強化安全意識與程式碼審查能力
4. **第四階段（Week 8-10）**：探索前端自動化與未來趨勢

### 延伸資源

- [課程網站](https://themodernsoftware.dev/)
- [作業 GitHub Repo](https://github.com/mihail911/modern-software-dev-assignments)
- [Awesome Claude Agents](https://github.com/vijaythecoder/awesome-claude-agents)
- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
