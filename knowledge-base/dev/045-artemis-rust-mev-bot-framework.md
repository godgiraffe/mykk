# Artemis - Rust MEV 機器人框架與 Trait 動態分法實踐

> **來源**: [@0xLogicLog](https://x.com/0xLogicLog/status/1938291521713017013) | [原文連結](https://github.com/paradigmxyz/artemis)
>
> **日期**: 
>
> **標籤**: `Rust` `MEV` `框架設計`

---

> **來源**: [@0xLogicLog (罗格 | Web3安全 & 套利)](https://twitter.com/0xLogicLog)
> **日期**: 2026-02-18
> **標籤**: `Rust` `MEV` `Artemis` `Trait` `動態分發`

---

## 技術筆記

在閱讀 MEV 框架 Artemis 時，修復了一些過時的套件依賴，同時學習到 Rust 程式設計的關鍵知識點。

### Rust Trait 與動態分發

Rust 為了實現介面，使用的是 trait。當 trait 會被多個結構體使用時，需要使用動態分發 `<dyn T>`。但由於變數必須是可知大小的，因此需要搭配智能指標，例如 `<Box<dyn T>>`。

---

## Artemis 框架介紹

Artemis 是一個用 Rust 編寫 MEV 機器人的框架，設計理念強調簡單、模組化和高效能。

### 核心架構

Artemis 的核心架構採用事件處理管線（event processing pipeline）設計，由三個主要元件組成：

#### 1. Collectors（收集器）

收集器負責接收外部事件（如待處理交易、新區塊、市場訂單等），並將其轉換為內部事件表示形式。

#### 2. Strategies（策略）

策略包含每個 MEV 機會所需的核心邏輯。它們接收事件作為輸入，並計算是否存在任何機會（例如，策略可能會監聽市場訂單串流，以查看是否存在跨交易所套利機會）。策略會產生動作（actions）。

#### 3. Executors（執行器）

執行器處理動作，負責在不同領域執行這些動作（例如，提交交易、發布鏈下訂單等）。

### 已實現的策略

#### Opensea/Sudoswap NFT 套利

實現 Seaport 和 Sudoswap 之間的原子性跨市場 NFT 套利策略。

---

## 安裝與使用

### 前置需求

- Anvil

### 建置與測試

```bash
# 複製專案
git clone https://github.com/paradigmxyz/artemis
cd artemis

# 執行測試
cargo test --all
```

### 執行 Opensea-Sudoswap 套利策略

```bash
cargo run -- \
  --wss <INFURA_OR_ALCHEMY_KEY> \
  --opensea-api-key <OPENSEA_API_KEY> \
  --private-key <PRIVATE_KEY> \
  --arb-contract-address <ARB_CONTRACT_ADDRESS> \
  --bid-percentage <BID_PERCENTAGE>
```

其中 `ARB_CONTRACT_ADDRESS` 是部署套利合約的地址。

---

## 技術規格

- **主要語言**: Rust (74.2%)
- **智能合約**: Solidity (25.0%)
- **授權**: Apache-2.0, MIT

---

## 相關資源

- [GitHub 專案](https://github.com/paradigmxyz/artemis)
- 參考專案：subway, subway-rs, cfmms-rs, rusty-sando, bundle-generator, ethers-rs, ethers-flashbots
