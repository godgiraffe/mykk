# Ethereum MEV 資源彙編與套利工具指南

> **來源**: [@dan326714](https://x.com/dan326714/status/1996419977679863832) | [原文連結](https://github.com/Zacholme7/Mev-aholic/blob/main/eth.md)
>
> **日期**: 
>
> **標籤**: `MEV套利` `市場微觀結構` `DeFi開發`

---

太好了！我已經成功抓取到完整的 MEV 資源列表。現在讓我整理成結構化的繁體中文文章：

---

> **來源**: [@dan326714 (十年一梦)](https://twitter.com/dan326714)  
> **資源庫**: [Zacholme7/Mev-aholic](https://github.com/Zacholme7/Mev-aholic/blob/main/eth.md)  
> **標籤**: `MEV` `套利` `三明治攻擊` `清算機器人` `量化交易`

---

這是一份完整的 Ethereum MEV（Maximal Extractable Value）開源資源彙編，涵蓋套利、三明治攻擊、清算機器人等各類量化策略的實作項目與工具。

## 📊 資源總覽

| 分類 | 項目數量 | 說明 |
|------|---------|------|
| Arbitrage（套利） | 15 個 | DEX 間套利、閃電貸套利、跨鏈套利 |
| Sando（三明治攻擊） | 4 個 | 搶跑/夾擊交易策略 |
| Liquidation（清算） | 9 個 | DeFi 協議清算機器人 |
| Symbolic Execution（符號執行） | 7 個 | 智能合約形式化驗證工具 |
| Longtail（長尾機會） | 6 個 | NFT 搶購、新幣狙擊等 |
| Util/Misc（工具與框架） | 24 個 | MEV 基礎設施與輔助工具 |
| 其他資源庫 | 8 個 | MEV 研究與教學資料彙編 |
| Sleuthing（數據分析平台） | 8 個 | MEV 交易監控與分析工具 |
| Writers（內容創作者） | 3 個 | MEV 領域技術寫手 |

## 🔄 Arbitrage（套利機器人）

主流的 DEX 套利實作項目，多數基於 Flashbots 基礎設施：

- **[paco0x/amm-arbitrageur](https://github.com/paco0x/amm-arbitrageur)** - AMM 自動化套利框架
- **[flashbots/simple-arbitrage](https://github.com/flashbots/simple-arbitrage)** - Flashbots 官方簡易套利範例
- **[thasarito/simple-arbitrage-rs](https://github.com/thasarito/simple-arbitrage-rs)** - Rust 版本套利實作
- **[KuTuGu/FrontrunBot](https://github.com/KuTuGu/FrontrunBot)** - 搶跑機器人
- **[BowTiedDevil/degenbot](https://github.com/BowTiedDevil/degenbot)** - Python 套利框架
- **[ControlCplusControlV/Arbitrage-Example](https://github.com/ControlCplusControlV/Arbitrage-Example)** - 閃電貸套利教學範例
- **[mev-squad/Atomic-Arbitrage](https://github.com/mev-squad/Atomic-Arbitrage)** - 原子化套利合約
- **[ccyanxyz/uniswap-arbitrage-analysis](https://github.com/ccyanxyz/uniswap-arbitrage-analysis)** - Uniswap 套利數據分析
- **[dexloom/loom](https://github.com/dexloom/loom)** - 高性能 MEV 框架（Rust）
- **[flashbots/hindsight](https://github.com/flashbots/hindsight)** - 歷史套利機會回測工具
- **[RenatoDev3/rusty-john](https://github.com/RenatoDev3/rusty-john)** - Rust MEV 工具集
- **[eeish/unibot-rs](https://github.com/eeish/unibot-rs)** - Uniswap 交易機器人（Rust）
- **[kyzooghost/arbitrage-graph-engine](https://github.com/kyzooghost/arbitrage-graph-engine)** - 圖論套利路徑搜尋
- **[Zacholme7/BaseBuster](https://github.com/Zacholme7/BaseBuster)** - Base L2 套利工具
- **[DeGatchi/merkle-generator](https://github.com/DeGatchi/merkle-generator)** - Merkle 證明生成器

## 🥪 Sando（三明治攻擊）

專門針對 mempool 中的待處理交易進行夾擊的策略實作：

- **[libevm/subway](https://github.com/libevm/subway)** - 企業級三明治攻擊框架
- **[mouseless0x/rusty-sando](https://github.com/mouseless0x/rusty-sando)** - Rust 三明治機器人
- **[refcell/subway-rs](https://github.com/refcell/subway-rs)** - 輕量級 Rust 實作
- **[0xethghost/sando-rs](https://github.com/0xethghost/sando-rs)** - 另一個 Rust 版本

## 💧 Liquidation（清算機器人）

針對各大 DeFi 協議的清算機會監控與執行工具：

- **[yieldprotocol/yield-liquidator](https://github.com/yieldprotocol/yield-liquidator)** - Yield Protocol 清算機器人
- **[0xCalibur/abracadabra-money-liquidation-bot](https://github.com/0xCalibur/abracadabra-money-liquidation-bot)** - Abracadabra 清算工具
- **[haydenshively/New-Bedford](https://github.com/haydenshively/New-Bedford)** - 通用清算框架
- **[blockworks-foundation/liquidator-v3](https://github.com/blockworks-foundation/liquidator-v3)** - Mango Markets v3 清算器
- **[etherhood/Liquidator-Morpho](https://github.com/etherhood/Liquidator-Morpho)** - Morpho 協議清算工具
- **[liquity/liqbot](https://github.com/liquity/liqbot)** - Liquity 官方清算機器人
- **[massun-onibakuchi/grim-reaper](https://github.com/massun-onibakuchi/grim-reaper)** - 多協議清算聚合器
- **[ialberquilla/aave-liquidation](https://github.com/ialberquilla/aave-liquidation)** - Aave 清算實作
- **[fxfactorial/liquidation-bot-fall-2020](https://github.com/fxfactorial/liquidation-bot-fall-2020)** - 歷史清算機器人案例

## 🔬 Symbolic Execution（符號執行工具）

用於智能合約形式化驗證與漏洞發掘的符號執行引擎：

- **[Koukyosyumei/rhoevm](https://github.com/Koukyosyumei/rhoevm)** - 輕量級 EVM 符號執行器
- **[palkeo/pakala](https://github.com/palkeo/pakala)** - 自動化漏洞搜尋工具
- **[ethereum/hevm](https://github.com/ethereum/hevm)** - Ethereum Foundation 符號執行器（Haskell）
- **[trailofbits/manticore](https://github.com/trailofbits/manticore)** - Trail of Bits 符號執行框架
- **[leonardoalt/dl_symb_exec_sol](https://github.com/leonardoalt/dl_symb_exec_sol)** - Solidity 符號執行研究項目
- **[acuarica/evm](https://github.com/acuarica/evm)** - EVM 語義分析工具
- **[HackMD 符號執行指南](https://hackmd.io/@SaferMaker/EVM-Sym-Exec)** - 教學文檔

## 🦊 Longtail（長尾 MEV 機會）

針對特定場景的 MEV 策略，如 NFT mint、新幣狙擊等：

- **[Anish-Agnihotri/flashside](https://github.com/Anish-Agnihotri/flashside)** - 閃電貸跨鏈套利
- **[Supercycled/cake_sniper](https://github.com/Supercycled/cake_sniper)** - PancakeSwap 新幣狙擊
- **[0xAlcibiades/WolfGameMEV](https://github.com/0xAlcibiades/WolfGameMEV)** - NFT 遊戲 MEV 案例
- **[duckdegen/apebot](https://github.com/duckdegen/apebot)** - 自動化跟單機器人
- **[greekfetacheese/rs-uniswap-sniper](https://github.com/greekfetacheese/rs-uniswap-sniper)** - Uniswap 新幣狙擊（Rust）
- **[marktoda/uniswapx-artemis](https://github.com/marktoda/uniswapx-artemis)** - UniswapX 訂單流策略

## 🛠️ Util/Misc（工具與框架）

MEV 開發的基礎設施與輔助工具：

**核心框架：**
- **[alloy-rs/alloy](https://github.com/alloy-rs/alloy)** - Rust Ethereum 開發工具集
- **[bluealloy/revm](https://github.com/bluealloy/revm)** - Rust EVM 實作
- **[paradigmxyz/reth](https://github.com/paradigmxyz/reth)** - Rust Ethereum 客戶端
- **[paradigmxyz/artemis](https://github.com/paradigmxyz/artemis)** - MEV 策略框架

**AMM 工具：**
- **[0xKitsune/cfmms-rs](https://github.com/0xKitsune/cfmms-rs)** - CFMM 數學函式庫
- **[darkforestry/amms-rs](https://github.com/darkforestry/amms-rs)** - AMM 協議適配器

**路徑與優化：**
- **[solidquant/defi-path-finder](https://github.com/solidquant/defi-path-finder)** - DeFi 套利路徑搜尋
- **[mevcheb/optimal-sandwich](https://github.com/mevcheb/optimal-sandwich)** - 最優三明治攻擊計算
- **[lu-bann/swap-optimizer](https://github.com/lu-bann/swap-optimizer)** - 交易路徑優化器

**數據同步與儲存：**
- **[Zacholme7/PoolSync](https://github.com/Zacholme7/PoolSync)** - 流動性池數據同步工具
- **[Zacholme7/NodeDB](https://github.com/Zacholme7/NodeDB)** - 區塊鏈數據本地緩存

**合約開發：**
- **[Vectorized/multicaller](https://github.com/Vectorized/multicaller)** - 批量調用優化合約
- **[huff-language/huff-examples](https://github.com/huff-language/huff-examples)** - Huff 語言範例
- **[ControlCplusControlV/Yul-Optimization-Tips](https://github.com/ControlCplusControlV/Yul-Optimization-Tips)** - Yul 優化技巧

**其他工具：**
- **[Dedaub/storage-extractor](https://github.com/Dedaub/storage-extractor)** - 合約儲存槽提取工具
- **[degatchi/mev-template-rs](https://github.com/degatchi/mev-template-rs)** - Rust MEV 項目模板
- **[0xAlcibiades/mev-bundle-generator](https://github.com/0xAlcibiades/mev-bundle-generator)** - Bundle 打包工具
- **[flashbots/mev-flood](https://github.com/flashbots/mev-flood)** - MEV 壓力測試工具
- **[ralexstokes/mev-rs](https://github.com/ralexstokes/mev-rs)** - MEV Rust 函式庫
- **[valo/eth-sim](https://github.com/valo/eth-sim)** - 交易模擬工具
- **[pawurb/univ3-revm-arbitrage](https://github.com/pawurb/univ3-revm-arbitrage)** - Uniswap V3 套利（使用 REVM）
- **[jtriley-eth/uni-v4-core-flashloans](https://github.com/jtriley-eth/uni-v4-core-flashloans)** - Uniswap V4 閃電貸

## 📚 其他資源庫

更多 MEV 相關的資源彙編與研究資料：

- **[autistic-symposium/mev-toolkit](https://github.com/autistic-symposium/mev-toolkit)** - MEV 工具包
- **[0xOsiris/Mev_Book](https://github.com/0xOsiris/Mev_Book)** - MEV 電子書
- **[0xemperor/Awesome-MEV](https://github.com/0xemperor/Awesome-MEV)** - Awesome MEV 資源列表
- **[0xalpharush/awesome-MEV-resources](https://github.com/0xalpharush/awesome-MEV-resources)** - MEV 資源彙編
- **[HilliamT/awesome-mev-searching](https://github.com/HilliamT/awesome-mev-searching)** - MEV 搜尋策略資源
- **[Dogetoshi/MEV](https://github.com/Dogetoshi/MEV)** - MEV 教學資源
- **[flashbots/mev-research](https://github.com/flashbots/mev-research)** - Flashbots MEV 研究論文
- **[0xmebius/mev](https://github.com/0xmebius/mev)** - MEV 資源整理

## 🔍 Sleuthing（MEV 數據分析平台）

監控與分析鏈上 MEV 活動的工具與平台：

- **[Sorella Labs Explorer](https://sorellalabs.xyz/explorer)** - MEV 交易瀏覽器
- **[libmev.com](https://libmev.com/)** - MEV 數據分析平台
- **[EigenPhi](https://eigenphi.io/)** - MEV 與套利數據追蹤
- **[MEV Watch](https://www.mevwatch.info/)** - MEV 活動監控
- **[Arkham Intelligence](https://info.arkm.com/)** - 鏈上情報平台
- **[ZeroMEV](https://zeromev.org/)** - MEV 保護與監控
- **[Payload](https://payload.de/data/)** - 區塊構建數據分析
- **[RelayScan](https://www.relayscan.io)** - MEV-Boost Relay 監控

## ✍️ Writers（技術寫手）

值得追蹤的 MEV 領域技術內容創作者：

- **[SolidQuant](https://medium.com/@solidquant)** - Medium 技術文章
- **[Degatchi](https://degatchi.com/)** - MEV 開發教學
- **[EigenPhi Substack](https://substack.com/@eigenphi)** - MEV 研究報告

---

## 💡 使用建議

1. **新手入門**：從 Flashbots 官方的 `simple-arbitrage` 開始學習基礎概念
2. **工具選擇**：優先使用 Rust 生態（Alloy + REVM + Artemis）以獲得最佳性能
3. **數據分析**：先用 EigenPhi、LibMEV 等平台研究歷史 MEV 機會
4. **策略開發**：根據資金規模選擇適合的策略（套利 > 清算 > 三明治攻擊）
5. **風險提示**：三明治攻擊等策略涉及灰色地帶，需謹慎評估法律與道德風險
