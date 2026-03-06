---
title: "Morpho sUSDe/PT 預言機套利：迴圈貸仓位風險分析"
date: "2024-12-06"
tags: 
  - "Morpho"
  - "Pendle"
  - "預言機設計"
summary: "在 Morpho 協議上發現一個有趣的預言機價格差異現象：sUSDe/PT 在 Pendle 的實際市場價格已經達到 33% APY,但 Morpho 對 PT 的預言機價格是使用自定義的計算方式,按照 15% 的 APR 來計算。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 49
evergreenScore: 43
priorityScore: 61
curationNote: "先快速掃摘要與重點段落，再決定要精選或封存。"
source:
  tweetUrl: "https://x.com/yicenglou1/status/1865018985093460168"
  externalUrl: null
  authorUsername: "yicenglou1"
---

# Morpho sUSDe/PT 預言機套利：迴圈貸仓位風險分析

> **來源**: [@yicenglou1](https://x.com/yicenglou1/status/1865018985093460168)
>
> **日期**: Fri Dec 06 13:02:31 +0000 2024
>
> **標籤**: `Morpho` `Pendle` `預言機設計`

---

> **來源**: [@yicenglou1 (AntiDefi)](https://twitter.com/yicenglou1)
> **日期**: 2026-02-18
> **標籤**: `Morpho` `Pendle` `PT` `預言機套利` `循環貸款` `清算風險`

---

## 核心發現

在 Morpho 協議上發現一個有趣的預言機價格差異現象：sUSDe/PT 在 Pendle 的實際市場價格已經達到 33% APY,但 Morpho 對 PT 的預言機價格是使用自定義的計算方式,按照 15% 的 APR 來計算。

## 價格差異影響

由於 Morpho 預言機價格與 Pendle 市場價格存在顯著差異:

- **按 Pendle 價格計算**：許多循環貸倉位應該已經觸發清算
- **按 Morpho 預言機價格**：這些倉位目前仍然安全,且幾乎不可能爆倉

## 套利機會

這個價格差異創造了一個低風險的高收益機會:

- 許多使用者頂著清算線進行 10 倍槓桿挖礦
- 實際 APR 達到約 120%
- 由於預言機計算方式,清算風險極低
