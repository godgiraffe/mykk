# Agent 全域指令管理最佳實踐

> **來源**: [@elliotarledge](https://x.com/elliotarledge/status/2007752112361685197) | [原文連結](https://spec.md/)
>
> **日期**: Sun Jan 04 09:53:00 +0000 2026
>
> **標籤**: `Claude Code` `開發工具` `工程文化`

---

## 核心問題：全域指令該如何管理？

社群討論熱點：Agent 的全域規則和指令應該放在哪裡？

| 方法 | 說明 | 適用場景 |
|------|------|----------|
| `AGENT.md` / `CLAUDE.md` | 全域指令文件，每次請求載入 | 持久性規則、跨專案標準 |
| `SKILL.md` | 技能型指令，按需載入（如 commit 時才觸發） | 特定操作的專業指令集 |

**核心取捨**：commit 規則該放在全域載入的 CLAUDE.md（理論上每次都生效），還是做成 skill 只在執行 commit 時載入？

---

## Elliot Arledge 的全域配置實踐

### Python 開發規範

```xml
<python>
  Use uv for everything: uv run, uv pip, uv venv.
</python>
```

明確指定統一使用 `uv` 工具鏈，避免 pip/poetry/conda 混用。

---

### 核心原則 (Principles)

#### 1. **風格指南 (Style)**
```xml
<style>No emojis. No em dashes - use hyphens or colons instead.</style>
```
- 禁用 emoji
- 禁用 em dash (—)，改用 hyphen (-) 或 colon (:)

#### 2. **認識論 (Epistemology)**
```xml
Assumptions are the enemy. Never guess numerical values - benchmark instead of estimating.
When uncertain, measure. Say "this needs to be measured" rather than inventing statistics.
```
**反對臆測，強制實測**：
- 不猜數值 → 用 benchmark 驗證
- 不確定時明確說「需要測量」，不編造數據

#### 3. **規模化 (Scaling)**
```xml
Validate at small scale before scaling up. Run a sub-minute version first to verify the
full pipeline works. When scaling, only the scale parameter should change.
```
**先小規模驗證，再擴大執行**：
- 執行 <1 分鐘的小版本測試全流程
- 擴大時只改變規模參數，不改邏輯

#### 4. **互動模式 (Interaction)**
```xml
Clarify unclear requests, then proceed autonomously. Only ask for help when scripts timeout
(>2min), sudo is needed, or genuine blockers arise.
```
**澄清需求後自主執行**，只在以下情況才求助：
- 腳本執行超過 2 分鐘
- 需要 sudo 權限
- 遇到真正的阻礙

#### 5. **真實理解澄清 (Ground Truth Clarification)**
```xml
For non-trivial tasks, reach ground truth understanding before coding. Simple tasks execute
immediately. Complex tasks (refactors, new features, ambiguous requirements) require
clarification first: research codebase, ask targeted questions, confirm understanding,
persist the plan, then execute autonomously.
```
**簡單任務直接執行，複雜任務先達成共識**：
- 重構、新功能、模糊需求 → 先研究程式碼、提問、確認理解、持久化計畫
- 達成共識後才自主執行

#### 6. **規格驅動開發 (Spec-Driven Development)**
```xml
When starting a new project, after compaction, or when SPEC.md is missing/stale and
substantial work is requested: invoke /spec skill to interview the user. The spec persists
across compactions and prevents context loss. Update SPEC.md as the project evolves.
If stuck or losing track of goals, re-read SPEC.md or re-interview.
```
**SPEC.md 作為專案真理來源**：
- 新專案、context compaction 後、SPEC.md 過時時 → 執行 `/spec` skill 訪談用戶
- SPEC.md 跨 compaction 持久化，防止上下文遺失
- 卡住或目標模糊時，重讀 SPEC.md 或重新訪談

#### 7. **從第一原理重新實作 (First-Principles Reimplementation)**
```xml
Building from scratch can beat adapting legacy code when implementations are in wrong
languages, carry historical baggage, or need architectural rewrites. Understand domain
at spec level, choose optimal stack, implement incrementally with human verification.
```
**何時該重寫而非改寫**：
- 實作使用錯誤語言
- 背負歷史包袱
- 需要架構級改寫

**重寫流程**：理解領域規格 → 選最佳技術棧 → 增量實作 + 人工驗證

#### 8. **約束持久化 (Constraint Persistence)**
```xml
When user defines constraints ("never X", "always Y", "from now on"), immediately persist
to project's local CLAUDE.md. Acknowledge, write, confirm.
```
**用戶定義規則時立即寫入 CLAUDE.md**：
- 聽到「永遠不要 X」、「從現在起 Y」等約束
- 確認 → 寫入 → 回報完成

---

### 機器配置 (Machines)

```xml
<machines>
  `ssh macbook` - MacBook Pro
  `ssh theodolos` - local workstation, RTX 3090
  Check which machine we are currently on before using these.
</machines>
```

定義可用機器別名，執行前檢查當前機器位置。

---

## 關鍵洞察

| 原則 | 價值 |
|------|------|
| **SPEC.md 中心化** | 防止 context compaction 後目標遺失 |
| **約束即時持久化** | 用戶規則立即寫入 CLAUDE.md，不靠記憶 |
| **反臆測文化** | 強制測量而非估算，杜絕編造數據 |
| **小規模驗證** | 先跑 <1min 版本驗證流程，再擴大規模 |
| **真實理解門檻** | 複雜任務必須先達成共識再動工 |

---

## 參考討論

**Ian Nuttall 提問**：commit 規則該放 CLAUDE.md（全域載入）還是做成 skill（按需載入）？

**典型場景對比**：

| 規則類型 | CLAUDE.md | SKILL.md |
|----------|-----------|----------|
| Python 工具鏈統一 | ✅ 每次請求都生效 | ❌ 可能被遺忘 |
| Commit message 格式 | ⚠️ 載入但未必用到 | ✅ 只在 commit 時載入 |
| 風格指南（emoji 禁用） | ✅ 全局一致性 | ❌ 跨操作難保證 |

**最佳實踐建議**：
- **持久性規則** → CLAUDE.md（如工具鏈、風格、認識論原則）
- **操作性指令** → SKILL（如 commit 格式、測試流程、部署檢查）
