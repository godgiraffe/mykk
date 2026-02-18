# Lead-Lag 套利策略：捕捉小所價格滯後機制

> **來源**: [@0xKaKa03](https://x.com/0xKaKa03/status/1952377186335531043) | [原文連結](https://github.com/beaquant/thousandTrading/blob/master/margin_spot_strategy/margin_dig_btc.py)
>
> **日期**: Mon Aug 04 14:32:49 +0000 2025
>
> **標籤**: `套利` `跨所交易` `市場微觀結構`

---

> **來源**: [@0xKaKa03 (Sliipy⚡)](https://twitter.com/0xKaKa03)
> **日期**: 2026-02-18
> **標籤**: `套利` `跨所套利` `Lead-Lag` `量化交易`

---

## 策略概述

Lead-Lag Arbitrage 是一個經典的跨所套利策略，利用主流交易所（幣安、火幣、OKX）作為價格領先指標，捕捉小所的價格滯後機制。

## 核心邏輯

當三大主流交易所價格同向變動超過閾值時，說明市場趨勢已經形成。而小型交易所由於流動性較差、參與者較少，價格反應存在明顯延遲。策略在預判小所即將跟隨變動前提前掛單，賺取價格收敛的利潤。

## 歷史表現

- 巔峰期日收益高達 80%
- 3 天可實現翻倍收益

## 相關資源

- 源碼：https://t.co/HJpSxJdOL2
