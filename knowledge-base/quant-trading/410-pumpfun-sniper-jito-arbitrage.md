# 自製 Pump Fun 狙擊槍：Solana 鏈上 PvP 交易指南

> **來源**: [@InkyWang](https://x.com/InkyWang/status/1844770938577182736) | [原文連結](https://chainbuff.com/d/12)
>
> **日期**: Fri Oct 11 16:04:00 +0000 2024
>
> **標籤**: `狙擊交易` `Pump Fun` `Jito MEV`

---

> **來源**: [@InkyWang (Inky | IBRL)](https://twitter.com/InkyWang)
> **日期**: 2026-02-18
> **標籤**: `Solana` `Pump.fun` `狙擊` `交易機器人` `Geyser` `Jito` `DeFi`

---

## 概述

本文教學如何開發一個 Pump.fun 狙擊機器人，在 Solana 鏈上進行極致的 PvP 交易。主要實作內容包括：

1. 基於 Geyser gRPC 監聽 Pump 新流動池創建
2. 獲取買入和賣出新流動池代幣所需要的帳戶
3. 基於 Jito 上鏈的買入操作
4. 賣出操作的實現

## 技術重點

### 1. 監聽新流動池

使用 **Geyser gRPC** 服務監聽 Pump.fun 上新創建的流動池。這是狙擊交易的第一步，需要即時捕捉新池創建事件。

### 2. 帳戶準備

在執行買入和賣出操作前，必須先獲取以下關鍵帳戶：
- 新流動池代幣的相關帳戶地址
- 交易所需的授權帳戶
- 用戶錢包相關帳戶

### 3. Jito 快速上鏈

採用 **Jito** 服務進行交易提交，確保買入交易能夠快速上鏈，搶佔先機。Jito 是 Solana 上的 MEV（Maximum Extractable Value）基礎設施，可以提供更快的交易確認速度。

### 4. 賣出策略

實現自動化的賣出邏輯，完成完整的交易循環。

## 參考資料

完整技術文檔：https://t.co/tn1xUMFdaB
