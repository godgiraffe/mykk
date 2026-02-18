# Bonkfun 遷移狙擊機器人：Raydium CPMM 套利工具

> **來源**: [@Fried_rice](https://x.com/Fried_rice/status/1955754921669877951) | [原文連結](https://github.com/fuzzland/bonkfun-sniper?src=x)
>
> **日期**: Wed Aug 13 22:14:44 +0000 2025
>
> **標籤**: `MEV` `套利` `Solana`

---

> **來源**: [Chaofan Shou (svm/acc)](https://github.com/fuzzland/bonkfun-sniper)
> **日期**: 2026-02-18
> **標籤**: `MEV` `Raydium` `CPMM` `套利機器人` `Solana` `Jito` `開源工具`

---

## 專案概述

這是一個 Bonkfun 遷移狙擊機器人（又稱 Cupsey sandwicher），用於在代幣從 Bonkfun 遷移到 Raydium CPMM 的過程中進行套利交易。該機器人曾經是速度最快的狙擊機器人之一，現已開源。

GitHub 專案地址：https://github.com/fuzzland/bonkfun-sniper

## 工作原理

機器人的核心策略是**在遷移真正發生之前就預測出 Raydium CPMM 的帳戶地址**，並在遷移完成前就開始發送大量的交換交易，從而搶佔先機進行套利。

## 設定參數

機器人支援以下命令列參數：

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `--rpc-url` | Solana RPC 端點 | `http://localhost:8899` |
| `--keypair-path` | 錢包密鑰對檔案路徑 | `keypair.json` |
| `--token-mint` | 目標代幣 mint 地址 | 無（必填） |
| `--amount-in-lamports` | 交易金額（以 lamports 為單位） | `1000000000` |
| `--jito-keypair-path` | Jito 密鑰對檔案路徑 | 無（選填，不使用可刪除相關程式碼） |
| `--bloxroute-api-key` | Bloxroute API 金鑰 | 無（選填，不使用可刪除相關程式碼） |
| `--zeroslot-api-key` | 0slot API 金鑰 | 無（選填，不使用可刪除相關程式碼） |

**注意**：1 SOL = 10^9 lamports

## 建置與執行

### 建置專案

```bash
cargo build --release
```

### 執行機器人

```bash
cargo run --release -- \
  --rpc-url <RPC_URL> \
  --keypair-path <KEYPAIR_PATH> \
  --token-mint <TOKEN_MINT_ADDRESS> \
  --amount-in-lamports <AMOUNT_IN_LAMPORTS> \
  --jito-keypair-path <JITO_KEYPAIR_PATH> \
  --bloxroute-api-key <API_KEY> \
  --zeroslot-api-key <API_KEY>
```

## 技術細節

- **語言**：Rust 100%
- **依賴**：包含 Jito 協議支援（`jito-protos` 目錄）
- **專案結構**：
  - `bonk/` - 核心邏輯目錄
  - `jito-protos/` - Jito 協議相關檔案
  - `Cargo.toml` / `Cargo.lock` - Rust 專案設定
  - `rust-toolchain.toml` - Rust 工具鏈版本設定

## 開發團隊

由 @publicqi、@tonykebot 和 @shoucccc 共同開發。

## 專案統計

- **Stars**: 176
- **Forks**: 81
- **Watchers**: 2
- **開源協議**：未明確標註
- **最新發布**：無正式 release 版本
