# edgeX Post-Only 無損掛單網格交易策略

> **來源**: [@yourQuantGuy](https://x.com/yourQuantGuy/status/1965362391195033995) | [原文連結](https://pro.edgex.exchange/referral/QUANT)
>
> **日期**: 
>
> **標籤**: `網格交易` `無損交易` `手續費返佣`

---

> **來源**: [@yourQuantGuy (Your Quant Guy)](https://x.com/yourQuantGuy)
> **日期**: 2026-02-18
> **標籤**: `edgeX` `Post-Only` `網格交易` `量化交易` `Python SDK`

---

## edgeX 腳本更新

### 功能優化

Fork 了 edgeX 官方的 Python SDK，並增加了兩個功能：

- 增加了對 Post-Only 訂單的支持
- 增加了根據訂單號查詢訂單狀態的功能

### 腳本改進

- 使用新的 forked Python SDK，並加入 requirements.txt
- 修復了 Partial Filled 關倉時沒有止盈的 bug
- 因為使用了官方的 Python SDK，原來導出在 csv 裡的交易記錄暫時不支持了

## 策略特點

腳本目前只支持 ETH 和 BTC。如果你認為 ETH 或 BTC 近期會漲/跌/橫盤，這個腳本是無損刷交易量最好的簡單策略。比起馬丁策略，這個策略風險更小，交易量也更穩定。

## 邀請碼福利

使用邀請碼有以下福利：

1. 直接升級為 VIP 1 的手續費費率
2. 享受 10% 手續費返佣，每 24 小時自動結算一次，在 edgeX 網頁上直接領取。這是在 VIP 1 的手續費費率的基礎上返佣，所以實際手續費是 0.013% × 0.9 = 0.0117%
3. 10% 的積分加成
