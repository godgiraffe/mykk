# PublicNode：102 條區塊鏈的免費公開 RPC 端點服務

> **來源**: [@0xLogicLog](https://x.com/0xLogicLog/status/1984251989111472217) | [原文連結](https://publicnode.com/)
>
> **日期**: Fri Oct 31 13:31:54 +0000 2025
>
> **標籤**: `RPC服務` `區塊鏈基礎設施` `開發工具`

---

> **來源**: [@0xLogicLog (罗格 | Web3安全 & 套利)](https://twitter.com/0xLogicLog)
> **日期**: 2026-02-17
> **標籤**: `區塊鏈` `RPC` `開發工具` `Web3`

---

## 簡介

與區塊鏈直接互動需要 RPC（Remote Procedure Call）端點。以下介紹兩個提供公開免費且全面的 RPC URL 網站，非常適合用於撰寫測試範例，或硬編碼到程式碼中。

## 推薦服務

### PublicNode

**網站**：https://www.publicnode.com

**特色**：
- 支援 102 條區塊鏈
- 提供最快速、免費且注重隱私的 RPC 端點
- 包含異構鏈（非 EVM 鏈）
- 同時提供 HTTPS 和 WebSocket (WS) 端點
- 提供節點快照（Node Snapshots）和種子服務（Seed Service）

**使用統計**（最近 24 小時）：
- 總請求數：7,639,264,235
- 快取請求比例：41.39%
- 平均每秒請求數：88,417
- 當前每秒請求數：94,841

### ChainList

**網站**：https://chainlist.org

**特色**：
- 專注於 EVM 兼容鏈的 RPC
- 提供可達性和延遲篩選功能
- 可依據網路狀態選擇最佳 RPC 端點

## 主要支援的區塊鏈（按 24 小時請求量排序）

### 前十大網路

| 區塊鏈 | 節點數 | 24h 請求數 | 每秒請求數 | 端點類型 |
|--------|--------|-----------|-----------|----------|
| Ethereum | 54 | 3,130,867,200 | 38,439 | RPC, WS, Beacon API |
| BNB Smart Chain | 13 | 1,367,821,618 | 18,429 | RPC, WS |
| Polygon | 10 | 719,489,221 | 8,487 | Bor RPC/WS, Heimdall RPC/WS/REST |
| Base | 15 | 318,023,080 | 3,417 | RPC, WS |
| Avalanche | 14 | 181,345,178 | 2,261 | C-Chain, P-Chain, X-Chain |
| Osmosis | 8 | 164,991,648 | 1,841 | RPC, WS, GRPC, REST |
| Aptos | 2 | 162,397,909 | 2,430 | REST |
| Arbitrum | 11 | 139,051,254 | 1,429 | One, Nova RPC/WS |
| Optimism | 12 | 126,552,212 | 1,646 | RPC, WS |
| Sui | 11 | 101,931,022 | 1,109 | RPC, WS |

### 其他主要網路

**Layer 2 / Rollup**：
- dYdX (94M 請求/天)
- Scroll (32M 請求/天)
- Linea (52M 請求/天)
- Blast (37M 請求/天)
- Unichain (36M 請求/天)
- Sonic (44M 請求/天)

**非 EVM 鏈**：
- Solana (90M 請求/天) - 支援 Yellowstone GRPC
- Cosmos (25M 請求/天)
- Terra (58M 請求/天)
- Polkadot (11M 請求/天)
- Aptos (162M 請求/天)

**其他 EVM 鏈**：
- Cronos (63M 請求/天)
- PulseChain (40M 請求/天)
- Gnosis (32M 請求/天)
- Moonbeam (19M 請求/天)

## 支援的端點類型

PublicNode 根據不同區塊鏈提供多種端點類型：

### EVM 鏈
- **RPC**：標準 JSON-RPC 端點
- **WS RPC**：WebSocket 端點（實時數據）
- **Beacon API**：以太坊共識層 API（PoS 相關）

### Cosmos 生態
- **RPC / WS RPC**：Tendermint RPC
- **GRPC / GRPC-WEB**：高效能 gRPC 端點
- **REST / LCD**：RESTful API

### 特殊端點
- **Heimdall**（Polygon）：Polygon 驗證層
- **Yellowstone GRPC**（Solana）：Solana 專用高效能串流
- **CHAIN STREAM**（Injective）：Injective 專用串流服務

## 測試網支援

大多數主流鏈都提供測試網端點，例如：
- Ethereum Sepolia / Hoodi
- BNB Smart Chain Testnet
- Polygon Amoy
- Base Sepolia
- Avalanche Fuji
- Arbitrum Sepolia

## 適用場景

1. **開發測試**：快速接入多鏈進行開發測試
2. **原型驗證**：無需自行架設節點即可驗證想法
3. **多鏈應用**：輕鬆支援 100+ 條鏈的應用開發
4. **教學示範**：提供穩定的公開端點用於教學
5. **臨時部署**：快速部署需要多鏈支援的專案

## 注意事項

- 公開 RPC 有速率限制，生產環境建議使用付費服務或自建節點
- 不應在公開 RPC 上進行敏感操作（如大額交易）
- 建議監控端點可用性，必要時準備備用端點
