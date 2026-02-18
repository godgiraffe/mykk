# Rindexer：基於 Rust 的高效 EVM 數據索引工具

> **來源**: [@0xKaKa03](https://x.com/0xKaKa03/status/1949383498936332625) | [原文連結](https://github.com/joshstevens19/rindexer)
>
> **日期**: Sun Jul 27 08:16:58 +0000 2025
>
> **標籤**: `EVM` `數據索引` `開源工具`

---

> **來源**: [@0xKaKa03 (Sliipy⚡)](https://twitter.com/0xKaKa03)
> **日期**: 2026-02-18
> **標籤**: `rindexer` `EVM` `indexer` `Rust` `區塊鏈數據索引` `開源工具`

---

## 簡介

Rindexer 是一個基於 Rust 開發的開源 EVM 數據索引工具，支援任何 EVM 兼容鏈。使用者可以透過簡單的 YAML 配置檔快速索引鏈上事件，無需編寫任何程式碼。對於有數據分析需求的開發者來說是一個高效的解決方案。

## 核心特性

### 無代碼索引
- 透過 YAML 配置檔即可索引鏈上事件
- 無需編寫額外程式碼
- 快速原型開發和 MVP 建置

### 技術優勢
- **高性能**：基於 Rust 實作，提供極速索引能力
- **廣泛相容性**：支援任何 EVM 兼容鏈
- **高度可擴展**：提供進階功能框架，可建構客製化索引管道
- **內建 GraphQL API**：索引完成後即可透過 GraphQL 查詢數據

### 支援的網路
支援所有 EVM 鏈，包括：
- 自定義鏈只需在 YAML 配置中添加 RPC URL 和 chain ID
- 無需修改任何程式碼

## 安裝方式

### Linux/macOS
```bash
curl -L https://rindexer.xyz/install.sh | bash
```

### Windows
需要使用 Git BASH 或 WSL，不支援 Powershell 或 Cmd。

### Docker
使用預建的 Docker 映像：
```bash
# Docker image
ghcr.io/joshstevens19/rindexer

# 創建新專案
docker run -it -v $PWD:/app/project_path ghcr.io/joshstevens19/rindexer new -p /app/project_path no-code

# 使用現有專案
export PROJECT_PATH=/path/to/your/project
export DATABASE_URL="postgresql://user:pass@postgres/db"
docker-compose up -d
```

### Kubernetes (Helm Chart)
提供 Helm chart 用於 Kubernetes 部署，詳見專案中的 Helm Chart README。

## 基本使用

安裝完成後可使用以下命令：

```bash
rindexer --help

# 主要命令：
rindexer new           # 創建新專案（no-code 或 rust）
rindexer start         # 啟動索引器、GraphQL API 或兩者
rindexer add           # 添加合約到 rindexer.yaml
rindexer codegen       # 基於 yaml 或 graphql 查詢生成 rust 代碼
rindexer delete        # 刪除 postgres 或 csv 數據
rindexer phantom       # 添加自定義事件到合約
```

## 應用場景

- **Hackathons**：快速為 dApp 建立索引器和 API
- **數據報告**：鏈上數據分析和報告
- **進階索引器**：建構客製化索引解決方案
- **快速原型**：POC 和 MVP 開發
- **企業級方案**：為專案提供標準化索引解決方案

## 專案結構

### core
核心邏輯，包含所有索引功能的主要代碼。

### cli
命令列介面，使用者與 rindexer 互動的主要方式。

### graphql
基於 PostGraphile 的 Express 專案，在 Rust 建置過程中使用 `pkg` 自動打包成二進制檔。

建置流程：
- `cargo build` 時自動建置
- 偵測目標架構（macOS、Linux、Windows）
- 智慧重建：僅在原始碼變更時重建
- 開發需要 Node.js 和 npm

開發指令：
```bash
cd graphql
npm install
npm start
```

### documentation
使用 [vocs](https://vocs.dev) 建置的文件網站。

### examples
範例專案，展示不同使用方式：

#### No-code 範例（僅 YAML）
- `rindexer_demo_cli` — 基礎 PostgreSQL 索引（RocketPool ETH 轉帳）
- `nocode_clickhouse` — 基礎 ClickHouse 索引
- `rindexer_demo_custom_indexing` — 客製化索引模式
- `rindexer_native_transfers` — 索引原生 ETH 轉帳（使用 trace_block）
- `streams_playground` — 串流整合：Kafka、RabbitMQ、Redis、Webhook

#### Rust 範例（完整 Rust 專案）
- `rindexer_rust_playground` — 多合約、多網路、雙存儲（PostgreSQL + CSV）
- `rindexer_factory_indexing` — Factory 模式索引（動態發現 Uniswap V3 合約）
- `clickhouse_factory_indexing` — Factory 模式 + ClickHouse
- `rust_clickhouse` — 最小化 Hello World（單合約、單網路）

#### Table 範例（數據轉換）
- `tables_erc20_balances` — 追蹤 ERC20 代幣餘額（加減運算）
- `tables_erc20_allowances` — 追蹤授權額度（owner → spender）
- `tables_erc721_ownership` — 追蹤 NFT 擁有權
- `tables_erc1155_balances` — 追蹤 ERC1155 餘額（支援 TransferBatch）
- `tables_dex_pool` — 追蹤 Uniswap V2 池狀態（儲備、交易量、LP 位置）
- `tables_factory_uniswap` — Factory + tables：追蹤 Uniswap V3 池交換指標
- `tables_governance` — 追蹤治理投票（複合主鍵）
- `tables_token_supply` — 追蹤代幣供應（鑄造/銷毀，使用全域表）
- `tables_registry_delete` — 演示刪除操作（維護活躍發送者註冊表）
- `tables_view_calls` — 使用鏈上 view call 數據豐富事件
- `tables_cron_chainlink_price` — 定時抓取 Chainlink 價格
- `tables_cron_historical_sync` — 定時歷史同步：在過去區塊重放操作
- `tables_factory_cron` — Factory + cron 組合模式

## 建置要求

### 開發環境
- Rust（最新穩定版）
- Node.js 和 npm（用於建置 GraphQL 伺服器）

### 本地建置
```bash
cargo build
```

首次建置會較慢，因為需要：
- 安裝 GraphQL 伺服器的 npm 依賴
- 為目標平台建置 GraphQL 二進制檔
- 編譯所有 Rust 代碼

後續建置會使用智慧快取，僅重建變更的元件。

### 生產建置
```bash
make prod_build
```
會建置並優化所有內容以用於生產環境。

### 程式碼格式化
```bash
cargo fmt
```
格式化規則定義在 `rustfmt.toml` 檔案中。

## 本地開發

使用 `cli` 資料夾中的 Makefile 命令來本地測試 CLI：
- 使用 `CURDIR` 解析路徑，開箱即用
- `examples/rindexer_demo_cli` 可用於測試（請勿提交變更）
- 也可使用 make 命令建立新的 no-code 專案

## 發布流程

1. Checkout `release/x.x.x` 分支（依據版本號）
2. 推送分支到 GitHub，觸發 CI 建置
3. 建置成功後，會自動建立包含更新日誌和版本的 PR
4. 審查並合併自動生成的 PR，將自動部署發布（從 release 分支建置二進制檔）

## 開源與貢獻

- **授權**：MIT License
- **貢獻**：歡迎任何人貢獻，可查看 issues 或提出新的功能建議和 bug 報告
- **Crate.io**：雖然可在 crate.io 上使用，但強烈建議使用 Git repository 安裝

## 相關資源

- 官網：https://rindexer.xyz
- 文件：https://rindexer.xyz/docs/introduction/installation
- GitHub：https://github.com/joshstevens19/rindexer
- Stars：658 | Forks：86 | Contributors：37+
- 最新版本：v0.36.0（2026-02-09）
