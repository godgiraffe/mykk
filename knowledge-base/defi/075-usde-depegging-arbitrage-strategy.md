# USDE 脫錨套利策略與跨鏈橋接實踐

> **來源**: [@craigyc_eth](https://x.com/craigyc_eth/status/1976791881406431741)
>
> **日期**: Fri Oct 10 23:28:06 +0000 2025
>
> **標籤**: `USDE套利` `跨鏈橋接` `DEX交易`

---

> **來源**: [@craigyc_eth (Craig C.)](https://x.com/craigyc_eth)
> **日期**: 2026-02-17
> **標籤**: `USDE` `套利` `跨鏈橋接` `Pendle` `Stargate` `CCTP`

---

## 操作摘要

今晚看見 USDE 閃崩脫錨後，在幣安買入。當時正好在電腦前看 Pendle，就用 Pendle Swap 看了一眼，發現 BASE 和 ARB 的 USDE 在錨（事實上這兩條鏈 USDE 就壓根沒脫錨）。

隨後開始跨鏈拋售，然後充回幣安，發現確認要用他媽的 40 分鐘！無奈，從異構鏈歸攏資金，重複上述步驟，但是將 USDC 跨入 Solana、將 USDT0 跨入 XPL，再轉入幣安進行循環。

## 操作鏈路

1. 買入打折 USDe
2. 提幣並跨至在錨鏈
3. 將 USDT0/USDC 跨鏈以規避 CEX 確認時間
4. 重複以上步驟

## 使用工具

| 工具 | 用途 |
|------|------|
| Pendle Swap (@pendle_fi) | 查看不同鏈上 USDE 價格 |
| Stargate (@StargateFinance) | 跨鏈橋接 |
| USDT0 (@USDT0_to) | 跨鏈穩定幣 |
| CCTP (@USDC) | Circle 跨鏈傳輸協議 |
| Shadow Bridge (@ShadowOnSonic) | UI 最簡潔的橋接工具 |

## 備註

- 看見 USDE 閃崩脫錨我就興奮得不得了，完全沒顧得上 WBETH 和 bnSOL
- 小 V 子（@VitalikButerin），Fusaka 升級快點吧，blob 不夠用啊。遇上真正需要高性能的時候，這些 L2 一個個都癱了😂
