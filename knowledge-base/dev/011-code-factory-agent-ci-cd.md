# Code Factory：如何設置倉庫讓 AI Agent 自動撰寫與審查程式碼

> **來源**: [@ryancarson](https://x.com/ryancarson/status/2023452909883609111) | [原文連結](https://x.com/i/article/2023001790258573312)
>
> **日期**: Mon Feb 16 17:42:22 +0000 2026
>
> **標籤**: `AI 開發` `CI/CD 自動化` `代碼審查`

---

## 目標

你希望建立一個自動化迴圈：

1. 程式碼撰寫 agent 編寫程式碼
2. 倉庫在合併前執行風險感知檢查
3. 程式碼審查 agent 驗證 PR
4. 證據（測試 + 瀏覽器 + 審查）可由機器驗證
5. 發現的問題轉換為可重複的測試案例

特定的審查 agent 可以是 Greptile、CodeRabbit、CodeQL + 政策邏輯、自訂 LLM 審查，或其他服務。控制平面模式保持不變。

這個方法的靈感來自 @_lopopolo 的實用部落格文章。

## 高層級流程

### 1) 維護一份機器可讀的契約

你的契約應該定義：

- 依路徑的風險等級
- 依等級要求的檢查項目
- 控制平面變更的文件漂移規則
- UI/關鍵流程的證據要求

```json
{
  "version": "1",
  "riskTierRules": {
    "high": [
      "app/api/legal-chat/**",
      "lib/tools/**",
      "db/schema.ts"
    ],
    "low": ["**"]
  },
  "mergePolicy": {
    "high": {
      "requiredChecks": [
        "risk-policy-gate",
        "harness-smoke",
        "Browser Evidence",
        "CI Pipeline"
      ]
    },
    "low": {
      "requiredChecks": ["risk-policy-gate", "CI Pipeline"]
    }
  }
}
```

為何重要：這消除了歧義，防止腳本、工作流程檔案和政策文件之間的無聲漂移。

### 2) 在昂貴的 CI 之前設置預檢閘門

一個可靠的模式是：

1. 首先執行 `risk-policy-gate`
2. 驗證確定性政策 + 審查 agent 狀態
3. 然後才開始 `test/build/security` 扇出作業

這避免在已經被政策阻擋或未解決審查發現的 PR head 上浪費 CI 時間。

```typescript
const requiredChecks = computeRequiredChecks(changedFiles, riskTier);
await assertDocsDriftRules(changedFiles);
await assertRequiredChecksSuccessful(requiredChecks);

if (needsCodeReviewAgent(changedFiles, riskTier)) {
  await waitForCodeReviewCompletion({ headSha, timeoutMinutes: 20 });
  await assertNoActionableFindingsForHead(headSha);
}
```

### 3) 強制執行當前 head SHA 規範

這是從實際 PR 迴圈中學到的最大實務課題。

僅當審查狀態與當前 PR head commit 匹配時才視為有效：

- 等待 `headSha` 上的審查檢查執行
- 忽略綁定到較舊 SHA 的過時摘要評論
- 如果最新審查執行非成功或逾時則失敗
- 每次同步/推送後要求重新執行
- 透過在相同 head 上重新執行政策閘門來清除過時的閘門失敗

如果你跳過這個步驟，你可能會使用過時的「乾淨」證據合併 PR。

### 4) 使用單一重新執行評論寫入器配合 SHA 去重

當多個工作流程可以請求重新執行時，會出現重複的 bot 評論和競爭條件。

使用恰好一個工作流程作為規範的重新執行請求者，並透過標記 + `sha:<head>` 去重。

```typescript
const marker = '<!-- review-agent-auto-rerun -->';
const trigger = `sha:${headSha}`;
const alreadyRequested = comments.some((c) =>
  c.body.includes(marker) && c.body.includes(trigger),
);

if (!alreadyRequested) {
  postComment(`${marker}\n@review-agent please re-review\n${trigger}`);
}
```

### 5) 加入自動化修復迴圈（選用，高槓桿）

如果審查發現是可操作的，觸發一個程式碼撰寫 agent 來：

1. 讀取審查上下文
2. 修補程式碼
3. 執行聚焦的本地驗證
4. 推送修復 commit 到相同的 PR 分支

然後讓 PR 同步觸發正常的重新執行路徑。保持這個過程的確定性：

- 固定模型 + 工作量以實現可重現性
- 跳過不匹配當前 head 的過時評論
- 永遠不要繞過政策閘門

### 6) 僅在乾淨重新執行後自動解決僅 bot 的討論串

一個有用的生活品質改善步驟：

- 在乾淨的當前 head 重新執行後
- 自動解決所有評論都來自審查 bot 的未解決討論串
- 永遠不要自動解決有人類參與的討論串

然後重新執行政策閘門，以便所需的對話解決反映新狀態。

### 7) 將瀏覽器證據視為第一類證明

對於 UI 或使用者流程變更，在 CI 中要求證據清單和斷言（不只是 PR 文字中的截圖）：

- 所需流程存在
- 使用了預期的入口點
- 登入流程存在預期的帳戶身份
- 產物是新鮮且有效的

```bash
npm run harness:ui:capture-browser-evidence
npm run harness:ui:verify-browser-evidence
```

### 8) 透過測試缺口迴圈保存事故記憶

```plaintext
生產環境回歸 -> 測試缺口問題 -> 案例新增 -> SLA 追蹤
```

這使修復不會成為一次性補丁，並增長長期覆蓋率。

### 9) 在 PR 中執行此流程學到的經驗

最重要的經驗是：

1. 確定性順序很重要：預檢閘門必須在 CI 扇出之前完成
2. 當前 head SHA 匹配是不可妥協的
3. 審查重新執行請求需要一個規範的寫入器
4. 審查摘要解析應將漏洞語言和低信心摘要視為可操作的
5. 自動解決僅 bot 的討論串可以減少摩擦，但僅在乾淨的當前 head 證據之後
6. 如果保護措施保持嚴格，修復 agent 可以顯著縮短迴圈時間

### 10) 通用模式 vs. 一個實作

通用模式術語：

- `code review agent`（程式碼審查 agent）
- `remediation agent`（修復 agent）
- `risk policy gate`（風險政策閘門）

一個具體實作（我們的）：

- code review agent: Greptile
- remediation agent: Codex Action
- 規範的重新執行工作流程：`greptile-rerun.yml`
- 過時討論串清理工作流程：`greptile-auto-resolve-threads.yml`
- 預檢政策工作流程：`risk-policy-gate.yml`

如果你使用不同的審查者，保持相同的控制平面語義並交換整合點。

## 有用的命令集

```bash
npm run typecheck
npm test
npm run build:ci
npm run harness:legal-chat:smoke
npm run harness:ui:pre-pr
npm run harness:risk-tier
npm run harness:weekly-metrics
```

## 可複製的最終模式

1. 將風險 + 合併政策放入一個契約
2. 在昂貴的 CI 之前強制執行預檢閘門
3. 要求當前 head SHA 的乾淨程式碼審查 agent 狀態
4. 如果存在發現，在分支內修復並確定性地重新執行
5. 僅在乾淨重新執行後自動解決僅 bot 的過時討論串
6. 要求 UI/流程變更的瀏覽器證據
7. 將事故轉換為測試案例並追蹤迴圈 SLO

這給你一個倉庫，其中 agent 可以實作、驗證並以確定性、可稽核的標準進行審查。
