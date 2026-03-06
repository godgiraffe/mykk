---
title: "幣安現貨量化交易：AWS 東京伺服器延遲優化指南"
date: "2025-02-24"
tags: 
  - "伺服器部署"
  - "交易速度"
  - "基礎設施"
summary: "做幣安現貨量化服務時，如果對速度有要求，可以優先考慮將伺服器放在 AWS 東京的 **Zone C**。"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 47
evergreenScore: 55
priorityScore: 58
curationNote: "先快速掃摘要與重點段落，再決定要精選或封存。"
source:
  tweetUrl: "https://x.com/TuobaW/status/1894016372901912887"
  externalUrl: null
  authorUsername: "TuobaW"
---

# 幣安現貨量化交易：AWS 東京伺服器延遲優化指南

> **來源**: [@TuobaW](https://x.com/TuobaW/status/1894016372901912887)
>
> **日期**: Mon Feb 24 13:27:47 +0000 2025
>
> **標籤**: `伺服器部署` `交易速度` `基礎設施`

---

> **來源**: [@TuobaW (禾山)](https://x.com/TuobaW)  
> **標籤**: `幣安` `量化交易` `AWS` `延遲優化` `伺服器選擇`

---

## AWS 東京區域延遲比較

做幣安現貨量化服務時，如果對速度有要求，可以優先考慮將伺服器放在 AWS 東京的 **Zone C**。

### Ticker 速度排序

**Zone C > Zone D > Zone A**（針對永續合約）

### 延遲差異

- Zone C 比 Zone D 快約 **1.2ms**
- Zone C 比 Zone A 快約 **2.8ms**
