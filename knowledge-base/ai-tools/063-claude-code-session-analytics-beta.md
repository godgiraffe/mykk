# Claude Code 會話分析工具（測試版）

> **來源**: [@dani_avila7](https://x.com/dani_avila7/status/1984669230994747769)
>
> **日期**: Sat Nov 01 17:09:52 +0000 2025
>
> **標籤**: `Claude Code` `效能分析` `開發工具`

---

> **來源**: [@dani_avila7 (Daniel San)](https://twitter.com/dani_avila7)  
> **日期**: 2026-02-17  
> **標籤**: `Claude Code` `開發工具` `效能分析` `監控工具`

---

## 工具簡介

claude-code-templates 推出新功能：Claude Code 會話分析工具（Beta），可查看 Claude Code 會話的詳細執行數據。

## 使用方式

```bash
npx claude-code-templates@latest --chats
```

## 分析數據

工具可顯示以下資訊：
- Token 使用量
- 工具呼叫次數
- 快取效率
- 成本統計
- 時間分配分析

## 關鍵發現

時間分配統計顯示：
- **85% 執行時間**（26 小時 7 分鐘）：Claude 實際執行任務
- **15% 對話時間**（4 小時 45 分鐘）：來回交流討論

這表示 Claude Code 大部分時間都在執行操作，而非進行對話溝通。

## 狀態

目前為 Beta 測試版本，開發者歡迎使用者回饋使用模式與發現。
