# Meteora DLMM 流動性提供者完全指南

> **來源**: [@narkokek](https://x.com/narkokek/status/1947687843780038782) | [原文連結](https://x.com/i/article/1945912494339342336)
>
> **日期**: 
>
> **標籤**: `DLMM` `流動性提供` `Meteora`

---

> **來源**: [@narkokek (narko)](https://twitter.com/narkokek)
> **標籤**: `Meteora` `DLMM` `Liquidity Provider` `DeFi` `Solana`

---

## 1. 什麼是 DLMM？

DLMM 全稱為 Dynamic Liquidity Market Maker（動態流動性做市商），是 Meteora 上進階流動性提供的核心引擎。DLMM 受 Trader Joe 的 Liquidity Book 啟發，賦予流動性提供者（LP）真正的控制權：

- 資金配置位置
- 手續費賺取方式
- 承擔的風險類型

### DLMM 運作原理

與傳統 AMM 的恆定曲線不同，DLMM 將價格區間分割成**價格箱（bins）**，每個 bin 在特定價格點持有流動性。

這種設計讓 LP 能夠：

- 將流動性集中在最關鍵的價格區間
- 用更少資金獲取更多手續費
- 避免活躍 bin 內的滑價
- 部署結構化策略，如 DCA、曲線或點位形狀

### DLMM 核心特性

**集中流動性（Concentrated Liquidity）**

在精確價格區間提供流動性，市場區間外的資金不會被浪費。

**動態手續費（Dynamic Fees）**

市場波動期間手續費增加，LP 從市場活動中獲益。

**零滑價（每個 bin 內）**

bin 內的交換以固定價格執行，無滑價或價格影響。

**單邊流動性（Single-Sided Liquidity）**

可選擇僅用單一代幣提供流動性，適合方向性策略或 DCA 退出。

**自定義波動率策略**

使用 Spot、Curve 或 Bid-Ask 等流動性「形狀」來匹配風險偏好。

### 實時調整 = 真正的控制力

DLMM 手續費由兩部分組成：

1. **基礎手續費**：由池創建者設定
2. **可變手續費**：根據市場波動率和交易活動動態調整（如跨越了多少個 bin）

這意味著：

- 活躍 bin 中的 LP 賺取最多
- 手續費按 bin 公平分配
- bin 內活動越多，收益越高

*註：第 2 節將深入說明。*

### DLMM 為新幣發行而生

Meteora 的 DLMM Launch Pools 為新代幣發行量身打造：

- 通過基於波動率的手續費阻止狙擊機器人
- 從第一天起就建立深度流動性
- DLMM 支持單邊流動性，無需預先準備 USDC 或 SOL，項目可僅用自己的代幣啟動
- 確保與 Jupiter 和整個 Solana 生態即時整合

---

## 2. 什麼是 Bins 和 Binsteps？

DLMM 不像傳統 AMM 使用曲線，而是將流動性組織成 **bins**（價格箱），即代幣以零滑價交易的離散價格桶。

### 什麼是 Bins？

每個 bin 代表池中的一個固定價格點，可以想像成「流動性桶」。當交易發生時，流動性根據價格在這些 bin 之間移動。

**核心機制**：

- 任何時候只有一個 bin 處於活躍狀態，它同時持有兩種代幣並賺取手續費
- 左側的 bin 只持有報價代幣（如 USDC）
- 右側的 bin 只持有基礎代幣（如 SOL）

這個系統實現了：

- 精確的 LP 配置
- bin 內零滑價的交換
- 跨 bin 的清晰代幣分離

### Bin 如何運作？

每個 bin 遵循恆定和公式：

> L = P × X + Y

其中：
- L = 流動性
- P = 價格
- X = 基礎代幣數量
- Y = 報價代幣數量

### DLMM 中的價格移動

DLMM 中的價格移動是指交換發生時交易價格如何變化，通過活躍 bin 的移動來追蹤。

**活躍 Bin 移動**：

- 任何時候只有一個 bin 可以「活躍」——這是同時包含兩種代幣並賺取交易手續費的 bin
- 當交易者買賣代幣時，會耗盡活躍 bin 的儲備
- 一旦 bin 的儲備耗盡，活躍 bin 就會向交易方向的下一個 bin 移動：
  - 價格上漲 → 活躍 bin 向右移動（更高價格的 bin）
  - 價格下跌 → 活躍 bin 向左移動（更低價格的 bin）

### 什麼是 Binsteps？

Binstep 定義了 bin 之間的百分比差異。

- 較小的 binstep = 更緊密的定價 = 更精細的控制
- 較大的 binstep = 更大的跳躍 = 更廣的價格覆蓋

**Bin Step 權衡**：

**較小的 Binsteps**

1. 捕獲更多交易量
2. 整體價格範圍較小
3. 適合穩定幣對

**較大的 Binsteps**

1. 覆蓋更大價格範圍（每個位置最多 69 個 bin）
2. 每個 bin 的交易量較少
3. 適合波動性資產

### Bins + Binsteps 如何影響手續費

基礎交換手續費計算公式：

> Base Fee = Base Factor × Bin Step

因此：

- 較大的 binstep → 允許更高的基礎手續費
- 較小的 binstep → 實現更緊密的價差，適合高頻交易或穩定幣

**只有當你的 bin 處於活躍或被跨越時，你才能賺取手續費。**

**與手續費的關係**：

- Base Fee = Base Factor × Bin Step
- 通常，較高的 bin step 允許更高的基礎手續費
- DLMM 池的最大 bin step 為 400 個基點

*註：如果想進一步了解何時使用哪種策略，可以閱讀我的推文 ["DLMM Strategy Guide: 100/2% vs. 20/0.2% Pools"](https://x.com/narkokek/status/1878598295121244536)。*

---

## 3. DLMM 交易手續費：快速基礎

LP 從代幣交換中賺取手續費。

> 總手續費 = 基礎手續費（固定最低值）+ 可變手續費（隨市場波動變化）

手續費按價格「bin」（區間）計算，與該處的 LP 分享。可隨時領取。

### 基礎手續費（Base Fee）

- 每次交換的穩定最低費用
- 低 = 更多交易；高 = 每筆交易更多收益
- 由池創建者設定：Base Fee = Factor (B) × Bin Step

### 可變手續費（Variable Fee / Dynamic Fee）

- 波動市場（大幅價格波動）的額外費用
- 公式：Variable (per bin k) = A × (Volatility × s)²
- 波動率追蹤價格範圍（bin）變化：
  - 快速交易時上升
  - 緩慢時衰減或重置
  - 忽略小幅度來回波動以防止操縱

最終 bin 手續費：交換金額 × 總手續費

### 動態手續費實例

讓我們用例子理解動態手續費如何運作，或何時能賺取更多手續費：

假設兩個場景，都從相同價格開始和結束，TVL 相同，池相同。

可變手續費隨波動率增加，波動率由「bin」跨越次數（價格在小範圍間移動）衡量。更多跨越意味著更高波動率，直接提升可變手續費部分。

**場景 1（平滑路徑）**：價格逐漸下跌和上升（紫色線）。這導致較少的 bin 跨越，因此波動率保持低位。結果：較低的可變手續費，因為波動率累積器增長最少,每次交換的額外費用很小。

**場景 2（暴漲暴跌路徑）**：價格急劇飆升至 $35 然後跌回 $20。這在漲跌過程中觸發大量 bin 跨越。結果：較高的可變手續費，因為每次跨越都會疊加波動率累積器（隨快速或大幅變化上升，僅在平靜期緩慢衰減或重置）。

即使最終價格相同，額外的跨越會放大可變手續費公式，導致沿路徑的交換產生更多總體手續費。

場景 2 產生更多手續費純粹是因為其顛簸路徑跨越了更多 bin，放大了波動率度量，從而增加了每次交換的動態手續費。

### 協議費用（Protocol Cut）

Protocol Cut 指交易手續費中歸屬於 Meteora 協議（而非流動性提供者）的百分比。不同池類型的運作方式如下：

**標準池**

- 總交易手續費的 5% 歸屬協議
- 適用於常規 DLMM 池、DAMM v1 池和 DAMM v2 池
- 剩餘 95% 作為手續費收益歸 LP

**Launch Pools**

- 總交易手續費的 20% 歸屬協議
- 這個較高費率適用於為新代幣發行設計的特殊 launch pools
- 包括 DLMM Launch Pools 和 DAMM Launch Pools
- 剩餘 80% 歸 LP

---

## 4. 策略

除了標準的 spot、curve 和 bid-ask 之外，還有許多策略。為了保持簡潔，我會告訴你在哪裡找到它們，並分享一些推文幫助你入門。

### 在哪裡找策略？

> https://www.lparmy.com/strategies

這個頁面每週更新來自頂級內容創作者為 Meteora 量身定制的策略，值得定期查看。

**我推薦初學者的策略**：

- [Anti-Sawtooth Strategy](https://x.com/souei_nft/status/1883899954189758704)
- [In-Out Strategy](https://x.com/_mythicalpotato/status/1896738642233844066)

這些都非常適合初學者，你可以隨時在 lparmy.com/strategies 上學習新發布的策略，記得定期查看網站。

---

## 5. 工具

這些是我用來分析和追蹤 LP 活動的主要工具：

- [RugCheck](https://rugcheck.xyz/) – 用於檢查代幣安全性和合約風險
- [BubbleMaps (Solana)](https://app.bubblemaps.io/sol/) – 幫助可視化錢包連接和代幣分布
- [Trench Bot](https://trench.bot/) – 適合監控錢包和設置警報
- [GMGN](https://gmgn.ai/?chain=sol) – 用於發現趨勢的數據
- [JUP](https://jup.ag/pro?tab=cooking) – 按有機評分和交易量篩選代幣
- [Metlex](https://www.metlex.io/) – @AlekssRG 開發的工具，可以發現趨勢 DLMM 池，並在關閉倉位後獲得著名的 PnL 圖表
- [LP Army Discord](https://discord.com/invite/lparmy) – 我經常使用。那裡的機器人讓追蹤新捆綁包和實時跟進 LP 活動變得容易。也可以與 LP Army 合作，社群非常活躍

這些工具涵蓋了入門所需的大部分功能。

---

## 6. LP Army

LP Army Discord 每天都在成長，目前已接近 9,000 名成員。

這是一個人們提問、分享學習內容、共同解決問題的地方。如果你是 DLMM 新手，這個地方可以大大加速你的學習。

很多人在這裡找到了第一次真正的動力。這不僅僅是信息,更是一個社群。

找到你的方向，結識一些朋友，一起變得更好。

LP Army 之道。

> https://discord.com/invite/lparmy
