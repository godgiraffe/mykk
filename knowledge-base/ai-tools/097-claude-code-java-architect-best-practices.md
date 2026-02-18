# Java 架構師使用 Claude Code 一個月的最佳實踐

> **來源**: [@BadUncleX](https://x.com/BadUncleX/status/1945316833458053542)
>
> **日期**: Wed Jul 16 02:57:29 +0000 2025
>
> **標籤**: `Claude Code` `開發工作流程` `團隊規範`

---

![](../assets/ai-tools/097-claude-code-java-architect-best-practices-1.jpg)

## 項目上下文管理（CLAUDE.md）

手動完善 CLAUDE.md，加入團隊特定規範：
- Lombok 使用約定（如優先用 `@Data`、`@Builder`）
- Google 程式碼風格（2 空格縮排）
- DDD 架構模式說明
- 自訂異常處理模式
- 測試規範（Given-When-Then 模式、80% 覆蓋率要求）

**效果**：讓 AI 從「新手」變成了解團隊規範的「初級開發者」

## 文件模組化策略

大型專案避免單一巨型文件，按領域拆分：
- `CLAUDE_AWS.md`：雲端服務配置規範
- `CLAUDE_TESTING.md`：測試策略和模式
- `CLAUDE_API.md`：REST 介面設計規範

使用 `/memory` 命令動態更新會話上下文

## 靈活切換 AI 模型

**配置方式**：環境變數或 `~/.claude/settings.json`

**模型選擇策略**：
- **Haiku**：簡單任務（格式化、產生 getter/setter），回應快成本低
- **Sonnet 4**：日常開發主力，效能成本平衡
- **Opus 4**：複雜重構、分散式系統分析（Max 計畫專屬）

**實戰技巧**：會話中用 `/model` 命令快速切換

## 高品質 Prompt 示例

**差勁**：「建立一個管理使用者的服務」

**優秀**：「分析現有 UserService 的模式，建立 ProfileService 並遵循相同約定。
要求：
- 整合 AWS Cognito 認證
- 繼承 BaseService 處理錯誤
- 使用 Spring Cache + Redis 實作快取
- 測試遵循專案的 Given-When-Then 模式」

## 高效開發循環

新功能開發流程：
1. AI 腦力激盪定義需求
2. Claude 產生初始程式碼
3. 人工審查和調整
4. 自動產生單元測試（Claude 最擅長的領域）
5. 使用 commitlint 規範自動產生提交訊息

## 會話管理

每 30-40 分鐘使用 `/clear` 重置上下文

**原因**：保持 AI 回應速度，避免上下文混亂導致的錯誤

## 自訂 Slash 命令

在 `~/.claude/commands` 建立專屬命令檔案（如 `dto.md`）

**示例**：輸入 `/user:dto User` 自動產生：
- UserDTO（包含 Jakarta 驗證註解）
- UserMapper（使用 MapStruct）
- 完整的單元測試

**價值**：像擁有完全了解團隊標準的初級開發者

## 工具權限配置

```json
{
  "allow": [
    "Bash(cat:*)",     // 安全的唯讀命令
    "Bash(ls:*)",      
    "Bash(find:*)",
    "Bash(git:log,status,diff)",  // 僅查詢 Git 狀態
    "Bash(mvn:clean,compile,test)"  // 建置驗證
  ]
}
```

**策略**：讀取操作完全開放，寫入操作保持手動控制

## 量化收益

- **標準任務效率提升**：約 400%（一天工作量 → 幾小時完成）
- **角色轉變**：從編寫樣板程式碼 → 專注架構設計和業務邏輯
- **程式碼審查升級**：從找語法錯誤 → 評估架構決策

## 最佳應用場景

**✅ 適合**：
- 單元測試產生：自動覆蓋邊界情況，甚至發現潛在 bug
- 標準架構的新功能：REST 端點、Service 層、Repository
- 日誌分析偵錯：結合上下文快速定位問題

**❌ 限制**：
- 複雜架構限制：Kafka + CQRS + gRPC 組合時效果有限

## 入門要點

- 認真閱讀官方文件，發掘隱藏功能（影響巨大）
- 提示詞要具體化：「優化查詢」→「優化查詢：users 表 1000 萬記錄，索引在 email 和 created_at 欄位，90% 查詢過濾 active 狀態」
- 前期投入回報高：每小時優化配置 = 節省數天手動修正
