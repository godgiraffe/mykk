# Composer Trade MCP：AI 量化策略回測與自動化投資工具

> **來源**: [@0xKaKa03](https://x.com/0xKaKa03/status/1958860048232599661) | [原文連結](https://github.com/invest-composer/composer-trade-mcp)
>
> **日期**: Fri Aug 22 11:53:24 +0000 2025
>
> **標籤**: `MCP工具` `策略回測` `自動化交易`

---

> **來源**: [@0xKaKa03 (Sliipy⚡)](https://github.com/invest-composer/composer-trade-mcp)
> **日期**: 2026-02-18
> **標籤**: `MCP` `量化交易` `AI 工具` `回測` `自動化投資`

---

## 概述

Composer Trade MCP 是 Composer 官方提供的 Model Context Protocol (MCP) 伺服器,讓支援 MCP 的 LLM(如 Claude、Cursor)能夠驗證投資想法、執行回測,甚至自動交易多個策略(稱為「symphonies」)並比較其即時表現。

## 核心功能

### 建立自動化投資策略

- 使用技術指標:RSI(相對強弱指標)、MA(移動平均線)、EMA(指數移動平均線)
- 支援股票與加密貨幣多樣化資產組合
- Composer symphonies 持續監控市場並自動再平衡
- 範例提示詞:「建立最大回撤不超過 30% 的加密貨幣策略」

### 回測驗證

- 回測 API 提供快速反饋迴圈,供 AI 迭代與驗證假設
- 範例提示詞:「將策略表現與 S&P 500 比較並繪製結果」

### 策略搜尋

- 從 1000+ 策略資料庫中搜尋符合需求的策略
- 範例提示詞:「找出風險報酬比優於比特幣的策略」

### 績效監控

- 查看整體帳戶與個別 symphonies 的績效統計
- 範例提示詞:「找出表現最好的 symphonies 並分析原因」

### 投資控制(需訂閱)

- AI 分析投資組合並調整曝險部位
- 範例提示詞:「研究最新趨勢與新聞,分析我的 symphonies 並決定是否增減投資」

## 安裝方式

### Claude Desktop + iOS

1. 確保已安裝 Claude Desktop 並訂閱 Claude Pro 或 Max 方案
2. 前往 Settings → Connectors,點擊 Add custom connector
3. Name 欄位輸入「Composer」
4. Remote MCP server URL 欄位輸入 `https://ai.composer.trade/mcp`
5. 在開啟的登入畫面輸入 Composer 帳號密碼
6. 完成後 Claude iOS app 也會自動可用

### Claude Code

```bash
claude mcp add --transport http composer https://ai.composer.trade/mcp
```

### Cursor

在瀏覽器複製貼上:
```
cursor://anysphere.cursor-deeplink/mcp/install?name=Composer&config=eyJ1cmwiOiJodHRwczovL2FpLmNvbXBvc2VyLnRyYWRlL21jcCJ9
```

### n8n

1. 取得 API Key 並 Base64 編碼(格式:`MY_KEY:MY_SECRET`)
2. 確保 n8n 版本至少 1.104.0
3. 新增「MCP Client Tool」作為 agent 工具
4. 輸入以下設定:
   - Endpoint: `https://mcp.composer.trade/mcp/`
   - Server Transport: HTTP
   - Authentication: Header Auth
   - Name: Authorization
   - Value: `Basic YOUR_BASE64_ENCODED_KEY`
5. 建議排除可修改帳戶的工具(如 `save_symphony`、`invest_in_symphony` 等)

### 其他 MCP 客戶端

在 MCP 設定 JSON 中加入:
```json
{
  "mcpServers": {
    "composer": {
      "url": "https://ai.composer.trade/mcp"
    }
  }
}
```

**注意**: ChatGPT 除非訂閱 Pro Plan($200/月)否則不支援自訂 MCP 伺服器,且僅支援最多兩個工具的 MCP 伺服器。

## 取得 API Key

1. 建立 [Composer 帳號](https://www.composer.trade)
2. 開啟「Accounts & Funding」頁面
3. 請求 API key
4. 儲存 API key 與 secret

**注意**: 交易 symphony 需付費訂閱,但清算部位不受訂閱狀態限制。Composer 提供 14 天免費試用。

## 可用工具清單

### 策略建立與回測
- `create_symphony` - 使用 Composer 系統定義自動化策略
- `backtest_symphony` - 回測透過 create_symphony 建立的策略
- `backtest_symphony_by_id` - 根據 ID 回測現有策略

### 策略搜尋與管理
- `search_symphonies` - 搜尋現有 Composer symphonies 資料庫
- `save_symphony` - 儲存 symphony 至使用者帳戶
- `copy_symphony` - 複製現有 symphony 至使用者帳戶
- `update_saved_symphony` - 更新已儲存的 symphony
- `get_saved_symphony` - 根據 ID 取得現有 symphony 定義

### 帳戶與持倉
- `list_accounts` - 列出所有可用的券商帳戶
- `get_account_holdings` - 取得券商帳戶持倉
- `get_aggregate_portfolio_stats` - 取得券商帳戶的總體投資組合統計
- `get_aggregate_symphony_stats` - 取得券商帳戶中所有 symphony 的統計
- `get_symphony_daily_performance` - 取得特定 symphony 的每日績效
- `get_portfolio_daily_performance` - 取得券商帳戶的每日績效

### 市場資料
- `get_market_hours` - 取得下週市場交易時間
- `get_options_chain` - 取得特定標的選擇權鏈資料(含篩選與分頁)
- `get_options_contract` - 取得特定選擇權合約詳細資訊(含 Greeks、成交量、價格)
- `get_options_calendar` - 取得標的可用的合約到期日清單

### 交易操作
- `invest_in_symphony` - 在特定帳戶中投資 symphony
- `withdraw_from_symphony` - 從特定帳戶的 symphony 提款
- `cancel_invest_or_withdraw` - 取消尚未處理的投資或提款請求
- `skip_automated_rebalance_for_symphony` - 跳過特定帳戶中 symphony 的自動再平衡
- `go_to_cash_for_symphony` - 立即賣出 symphony 中所有資產
- `liquidate_symphony` - 立即清算 symphony 所有資產(市場關閉時排隊至開盤)
- `preview_rebalance_for_user` - 模擬所有帳戶的再平衡,查看建議交易
- `preview_rebalance_for_symphony` - 模擬特定 symphony 的再平衡,查看建議交易
- `rebalance_symphony_now` - 立即再平衡 symphony 而非等待自動再平衡
- `execute_single_trade` - 執行單一標的訂單(如傳統券商)
- `cancel_single_trade` - 取消尚未執行的單一交易請求

## 使用建議

1. **模型選擇**: 使用 Claude Opus 4 而非 Sonnet,Opus 在工具使用上表現更好
2. **研究模式**: 需要最新財經資料與新聞時,開啟 Claude 的 Research 模式
3. **權限控制**: 執行交易或影響資金的工具應僅允許一次,不要設為「Always Allow」

### 高風險工具清單
以下工具應謹慎處理:
- `invest_in_symphony`
- `withdraw_from_symphony`
- `skip_automated_rebalance_for_symphony`
- `go_to_cash_for_symphony`
- `liquidate_symphony`
- `rebalance_symphony_now`
- `execute_single_trade`

## 故障排除

Claude Desktop 執行時的日誌位置:
- **Windows**: `%APPDATA%\Claude\logs\mcp-server-composer.log`
- **macOS**: `~/Library/Logs/Claude/mcp-server-composer.log`

使用前請詳閱 [API & MCP Server Disclosure](https://www.composer.trade)。

## 授權

MIT License
