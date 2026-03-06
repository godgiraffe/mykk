---
title: "ItyFuzz - 智能合約混合模糊測試工具"
date: "2025-04-12"
tags: 
  - "智能合約安全"
  - "漏洞檢測"
  - "模糊測試"
summary: "ItyFuzz 是一個超高速的 EVM 和 MoveVM 智能合約混合模糊測試工具（Hybrid Fuzzer），結合符號執行（Symbolic Execution）和模糊測試（Fuzzing）技術，用於鏈下和鏈上尋找智能合約漏洞。"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 49
evergreenScore: 57
priorityScore: 59
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/quant_sheep/status/1911193028498497851"
  externalUrl: "https://github.com/fuzzland/ityfuzz"
  authorUsername: "quant_sheep"
---

# ItyFuzz - 智能合約混合模糊測試工具

> **來源**: [@quant_sheep](https://x.com/quant_sheep/status/1911193028498497851) | [原文連結](https://github.com/fuzzland/ityfuzz)
>
> **日期**: Sat Apr 12 23:01:40 +0000 2025
>
> **標籤**: `智能合約安全` `漏洞檢測` `模糊測試`

---

> **來源**: [@quant_sheep (Labrin)](https://twitter.com/quant_sheep)
> **日期**: 2024-XX-XX
> **標籤**: `智能合約` `模糊測試` `安全審計` `ItyFuzz` `區塊鏈安全`

---

## 專案簡介

ItyFuzz 是一個超高速的 EVM 和 MoveVM 智能合約混合模糊測試工具（Hybrid Fuzzer），結合符號執行（Symbolic Execution）和模糊測試（Fuzzing）技術，用於鏈下和鏈上尋找智能合約漏洞。

**專案連結**：
- GitHub: https://github.com/fuzzland/ityfuzz
- 文件: https://docs.ityfuzz.rs
- 研究論文: [Research Paper]
- 社群: Twitter / Discord / Telegram

---

## 安裝方式

```bash
curl -L https://ity.fuzz.land/ | bash
ityfuzzup
```

---

## 使用範例

### 1. 模糊測試已部署的智能合約

生成完整的攻擊利用腳本，從 Polygon 上具有閃電貸 + 只讀重入漏洞的合約中竊取資金：

```bash
# Fork Polygon 區塊 35718198 並模糊測試合約
ETH_RPC_URL=https://polygon-rpc.com ityfuzz evm \
  -t 0xbcf6e9d27bf95f3f5eddb93c38656d684317d5b4,0x5d6c48f05ad0fde3f64bab50628637d73b1eb0bb \
  -c polygon \
  --flashloan \
  --onchain-block-number 35718198 \
  --onchain-etherscan-api-key TR24XDQF35QCNK9PZBV8XEH2XRSWTPWFWT
```

（註：請在 https://polygonscan.com/apis 取得自己的 API key）

### 2. Foundry 不變性測試（Invariant Test）

執行定義在 `test/Invariant.sol` 中 `Invariant` 合約的不變性測試：

```bash
# 取代：forge test --mc test/Invariant.sol:Invariant
ityfuzz evm -m test/Invariant.sol:Invariant -- forge test
```

---

## 效能表現

### 大型真實專案測試

在大型真實智能合約專案中：
- **ItyFuzz**: 找到 **126** 個漏洞
- **Echidna**: 找到 **0** 個漏洞
- **Mythril**: 找到 **9** 個漏洞

詳細資料請參考 [backtesting](https://github.com/fuzzland/ityfuzz/blob/master/backtesting.md)、研究論文和新發現的漏洞列表。

### 小型真實合約（ERC20、抽獎等）

相比學術界最先進的模糊測試工具 SMARTIAN：
- 測試覆蓋率提升 **10%**
- 測試時間僅需 **1/30**

### Consensys Daedaluzz 基準測試

ItyFuzz（不使用符號執行）與其他工具對比：
- 比 Echidna 多找到 **44%** 漏洞
- 比 Foundry 多找到 **31%** 漏洞
- 速度比 Echidna 快 **2.5 倍**
- 速度比 Foundry 快 **1.5 倍**

---

## 核心功能

| 功能 | 說明 |
|------|------|
| **鏈分叉（Chain Forking）** | 在任意鏈、任意區塊高度上模糊測試合約 |
| **精確漏洞利用生成** | 自動生成精度損失、整數溢位、資金竊取、Uniswap pair 誤用等漏洞的攻擊腳本 |
| **重入支援（Reentrancy Support）** | 具體利用潛在重入機會，探索更多程式碼路徑 |
| **超高速電源調度** | 優先模糊測試更可能有漏洞的程式碼區段 |
| **符號執行** | 生成比純模糊測試覆蓋更多程式碼路徑的測試案例 |
| **閃電貸支援** | 假設攻擊者擁有無限資金，挖掘閃電貸漏洞 |
| **清算支援** | 在模糊測試期間模擬從流動性池買賣任何代幣 |
| **反編譯支援** | 無需原始碼即可模糊測試合約 |
| **複雜合約初始化** | 支援使用 Foundry setup script、Anvil RPC 分叉或 JSON 設定檔 |
| **LibAFL 引擎** | 由最先進的模糊測試引擎 [LibAFL](https://github.com/AFLplusplus/LibAFL) 驅動 |

---

## 發現的漏洞

### 新發現的精選漏洞

| 專案 | 漏洞類型 | 風險資產 |
|------|----------|----------|
| BSC $rats NFT | 整數溢位導致無限鑄造 | $79k |
| 9419 Token | 錯誤邏輯導致價格操縱 | $35k |
| BSC Mevbot | 未保護的 DPPFlashLoanCall | $19k |
| FreeCash | 錯誤邏輯導致價格操縱 | $12k |
| 0xnoob Token | 錯誤邏輯導致價格操縱 | $7k |
| Baby Wojak Token | 錯誤邏輯導致價格操縱 | $4k |
| Arrow | 錯誤倉位邏輯導致資金損失 | 審計期間發現 |

### 歷史攻擊事件回測

ItyFuzz 能在**不了解攻擊細節**的情況下，自動為 **>80%** 的歷史攻擊事件生成攻擊腳本。

詳細操作請參考 [backtesting](https://github.com/fuzzland/ityfuzz/blob/master/backtesting.md)。

---

## 技術架構

- **程式語言**: Rust (92.2%)
- **支援合約語言**: Solidity, Move
- **支援鏈**: EVM 鏈、MoveVM 鏈（Sui, Aptos）
- **授權**: MIT License

---

## 贊助商與資助

- Manifold Finance
- Sui

---

## 專案統計

- ⭐ **1.1k** stars
- 🔀 **170** forks
- 👥 **27** 貢獻者
- 📦 **48** releases
- 📖 完整文件與社群支援
