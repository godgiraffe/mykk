# GMGN 錢包分析爬蟲工具 - 自動抓取交易統計與記錄

> **來源**: [@cbd1913](https://x.com/cbd1913/status/1914680285423395238) | [原文連結](https://github.com/a00012025/crawler-scripts)
>
> **日期**: 
>
> **標籤**: `量化交易` `工具開發` `Solana 錢包`

---

> **來源**: [@cbd1913 (Harry C)](https://twitter.com/cbd1913)
> **日期**: 2026-02-18
> **標籤**: `GMGN` `Solana` `爬蟲` `錢包分析` `量化工具`

---

## 專案簡介

這是一個開源的自動化爬蟲腳本，可以訪問 GMGN.ai 網站並獲取 Solana 錢包的勝率統計和交易記錄。只要輸入錢包地址就可以爬出統計資料（勝率、交易次數）和交易紀錄，也可以一次爬多個錢包地址的資料。

GitHub 專案：https://github.com/a00012025/crawler-scripts

## 功能特點

- 自動訪問 GMGN.ai 上指定錢包地址的頁面
- 自動處理網頁操作（關閉彈窗、點擊按鈕等）
- 抓取錢包的統計數據和持倉資訊
- 支持批量分析多個錢包地址
- 可選擇保持瀏覽器開啟以便調試

## 安裝要求

在使用前，需要安裝以下依賴：

```bash
pip install -r requirements.txt
```

主要依賴：
- undetected-chromedriver >= 3.5.0
- selenium >= 4.10

## 使用方法

### 基本用法

分析單個錢包地址：

```bash
python wallet_analysis.py <錢包地址>
```

分析多個錢包：

```bash
python wallet_analysis.py <錢包地址1> <錢包地址2> <錢包地址3> ...
```

### 命令行參數

- `<錢包地址>`：一個或多個要分析的 Solana 錢包地址
- `keep_open`：分析完成後保持瀏覽器開啟（用於調試）
- `clean`：只輸出乾淨的 JSON 數據，不輸出調試信息

### 使用示例

**分析單個錢包地址：**

```bash
python wallet_analysis.py 8zab1batbJZZz5MnawzLz3MqkWJBP9LF4AdZCE3y2JJF
```

**分析多個錢包地址並保持瀏覽器開啟：**

```bash
python wallet_analysis.py 8zab1batbJZZz5MnawzLz3MqkWJBP9LF4AdZCE3y2JJF 4Xky4NEi6rPsLzQxNhZ3JvKnasocUL4cT3x4fso76qxN keep_open
```

**只輸出乾淨的 JSON 數據（適合後續處理）：**

```bash
python wallet_analysis.py 8zab1batbJZZz5MnawzLz3MqkWJBP9LF4AdZCE3y2JJF clean
```

## 輸出數據

腳本將輸出 JSON 格式的數據，包含每個錢包的：

- `wallet_summary`：錢包的統計摘要，包括勝率等信息
- `wallet_holdings`：錢包交易過的代幣信息

如果發生錯誤，將返回錯誤信息。

## 應用場景

這個工具適合用來尋找適合跟單的錢包地址，透過批量分析錢包的歷史交易記錄和勝率，篩選出表現優異的交易者進行跟單操作。
