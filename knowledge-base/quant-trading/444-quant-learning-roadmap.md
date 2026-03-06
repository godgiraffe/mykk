---
title: "成為量化交易員完全指南"
date: ">"
tags: 
  - "量化交易"
  - "學習路線"
  - "衍生品定價"
summary: "這條路就像電玩遊戲的關卡，你無法跳關。每個概念都建立在前一個概念之上。但如果你投入真正的努力——不是看那些無聊的 YouTube 金融影片浪費時間，而是真正的問題解決工作——你可以在大約 18 個月內從零基礎成為專業人士。"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 49
evergreenScore: 57
priorityScore: 59
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/gemchange_ltd/status/2028904166895112617"
  externalUrl: "https://x.com/i/article/2028762672343257088"
  authorUsername: "gemchange_ltd"
---

# 成為量化交易員完全指南

> **來源**: [@gemchange_ltd](https://x.com/gemchange_ltd/status/2028904166895112617) | [原文連結](https://x.com/i/article/2028762672343257088)
>
> **日期**: 
>
> **標籤**: `量化交易` `學習路線` `衍生品定價`

---

> **來源**: [@gemchange_ltd (gemchanger)](https://x.com/gemchange_ltd)
> **日期**: 2025
> **標籤**: `量化交易` `職涯規劃` `數學` `程式設計` `衍生性商品`

---

## 如果必須重新開始，我會如何成為量化交易員

2025 年，頂級公司的入門級量化交易員總薪酬為 30 萬到 50 萬美元。

金融領域的 AI/ML 招聘年增 88%。

這篇文章涵蓋了我希望當初有人能交給我的所有內容，按照你應該學習的確切順序排列。

這條路就像電玩遊戲的關卡，你無法跳關。每個概念都建立在前一個概念之上。但如果你投入真正的努力——不是看那些無聊的 YouTube 金融影片浪費時間，而是真正的問題解決工作——你可以在大約 18 個月內從零基礎成為專業人士。

**免責聲明**：
非財務建議 & 請自行研究 & 市場涉及風險。
我自己的專案 - [@coldvisionXYZ](https://x.com/@coldvisionXYZ)

## 忘掉你對交易的所有認知

大多數人認為量化交易是關於選股、對 Tesla 有看法、預測盈餘。

量化交易是關於數學。

你主要處理的是統計關係、定價效率低下，以及因為市場是由會犯系統性錯誤的人類運行的複雜系統而存在的結構性優勢。

## 第一部分：機率是不確定性的語言

量化金融中的一切都歸結為一個問題：

**勝算是多少，勝算對我有利嗎？**

這就是機率。如果你不深入理解機率，這篇文章的其他內容都不重要。

### 條件思維

大多數人以絕對方式思考。某件事要麼是真的，要麼不是。

量化交易員以條件方式思考。**在我所知的情況下，這有多大可能性？**

給定 B 發生時 A 的機率，等於兩者同時發生的機率除以 B 的機率。這有深遠的影響。

一支股票 60% 的日子上漲——這是基礎機率。但在成交量高於平均的日子，它 75% 的時間上漲。

那個條件機率才是真正的信號。原始的 60% 只是雜訊。

### 貝氏定理

你的更新信念 = (如果你的假設為真，你看到這個數據的可能性) × (你的先驗信念) / (在任何假設下看到這個數據的總機率)

分母對所有假設求和。

實務上,你用蒙地卡羅抽樣計算這個。但邏輯是一樣的。貝氏定理是你如何即時更新你的信念。

一個模型說股票應該值 50 美元。財報出來，營收比預估高 3%。貝氏後驗機率向上移動。更新最快、最準確的交易員贏得麵包。

### 期望值和變異數：你最好的朋友

**期望值是你的信念。變異數是你的風險。**

如果你的策略有正期望值，而且你能承受變異數，你很可能會賺錢。

### 第一關作業（每天 2 小時，3-4 週）

1. **閱讀**：Blitzstein & Hwang, *Introduction to Probability*（哈佛免費 PDF）。完成第 1-6 章的每個問題。

2. **寫程式**：模擬 10,000 次擲硬幣，視覺化驗證大數法則。

3. **寫程式 2**：實作貝氏更新器，接受先驗和似然，回傳後驗。

```python
import numpy as np
import matplotlib.pyplot as plt

# 大數法則：移動平均收斂到真實機率
np.random.seed(42)
flips = np.random.choice([0, 1], size=10000, p=[0.5, 0.5])
running_avg = np.cumsum(flips) / np.arange(1, 10001)

plt.figure(figsize=(10, 4))
plt.plot(running_avg, linewidth=0.7)
plt.axhline(y=0.5, color='r', linestyle='--', label='True probability')
plt.xlabel('Number of flips')
plt.ylabel('Running average')
plt.title('Law of Large Numbers in Action')
plt.legend()
plt.savefig('lln.png', dpi=150)
print(f"After 10,000 flips: {running_avg[-1]:.4f} (true: 0.5000)")
```

## 第二部分：統計學

一旦你會說機率的語言，你需要學會聆聽數據。

這就是統計學，而統計學教你的第一課是：**「大多數看起來像信號的東西實際上都是雜訊。」**

### 假設檢定：BS 偵測器

你建立一個模型。回測年化報酬率 15%。這是真的嗎？

設定 H₀：「這個策略的期望報酬為零。」
計算檢定統計量。
計算 p 值——如果 H₀ 為真，看到這麼好結果的機率。

**但是**，如果你測試 1,000 個隨機策略，其中 50 個純粹因為隨機會顯示 p 值低於 0.05。

這就是多重比較問題。

你的修正方法是 **Bonferroni 校正**：將顯著性閾值除以測試次數。或使用 Benjamini-Hochberg 進行錯誤發現率控制。

每個初學者都大幅高估了他們找到的信號量。你的前 10 個策略都會是雜訊。現在就接受這點，省下很多錢。

### 迴歸：拆解報酬

線性迴歸 y = Xβ + ϵ 是主力工具。

在金融中，你將策略的報酬對已知風險因子做迴歸：

截距 α 是你的 alpha——無法用已知因子解釋的報酬。如果考慮因子後 α 為零，你的「優勢」只是偽裝的市場曝險。

OLS 估計量：β̂ = (X'X)⁻¹X'y

最重要的數字是 α。使用 Newey-West 標準誤——金融數據有自相關和異質變異數，所以預設的 OLS 標準誤是錯的。使用它們就像開著擋風玻璃破裂的車。

### 最大概似估計（MLE）

給定來自參數 θ 模型的數據 x₁, …, xₙ：

L(θ) = ∏ᵢ f(xᵢ | θ)

將導數設為零並求解。（否則就完了）

MLE 是你如何校準金融中的每個模型：擬合 GARCH 模型到波動率、估計跳躍擴散參數、將選擇權定價校準到市場報價。

它是漸近有效的——對於大樣本，沒有其他一致估計量有更低的變異數（Cramér-Rao 下界）。

當公司裡有人說他們在「校準」模型時，他們幾乎總是指 MLE。

### 第二關作業（4-5 週）

1. **閱讀**：Wasserman, *All of Statistics*, 第 1-13 章。

2. **寫程式**：用 yfinance 下載真實股票報酬。測試常態性（會失敗）。用 MLE 擬合 t 分佈。比較。

3. **寫程式**：用 statsmodels 對股票投資組合進行 Fama-French 三因子迴歸。

4. **寫程式**：實作排列檢定：隨機打亂日期 10,000 次，比較打亂後的表現與實際表現。

```python
import numpy as np
from scipy import optimize, stats

# 展示肥尾：對報酬數據進行 Student-t 的 MLE 擬合
np.random.seed(42)

# 模擬「真實」報酬（肥尾、輕微正漂移）
true_df = 4
returns = stats.t.rvs(df=true_df, loc=0.0005, scale=0.015, size=1000)

def neg_log_likelihood(params, data):
    df, loc, scale = params
    if df <= 2 or scale <= 0:
        return 1e10
    return -np.sum(stats.t.logpdf(data, df=df, loc=loc, scale=scale))

result = optimize.minimize(
    neg_log_likelihood, x0=[5, 0, 0.01], args=(returns,),
    method='Nelder-Mead'
)
fitted_df, fitted_loc, fitted_scale = result.x

print(f"MLE degrees of freedom: {fitted_df:.2f} (true: {true_df})")
print(f"MLE location:           {fitted_loc:.6f}")
print(f"MLE scale:              {fitted_scale:.6f}")

# 常態性檢定
_, p_normal = stats.normaltest(returns)
print(f"\nNormality test p-value: {p_normal:.2e}")
print(f"Reject normality? {'YES  fat tails confirmed' if p_normal < 0.05 else 'NO'}")
```

## 第三部分：線性代數

線性代數聽起來很無聊。但它是運行一切的機制：投資組合建構、PCA、神經網路、共變異數估計、因子模型。沒有線性代數的流暢度，你無法成為量化交易員。

### 以矩陣思考

共變異數矩陣 Σ 捕捉每個資產相對於其他每個資產的移動方式。對於 500 支股票，Σ 是 500×500，有 125,250 個唯一項目。投資組合變異數簡化為單一表達式：

σ²ₚ = w'Σw

這個二次型是 Markowitz 投資組合理論、風險管理、一切的核心。

### 特徵值：股票宇宙中真正重要的東西

看一個 500 支股票的宇宙，前 5 個特徵向量解釋了 70% 的所有變異數。其他一切都是雜訊。

第一次使用特徵分解時，整個世界都變了。看一個 500 支股票的宇宙，前 5 個特徵向量解釋了 70% 的所有變異數。降維，這是因子投資的基礎。

### 第三關作業（4-6 週）

1. **觀看**：Gilbert Strang 的 MIT 18.06 講座——全部。不可協商。

2. **閱讀**：Strang, *Introduction to Linear Algebra*。做習題。

3. **寫程式**：S&P 500 報酬的 PCA 分解。繪製特徵值譜。識別前 3 個成分。

4. **寫程式**：從頭實作 Markowitz 均值-變異數優化。

```python
import numpy as np
import cvxpy as cp

# ============================================
# 用 cvxpy 進行 Markowitz 優化
# ============================================
np.random.seed(42)
n_assets = 10
mu = np.random.uniform(0.04, 0.15, n_assets)
A = np.random.randn(n_assets, n_assets) * 0.1
cov = A @ A.T + np.eye(n_assets) * 0.01

w = cp.Variable(n_assets)
objective = cp.Minimize(cp.quad_form(w, cov))
constraints = [
    mu @ w >= 0.08,      # 最小報酬
    cp.sum(w) == 1,       # 完全投資
    w >= -0.1,            # 最多 10% 空頭
    w <= 0.3              # 最多 30% 多頭
]

prob = cp.Problem(objective, constraints)
prob.solve()

ret = mu @ w.value
vol = np.sqrt(w.value @ cov @ w.value)
sharpe = (ret - 0.03) / vol

print(f"Portfolio return:  {ret:.4f}")
print(f"Portfolio vol:     {vol:.4f}")
print(f"Sharpe ratio:      {sharpe:.4f}")
print(f"Weights: {np.round(w.value, 4)}")
```

## 第四部分：微積分與最佳化

微積分是變化的語言。在金融中，一切都在變化：價格、波動率、相關性，整個機率分佈每秒都在移動。微積分描述並利用這些變化。

### 導數（數學那種）

出現在每個神經網路反向傳播和每個希臘字母計算中。

**Taylor 展開**：

f(x+h) ≈ f(x) + f'(x)h + ½f''(x)h²

Delta 避險是一階近似。
Gamma 避險加上二階修正。
Itô 微積分與普通微積分不同的原因，正是因為對於隨機過程，二階 Taylor 項不會消失。記住這點。

### 第四關作業（4-5 週）

1. **閱讀**：Boyd & Vandenberghe, *Convex Optimization*（史丹佛免費 PDF），第 1-5 章。

2. **寫程式**：從頭實作梯度下降。最小化 Rosenbrock 函數。

3. **寫程式**：用 cvxpy 解決包含交易成本約束的投資組合優化問題。

## 第五部分：隨機微積分

在隨機微積分之前，你是一個喜歡金融的數據科學家。

之後，你就是量化交易員。量化金融專家，懂嗎？

這是你學習在連續時間中建模隨機性、從第一原理推導 Black-Scholes 方程式，以及理解為什麼兆美元衍生品市場以它的方式運作的地方。

### 布朗運動：純隨機性，形式化

布朗運動（Wiener 過程）Wₜ 是連續時間隨機遊走：

- W₀ = 0
- 增量 Wₜ - Wₛ ~ N(0, t - s) 對 t > s
- 不重疊的增量是獨立的
- 路徑連續但處處不可微

其他一切都依賴的關鍵洞察：dWₜ 的「大小」是 √dt，這意味著 (dWₜ)² = dt。這聽起來像技術細節，但它是量化金融中最重要的事實。

**幾何布朗運動**建模股價：

dSₜ = μSₜdt + σSₜdWₜ

### Itô 引理

在普通微積分中，df = f'(x)dx。你做 Taylor 展開，(dx)² 項無窮小——你捨棄它。

但當 x 是隨機過程時，(dWₜ)² = dt 是一階的。你不能捨棄它。

**Itô 引理**：

df = (∂f/∂t + μ∂f/∂x + ½σ²∂²f/∂x²)dt + σ∂f/∂x dW

將它應用於選擇權價格，你就得到 Black-Scholes。這個公式是整個衍生品產業背後的引擎。

### 從頭推導 Black-Scholes

用筆和紙跟著做。

**步驟 1**：設 V(S,t) 為選擇權價格。應用 Itô 引理：

dV = (∂V/∂t + μS∂V/∂S + ½σ²S²∂²V/∂S²)dt + σS∂V/∂S dW

**步驟 2**：構造 delta 避險投資組合 Π = V - (∂V/∂S)·S。計算 dΠ：

dΠ = (∂V/∂t + ½σ²S²∂²V/∂S²)dt

dW 項完美抵消。投資組合局部無風險。

**步驟 3**：無風險投資組合必須賺取無風險利率：dΠ = rΠ dt。

**步驟 4**：代入並重新排列：

∂V/∂t + rS∂V/∂S + ½σ²S²∂²V/∂S² = rV

這就是 **Black-Scholes PDE**。

注意發生了什麼——漂移 μ 消失了。選擇權價格不依賴於股票的期望報酬。風險偏好不重要。你可以把選擇權定價視為每個人都是風險中性的。第一次理解這點時——真正令人震驚。

對到期日為 T、行使價 K 的歐式買權求解此 PDE，得到：

C = S·N(d₁) - Ke⁻ʳᵀN(d₂)

其中 d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)，d₂ = d₁ - σ√T

### 希臘字母

- **Delta (Δ)**：每 1 美元股票移動，選擇權移動多少。你的避險比率。
- **Gamma (Γ)**：delta 變化的速度。你的凸性曝險。
- **Theta (Θ)**：時間衰減。對多頭選擇權通常為負。
- **Vega (V)**：對波動率的敏感度。大多數衍生品獲利的地方。
- **Rho (ρ)**：對利率的敏感度。

Delta 告訴你避險比率。Gamma 告訴你多久重新避險一次。Theta 是持有成本。Vega 是波動率交易部門的麵包和奶油。

### 第五關作業（6-8 週——最難的關卡）

1. **閱讀**：Shreve, *Stochastic Calculus for Finance II*。黃金標準。

2. **替代**：Arguin, *A First Course in Stochastic Calculus*（較新、更易理解）。

3. **推導**：對 f(S) = ln(S) 應用 Itô 引理，其中 S 遵循 GBM。得到 -σ²/2。

4. **推導**：從 delta 避險論證推導完整的 Black-Scholes 方程式。

5. **寫程式**：從頭實作 Black-Scholes。與蒙地卡羅比較。驗證收斂。

```python
import numpy as np
from scipy.stats import norm

def black_scholes(S, K, T, r, sigma, option_type='call'):
    d1 = (np.log(S/K) + (r + sigma**2/2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    if option_type == 'call':
        return S*norm.cdf(d1) - K*np.exp(-r*T)*norm.cdf(d2)
    else:
        return K*np.exp(-r*T)*norm.cdf(-d2) - S*norm.cdf(-d1)

def monte_carlo_option(S0, K, T, r, sigma, n_sims=500_000):
    """透過風險中性模擬定價（漂移 = r，不是 μ）"""
    Z = np.random.standard_normal(n_sims)
    ST = S0 * np.exp((r - sigma**2/2)*T + sigma*np.sqrt(T)*Z)
    payoffs = np.maximum(ST - K, 0)
    price = np.exp(-r*T) * np.mean(payoffs)
    stderr = np.exp(-r*T) * np.std(payoffs) / np.sqrt(n_sims)
    return price, stderr

def greeks(S, K, T, r, sigma):
    d1 = (np.log(S/K) + (r + sigma**2/2)*T) / (sigma*np.sqrt(T))
    d2 = d1 - sigma*np.sqrt(T)
    return {
        'delta': norm.cdf(d1),
        'gamma': norm.pdf(d1) / (S * sigma * np.sqrt(T)),
        'theta': -(S*norm.pdf(d1)*sigma)/(2*np.sqrt(T)) - r*K*np.exp(-r*T)*norm.cdf(d2),
        'vega':  S * np.sqrt(T) * norm.pdf(d1),
        'rho':   K * T * np.exp(-r*T) * norm.cdf(d2),
    }

# 驗證：蒙地卡羅收斂到 Black-Scholes
S, K, T, r, sigma = 100, 105, 1.0, 0.05, 0.2

bs = black_scholes(S, K, T, r, sigma)
mc, err = monte_carlo_option(S, K, T, r, sigma)
g = greeks(S, K, T, r, sigma)

print(f"Black-Scholes: ${bs:.4f}")
print(f"Monte Carlo:   ${mc:.4f} ± {err:.4f}")
print(f"Difference:    ${abs(bs - mc):.4f}\n")
for name, val in g.items():
    print(f"  {name:>6}: {val:.6f}")
```

## Polymarket

這是目前世界上最有趣的市場，背後的數學連接了本文的一切：機率、資訊理論、凸優化、整數規劃。

### LMSR 如何定價信念

對數市場評分法則（LMSR），由 Robin Hanson 發明，驅動自動化預測市場。n 個結果的成本函數：

C(q) = b·ln(∑ᵢ eqⁱ/ᵇ)

其中 qᵢ 追蹤結果 i 的未平倉股份，b 是流動性參數。結果 i 的價格：

pᵢ = eqⁱ/ᵇ / ∑ⱼ eqʲ/ᵇ

這就是 **softmax 函數**——驅動每個神經網路分類器的函數。

價格總是加總為 1，總是在 (0,1) 之間，並且總是存在——提供無限流動性。做市商的最大損失限制在 b·ln(n)。

## 量化交易職涯版圖

### 4 種原型

**量化研究員（Quant Researcher）**
最強的人，從 PB 級數據中發現模式、建立預測模型、設計策略。需要博士級別的數學/統計/ML，或傑出的大學成就。在 Jane Street 這樣的公司，QR 使用數萬個 GPU。

**量化開發/工程師（Quant Developer/Engineer）**
中等強度的人，主要是建構者。交易平台、執行引擎、即時數據管道。讓研究員的模型實際交易。需要生產級的 C++/Rust/Python、低延遲系統。

**量化交易員（Quant Trader）**
要麼是最大的賭徒，要麼是最強的人，主要是決策者。運行資本、管理風險、做即時決策。薪酬變異最高——傑出年份可達八位數。

**風險量化（Risk Quant）**
最強的人或經驗豐富的企業人士，主要是守護者。模型驗證、VaR、壓力測試、法規遵循。職涯更穩定，上限較低。新興的 AI/ML 量化角色——用深度學習生成信號——是成長最快的，2025 年招聘年增 88%。

### 薪酬水平

**頂級公司（Jane Street、Citadel、HRT）**：
- 新鮮人：$300K-$500K+ 總薪酬
- 中階（3-7 年）：$550K-$950K
- 資深（8+ 年）：$1M-$3M+
- 明星交易員/PM：$3M-$30M+

**中級公司（Two Sigma、DE Shaw）**：
- 新鮮人：$250K-$350K
- 中階（3-7 年）：$350K-$625K
- 資深（8+ 年）：$575K-$1.2M

Jane Street 的平均員工薪酬在 2025 年上半年報告為每年 140 萬美元。那是平均值。

### 面試關卡

履歷篩選 → 線上測驗（Zetamac 心算——目標 50+、邏輯謎題）→ 電話篩選（機率問題、賭博遊戲）→ 超級日（3-5 場連續面試、模擬交易、編碼、白板推導）。

Jane Street 給的問題故意難到你無法獨自解決——他們測試你如何使用提示和協作。

他們最近實習生班級超過三分之二學 CS；超過三分之一學數學。通常不需要金融知識。

### 第一準備資源

- **Xinfeng Zhou 的綠皮書**（*A Practical Guide to Quantitative Finance Interviews*）——200+ 真實問題
- 補充 QuantGuide.io（「量化的 LeetCode」）
- Brainstellar
- Jane Street 的 Figgie 卡牌遊戲

## 完整工具箱

### Python 技術棧

**數據**：pandas、polars（Polars 在大數據集上快 10-50 倍）
**數值**：numpy、scipy
**ML（表格）**：xgboost、lightgbm、catboost
**ML（深度）**：pytorch
**優化**：cvxpy
**衍生品**：QuantLib（產業級，C++ 後端）
**統計**：statsmodels
**回測**：NautilusTrader
**回測（較簡單）**：backtrader、vectorbt（更容易上手）
**量化研究**：Microsoft Qlib（17K+ 星，AI 導向）
**交易 RL**：FinRL（10K+ 星）

### C++ 和 Rust

老實說我不太懂這個。這是我找到的：
**C++ 函式庫**：QuantLib、Eigen、Boost
**Rust**：RustQuant 用於選擇權定價、NautilusTrader 作為 Rust+Python 範例（Rust 核心求速度，Python API 供研究）

### 數據來源

**免費**：yfinance、Finnhub（60 次/分鐘）、Alpha Vantage
**中階**：Polygon.io（$199/月，<20ms 延遲）、Tiingo
**企業**：Bloomberg Terminal（~$32K/年）、Refinitiv、FactSet
**區塊鏈**：Alchemy（免費層包含歷史存取）

### 求解器

**Gurobi**：最快的商業 MIP 求解器，免費學術授權。對組合套利至關重要。
**Google OR-Tools**：最強的免費求解器。
**PuLP/Pyomo**：Python 建模介面。

## 閱讀清單（按順序）

### 數學

1. Blitzstein & Hwang - *Introduction to Probability*（哈佛免費 PDF）
2. Strang - *Introduction to Linear Algebra* + MIT 18.06 講座
3. Wasserman - *All of Statistics*
4. Boyd & Vandenberghe - *Convex Optimization*（史丹佛免費 PDF）
5. Shreve - *Stochastic Calculus for Finance I & II*

### 量化金融

1. Hull - *Options, Futures, and Other Derivatives*
2. Natenberg - *Option Volatility and Pricing*
3. López de Prado - *Advances in Financial Machine Learning*
4. Ernest Chan - *Quantitative Trading*
5. Zuckerman - *The Man Who Solved the Market*

### 面試準備

1. Zhou - *Practical Guide to Quantitative Finance Interviews*（綠皮書 #1）
2. Crack - *Heard on the Street*
3. Joshi - *Quant Job Interview Questions*

### 競賽

- Jane Street Kaggle（$100K 獎金）
- WorldQuant BRAIN（100K+ 用戶，為 alpha 信號付費）
- Citadel Datathon（快速就業通道）
- Jane Street 月度謎題（高於面試難度）

## 我希望早點知道的三件事

### 1. 估計誤差才是真正的敵人

完全 Kelly 下注、無約束 Markowitz、太多特徵的 ML 模型——它們都因同樣原因失敗：**過度擬合參數估計中的雜訊**。

數學在真實參數下完美運作。你永遠沒有真實參數。理論與實務之間的差距總是估計誤差，最好的量化交易員是尊重它的人。

### 2. 工具已經民主化。信念沒有

任何人都可以存取 QuantLib、Polygon.io 和 PyTorch。技術是必要但不充分的。優勢存在於獨特數據、獨特模型或獨特執行——不是更好的 pip 安裝。

### 3. 數學是護城河

AI 可以寫程式碼和建議策略。但推導為什麼 Itô 引理有額外項、證明折現價格在風險中性測度下是鞅、知道組合市場中凸鬆弛何時緊密或鬆散的能力——這種數學流暢度區分了建立優勢的量化交易員和借用優勢的量化交易員。而借來的優勢會過期。

## 第二部分預告

第二部分涵蓋：奇異衍生品（障礙、亞式、回顧）、隨機波動率（Heston 模型校準）、跳躍擴散（Merton）、進階測度論（鞅表示、可選停止）、最佳執行的隨機控制（Almgren-Chriss）、做市的強化學習、金融時間序列的 transformer 架構、FPGA 交易基礎設施、WebSocket 饋送、平行執行、Frank-Wolfe 與 Gurobi 用於跨數千條件的組合套利。

數學變難。薪水變長。
