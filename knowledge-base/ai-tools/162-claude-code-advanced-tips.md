# Claude Code 五大進階技巧：自我進化到超深度思考

> **來源**: [@runes_leo](https://x.com/runes_leo/status/2024498235885433276)
>
> **日期**: 
>
> **標籤**: `Claude Code` `工作流程優化` `AI 開發工具`

---

Luca (@DellAnnaLuca) 分享了他高強度使用 Claude Code 的 5 個進階技巧，非常硬核：

## 五大進階技巧總覽

1. **自我進化注入**：設置一個 Hook，當 Tool Calls > 8 次時，強制 Claude 輸出一條「優化建議」。讓它自己教你如何把剛才的操作沉澱為 Skill。

2. **戰略性壓縮 (/compact)**：不要等 Context 爆了再重開。在每個任務節點主動 /compact，保持上下文的高信噪比。

3. **黑客視角審查**：部署前強制運行 /security。這不僅是查漏洞，更是讓 AI 換個視角（Attacker）重新審視代碼邏輯。

4. **Agent 分身**：別讓 Root Agent 幹所有事。給 SQL、文案、測試分別建 Sub-Agent，專業的人幹專業的事。

5. **開啟 Ultra Think**：遇到架構設計，別省 Token。開啟深度思考模式，讓它先想清楚再寫。

## 第一點詳細說明

### Self-improvement injection

> "Create a UserPromptSubmit hook (global settings). Script echoes: If 8+ tool calls, append one optimization hint (reusable skill, memory pattern, or workflow fix). One sentence. Skip if exploratory."

在全域設定中建立 UserPromptSubmit hook。腳本邏輯：如果工具呼叫次數超過 8 次，自動附加一條優化提示（可重用的技能、記憶模式或工作流程修正）。只需一句話。如果是探索性任務則跳過。
