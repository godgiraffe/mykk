# Binance 現貨剝頭皮交易機器人開源

> **來源**: [@yourQuantGuy](https://x.com/yourQuantGuy/status/1952268897995882713) | [原文連結](https://github.com/your-quantguy/binance-scalping)
>
> **日期**: Mon Aug 04 07:22:31 +0000 2025
>
> **標籤**: `剝頭皮交易` `網格交易` `Binance API`

---

> **來源**: [@yourQuantGuy](https://github.com/your-quantguy/binance-scalping)  
> **日期**: 2026-02-18  
> **標籤**: `量化交易` `剝頭皮交易` `Binance` `開源腳本`

---

## 策略概述

### 什麼是剝頭皮交易（Scalp Trading）

剝頭皮交易是一種超短線交易策略，通過在極短時間內（幾秒到幾分鐘）頻繁進出市場，賺取極小的價格波動或價差來獲利。

### 作者的交易思路

作者基本不做有方向性的交易，但喜歡在市場急跌之後用非常小量的資金來做剝頭皮交易，原因是（主觀認為）在急跌後震盪和回漲的可能性更大，而不管是震盪還是回漲，都非常適合剝頭皮交易。作者只做看漲，且不設止損，套住了就套住了。雖然叫它剝頭皮交易，但已經把它變得更像網格交易。

## 腳本邏輯

### 無腦下單

腳本下單完全沒有任何技術指標。在設定好每單數額和最大持倉後：
- 在到達最大持倉的 1/3 前會快速下單
- 持倉達到 1/3 後會在每單之間隔固定的一段時間（默認 30 秒）

### 止盈

在開倉的訂單成交後，立馬根據設定下止盈單（默認 ETH +$0.5，也就是 0.015%）。如果下單時的價格已經超過了 0.015%，則按照 Queue 1 的價格下單，以此保證是免手續費的掛單。

### 止損

沒有止損機制。

## 腳本功能特點

### 基本說明

1. 任何交易對都可以，但推薦用 USDC 交易對，因為沒有手續費
2. 下的所有訂單都是 POST-ONLY 的掛單，確保沒有手續費
3. 可以選擇開多或者開空，以及設置止盈，但沒有止損
4. 可以設置最高訂單數，以及每單數額

### 交易參數

| 參數 | 說明 | 範例 |
|------|------|------|
| `--symbol` | 交易對（如 BTCUSDC, ETHUSDC, PUMPUSDT） | ETHUSDC |
| `--quantity` | 每單數量（如交易 ETHUSDC，0.1 表示 0.1 ETH） | 0.2 |
| `--take_profit` | 止盈價格偏移（0.5 表示開倉價 +$0.5 平倉） | 0.5 |
| `--max-orders` | 最大並發訂單數 | 50 |
| `--wait-time` | 訂單間隔時間（秒） | 30 |
| `--direction` | 交易方向（BUY 或 SELL） | BUY |

## 使用範例

### BTC/USDC 交易
```bash
python runbot.py --symbol BTCUSDC --quantity 0.001 --take_profit 50 --max-orders 50 --wait-time 30
```

### ETH/USDC 交易
```bash
python runbot.py --symbol ETHUSDC --quantity 0.2 --take_profit 0.5 --max-orders 50 --wait-time 30
```

## 作者的實際設定與收益

### 設定參數

作者目前在 ETHUSDC 放了 $20,000 運行腳本，設定如下：
- 每個訂單：0.4 ETH
- 止盈：漲 $0.5
- 每單收益：$0.2
- 最大訂單量：75

這意味著如果 ETH 每次在開多單後都跌，那麼最大持倉是 75 × 0.4 = 30 ETH，大約是 5.25 倍槓桿。

### 運行收益（6 小時）

策略從 UTC 1 點運行到 UTC 7 點，ETH 價格從 $3,550 漲漲跌跌後回到原價位：
- 完成交易：1,508 筆開倉並獲利關倉
- 實現收益：$300
- 當前倉位：17 ETH
- 浮虧：$100
- 實際盈利：$200

作者表示，因為這不是中性策略，是完全吃市場的交易方式，所以就不算 APR 了，沒有什麼意義。

## 儀表板功能

腳本包含即時監控儀表板：

```bash
python dashboard.py
```

### 儀表板功能

| 功能 | 說明 |
|------|------|
| 即時帳戶監控 | 實時錢包餘額、未實現盈虧、可用餘額 |
| 倉位追蹤 | 監控開倉倉位的入場價格和標記價格 |
| 訂單管理 | 查看所有開倉訂單的狀態和詳情 |
| 交易統計 | 追蹤總盈虧、每日盈虧、勝率和交易計數 |
| 最近交易 | 查看最近 10 筆交易及實現盈虧 |
| 連接狀態 | 監控 WebSocket 連接和 API 狀態 |

### 儀表板選項

```bash
# 監控特定交易對
python dashboard.py --symbol BTCUSDC

# 更改刷新率（默認 5 秒）
python dashboard.py --refresh-rate 10

# 從命令列使用 API 憑證
python dashboard.py --api-key "your_key" --api-secret "your_secret"
```

## 工作原理

### 交易策略流程

1. **訂單下達**：機器人在隨機價格水平下限價單
2. **訂單監控**：WebSocket 連接即時監控訂單狀態
3. **執行處理**：當訂單成交時，機器人自動下平倉單
4. **風險管理**：可配置的限制防止過度暴露

### 訂單流程

1. 機器人在 QUEUE 1 價格 ± 偏移處下 POST-ONLY 開倉單
2. WebSocket 持續監控訂單狀態
3. 當訂單成交時，機器人立即下平倉限價單
4. 根據等待時間和最大訂單配置重複流程

### 關鍵組件

| 組件 | 功能 |
|------|------|
| TradingBot | 主要機器人邏輯和訂單管理 |
| WebSocketManager | 即時訂單和帳戶更新 |
| BinanceClient | API 互動和訂單下達 |
| TradingLogger | 全面的日誌記錄和交易追蹤 |
| TradingDashboard | 即時監控介面 |

## 日誌記錄

機器人提供全面的日誌記錄：
- **交易日誌**：包含詳細交易資訊的 CSV 檔案
- **活動日誌**：用於故障排除的除錯日誌
- **即時更新**：控制台輸出以獲得即時反饋

每個交易對會創建日誌檔案：
- `{SYMBOL}_transactions_log.csv`
- `{SYMBOL}_bot_activity.log`

## 安全性考量

### API 憑證

- **環境變數**：API 憑證儲存在環境變數中，永不硬編碼
- **安全儲存**：本地開發使用 `.env` 檔案（不提交到 git）
- **生產環境**：使用系統的環境變數管理

### 連接安全

- **WebSocket**：所有連接使用安全 WebSocket 協議（WSS）
- **API 呼叫**：所有 API 呼叫使用 HTTPS 並進行適當身份驗證
- **監聽密鑰**：每 30 分鐘自動刷新以維持安全連接

### 資料保護

- **無敏感日誌記錄**：API 密鑰和密碼永不記錄或顯示
- **交易日誌**：僅記錄交易資料，不記錄帳戶憑證
- **錯誤處理**：敏感資訊在錯誤訊息中被遮罩

### 最佳實踐

1. 永不提交 `.env` 檔案 - 它們已在 `.gitignore` 中
2. 使用權限最小的 API 密鑰 - 僅需期貨交易權限
3. 定期輪換密鑰 - 考慮定期輪換 API 密鑰
4. 先在測試網測試 - 在實盤交易前始終使用小額測試
5. 監控訪問日誌 - 檢查 Binance 帳戶是否有異常活動

## 環境設定

複製 `.env.example` 到 `.env` 並填入您的憑證：

```bash
cp .env.example .env
# 使用您的實際 API 憑證編輯 .env
```

## 安裝步驟

### 前置要求

- Python 3.7 或更高版本
- Binance Futures 帳戶並具有 API 訪問權限
- 具有期貨交易權限的 API 密鑰

### 安裝

1. 複製儲存庫：
```bash
git clone <repository-url>
cd binance-bot
```

2. 安裝依賴：
```bash
pip install -r requirements.txt
```

3. 設定環境變數：
```bash
cp .env.example .env
# 使用您的實際 Binance API 憑證編輯 .env
```

## 專案結構

```
binance-scalping/
├── runbot.py              # 主要交易機器人
├── dashboard.py           # 即時監控儀表板
├── requirements.txt       # Python 依賴
├── .env.example          # 環境變數模板
├── .gitignore            # Git 忽略規則
├── LICENSE               # MIT 許可證
└── README.md             # 說明文件
```

## 貢獻

歡迎貢獻！請隨時提交 Pull Request。

對於重大更改，請先開啟 issue 討論您想要更改的內容。

### 開發設定

1. Fork 儲存庫
2. 創建功能分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 開啟 Pull Request

## 安全報告

如果您發現安全漏洞，請通過電子郵件報告或創建私人 issue。請不要為安全漏洞創建公開的 GitHub issue。

## 許可證

本專案採用 MIT 許可證 - 詳見 LICENSE 檔案。

## 風險警告

⚠️ **重要**：此機器人僅供教育和測試目的。加密貨幣交易涉及重大風險。永遠不要用您無法承受損失的資金進行交易。

- 在使用真實資金之前，請在測試網上徹底測試
- 從小額開始
- 持續監控機器人
- 在部署之前了解交易策略

## 支援

如有問題和疑問：
- 檢查日誌以查看錯誤訊息
- 驗證 API 憑證和權限
- 先使用小數量測試
- 監控儀表板以獲取即時狀態

## 總結

作者表示這個腳本還是偏玩票性質的，但自己確實有在運行。在震盪行情裡的收益應該還是可以的，但如果是急漲/急跌的行情裡，那應該比直接做合約少賺/少虧。具體運行的方式和參數調整都可以在 README 文檔裡看到。

## GitHub 連結

https://github.com/your-quantguy/binance-scalping
