# Claude Code Skill Creator 官方工具及社群改進版本

> **來源**: [@gasikaramada](https://x.com/gasikaramada/status/1996038285295079451) | [原文連結](https://github.com/daymade/claude-code-skills/tree/main/skill-creator)
>
> **日期**: Wed Dec 03 02:06:26 +0000 2025
>
> **標籤**: `Claude Code` `Skill 創建` `最佳實踐`

---

> **來源**: [@gasikaramada (DAYMADE.AI)](https://x.com/gasikaramada)
> **日期**: 2026-02-17
> **標籤**: `Claude Code` `Skill Creator` `AI 工具` `開發工具`

---

## Claude Code Skill Creator 工具

### 官方 skill-creator

Claude Code 官方提供了一個 skill-creator 工具，功能是基於聊天記錄創建 Skill。

相關資源：[claude-code-skills/skill-creator](https://github.com/daymade/claude-code-skills/tree/main/skill-creator)

### 社群改進版本

@gasikaramada 基於官方 skill-creator 進行了三項重要改進：

#### 1. 最佳實踐知識

改進版本內建了創建 Skill 的最佳實踐知識，能夠區分什麼樣的 Skill 是高質量的，什麼樣是低質量的。而官方的 Skill Creator 不具備這方面的判斷能力。

#### 2. 安全掃描功能

創建完 Skill 後會自動進行安全掃描，防止洩露聊天記錄中的敏感信息，例如：
- 電腦的文件路徑
- API key
- 其他私密資訊

#### 3. 引用驗證

改進版本會驗證你引用的腳本和文檔是否真實存在，避免創建出包含幻覺內容的 Skill。這樣可以確保發布出去的 Skill 能夠被其他人正常使用，不會因為引用了不存在的資源而無法運行。
