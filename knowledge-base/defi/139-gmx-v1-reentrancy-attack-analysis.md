# GMX V1 重入漏洞攻擊事件分析：全球空頭平均價格操纵

> **來源**: [@ACai_sec](https://x.com/ACai_sec/status/1946137401279270923) | [原文連結](https://www.cnblogs.com/ACaiGarden/p/18991716)
>
> **日期**: Fri Jul 18 09:18:08 +0000 2025
>
> **標籤**: `智能合約安全` `重入漏洞` `永續合約`

---

> **來源**: [@ACai_sec](https://twitter.com/ACai_sec)
> **日期**: 2025-07-09
> **標籤**: `GMX` `重入攻擊` `DeFi安全` `智能合約漏洞` `價格操縱`

---

## 攻擊概述

2025 年 7 月 9 日，GMX V1 遭受黑客攻擊，損失約 4200 萬美元資產。攻擊者利用 `executeDecreaseOrder` 函數發送 ETH 的行為進行重入，繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新進行開倉，從而操縱全局空頭平均價格（globalShortAveragePrices），抬高 GLP 代幣的價值。最後將 GLP 以池內資產（BTC、ETH、USDC 等）的形式贖回完成獲利。

**攻擊合約**: [0x7d3bd50336f64b7a473c51f54e7f0bd6771cc355](https://arbiscan.io/address/0x7d3bd50336f64b7a473c51f54e7f0bd6771cc355)

整個攻擊事件涉及 14 筆交易，其中 1-13 筆是準備交易，第 14 筆是攻擊交易。

## GMX V1 協議簡介

GMX V1 是一個去中心化永續合約交易平台，允許用戶以最高 30 倍槓桿交易加密資產（如 ETH、BTC）通過 GLP 池作為合約用戶對手方。流動性提供者（LP）通過存入資產（如 USDC、ETH）獲得 GLP 代幣。合約用戶可開多頭或空頭頭寸，盈亏以 USD 計價。平台通過 Chainlink 預言機獲取價格，Keeper 自動化執行清算和限價單，確保效率和安全性。

## 關鍵參數說明

攻擊交易中涉及的關鍵索引和標識：

- **positionKey**: 對應 position
- **requestKey**: 對應 request
- **increaseOrdersIndex**: 對應 order，從 0 開始
- **decreasePositionsIndex**: 對應 request，從 1 開始

## 準備交易分析 (TX 1-13)

這些準備交易的發起者和調用合約都不相同，需要通過各種 Key 和 Index 來排查每筆交易之間的順序關係。

### TX 1 [355878385]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x0b8cd648fb585bc3d421fc02150013eab79e211ef8d1c68100f2820ce90a4712)

`OrderBook.createIncreaseOrder()`: 攻擊者創建了一個 WETH increase order，這個倉位是後續多次進行重入的關鍵。[increaseOrdersIndex = 0]

### TX 2 [355878605]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x28a000501ef8e3364b0e7f573256b04b87d9a8e8173410c869004b987bf0beef)

`OrderBook.executeIncreaseOrder()`: Keeper 執行 TX 1 中的 order，創建 WETH long position [positionKey = 0x05d2]

### TX 3 [355878984]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x20abfeff0206030986b05422080dc9e81dbb53a662fbc82461a47418decc49af)

`OrderBook.createDecreaseOrder()`: Hacker 創建了一個 WETH decrease order，這是利用重入漏洞的關鍵操作。[positionKey = 0x05d2, decreaseOrdersIndex = 0]

### TX 4 [355879148] - 首次觸發重入漏洞

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x1f00da742318ad1807b6ea8283bfe22b4a8ab0bc98fe428fbfe443746a4a7353)

`OrderBook.executeDecreaseOrder()`: Keeper 執行 WETH decrease order，**觸發重入漏洞**。[positionKey = 0x05d2, decreaseOrdersIndex = 0]

**在重入過程中**:

- `Vault.increasePosition()`: 繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新，直接創建 WBTC short position（抵押品為 3001 USDC）[positionKey = 0x255b]
- `PositionRouter.createDecreasePosition()`: 創建 WBTC short position 的平倉 request [requestKey = 0xc239, decreasePositionsIndex = 1]

**此時相關參數的值**:

```
price = 109469868000000000000000000000000000
[before] ShortsTracker.globalShortAveragePrices = 108757787000274036210359376021024492
```

#### globalShortAveragePrices 操縱機制

`globalShortAveragePrices` 代表的是**總體空頭倉位的平均價格**，也就是說當現貨價格與平均價格相等時，則到達了不虧不賺的成本價。

**正常情況下的更新邏輯**:

- 開倉時：`globalShortAveragePrices` 會向現貨價格 `Price` 的值靠攏（例如現貨價格高於平均價格，那麼採用現貨價格開空時，會抬高平均價格）
- 減倉時：獲利則上調 `globalShortAveragePrices`，虧損則下調 `globalShortAveragePrices`

**攻擊者的繞過方式**:

正常情況下，`increasePosition` 需要 Keeper 調用 `PositionManager.executeIncreaseOrder()` 作為入口，此時會執行 `ShortsTracker.updateGlobalShortData()` 更新 `ShortsTracker.globalShortAveragePrices` 資料。

攻擊者通過重入繞過 Timelock 和 `getIncreaseOrder` 直接調用 `Vault.increasePosition()`，則不會更新 `ShortsTracker.globalShortAveragePrices` 的值，維持 `globalShortAveragePrices` 在 108757 沒有向現貨價格 109394 靠攏。

在 TX 5 中，當 Keeper 執行 `PositionRouter.executeDecreasePosition()` 的時候會更新 `ShortsTracker.globalShortAveragePrices` 的值。**開倉時缺失了一次更新，使得所採用的值會比實際值要小。加上是虧損的減倉操作，所以 `globalShortAveragePrices` 的值會進一步減小。**

### TX 5 [355879171]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x222cdae82a8d28e53a2bddfb34ae5d1d823c94c53f8a7abc179d47a2c994464e)

`PositionRouter.executeDecreasePosition()`: Keeper 關閉 WBTC short position，贖回 2791 USDC [positionKey = 0x255b, requestKey = 0xc239]

`gmxPositionCallback`: 在 Callback 函數中調用 `OrderBook.createDecreaseOrder()` 創建 WETH decrease order [positionKey = 0x05d2, decreaseOrdersIndex = 1]

**此時相關參數的值**（globalShortAveragePrices 已經被更新成了更小的值）:

```
price = 109505774000000000000000000000000000
[beforeUpdate] ShortsTracker.globalShortAveragePrices = 108757787000274036210359376021024492
[afterUpdate] ShortsTracker.globalShortAveragePrices = 104766755156748843189540879601516878
```

### TX 6-13 - 重複操縱流程

隨後的 TX 6-7、8-9、10-11、12-13 都是在重複 TX 4-5 的操作，其目的就是通過反覆多次的操作盡可能地縮小 `globalShortAveragePrices` 的值。

#### TX 6 [355879337]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0xc9a4692a4a297202a099144a59dc30497d47d20a0eef3a0f6dc2f017221293c2)

`OrderBook.executeDecreaseOrder()`: Keeper 執行 WETH decrease order，**觸發重入漏洞**。[positionKey = 0x05d2, decreaseOrdersIndex = 1]

**在重入過程中**:

- `Vault.increasePosition()`: 繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新，直接創建 WBTC short position（抵押品為 2791 USDC）[positionKey = 0x255b]
- `PositionRouter.createDecreasePosition()`: 創建 WBTC short position 的平倉 request [requestKey = 0x1489, decreasePositionsIndex = 2]

```
price = 109527370000000000000000000000000000
[before] ShortsTracker.globalShortAveragePrices = 104934381964999641338644145008879305
```

#### TX 7 [355879359]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x1cbf250b6b22a62e766e8cb7aa6c0b16d1d46777d3f5be53d5d80cd2d853943a)

`Vault.decreasePosition()`: Keeper 關閉 WBTC short position，贖回 2622 USDC

`gmxPositionCallback()`: 在 Callback 函數中調用 `OrderBook.createDecreaseOrder()` 創建 WETH decrease order [positionKey = 0x05d2, decreaseOrdersIndex = 2]

#### TX 8 [355879563]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0xb58415cf40b03f7f3e3603646af0c0b6be6e22640459060a70b7ef803b4cfb0b)

`OrderBook.executeDecreaseOrder()`: Keeper 執行 WETH decrease order，**觸發重入漏洞** [positionKey = 0x05d2, decreaseOrdersIndex = 2]

**在重入過程中**:

- `Vault.increasePosition()`: 繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新，直接創建 WBTC short position（抵押品為 2622 USDC）[positionKey = 0x255b]
- `PositionRouter.createDecreasePosition()`: 創建 WBTC short position 的平倉 request [requestKey = 0xe63c, decreasePositionsIndex = 3]

#### TX 9 [355879585]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x5a37ff59323e70ba25560985ffaf20069f2c0ec53829e8aa639fef72cb59c3b7)

`Vault.decreasePosition()`: Keeper 關閉 WBTC short position，贖回 2481 USDC

`gmxPositionCallback()`: 在 Callback 函數中調用 `OrderBook.createDecreaseOrder()` 創建 WETH decrease order [positionKey = 0x255b, decreaseOrdersIndex = 3]

#### TX 10 [355879763]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0xff6fe60a740fd5cab2ad5364949a7983f83eb82806b583834c9d4e90377bf108)

`OrderBook.executeDecreaseOrder()`: Keeper 執行 WETH decrease order，**觸發重入漏洞** [positionKey = 0x05d2, decreaseOrdersIndex = 3]

**在重入過程中**:

- `Vault.increasePosition()`: 繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新，直接創建 WBTC short position（抵押品為 2481 USDC）[positionKey = 0x255b]
- `PositionRouter.createDecreasePosition()`: 創建 WBTC short position 的平倉 request [requestKey = 0xcc53, decreasePositionsIndex = 4]

#### TX 11 [355879785]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0xbd65d666e7f096255661747ead63128e7193efa5ed3cff255a1214e7e0187be6)

`Vault.decreasePosition()`: Keeper 關閉 WBTC short position，贖回 2345 USDC

`gmxPositionCallback()`: 在 Callback 函數中調用 `OrderBook.createDecreaseOrder()` 創建 WETH decrease order [positionKey = 0x255b, decreaseOrdersIndex = 4]

#### TX 12 [355879999]

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x1052738769e80df1664049f37d715bc6200b01e38ba1123b841ce6c819fcdec6)

`OrderBook.executeDecreaseOrder()`: Keeper 執行 WETH decrease order，**觸發重入漏洞** [positionKey = 0x05d2, decreaseOrdersIndex = 4]

**在重入過程中**:

- `Vault.increasePosition()`: 繞過 `enableLeverage` 檢查和 `globalShortAveragePrices` 的更新，直接創建 WBTC short position（抵押品為 2345 USDC）[positionKey = 0x255b]
- `PositionRouter.createDecreasePosition()`: 創建 WBTC short position 的平倉 request [requestKey = 0xf42a, decreasePositionsIndex = 5]

```
price = 109466220000000000000000000000000000
[before] ShortsTracker.globalShortAveragePrices = 9881613652623553707300056873939342
```

#### TX 13 [355880022] - 最終操縱結果

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x0cdbacae0584e068dd9ba8f93c55df02630ee3481eeca8f2477cda7b84339fcc)

`Vault.decreasePosition()`: Keeper 關閉 WBTC short position，贖回 2182 USDC

`gmxPositionCallback()`: 在 Callback 函數中調用 `OrderBook.createDecreaseOrder()` 創建 WETH decrease order [positionKey = 0x255b, decreaseOrdersIndex = 5]

```
price = 109505774000000000000000000000000000
[beforeUpdate] ShortsTracker.globalShortAveragePrices = 9881613652623553707300056873939342
[afterUpdate] ShortsTracker.globalShortAveragePrices = 1913705482286167437447414747675542
```

**最終操縱結果**: `ShortsTracker.globalShortAveragePrices` 的值變為原來的 **1.76%**

```
108757787000274036210359376021024492 → 1913705482286167437447414747675542
```

## 攻擊交易分析 (TX 14)

TX 1-13 的目的，都是通過利用重入漏洞，繞過 `ShortsTracker.globalShortAveragePrices` 的更新進行開倉，從而達到降低 `ShortsTracker.globalShortAveragePrices` 值的目的。

### TX 14 [355880237] - 攻擊交易

[交易連結](https://app.blocksec.com/explorer/tx/arbitrum/0x03182d3f0956a91c4e4c8f225bbc7975f9434fab042228c7acdc5ec9a32626ef)

重點分析重入後在 `uniswapV3FlashCallback` 中進行的操作：

#### 步驟 1: mintAndStakeGlp()

調用 `mintAndStakeGlp()` 鑄造並質押價值 6000000 USDC 的 GLP。通過 trace 可以看出扣除費用後價值 5997000 USDG。質押了 **4129578 GLP**。

#### 步驟 2: Vault.increasePosition()

調用 `Vault.increasePosition()`，傳入 1538567 USDC 創建 WBTC short position。

#### 步驟 3: Reward Router V2.unstakeAndRedeemGlp() [獲利]

取消質押 GLP，並以其他各種代幣的形式進行提取。

以提取 WBTC 的調用為例，攻擊者只移除了 386498 GLP，經過計算得出這部分的價值為 9731948 USDG，等價於 **88 WBTC**。

**完整贖回明細**:

- **WETH**: 移除 341596 GLP，贖回價值 8601309 USDG 的 3205 WETH
- **USDC**: 移除 7503 GLP，贖回價值 188930 USDG 的 187343 USDC
- **LINK**: 移除 13453 GLP，贖回價值 338759 USDG 的 23800 LINK
- **UNI**: 移除 21422 GLP，贖回價值 539419 USDG 的 65479 UNI
- **USDT**: 移除 53812 GLP，贖回價值 1354 USDG 的 1343 USDT
- **FRAX**: 移除 450568 GLP，贖回價值 11345197 USDG 的 11249897 FRAX
- **DAI**: 移除 53603 GLP，贖回價值 1349722 USDG 的 1338385 DAI

攻擊者在這個環節中共贖回了 **1328455 GLP**，剩餘 **2801123 GLP**。

### 超額贖回機制解析

超額的贖回價值是如何計算出來的？

在計算贖回 GLP 獲得的 WBTC 數量時，首先通過 `_removeLiquidity()` 計算等價的 USDG。其中 `usdgAmount` 的值需要根據 `aumInUsdg` 來計算，而 **aumInUsdg 正是被攻擊者所操控的值**。

#### AUM 的含義及計算方法

**Assets Under Management (AUM)** 代表 GMX 協議管理的所有資產的總價值。

用途：`GLP 價格 = AUM / GLP 總供應量`

`getAum()` 函數計算 GMX 協議管理的所有資產的總價值，分為穩定幣和非穩定幣兩種計算方式。

[原始碼參考](https://github.com/gmx-io/gmx-contracts/blob/master/contracts/core/GlpManager.sol#L136)

**穩定幣的資產總價值計算方式**較為簡單：

```
資產總價值 = poolAmount × price
```

**非穩定幣的資產總價值計算**涉及以下方面：

- **空頭倉位數量**: size
- **空頭倉位獲利/虧損數量**: delta
- **多頭墊付資金**: guaranteedUsd
  - `guaranteedUsd = size - collateral`
  - `多頭倉位收益/虧損 = size - guaranteedUsd`
- **可用流動性**: `poolAmount - reservedAmount`

**計算公式**:

```
WBTC_AUM = guaranteedUsd + (poolAmount - reservedAmount) × price ± delta
```

其中 `delta` 通過 `getGlobalShortDelta()` 函數進行計算，其中 `averagePrice` 的值被攻擊者通過 TX 1-13 的操控後，變得遠小於實際值。使得最終計算得到的 `delta` 要遠大於實際值。

**操縱後的數值**:

```
globalShortAveragePrices = 1913705482286167437447414747675542（正常值的 1.76%）
delta: 865836626141799337421744137507209211350
hasProfit: False
```

由於 `hasProfit` 為 false，代表空頭虧損，所以 WBTC_AUM 的計算公式需要**加上**被操控的 `delta`：

```
WBTC_AUM = guaranteedUsd + (poolAmount - reservedAmount) × price + delta
```

這也就導致了 `aumInUsdg` 的值比正常情況下大，計算得到的 `usdgAmount` 值也變大，所以攻擊者能夠贖回獲得超額的收益。

#### 步驟 4: Vault.decreasePosition()

調用 `Vault.decreasePosition()` 關閉 WBTC short position，取回 1507796 USDC。

#### 步驟 5: 重複操作獲取更多 USDC

接下來黑客進行了 3 次操作去擴大收益，前面 2 次為了積累 GLP 代幣，為了在第 3 次贖回超額的 USDC。

**第 1 次操作**: 質押 FRAX 獲得了 16083241 GLP，贖回使用了 625160 GLP，剩餘了 15458081 GLP。但同時又虧損了 149057 FRAX 和 2500 USDC。

**第 2 次操作**: 與第 1 次類似

**第 3 次操作**: tokenOut 選擇的是 USDC，贖回得到 **15834169 USDC**

#### 步驟 6: 歸還閃電貸

歸還閃電貸，完成攻擊。

## 總結

這次的 GMX 攻擊事件分析可以說是較為複雜的攻擊，尤其是 GMX 裡面涉及到了很多關於永續合約倉位和收益的計算。裡面每個參數的含義，計算公式的含義還是比較難理解的。還有前面的 13 筆準備交易的收集也花費了大量的時間和精力，不過對 GMX 的了解也在理清楚準備交易的過程中慢慢加深了。
