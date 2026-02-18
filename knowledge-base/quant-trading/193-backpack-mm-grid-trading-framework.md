# Backpack 做市與網格交易框架

> **來源**: [@practice_y11](https://x.com/practice_y11/status/1940418624155713758) | [原文連結](https://github.com/yanowo/Backpack-MM-Simple)
>
> **日期**: Wed Jul 02 14:33:45 +0000 2025
>
> **標籤**: `做市策略` `多交易所` `量化交易`

---

![](../assets/quant-trading/193-backpack-mm-grid-trading-framework-1.jpg)

## 專案簡介

這是一個支援對沖與做市策略的加密貨幣交易框架，具備多交易所自助接入與自訂策略擴充能力。系統內建自動化做市功能，可透過維持買賣價差獲取穩定收益。使用邀請連結可獲得 10~35% 自返傭（由官方自動發放）。

## 支援的交易所與功能

| 交易所 | 現貨做市 | 永續做市 | 永續對沖 | 現貨網格 | 合約網格 | 邀請連結 |
|--------|----------|----------|----------|----------|----------|----------|
| Backpack | ✅ | ✅ | ✅ | ✅ | ✅ | [註冊連結](https://backpack.exchange/refer/yan-practice) |
| Aster | ❌ | ✅ | ✅ | ❌ | ✅ | [註冊連結](https://aster.exchange/signup?r=PracticeY11) |
| Paradex | ❌ | ✅ | ✅ | ❌ | ✅ | [註冊連結](https://app.paradex.trade/onboarding) |
| Lighter | ❌ | ✅ | ✅ | ❌ | ✅ | [註冊連結](https://lighter.xyz) |
| APEX | ❌ | ✅ | ✅ | ❌ | ✅ | [註冊連結](https://omni.apex.exchange) |
| StandX | ❌ | ✅ | ✅ | ❌ | ✅ | [註冊連結](https://standx.com) |

## 功能特點

- **Web 控制台**：直觀的圖形化界面，實時監控交易狀態和策略表現
- **多交易所架構**：支援 Backpack、Aster、Paradex、Lighter、APEX、StandX，可擴展至其他交易所
- **四種策略模式**：
  - **現貨做市**：多層訂單 + 智能重平衡
  - **永續做市**：倉位管理 + 風險中性
  - **永續對沖**：Maker 掛單成交後立即反向平倉
  - **網格交易**：區間震盪 + 自動套利
- **增強日誌系統**：詳細的市場狀態和策略追蹤
- **WebSocket 實時連接**：即時市場數據和訂單更新
- **可選資料庫紀錄**：根據需求啟用或停用資料庫寫入以兼顧效能

## 專案結構

```
lemon_trader/
│
├── api/                      # API相關模塊
│   ├── __init__.py
│   ├── auth.py              # API認證和簽名相關
│   ├── base_client.py       # 抽象基礎客戶端 (支持繼承開發接入任意交易所)
│   ├── bp_client.py         # Backpack Exchange 客戶端
│   ├── aster_client.py      # Aster Exchange 客戶端
│   ├── paradex_client.py    # Paradex Exchange 客戶端 (含 JWT 認證)
│   ├── lighter_client.py    # Lighter Exchange 客戶端
│   └── apex_client.py       # APEX Omni Exchange 客戶端 (zkLink 簽名)
│
├── ws_client/               # WebSocket模塊
│   ├── __init__.py
│   └── client.py            # WebSocket客戶端
│
├── database/                # 數據庫模塊
│   ├── __init__.py
│   └── db.py                # 數據庫操作
│
├── strategies/              # 策略模塊
│   ├── __init__.py
│   ├── market_maker.py      # 現貨做市策略
│   ├── perp_market_maker.py # 永續合約做市策略
│   └── maker_taker_hedge.py # Maker-Taker 對沖策略
│
├── utils/                   # 工具模塊
│   ├── __init__.py
│   └── helpers.py           # 輔助函數
│
├── cli/                     # 命令行界面
│   ├── __init__.py
│   └── commands.py          # 命令行命令
│
├── web/                     # Web 控制台界面
│   ├── __init__.py
│   ├── server.py            # Flask Web 服務器
│   ├── templates/           # HTML 模板
│   │   └── index.html
│   └── static/              # 靜態資源 (CSS, JS)
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── app.js
│
├── docs/                    # 策略文檔
│   ├── SPOT_MARKET_MAKING.md    # 現貨做市策略說明
│   ├── PERP_MARKET_MAKING.md    # 永續合約做市策略說明
│   └── MAKER_TAKER_HEDGE.md     # Maker-Taker 對沖策略說明
│
├── config.py                # 配置文件
├── logger.py                # 日誌配置
├── run.py                   # 統一入口文件
└── README.md                # 說明文檔
```

## 環境要求

- Python 3.8 或更高版本（暫不支持 3.13 以上版本）
- 所需第三方庫：
  - PyNaCl
  - requests
  - websocket-client
  - numpy
  - python-dotenv
  - starknet-py
  - flask
  - flask-socketio
  - python-socketio

## 安裝步驟

### 1. 克隆代碼庫

```bash
git clone https://github.com/yanowo/Backpack-MM-Simple.git
cd Backpack-MM-Simple
```

### 2. 安裝依賴

```bash
pip install -r requirements.txt
```

### 3. 設置環境變數

複製 `.env.example` 為 `.env` 並添加配置：

```bash
# ==================== 全局代理配置 ====================
# HTTP/HTTPS 代理（支持所有交易所：Backpack、Aster、Paradex、Lighter、APEX）
# 格式: http://USER:PASS@HOST:PORT 或 https://USER:PASS@HOST:PORT
# 若不需要代理，留空即可
HTTP_PROXY=
HTTPS_PROXY=

# Backpack Exchange
BACKPACK_KEY=your_backpack_api_key
BACKPACK_SECRET=your_backpack_secret_key
BASE_URL=https://api.backpack.work

# Aster Exchange
ASTER_API_KEY=your_aster_api_key
ASTER_SECRET_KEY=your_aster_secret_key

# Paradex Exchange (使用 Paradex 賬戶認證)
# 需先登入 Paradex 使用 Paradex 地址與私鑰
PARADEX_PRIVATE_KEY=your_paradex_private_key
PARADEX_ACCOUNT_ADDRESS=your_paradex_account_address
PARADEX_BASE_URL=https://api.prod.paradex.trade/v1

# Lighter Exchange
LIGHTER_PRIVATE_KEY=your_private_key
LIGHTER_PUBLIC_KEY=your_public_key
LIGHTER_API_KEY_INDEX=your_API_key_index
LIGHTER_ADDRESS=<your_wallet_address (ignored if LIGHTER_ACCOUNT_INDEX is set)>
# 如果使用主賬戶，直接將錢包地址填入 LIGHTER_ADDRESS 環境變量即可，無需查找 account_index
# 如果你需要使用子賬戶，請按照以下步驟查找 account_index
# 請在瀏覽器中打開 https://mainnet.zklighter.elliot.ai/api/v1/account?by=l1_address&value=你的錢包地址
# 在返回結果中搜索 "account_index"手動查找並填寫對應的 account_index
LIGHTER_ACCOUNT_INDEX=
LIGHTER_BASE_URL=https://mainnet.zklighter.elliot.ai

# APEX Omni Exchange
# 需先登入 APEX 並在 Key Management 頁面獲取 API 密鑰和 zkKey Seeds
# https://omni.apex.exchange/keyManagement
APEX_API_KEY=your_apex_api_key
APEX_SECRET_KEY=your_apex_secret_key
APEX_PASSPHRASE=your_apex_passphrase
APEX_ZK_SEEDS=your_apex_zk_seeds

# StandX Perps Exchange
# 需先在 StandX 生成 API Token (JWT) 與 Request Sign Key
STANDX_API_TOKEN=your_standx_api_token
STANDX_PRIVATE_KEY=your_standx_signing_key_base64
STANDX_BASE_URL=https://perps.standx.com
STANDX_WS_URL=wss://perps.standx.com/ws-stream/v1
STANDX_SESSION_ID=  # Optional

# Optional Features
# ENABLE_DATABASE=1  # 啟用資料庫寫入 (預設0關閉)

# Web 服務器配置
# 主機地址（127.0.0.1 為僅本機訪問）
WEB_HOST=127.0.0.1
# Web 服務器端口號（如果端口被佔用，會自動在 5001-6000 範圍內尋找可用端口）
WEB_PORT=5000
# 調試模式（true 開啟，false 關閉）
WEB_DEBUG=false
```

## 使用方法

本程序提供三種運行模式，您可以根據需求選擇：

### 運行模式說明

| 模式 | 命令 | 適用場景 | 特點 |
|------|------|----------|------|
| Web 控制台 | `python run.py --web` | 可視化操作和監控 | 圖形界面、實時數據、易於上手 |
| 命令行界面 (CLI) | `python run.py --cli` | 交互式配置 | 菜單導航、逐步配置、適合測試 |
| 快速啟動 | `python run.py [參數]` | 自動化運行 | 直接啟動、適合腳本化部署 |

**推薦順序**：新手建議先用 Web 控制台熟悉功能 → CLI 測試參數 → 快速啟動自動化運行

## 模式一：Web 控制台

程序提供了直觀的 Web 控制台界面，方便可視化管理和監控交易策略。

### 啟動步驟

```bash
# 啟動 Web 服務器（默認端口 5000）
python run.py --web
```

### 訪問控制台

啟動後，在瀏覽器中訪問：`http://localhost:5000`

### Web 界面功能

- **實時監控**：查看交易統計、餘額、盈虧等實時數據（每5秒更新）
- **策略管理**：啟動/停止做市策略，支持多種策略類型
- **參數配置**：
  - 交易所選擇（Backpack、Aster、Paradex、Lighter、APEX、StandX）
  - 市場類型（現貨 / 永續合約）
  - 策略類型（標準做市 / Maker-Taker 對沖）
  - 交易對、價差、訂單數量等
  - 永續合約參數（目標倉位、最大倉位、止損止盈等）
  - 現貨重平衡參數
- **數據展示**：
  - 當前價格和餘額（只顯示報價資產 USDT/USDC/USD）
  - 交易統計（買賣筆數、成交量、手續費）
  - 盈虧分析（已實現/未實現盈虧、累計盈虧、磨損率）
  - 運行時間統計

### 使用示例

1. 啟動 Web 服務器
2. 在瀏覽器打開控制台
3. 配置環境變量（API Key 需提前在 `.env` 文件中設置）
4. 選擇交易所和交易對
5. 設置策略參數
6. 點擊「啟動機器人」開始交易
7. 實時查看交易狀態和統計數據
8. 需要停止時點擊「停止機器人」

### 注意事項

- Web 服務器需要持續運行以監控策略
- API 密鑰通過環境變量讀取，不會在 Web 界面中顯示
- 停止策略後統計數據會保留，方便查看最終結果

## 模式二：命令行界面 (CLI)

交互式命令行界面，提供菜單導航和逐步配置。

### 啟動步驟

```bash
python run.py --cli
```

### 主要功能

- **1 - 查詢餘額**：查看所有已配置交易所的資產餘額
- **2 - 查詢訂單簿**：查看指定交易對的買賣盤口
- **3 - 下單**：手動下單測試
- **4 - 取消訂單**：取消指定訂單
- **5 - 執行做市策略**：交互式配置並啟動做市策略
- **6 - 查看市場信息**：查看交易對詳細信息
- **7 - 查看波動率**：分析市場波動率
- **8 - 重平設置管理**：查看和測試重平衡配置
- **9 - 資料庫管理**：切換資料庫寫入功能
- **0 - 退出**：退出程序

**適合場景**：參數測試、功能驗證、逐步配置

## 模式三：快速啟動

直接通過命令行參數啟動策略，適合自動化部署和腳本運行。

### 快速示例

#### BackPack 現貨做市
```bash
python run.py --exchange backpack --symbol SOL_USDC --spread 0.01 --max-orders 3 --duration 3600 --interval 60
```

#### BackPack Maker-Taker 現貨對沖
```bash
python run.py --exchange backpack --symbol SOL_USDC --spread 0.01 --strategy maker_hedge --duration 3600 --interval 30
```

#### BackPack 永續做市
```bash
python run.py --exchange backpack --market-type perp --symbol SOL_USDC_PERP --spread 0.01 --quantity 0.1 --max-orders 2 --target-position 0 --max-position 5 --position-threshold 2 --inventory-skew 0 --stop-loss -1 --take-profit 5 --duration 3600 --interval 10
```

#### BackPack Maker-Taker 永續對沖
```bash
python run.py --exchange backpack --market-type perp --symbol SOL_USDC_PERP --spread 0.01 --quantity 0.1 --strategy maker_hedge --target-position 0 --max-position 5 --position-threshold 2 --duration 3600 --interval 8
```

#### Aster 永續做市
```bash
python run.py --exchange aster --market-type perp --symbol SOLUSDT --spread 0.01 --quantity 0.1 --max-orders 2 --target-position 0 --max-position 5 --position-threshold 2 --inventory-skew 0 --stop-loss -1 --take-profit 5 --duration 3600 --interval 10
```

#### Aster Maker-Taker 永續對沖
```bash
python run.py --exchange aster --market-type perp --symbol SOLUSDT --spread 0.01 --quantity 0.1 --strategy maker_hedge --target-position 0 --max-position 5 --position-threshold 2 --duration 3600 --interval 15
```

#### Paradex 永續做市
```bash
python run.py --exchange paradex --market-type perp --symbol BTC-USD-PERP --spread 0.01 --quantity 0.001 --max-orders 2 --target-position 0 --max-position 1 --position-threshold 0.1 --inventory-skew 0 --stop-loss -10 --take-profit 20 --duration 3600 --interval 10
```

#### Paradex Maker-Taker 對沖
```bash
python run.py --exchange paradex --market-type perp --symbol BTC-USD-PERP --spread 0.01 --quantity 0.001 --strategy maker_hedge --target-position 0 --max-position 1 --position-threshold 0.1 --duration 3600 --interval 8
```

#### Lighter 永續做市
```bash
python run.py --exchange lighter --market-type perp --symbol BTC --spread 0.01 --quantity 0.001 --max-orders 2 --target-position 0 --max-position 1 --position-threshold 0.1 --inventory-skew 0 --stop-loss -10 --take-profit 20 --duration 3600 --interval 10
```

#### Lighter Maker-Taker 對沖
```bash
python run.py --exchange lighter --market-type perp --symbol BTC --spread 0.01 --quantity 0.001 --strategy maker_hedge --target-position 0 --max-position 1 --position-threshold 0.1 --duration 3600 --interval 8
```

#### APEX 永續做市
```bash
python run.py --exchange apex --market-type perp --symbol BTCUSDT --spread 0.01 --quantity 0.001 --max-orders 2 --target-position 0 --max-position 1 --position-threshold 0.1 --inventory-skew 0 --stop-loss -10 --take-profit 20 --duration 3600 --interval 10
```

#### APEX Maker-Taker 對沖
```bash
python run.py --exchange apex --market-type perp --symbol BTCUSDT --spread 0.01 --quantity 0.001 --strategy maker_hedge --target-position 0 --max-position 1 --position-threshold 0.1 --duration 3600 --interval 8
```

#### StandX 永續做市
```bash
python run.py --exchange standx --market-type perp --symbol BTC-USD --spread 0.01 --quantity 0.001 --max-orders 2 --target-position 0 --max-position 1 --position-threshold 0.1 --inventory-skew 0 --stop-loss -10 --take-profit 20 --duration 3600 --interval 10
```

#### StandX Maker-Taker 對沖
```bash
python run.py --exchange standx --market-type perp --symbol BTC-USD --spread 0.01 --quantity 0.001 --strategy maker_hedge --target-position 0 --max-position 1 --position-threshold 0.1 --duration 3600 --interval 8
```

#### BackPack 現貨網格交易（自動價格範圍）
```bash
python run.py --exchange backpack --symbol SOL_USDC --strategy grid --auto-price --grid-num 10 --quantity 0.1 --duration 3600 --interval 60
```

#### BackPack 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange backpack --market-type perp --symbol SOL_USDC_PERP --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.1 --max-position 2.0 --duration 3600 --interval 60
```

#### Aster 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange aster --market-type perp --symbol SOLUSDT --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.1 --max-position 2.0 --duration 3600 --interval 60
```

#### Paradex 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange paradex --market-type perp --symbol BTC-USD-PERP --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.001 --max-position 1.0 --duration 3600 --interval 60
```

#### Lighter 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange lighter --market-type perp --symbol BTC --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.001 --max-position 1.0 --duration 3600 --interval 60
```

#### APEX 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange apex --market-type perp --symbol BTCUSDT --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.001 --max-position 1.0 --duration 3600 --interval 60
```

#### StandX 永續合約網格交易（自動價格範圍）
```bash
python run.py --exchange standx --market-type perp --symbol BTC-USD --strategy perp_grid --grid-type neutral --auto-price --price-range 5 --grid-num 10 --quantity 0.001 --max-position 1.0 --duration 3600 --interval 60
```

**適合場景**：自動化部署、定時任務、批量運行

## 策略文檔

詳細的策略說明、參數配置和最佳實踐：

- [現貨做市策略](https://github.com/yanowo/Backpack-MM-Simple/blob/main/docs/SPOT_MARKET_MAKING.md) - 多層訂單、智能重平衡
- [永續合約做市策略](https://github.com/yanowo/Backpack-MM-Simple/blob/main/docs/PERP_MARKET_MAKING.md) - 倉位管理、風險中性
- [Maker-Taker 對沖策略](https://github.com/yanowo/Backpack-MM-Simple/blob/main/docs/MAKER_TAKER_HEDGE.md) - 即時對沖、零持倉
- 網格交易策略 - 區間震盪、自動套利

## 命令行參數概覽

### 基本參數

- `--api-key`：API 密鑰（可選，默認使用環境變數）
- `--secret-key`：API 密鑰（可選，默認使用環境變數）
- `--exchange`：交易所選擇（`backpack`、`aster`、`paradex`、`lighter`、`apex`、`standx`）
- `--symbol`：交易對（例如：SOL_USDC）
- `--spread`：價差百分比（例如：0.5）
- `--quantity`：訂單數量（可選）
- `--duration`：運行時間（秒）
- `--interval`：更新間隔（秒）
- `--market-type`：市場類型（`spot` 或 `perp`）
- `--strategy`：策略選擇（`standard` 或 `maker_hedge`）

### 高級參數

- `--enable-db` / `--disable-db`：資料庫寫入控制
- `--target-position`：永續合約目標淨倉位
- `--max-position`：永續合約最大允許淨倉
- `--position-threshold`：永續倉位調整觸發值
- `--inventory-skew`：永續做市報價偏移係數（0-1）
- `--stop-loss`：未實現止損閾值
- `--take-profit`：未實現止盈閾值
- `--enable-rebalance` / `--disable-rebalance`：重平衡控制
- `--base-asset-target`：基礎資產目標比例（0-100）
- `--rebalance-threshold`：重平觸發閾值

## 資料庫寫入選項

- 預設情況下，程式僅在記憶體中追蹤交易統計，不會寫入 SQLite 資料庫
- 透過環境變數 `ENABLE_DATABASE=1` 或命令參數 `--enable-db` 可啟用資料庫寫入
- 使用 `--disable-db` 可臨時停用資料庫
- 當資料庫功能關閉時，相關的歷史統計功能將不可用

## 作者資訊

- Twitter：[@practice_y11](https://twitter.com/practice_y11) (Yan Practice ⭕散修🎒)
- GitHub：[yanowo/Backpack-MM-Simple](https://github.com/yanowo/Backpack-MM-Simple)

## 授權

MIT License
