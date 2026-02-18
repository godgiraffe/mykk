# Sui 套利機器人開源：MoveVM 模擬器與跨 DEX 套利策略

> **來源**: [@Fried_rice](https://x.com/Fried_rice/status/1907510713251426455) | [原文連結](https://github.com/fuzzland/sui-mev?id=1)
>
> **日期**: Wed Apr 02 19:09:28 +0000 2025
>
> **標籤**: `Sui` `套利交易` `開源工具`

---

> **來源**: [@Fried_rice (Chaofan Shou)](https://twitter.com/Fried_rice)  
> **日期**: 2026-02-18  
> **標籤**: `Sui` `套利機器人` `MEV` `開源專案` `MoveVM模擬器`

---

## 專案概述

這是一個開源的 Sui 套利機器人專案，已實現超過 $200k 的套利收益。該機器人支援跨多個去中心化交易所（DEX）進行套利操作，並包含一個用 Rust 編寫的 MoveVM 模擬器，可以 fork 鏈並更快速地模擬交易。

**專案連結**: https://github.com/fuzzland/sui-mev

## 支援的 DEX 平台

該機器人可以在以下 DEX 之間進行套利：

- Cetus Protocol (@CetusProtocol)
- Navi Protocol (@navi_protocol)
- Aftermath (@AftermathFi)
- DeepBook (@DeepBookonSui)
- Turbos Finance (@Turbos_finance)
- Kriya DEX (@KriyaDEX)
- BlueMove
- FlowX
- Abex
- Shio

## 核心技術特點

### MoveVM 模擬器

專案自建了一個基於 Rust 的 MoveVM 模擬器，具備以下能力：

- **鏈分叉（Chain Fork）**：可以複製當前鏈狀態
- **快速交易模擬**：在本地環境快速模擬交易執行結果
- 提升套利策略的回測和驗證速度

## 專案現狀

由於以下原因，該專案已停止維護：

1. **缺乏工程師資源**：開發團隊人力不足
2. **鏈上競爭激烈**：套利機會減少，競爭加劇

## 待改進方向

專案目前缺少 **Bellman-Ford 演算法**的實作。若要恢復盈利能力，需要實作該演算法來優化套利路徑搜尋。

Bellman-Ford 演算法可用於：
- 在多個 DEX 之間尋找負權重環（套利機會）
- 處理更複雜的跨池套利路徑
- 提高套利路徑發現的準確性

## 使用方式

### 啟動套利機器人

```bash
cargo run -r --bin arb start-bot -- --private-key {YOUR_PRIVATE_KEY}
```

### 使用中繼器（Relay）

如果你擁有驗證節點（validator），可以讓驗證節點將 mempool 交易推送到中繼器，再轉發給機器人：

```bash
cargo run -r --bin relay
```

## 開源授權

該專案完全開源，開發者可以自由使用、修改和分發程式碼。
