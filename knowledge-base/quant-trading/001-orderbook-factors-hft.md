# 高頻交易中的 6 個盤口因子

> **來源**: [@0xYuCry](https://x.com/0xyucry/status/1995775488149860748)
>
> **日期**: 2025-12-02
>
> **標籤**: `HFT` `Order Book` `Market Microstructure` `盤口因子`

---

## 符號定義（L1 數據）

| 符號 | 說明 |
|------|------|
| `bid1_t` / `ask1_t` | 買一價 / 賣一價 |
| `bidVol1_t` / `askVol1_t` | 買一 / 賣一掛單量 |
| `mid_t` | 中間價 = `(bid1_t + ask1_t) / 2` |
| `spread_t` | 價差 = `ask1_t - bid1_t` |
| `VWAP_t` | 成交量加權成交價（短窗口） |

---

## Factor 1：VWAP 偏離 — 成交重心 vs 報價中樞

```
factor1_t = (VWAP_t - mid_{t-1}) / spread_t
```

**核心邏輯**：
- `mid_{t-1}` 是報價系統認為的公平中點
- `VWAP_t` 是資金「真實把成交落在哪」
- 若 VWAP 長期在 mid 上方 → 主動買盤在挑戰當前報價共識，多頭在用真金白銀抬價

**設計細節**：
- 歸一到 spread 後，不同標的、不同價格區間下保持可比性
- 弱化微小價差噪音
- 本質是**行為層面的 order flow 信號**，比拆成交量或買賣手數更穩

---

## Factor 2：價差歸一 — 流動性狀態 & 波動敏感度

```
factor2_t = (ask1_t - bid1_t) / (ask1_t + bid1_t) ≈ spread_t / (2 * mid_t)
```

**核心邏輯**：spread 不只是交易成本，而是**市場狀態變量**：

| 狀態 | 含義 |
|------|------|
| spread 收窄 | 做市商貼近 → 小單也能推 mid → 價格對訂單流更敏感 |
| spread 拉寬 | 做市商怕 adverse selection → mid 更難推，但一旦動起來跳得更猛 |

**實戰用途**：
- 不是直接交易信號
- 常用於 **regime 分桶**：不同 spread 桶裡 IC 完全是兩種世界

---

## Factor 3：盤口量不平衡（Imbalance） — 結構性信號

```
factor3_t = (askVol1_t - bidVol1_t) / (askVol1_t + bidVol1_t)
```

**核心邏輯**：
- 不是「買一多 → 要漲」
- 真正含義：**哪一側的流動性更脆弱，mid 往哪裡走更省力**

**具體解讀**：
- `bidVol1` 遠大於 `askVol1` 時：
  - 向下砸盤成本高（厚 bid）
  - 向上吃盤成本低（薄 ask）
- imbalance 描述的是 mid 的「**最小阻力方向**」

**注意事項**：
- 容易被「假掛單 + 高頻撤單」干擾
- 必須配合時間維度使用

---

## Factor 4：動態壓強 — 從截面到「盤口動作」

靜態只看這一刻盤口形狀（如 factor3）；動態要看盤口**實際在做什麼動作**。

**偽代碼**：

```python
# Ask 側
if ask1_t > ask1_{t-1}:        # 賣一抬價
    askPress_t = -(askVol1_t - askVol1_{t-1})
elif ask1_t < ask1_{t-1}:      # 賣一降價
    askPress_t = +askVol1_t
else:
    askPress_t = askVol1_t - askVol1_{t-1}

# Bid 側類似

factor4_t = bidPress_t - askPress_t
```

**有效壓強的判定**：

| 動作 | 含義 |
|------|------|
| bid 抬價 + 補量 | 真買力 |
| ask 下移 + 減量 | 真退讓 |
| 價格方向 + 掛單變化同向 | 有效壓強 |

**與 Factor 3 的本質區別**：
- factor3 = 靜態結構
- factor4 = **行為結構**（誰在主動推盤子）
- 行為因子能過濾掉「只是掛著但不想成交」的假信號

---

## Factor 5：極簡壓強 — 只記錄能動價格的事件

**思路**：把所有弱動作、噪音都抹掉，只保留**足夠動 mid 的強事件**。

```python
if mid_t > mid_{t-1} and bidPress_t 顯著為正:
    factor5_t = +strong_buy
elif mid_t < mid_{t-1} and askPress_t 顯著為正:
    factor5_t = -strong_sell
else:
    factor5_t = 0
```

**設計原則**：
- 價格真跳了 + 盤口真出力 → 才算信號
- **寧可少，不要髒**
- 適合超高頻 — 觸發就下單，不觸發就空倉
- 常用於做模型 **gating**（過濾低質量時刻）

---

## Factor 6：Microprice 偏離 — 盤口的「勢能中心」

**Microprice 公式**（權重用對側量）：

```
micro_t = ask1_t × (bidVol1_t / (askVol1_t + bidVol1_t))
         + bid1_t × (askVol1_t / (askVol1_t + bidVol1_t))
```

**因子**：

```
factor6_t = (micro_t - mid_t) / spread_t
```

**直觀理解**：

| 情況 | Microprice 位置 | 含義 |
|------|----------------|------|
| `bidVol1` 大 | micro 靠向 ask | 上推傾向強 |
| `askVol1` 大 | micro 靠向 bid | 下推傾向強 |

**核心概念**：
- `mid` 是幾何中心
- `micro` 是「買賣力量計算出來的**勢能中心**」
- 若 `micro > mid`：買方勢能更大，mid 向上漂移是回歸平衡的自然路徑
- `sign(factor6)` 單獨就是一個不錯的短期方向預測器
- 在**窄 spread + 正常流動性**的 regime 下效果尤佳

---

## 因子總覽

| # | 名稱 | 類型 | 核心作用 |
|---|------|------|----------|
| 1 | VWAP 偏離 | Order Flow | 成交重心偏離方向 |
| 2 | 價差歸一 | Regime | 流動性狀態分桶 |
| 3 | 盤口 Imbalance | 靜態結構 | 最小阻力方向 |
| 4 | 動態壓強 | 行為結構 | 誰在主動推盤 |
| 5 | 極簡壓強 | 事件驅動 | 強信號 gating |
| 6 | Microprice 偏離 | 勢能 | 短期方向預測 |
