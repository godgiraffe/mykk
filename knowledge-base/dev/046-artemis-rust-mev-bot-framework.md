# Artemis：Rust MEV 機器人開發框架

> **來源**: [@0xKaKa03](https://x.com/0xKaKa03/status/1937423039278518533) | [原文連結](https://github.com/paradigmxyz/artemis?source=post_page-----77f4c99207f---------------------------------------)
>
> **日期**: 
>
> **標籤**: `MEV機器人` `Rust框架` `事件驅動架構`

---

```markdown
> **來源**: [@0xKaKa03 (Sliipy⚡)](https://twitter.com/0xKaKa03)
> **日期**: 2025-02-18
> **標籤**: `Rust` `MEV` `框架` `開源` `事件驅動`

---

## 專案簡介

Artemis 是一個用 Rust 編寫 MEV 機器人的框架，由 Paradigm 開源。設計理念是簡單、模組化且高效能。炒飯獸大佬開源的 SUI MEV Bot 就是基於這個框架構建的。

- **GitHub**: [paradigmxyz/artemis](https://github.com/paradigmxyz/artemis)
- **授權**: Apache-2.0 & MIT 雙授權
- **Stars**: 2.9k+

## 核心架構

Artemis 遵循事件驅動設計原則，資料流動結構為：

**Collector → Strategy → Executor**

所有組件由一個 Engine 統一管理。

### 三大核心組件

#### 1. Collectors（收集器）
- 接收外部事件（pending txs、新區塊、市場訂單等）
- 將外部事件轉換為內部事件表示
- 可以配置多個 Collector 分別收集不同鏈上資訊

#### 2. Strategies（策略）
- 包含每種 MEV 機會的核心邏輯
- 接收 Collector 產生的 Events
- 計算是否存在套利機會（例如：監聽市場訂單流尋找跨交易所套利）
- 產生 Actions

#### 3. Executors（執行器）
- 處理 Strategy 產生的 Actions
- 在不同域執行操作（提交交易、發布鏈下訂單等）
- 支援發送 Telegram 訊息推送等輔助功能

## 已實現策略

### Opensea/Sudoswap NFT 套利
實現 Seaport 和 Sudoswap 之間的原子跨市場 NFT 套利策略。

## 快速開始

### 環境需求
- Rust
- Anvil

### 安裝與測試

```bash
# 複製專案
git clone https://github.com/paradigmxyz/artemis
cd artemis

# 執行測試
cargo test --all
```

### 執行 Opensea/Sudoswap 套利策略

```bash
cargo run -- \
  --wss <INFURA_OR_ALCHEMY_KEY> \
  --opensea-api-key <OPENSEA_API_KEY> \
  --private-key <PRIVATE_KEY> \
  --arb-contract-address <ARB_CONTRACT_ADDRESS> \
  --bid-percentage <BID_PERCENTAGE>
```

其中 `ARB_CONTRACT_ADDRESS` 是部署套利合約的地址。

## 應用場景

這套事件驅動架構不僅適用於 MEV，任何事件驅動的交易/套利場景都可以按這個思路組織：

- 高效解耦各組件
- 模組複用性強
- 易於擴展新策略

## 相關資源

- [subway](https://github.com/refcell/subway)
- [subway-rs](https://github.com/refcell/subway-rs)
- [cfmms-rs](https://github.com/0xKitsune/cfmms-rs)
- [rusty-sando](https://github.com/mouseless-eth/rusty-sando)
- [bundle-generator](https://github.com/flashbots/bundle-generator)
- [ethers-rs](https://github.com/gakonst/ethers-rs)
- [ethers-flashbots](https://github.com/onbjerg/ethers-flashbots)
```
