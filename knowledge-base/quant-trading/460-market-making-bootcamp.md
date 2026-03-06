---
title: "量化做市商 15 天完整學習計劃：訂單簿微觀結構到實盤交易"
date: "2026-02-18"
tags: 
  - "做市商"
  - "訂單簿微觀結構"
  - "量化交易"
summary: "這份高強度學習計劃將帶你從剛進入金融市場、有基礎訂單簿了解和 DeFi 經驗，到能夠接近專家的水平。包含多因子、機器學習、訂單簿博弈等內容。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 47
evergreenScore: 57
priorityScore: 65
curationNote: "先快速掃摘要與重點段落，再決定要精選或封存。"
source:
  tweetUrl: "https://x.com/0Xweaksheep/status/2023999208827855316"
  externalUrl: null
  authorUsername: "0Xweaksheep"
---

# 量化做市商 15 天完整學習計劃：訂單簿微觀結構到實盤交易

> **來源**: [@0Xweaksheep](https://x.com/0Xweaksheep/status/2023999208827855316)
>
> **日期**: Wed Feb 18 05:53:10 +0000 2026
>
> **標籤**: `做市商` `訂單簿微觀結構` `量化交易`

---

我將為你整理這篇文章的正文內容：

---

## 學習目標

這份高強度學習計劃將帶你從剛進入金融市場、有基礎訂單簿了解和 DeFi 經驗，到能夠接近專家的水平。包含多因子、機器學習、訂單簿博弈等內容。

## Day 1: 訂單簿物理現實與微觀結構基礎

1. 閱讀《Market Microstructure in Practice》Ch1-2（重點：限價單簿如何匹配、tick size、隊列位置）。

2. 用 ccxt 下載 Binance BTC/USDT 1 分鐘 Level2 訂單簿快照（深度 10 檔），寫代碼實時重建訂單簿，計算 mid price、microprice（加權 mid）、bid-ask spread。

3. 計算並可視化日內 spread 分布、訂單簿不平衡度（imbalance = (bid vol - ask vol)/(bid+ask vol)）。

**目標**：徹底理解價格形成的原子單位是訂單簿。

## Day 2: 庫存風險與逆向選擇的第一性認識

1. 推導做市商最基礎的 P&L 分解：spread 收入 - 庫存價格風險 - 逆向選擇損失。

2. 實現簡單對稱做市策略：在固定 spread（如 2*tick）下同時掛 bid/ask，每次成交後立即重新掛單。

3. 用歷史數據回測，統計庫存分布、最大回撤、被逆向選擇次數（成交後價格朝不利方向移動）。

**目標**：親眼看到不控制庫存必然爆倉。

## Day 3: Avellaneda-Stoikov 經典模型（最重要單篇論文）

1. 通讀《High-frequency trading in a limit order book》（2008），手動推導最優報價公式。

2. 實現 AS 模型：用歷史波動率估計 σ，用固定 γ（風險厭惡）計算最優 skew 和 spread。

3. 對比 Day2 的對稱策略，回測 Sharpe 提升。

**目標**：掌握從波動率和庫存推導最優報價的第一性方法。

## Day 4: 訂單流不平衡（OFI）與短期價格預測

1. 閱讀《Order Flow Imbalance》相關論文，理解 OFI 如何領先價格。

2. 計算 10 檔 OFI 序列，回歸預測未來 1-5 秒回報。

3. 將 OFI 信號加入 AS 模型，動態調整 skew。

**目標**：從訂單簿原始變化直接提取可交易信號。

## Day 5: 多因子信號構建（做市版）

1. 構建 5 個基礎因子：
   - 短期 OFI
   - 訂單簿不平衡
   - 近期 trade imbalance
   - 波動率（EWMA）
   - 成交量加權平均價格偏差（VWAP deviation）

2. 標準化後做線性組合，作為 AS 模型中的額外 skew 信號。

3. 回測多因子版本 vs 純 AS。

**目標**：實現「信號+庫存控制」的基本量化做市框架。

## Day 6: 庫存控制與動態 γ 調整

1. 實現均值回歸庫存控制：當庫存超過閾值時大幅 skew 報價甚至單邊報價。

2. 嘗試動態 γ（根據近期 P&L 或波動率調整風險厭惡）。

3. 對比不同庫存控制策略的庫存分布與收益。

**目標**：解決庫存失控的工程問題。

## Day 7: 價格衝擊與大單拆分

1. 學習 Kyle 模型與最優執行基礎，理解做市商自身下單也會吃掉流動性。

2. 實現當庫存超限時的主動市價單拆分（TWAP/VWAP/Implementation Shortfall）。

3. 加入到策略中測試清庫存成本。

**目標**：閉環庫存管理。

## Day 8: 機器學習預測訂單流（LSTM/Transformer）

1. 準備特徵：過去 30 個訂單簿快照的 10 檔 bid/ask volume+price 差分、OFI、trade 方向等（序列化成 3D tensor）。

2. 用 LSTM 預測未來 1-10 秒 mid price 方向或 OFI。

3. 將 ML 預測概率作為額外 skew 信號加入策略。

**目標**：用深度學習替代手工多因子。

## Day 9: 強化學習做市初步（PPO）

1. 閱讀《Deep Reinforcement Learning for Automated Stock Trading》與做市相關論文。

2. 用 stable-baselines3 實現簡單環境：狀態=（庫存，近期 OFI，spread），動作=（bid skew, ask skew），獎勵=即時 P&L - γ*庫存²。

3. 訓練並對比監督學習版本。

**目標**：理解 RL 在做市中的潛力與當前局限。

## Day 10: 訂單簿博弈：多做市商競爭

1. 閱讀《Limit Order Books as Games》，理解隊列位置競爭。

2. 實現「搶隊列」策略：在同價位用更小單子頻繁取消重掛搶前端。

3. 模擬兩個策略互相博弈（用歷史數據驅動），觀察誰吃到更多 spread。

**目標**：認識到做市是零和博弈，速度與取消率很重要。

## Day 11: 延遲套利與跨場所做市

1. 下載 Binance + OKX 同一交易對訂單簿，計算跨所 mid price 差。

2. 實現跨場所做市：在一個所用寬 spread 吃跨所差，在另一個所對沖。

3. 加入延遲懲罰與滑點估計。

**目標**：從多場所價差賺取無風險 spread。

## Day 12: 高頻特徵工程與特徵重要性

1. 構建 50+ 高頻因子（包括跨檔 volume ratio、訂單取消率、hidden liquidity 估計等）。

2. 用 LightGBM 對未來價格方向做特徵重要性排序。

3. 精簡到 Top10 因子，替換 Day5 的多因子。

**目標**：系統化信號挖掘。

## Day 13: 完整策略回測框架搭建

1. 搭建事件驅動回測引擎（自己寫或用 nautilus_trader/backtrader），支援：
   - Level2 訂單簿重放
   - 延遲模擬
   - 手續費/maker rebate
   - 隊列位置模擬

2. 將 Day3-12 的最佳組件組合成最終策略回測。

**目標**：擁有接近生產級的回測系統。

## Day 14: 風險管理與容量分析

1. 計算策略最大容量（隨資金增大 Sharpe 下降點）。

2. 加入 VaR、最大回撤、庫存限額、波動率縮放等風控。

3. 壓力測試（極端波動日、閃崩數據）。

**目標**：讓策略能活下來。

## Day 15: 實盤準備與總結

1. 選擇 1-2 個低風險交易對（BTC/ETH 永續），用小資金（<1% 本金）上實盤觀察 1 週。

2. 寫 500 字總結：你認為做市最核心的三件事是什麼？當前策略最大風險在哪裡？

3. 規劃下一步（接入更低延遲、更多特徵、更好 ML 模型）。

**目標**：從「接近專家」邁向「真正專家」。

## 推薦核心資源（必讀）

1. Avellaneda & Stoikov (2008) - 做市聖經
2. 《Trading and Exchanges》Larry Harris - 微觀結構經典
3. 《Advances in Financial Machine Learning》Marcos López de Prado - 因子工程部分
4. Cartea《Algorithmic and High-Frequency Trading》Ch8-9 - 數學推導最清晰

## 完成計劃後的成果

完成這個計劃後，你將擁有：

- 一個可實盤的量化做市框架（AS 模型 + 多因子/ML 信號 + 庫存控制）
- 對訂單簿博弈的深刻理解
- 完整的回測與風控體系

這不是「學習知識」，而是「造出一台能賺錢的機器」。執行力決定一切。
