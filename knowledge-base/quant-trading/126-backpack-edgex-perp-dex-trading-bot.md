# Backpack & EdgeX 永續合約自動交易機器人框架

> **來源**: [@yourQuantGuy](https://x.com/yourQuantGuy/status/1967611807725433271) | [原文連結](https://github.com/your-quantguy/perp-dex-tools)
>
> **日期**: Mon Sep 15 15:29:46 +0000 2025
>
> **標籤**: `量化交易` `永續合約` `網格交易策略`

---

## 來源資訊

> **來源**: [@yourQuantGuy (Your Quant Guy)](https://twitter.com/yourQuantGuy)  
> **日期**: 2026-02-18  
> **標籤**: `perp-dex` `trading-bot` `backpack` `edgex` `量化交易` `自動交易`

---

## 專案更新說明

趁著寫 Backpack 的腳本，作者把整個程式碼框架重新寫了一遍，將 Backpack 和 EdgeX 的腳本放在同一個 Repo 裡，以後增加其他交易所也會更加方便。新的腳本在 GitHub 連結中，以後只會更新這個新版本，原來的 EdgeX 腳本會停止更新。

**重要變化：**

1. **`--exchange`**：增加了交易所選擇參數，可以選擇 `backpack` 或 `edgex`
2. **`--ticker`**：取消了 `--contract-id`，改用 `--ticker`，所有交易所可以直接用交易對符號（如 BTC、ETH、SOL），腳本會自動找到對應的合約 ID
3. **`--take-profit`**：從絕對價格改為百分比。`--take-profit 0.02` 代表當價格漲了 0.02% 時止盈。如果手續費是 0.013%，那麼止盈設為 `--take-profit 0.026` 則剛好覆蓋手續費

作者自己只跑了 8 小時作為測試，如果有任何問題請私訊。

**風險提示：這個策略是有風險的！被套的話，要麼認虧手動平倉，要麼扛單。**

---

## 專案簡介

一個支援多個交易所的模組化自動交易機器人，目前支援 EdgeX、Backpack、Paradex、Aster、Lighter、GRVT、Extended、Apex、Nado 等交易所。該機器人實現了自動下單並在盈利時自動平倉的策略，主要目的是取得高交易量。

**GitHub 專案**: [your-quantguy/perp-dex-tools](https://github.com/your-quantguy/perp-dex-tools)

---

## 交易所邀請連結（獲得返佣及福利）

| 交易所 | 邀請連結 | 福利 |
|--------|----------|------|
| EdgeX | https://pro.edgex.exchange/referral/QUANT | 永久享受 VIP 1 費率；額外 10% 手續費返佣；10% 額外獎勵積分 |
| Backpack | https://backpack.exchange/join/quant | 35% 手續費返佣 |
| Paradex | https://app.paradex.trade/r/quant | 10% 手續費返佣及潛在未來福利 |
| Aster | https://www.asterdex.com/zh-CN/referral/5191B1 | 30% 手續費返佣及積分加成 |
| GRVT | https://grvt.io/exchange/sign-up?ref=QUANT | 1.3x 全網最高積分加成、未來手續費返佣、專屬交易競賽 |
| Extended | https://app.extended.exchange/join/QUANT | 10% 即時手續費減免；積分加成 |
| ApeX | https://join.omni.apex.exchange/quant | 30% 返佣；5% 手續費減免；積分加成；社區專屬交易競賽資格 |

---

## 安裝與設定

### Python 版本要求

- GRVT 要求 Python 3.10 及以上
- Paradex 要求 Python 3.9 - 3.12
- 其他交易所需要 Python 3.8 及以上
- **最佳選項是 Python 3.10 - 3.12**

### 克隆專案

```bash
git clone <repository-url>
cd perp-dex-tools
```

### 建立虛擬環境

```bash
# 確保不在任何虛擬環境中
deactivate

# 建立虛擬環境
python3 -m venv env

# 啟動虛擬環境（每次使用腳本時都需要）
source env/bin/activate  # Windows: env\Scripts\activate
```

### 安裝依賴

```bash
# 確保不在任何虛擬環境中
deactivate

# 啟動虛擬環境
source env/bin/activate  # Windows: env\Scripts\activate

# 安裝基本依賴
pip install -r requirements.txt
```

**GRVT 使用者**需額外安裝：

```bash
pip install grvt-pysdk
```

**Paradex 使用者**需建立專用虛擬環境：

```bash
# 確保不在任何虛擬環境中
deactivate

# 建立 Paradex 專用虛擬環境
python3 -m venv para_env

# 啟動虛擬環境
source para_env/bin/activate  # Windows: para_env\Scripts\activate

# 安裝 Paradex 依賴
pip install -r para_requirements.txt
```

**Apex 使用者**需額外安裝：

```bash
pip install -r apex_requirements.txt
```

### 環境變數設定

在專案根目錄建立 `.env` 檔案，使用 `env_example.txt` 作為範本，修改為你的 API 金鑰。

---

## 策略概述

### 重要提醒

**請務必先理解腳本的邏輯和風險**，這樣才能設定更適合自己的參數，或者評估這是否是你想用的策略。作者不是為了分享而寫這些腳本，而是真的在用這個腳本，所以才寫了，然後順便分享出來。

這個腳本主要看長期下來的磨損，只要腳本持續開單，如果一個月後價格到你被套的最高點，那麼這一個月的交易量就都是零磨損的了。所以作者認為如果把 `--quantity` 和 `--wait-time` 設定得太小，並不是一個好的長期策略，但確實適合短期內高強度衝交易量。作者自己一般用 40 到 60 的 `quantity`，450 到 650 的 `wait-time`，以此來保證即使市場和判斷相反，腳本依然能夠持續穩定地下單，直到價格回到開單點，實現零磨損刷交易量。

### 交易流程

1. **訂單下單**：在市場價格附近下限價單
2. **訂單監控**：等待訂單成交
3. **平倉訂單**：在止盈水平自動下平倉單
4. **持倉管理**：監控持倉和活躍訂單
5. **風險管理**：限制最大並發訂單數
6. **網格步長控制**：透過 `--grid-step` 參數控制新訂單與現有平倉訂單之間的最小價格距離
7. **停止交易控制**：透過 `--stop-price` 參數控制停止交易的價格條件

### 交易流程範例

假設當前 ETH 價格為 $2000，設定止盈為 0.02%：

1. **開倉**：在 $2000.40 下買單（略高於市價）
2. **成交**：訂單被市場成交，獲得多頭倉位
3. **平倉**：立即在 $2000.80 下賣單（止盈價格）
4. **完成**：平倉單成交，獲得 0.02% 利潤
5. **重複**：繼續下一輪交易

---

## 關鍵參數說明

| 參數 | 說明 |
|------|------|
| `--exchange` | 使用的交易所（edgex、backpack、paradex、aster、lighter、grvt、extended、apex、nado） |
| `--ticker` | 標的資產符號（如 ETH、BTC、SOL），合約 ID 自動解析 |
| `--quantity` | 每筆訂單的交易數量（預設：0.1） |
| `--direction` | 交易方向：buy（看多）或 sell（看空），預設為 buy |
| `--take-profit` | 止盈百分比（如 0.02 表示 0.02%） |
| `--max-orders` | 最大同時活躍訂單數，用於風險控制（預設：40） |
| `--wait-time` | 訂單間等待時間（秒），避免過於頻繁交易（預設：450） |
| `--grid-step` | 網格步長控制，防止平倉訂單過於密集（預設：-100，表示無限制） |
| `--stop-price` | 當市場價格達到該價格時退出腳本（預設：-1，表示不會因價格停止） |
| `--pause-price` | 當市場價格達到該價格時暫停腳本（預設：-1） |
| `--boost` | 啟用 Boost 模式進行交易量提升（僅適用於 aster 和 backpack） |
| `--env-file` | 帳戶設定檔（預設：.env） |

### 網格步長功能詳解

`--grid-step` 參數用於控制新訂單的平倉價格與現有平倉訂單之間的最小距離：

- **預設值 -100**：無網格步長限制，按原策略執行
- **正值（如 0.5）**：新訂單的平倉價格必須與最近的平倉訂單價格保持至少 0.5% 的距離
- **作用**：防止平倉訂單過於密集，提高成交機率和風險管理

**範例**：當看多且 `--grid-step 0.5` 時，如果現有平倉訂單價格為 2000 USDT，新訂單的平倉價格必須低於 1990 USDT（2000 × (1 - 0.5%)），這樣可以避免平倉訂單過於接近，提高整體策略效果。

### Boost 模式

Boost 模式的下單邏輯：下 maker 單開倉，成交後立即用 taker 單關倉，以此循環。磨損為一單 maker、一單 taker 的手續費，以及滑點。

---

## 使用範例

### EdgeX 交易所

**ETH 基本交易**：
```bash
python runbot.py --exchange edgex --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450
```

**ETH 帶網格步長控制**：
```bash
python runbot.py --exchange edgex --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450 --grid-step 0.5
```

**ETH 帶停止交易價格控制**：
```bash
python runbot.py --exchange edgex --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450 --stop-price 5500
```

**BTC 交易**：
```bash
python runbot.py --exchange edgex --ticker BTC --quantity 0.05 --take-profit 0.02 --max-orders 40 --wait-time 450
```

### Backpack 交易所

**ETH 永續合約**：
```bash
python runbot.py --exchange backpack --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450
```

**ETH 帶網格步長控制**：
```bash
python runbot.py --exchange backpack --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450 --grid-step 0.3
```

**ETH 啟用 Boost 模式**：
```bash
python runbot.py --exchange backpack --ticker ETH --direction buy --quantity 0.1 --boost
```

### Aster 交易所

**ETH 基本交易**：
```bash
python runbot.py --exchange aster --ticker ETH --quantity 0.1 --take-profit 0.02 --max-orders 40 --wait-time 450
```

**ETH 啟用 Boost 模式**：
```bash
python runbot.py --exchange aster --ticker ETH --direction buy --quantity 0.1 --boost
```

### GRVT 交易所

**BTC 交易**：
```bash
python runbot.py --exchange grvt --ticker BTC --quantity 0.05 --take-profit 0.02 --max-orders 40 --wait-time 450
```

### Extended 交易所

**ETH 交易**：
```bash
python runbot.py --exchange extended --ticker ETH --quantity 0.1 --take-profit 0 --max-orders 40 --wait-time 450 --grid-step 0.1
```

---

## 對沖模式 (Hedge Mode)

新增的對沖模式（`hedge_mode.py`）是一個新的交易策略，透過同時在兩個交易所進行對沖交易來降低風險。

### 對沖模式工作原理

1. **開倉階段**：在選定交易所（如 Backpack）下 maker 訂單
2. **對沖階段**：訂單成交後，立即在 Lighter 下市價訂單進行對沖
3. **平倉階段**：在選定交易所下另一個 maker 訂單平倉
4. **對沖平倉**：在 Lighter 下市價訂單平倉

### 對沖模式優勢

- **風險降低**：透過同時持有相反頭寸，降低單邊市場風險
- **交易量提升**：在兩個交易所同時產生交易量
- **套利機會**：利用兩個交易所之間的價差
- **自動化執行**：全自動化的對沖交易流程

### 對沖模式使用範例

**BTC 對沖模式（Backpack）**：
```bash
python hedge_mode.py --exchange backpack --ticker BTC --size 0.05 --iter 20 --max-position 1
```

**ETH 對沖模式（Extended）**：
```bash
python hedge_mode.py --exchange extended --ticker ETH --size 0.1 --iter 20
```

**BTC 對沖模式（Apex）**：
```bash
python hedge_mode.py --exchange apex --ticker BTC --size 0.05 --iter 20
```

**BTC 對沖模式（GRVT）**：
```bash
python hedge_mode.py --exchange grvt --ticker BTC --size 0.05 --iter 20
```

**BTC 對沖模式（EdgeX）**：
```bash
python hedge_mode.py --exchange edgex --ticker BTC --size 0.001 --iter 20
```

### 對沖模式參數

| 參數 | 說明 |
|------|------|
| `--exchange` | 主要交易所（支援 backpack、extended、apex、grvt、edgex） |
| `--ticker` | 交易對符號（如 BTC、ETH） |
| `--size` | 每筆訂單數量 |
| `--iter` | 交易循環次數 |
| `--fill-timeout` | maker 訂單填充逾時時間（秒，預設 5） |
| `--sleep` | 每一筆交易之後的暫停時間，增加持倉時間（秒，預設 0） |
| `--max-position` | 當設定此參數後，對沖模式會在對沖的同時逐漸建倉到設定的最大倉位，單位是幣本位。達到最大倉位後，會逐漸減倉，以此循環 |

---

## 環境變數設定

### 通用設定

- `ACCOUNT_NAME`：環境變數中當前帳號的名稱，用於多帳號日誌區分，可自訂，非必須

### Telegram 設定（可選）

- `TELEGRAM_BOT_TOKEN`：Telegram 機器人令牌
- `TELEGRAM_CHAT_ID`：Telegram 對話 ID

### EdgeX 設定

- `EDGEX_ACCOUNT_ID`：您的 EdgeX 帳戶 ID
- `EDGEX_STARK_PRIVATE_KEY`：您的 EdgeX API 私鑰
- `EDGEX_BASE_URL`：EdgeX API 基礎 URL（預設：https://pro.edgex.exchange）
- `EDGEX_WS_URL`：EdgeX WebSocket URL（預設：wss://quote.edgex.exchange）

### Backpack 設定

- `BACKPACK_PUBLIC_KEY`：您的 Backpack API Key
- `BACKPACK_SECRET_KEY`：您的 Backpack API Secret

### Paradex 設定

- `PARADEX_L1_ADDRESS`：L1 錢包位址
- `PARADEX_L2_PRIVATE_KEY`：L2 錢包私鑰（點選頭像 → 錢包 → 「複製 paradex 私鑰」）

### Aster 設定

- `ASTER_API_KEY`：您的 Aster API Key
- `ASTER_SECRET_KEY`：您的 Aster API Secret

### Lighter 設定

- `API_KEY_PRIVATE_KEY`：Lighter API 私鑰
- `LIGHTER_ACCOUNT_INDEX`：Lighter 帳戶索引
- `LIGHTER_API_KEY_INDEX`：Lighter API 金鑰索引

**獲取 LIGHTER_ACCOUNT_INDEX 的方法**：

1. 在以下網址最後加上你的錢包位址：`https://mainnet.zklighter.elliot.ai/api/v1/account?by=l1_address&value=`
2. 在瀏覽器中開啟這個網址
3. 在結果中搜尋 "account_index"——如果你有子帳戶，會有多個 account_index，短的是主帳戶，長的是子帳戶

### GRVT 設定

- `GRVT_TRADING_ACCOUNT_ID`：您的 GRVT 交易帳戶 ID
- `GRVT_PRIVATE_KEY`：您的 GRVT 私鑰
- `GRVT_API_KEY`：您的 GRVT API 金鑰

### Extended 設定

- `EXTENDED_API_KEY`：Extended API Key
- `EXTENDED_STARK_KEY_PUBLIC`：建立 API 後顯示的 Stark 公鑰
- `EXTENDED_STARK_KEY_PRIVATE`：建立 API 後顯示的 Stark 私鑰
- `EXTENDED_VAULT`：建立 API 後顯示的 Extended Vault ID

### Apex 設定

- `APEX_API_KEY`：您的 Apex API 金鑰
- `APEX_API_KEY_PASSPHRASE`：您的 Apex API 金鑰密碼
- `APEX_API_KEY_SECRET`：您的 Apex API 金鑰私鑰
- `APEX_OMNI_KEY_SEED`：您的 Apex Omni 金鑰種子

### Nado 設定

- `NADO_PRIVATE_KEY`：您的錢包私鑰
- `NADO_MODE`：網路模式（MAINNET 或 DEVNET，預設：MAINNET）

---

## 風險控制

- **訂單限制**：透過 `max-orders` 限制最大並發訂單數
- **網格控制**：透過 `grid-step` 確保平倉訂單有合理間距
- **下單頻率控制**：透過 `wait-time` 確保下單的時間間隔，防止短時間內被套
- **實時監控**：持續監控持倉和訂單狀態
- **⚠️ 無止損機制**：此策略不包含止損功能，在不利市場條件下可能面臨較大損失

---

## 日誌記錄

該機器人提供全面的日誌記錄：

- **交易日誌**：包含訂單詳情的 CSV 檔案
- **除錯日誌**：帶時間戳記的詳細活動日誌
- **控制台輸出**：即時狀態更新
- **錯誤處理**：全面的錯誤日誌記錄和處理

---

## Q & A

### 如何在同一裝置設定同一交易所的多個帳號？

1. 為每個帳戶建立一個 `.env` 檔案，如 `account_1.env`、`account_2.env`
2. 在每個帳戶的 `.env` 檔案中設定 `ACCOUNT_NAME=`，如 `ACCOUNT_NAME=MAIN`
3. 在每個檔案中設定好每個帳戶的 API key 或私鑰
4. 透過更改命令列中的 `--env-file` 參數來開始不同的帳戶，如：
   ```bash
   python runbot.py --env-file account_1.env [其他參數...]
   ```

### 如何在同一裝置設定不同交易所的多個帳號？

將不同交易所的帳號都設定在同一 `.env` 檔案後，透過更改命令列中的 `--exchange` 參數來開始不同的交易所，如：
```bash
python runbot.py --exchange backpack [其他參數...]
```

### 如何在同一裝置用同一帳號設定同一交易所的多個合約？

將帳號設定在 `.env` 檔案後，透過更改命令列中的 `--ticker` 參數來開始不同的合約，如：
```bash
python runbot.py --ticker ETH [其他參數...]
```

---

## 貢獻與授權

### 貢獻方式

1. Fork 專案
2. 建立功能分支
3. 進行更改
4. 如適用，新增測試
5. 提交 Pull Request

### 分享說明

歡迎分享本專案！如果您要分享或修改此程式碼，請務必包含對原始專案的引用。我們鼓勵開源社群的發展，但請保持對原作者工作的尊重和認可。

### 授權

本專案採用非商業授權——詳情請參閱 LICENSE 檔案。

**重要提醒**：本軟體僅供個人學習和研究使用，嚴禁用於任何商業用途。如需商業使用，請聯絡作者獲取商業授權。

---

## 免責聲明

**本軟體僅供教育和研究目的。加密貨幣交易涉及重大風險，可能導致重大財務損失。使用風險自負，切勿用您無法承受損失的資金進行交易。**
