# awesome-go-quant：Go 量化交易資源庫

> **來源**: [@0xKaKa03](https://x.com/0xKaKa03/status/1952296615164924375) | [原文連結](https://github.com/goex-top/awesome-go-quant)
>
> **日期**: Mon Aug 04 09:12:39 +0000 2025
>
> **標籤**: `Go 語言` `量化交易` `開發工具`

---

> **來源**: [@0xKaKa03 (Sliipy⚡)](https://twitter.com/0xKaKa03)
> **日期**: 2026-02-18
> **標籤**: `量化交易` `Golang` `開源資源` `交易工具`

---

## 專案簡介

awesome-go-quant 是一個精心整理的 Go 語言量化金融資源庫，收錄了大量用於量化交易（Quantitative Finance）的 Go 語言函式庫、套件和資源。

**專案連結**: [goex-top/awesome-go-quant](https://github.com/goex-top/awesome-go-quant)

- ⭐ Stars: 280
- 🍴 Forks: 26
- 👀 Watchers: 8

## 資源分類

### Golang 數值計算函式庫與資料結構

| 專案 | 說明 |
|------|------|
| gonum | Go 語言的數值計算函式庫集合，包含矩陣、統計、優化等功能 |
| dataframe-go | 用於統計和資料操作/探索的 DataFrame |
| gota | Go 語言的 DataFrames 和資料整理工具 |
| GoDataframe | 類似 Python pandas 的 Go 語言實作，用於回測策略系統 |
| GoDS | Go 資料結構函式庫，包含 Sets、Lists、Stacks、Maps、Trees、Queues 等 |

### 統計學工具

| 專案 | 說明 |
|------|------|
| gonum/stats | Go 語言的統計套件 |
| stats | 用於抽象統計收集的 Go 套件 |
| stats | 經過完整測試的綜合性 Golang 統計函式庫，無外部依賴 |
| gostats | Stats 的 Go 客戶端 |

### 限速器

| 專案 | 說明 |
|------|------|
| rate | Go 語言的時間限速器 |

### 訂單簿實作

| 專案 | 說明 |
|------|------|
| go-hft-orderbook | 用於加密貨幣交易所高頻交易的限價訂單簿（LOB）Golang 實作 |

### 技術指標

| 專案 | 說明 |
|------|------|
| go-talib | TA-Lib 的純 Go 語言移植版本 |
| talib-cdl-go | TA-Lib 蠟燭圖識別模組（CDL）的純 Go 語言移植版本 |

### 機器學習

| 專案 | 說明 |
|------|------|
| sklearn | 將 sklearn 的部分功能移植到 Go 語言 |
| gorgonia | 協助在 Go 語言中進行機器學習的函式庫 |

### 交易與回測工具

| 專案 | 說明 |
|------|------|
| goex | 支援多個交易所的 Rest 和 WebSocket API 的 Golang 封裝，包括 OKCoin、OKEx、Huobi、HBDM、BitMEX、CoinEx、Poloniex、Bitfinex、Bitstamp、Binance、Kraken、Bithumb、ZB、HitBTC、Fcoin、CoinBene |
| goex_backtest | goex 訂單簿回測工具 |
| crex | Golang 加密貨幣交易 API 和函式庫，支援 Binance、BitMEX、Deribit、Bybit、Huobi DM、OKEX Futures 等 |
| gobacktest | 用 Golang 編寫的事件驅動回測框架 |
| gocryptotrader | 用 Golang 編寫的加密貨幣交易機器人和框架，支援多個交易所 |

### 市場資料

| 專案 | 說明 |
|------|------|
| finance-go | 用 Go 語言實作的金融市場資料函式庫 |
| go-quote | Yahoo Finance/Google Finance/Coinbase/Bittrex/Binance/Tiingo 歷史報價下載函式庫和 CLI 工具 |

### 風險分析

- 風險分析相關工具（待補充）

### 因子分析

- 因子分析相關工具（待補充）

### 時間序列

- 時間序列分析工具（待補充）

### 資料來源

- 各類資料來源整合工具（待補充）

### Excel 整合

- Excel 資料整合工具（待補充）

### 圖表/繪圖

| 專案 | 說明 |
|------|------|
| plot | 用於繪圖和視覺化資料的儲存庫 |
| go-chart | 原生 Golang 的基本圖表函式庫 |
| go-echarts | Golang 的可愛圖表函式庫 |

### 演算法

| 專案 | 說明 |
|------|------|
| algorithm-pattern | 演算法模板，最科學的刷題方式，最快速的刷題路徑 |
| 數據結構和算法 | 資料結構和演算法（Golang 實作）|

### 學習資源

| 專案 | 說明 |
|------|------|
| go-training | 每天學習 Golang |

### 開發工具

| 專案 | 說明 |
|------|------|
| gophernotes | Jupyter notebooks 和 nteract 的 Go kernel |

### 網頁爬蟲

| 專案 | 說明 |
|------|------|
| colly | 優雅的 Golang 爬蟲和抓取框架 |
| goquery | 類似 jQuery 的 Go 語言工具 |
| req | 具有黑魔法的簡單 Go HTTP 客戶端 |
| chromedp | 支援 Chrome DevTools Protocol 的更快、更簡單的瀏覽器驅動工具 |
| rod | 用於網頁自動化和爬蟲的 Chrome DevTools Protocol 驅動 |

### 情感分析工具

| 專案 | 說明 |
|------|------|
| centiment | 透過 Google Natural Language 和 Twitter 進行加密貨幣情感分析 |
| tsignal | 分析社交媒體情感及其對股市的影響 |
| Twitter sentiment | Twitter 情感分類器 |
| sentiment | Golang 的簡單情感分析 |
| goml | Go 語言的線上機器學習（及更多功能）|
| sentiment-server | 簡單的模組化語言情感微服務 |
| sentiment | 簡單的記憶體內情感分析套件 |
| homo | 基於離線喚醒、自然語言理解和情感分析的開源自然互動系統 |
| govader | Go 語言的 vader 情感分析 |
| sentiment | 情感分析，判斷公司是否要倒閉 |
| tfeel | Twitter 情感分析 |

### GoQuant 框架

GoQuant 是一個強大的 Go 框架，專為金融資料分析和視覺化設計，沒有邊界限制！

---

★ Insight ─────────────────────────────────────
- awesome-go-quant 提供了完整的 Go 量化交易生態系統，從底層數值計算到上層交易策略都有涵蓋
- 特別關注訂單簿實作（go-hft-orderbook）和多交易所整合（goex），這是量化交易的核心基礎設施
- 情感分析工具豐富，顯示社交媒體情緒對交易決策的重要性日益增加
─────────────────────────────────────────────────
