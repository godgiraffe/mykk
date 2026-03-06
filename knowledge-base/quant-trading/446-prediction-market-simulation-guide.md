---
title: "預測市場量化模擬完全指南：從蒙特卡洛到代理模型"
date: "2026-02-28"
tags: 
  - "蒙特卡洛模擬"
  - "預測市場"
  - "量化模型"
summary: "每個章節都建立在前一章的基礎上。跳過某部分，數學就不會有意義。按順序閱讀，到最後你將擁有堆疊中每一層的可執行程式碼。"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 47
evergreenScore: 43
priorityScore: 54
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/gemchange_ltd/status/2027744530124951831"
  externalUrl: "https://x.com/i/article/2027371960175386624"
  authorUsername: "gemchange_ltd"
---

# 預測市場量化模擬完全指南：從蒙特卡洛到代理模型

> **來源**: [@gemchange_ltd](https://x.com/gemchange_ltd/status/2027744530124951831) | [原文連結](https://x.com/i/article/2027371960175386624)
>
> **日期**: Sat Feb 28 13:55:44 +0000 2026
>
> **標籤**: `蒙特卡洛模擬` `預測市場` `量化模型`

---

> **來源**: [@gemchange_ltd (gemchanger)](https://twitter.com/gemchange_ltd)
> **日期**: 2026-03-05
> **標籤**: `預測市場` `量化交易` `蒙特卡洛模擬` `風險管理`

---

## 如何像量化交易桌一樣進行模擬：每個模型、每個公式、可執行的程式碼

這不是技術列表，而是一個故事——從拋硬幣開始，以機構級模擬引擎結束。

每個章節都建立在前一章的基礎上。跳過某部分，數學就不會有意義。按順序閱讀，到最後你將擁有堆疊中每一層的可執行程式碼。

**免責聲明**：非財務建議，請自行研究。

## 第一部分：打破一切的拋硬幣

你盯著 Polymarket 合約看：「聯準會會在 3 月降息嗎？」YES 的交易價格是 $0.62。

你的直覺說：那是 62% 的機率。也許你認為應該是 70%。所以你買入。

恭喜。你剛做了每個散戶交易者都會做的事。你把預測市場合約當作已知偏差的拋硬幣，估計了自己的偏差，然後下注差額。

但問題是：
- 你不知道對你的 70% 估計應該有多大信心
- 你不知道明天的就業報告發布時它應該如何變化
- 你不知道它與 Polymarket 上其他六個聯準會相關合約的相關性
- 你不知道從現在到結算之間的價格路徑是否能讓你在最終正確的情況下獲利退出

拋硬幣有一個參數：p。

嵌入在相關事件組合中的預測市場合約，具有時變資訊流、訂單簿動態和執行風險，有數十個參數。

## 第二部分：蒙特卡洛（Monte Carlo）——沒有人足夠尊重的基礎

本文中的每個模擬最終都歸結為蒙特卡洛：從分布中抽取樣本，計算統計量，重複。

事件機率 p=P(A) 的估計量就是樣本平均值：

中央極限定理給出收斂速率：O(N^{-1/2})，方差為 Var(p̂_N)=p(1−p)/N。

方差在 p=0.5 時最大化——交易價格 50 美分的合約（最不確定、最活躍交易的合約）正是你的蒙特卡洛估計最不精確的地方。

要在 p=0.50 時以 95% 信賴度達到 ±0.01 精度：需要 N ≈ 9,604 次模擬。

這還可以管理。但當你需要模擬路徑而不僅僅是終點時，情況會迅速惡化。

### 你的第一個可執行模擬

目標：估計資產連結二元合約的賠付機率（例如「AAPL 會在 3 月 15 日收盤價高於 $200 嗎？」）

```python
import numpy as np

def simulate_binary_contract(S0, K, mu, sigma, T, N_paths=100_000):
    """
    二元合約的蒙特卡洛模擬。
    
    S0:    當前資產價格
    K:     履約價/閾值
    mu:    年化漂移率
    sigma: 年化波動率
    T:     到期時間（年）
    N_paths: 模擬路徑數量
    """
    # 透過 GBM 模擬終端價格
    Z = np.random.standard_normal(N_paths)
    S_T = S0 * np.exp((mu - 0.5 * sigma**2) * T + sigma * np.sqrt(T) * Z)
    
    # 二元賠付
    payoffs = (S_T > K).astype(float)
    
    # 估計和信賴區間
    p_hat = payoffs.mean()
    se = np.sqrt(p_hat * (1 - p_hat) / N_paths)
    ci_lower = p_hat - 1.96 * se
    ci_upper = p_hat + 1.96 * se
    
    return {
        'probability': p_hat,
        'std_error': se,
        'ci_95': (ci_lower, ci_upper),
        'N_paths': N_paths
    }

# 範例：AAPL 在 $195，履約價 $200，20% 波動率，30 天
result = simulate_binary_contract(S0=195, K=200, mu=0.08, sigma=0.20, T=30/365)
print(f"P(AAPL > $200) ≈ {result['probability']:.4f}")
print(f"95% CI: ({result['ci_95'][0]:.4f}, {result['ci_95'][1]:.4f})")
```

這有效。對於一個合約，一個標的，假設對數常態動態。真實的預測市場打破了每一個假設。

### 評估你的模擬

在改進模擬之前，我們需要一種方法來衡量它有多好。Brier Score 是標準的校準指標：

```python
def brier_score(predictions, outcomes):
    """評估模擬校準。"""
    return np.mean((np.array(predictions) - np.array(outcomes))**2)

# 比較兩個模型
model_A_preds = [0.7, 0.3, 0.9, 0.1]  # 尖銳、自信
model_B_preds = [0.5, 0.5, 0.5, 0.5]  # 總是不確定
actual_outcomes = [1, 0, 1, 0]

print(f"Model A Brier: {brier_score(model_A_preds, actual_outcomes):.4f}")  # 0.05
print(f"Model B Brier: {brier_score(model_B_preds, actual_outcomes):.4f}")  # 0.25
```

Brier 分數低於 0.20 是好的。低於 0.10 是優秀的。最好的選舉預測者（538、Economist）在總統競選中歷史上達到 0.06-0.12。

如果你的模擬能超越這個水準，你就有優勢。

## 第三部分：當 100,000 次樣本還不夠時

現在故事升級了。

Polymarket 託管極端事件的合約。「標普 500 會在一週內下跌 20% 嗎？」交易價格是 $0.003。用 100,000 次樣本的粗略蒙特卡洛，你可能看到零次或一次命中。

你的估計要麼是 0.00000 要麼是 0.00001——兩者都沒用。

這不是理論問題。這就是為什麼大多數散戶交易者無法正確評估尾部風險合約。

### 讓罕見事件變得常見

重要性抽樣（Importance Sampling）用過度抽樣罕見區域的機率測度替換原始機率測度，然後用似然比修正偏差。

實用的主力是指數傾斜（exponential tilting）。

如果你的標的遵循隨機遊走，增量 Δ_i 具有動差生成函數 M(γ)=E[e^γΔ]，你傾斜分布，選擇 γ 使罕見事件變得典型。對於當總和超過大閾值時賠付的合約，γ 解決 Lundberg 方程 M(γ)=1。

### 尾部風險合約的重要性抽樣

```python
def rare_event_IS(S0, K_crash, sigma, T, N_paths=100_000):
    """
    極端下行二元合約的重要性抽樣。
    
    範例：P(標普下跌 20% 在一週內)
    """
    K = S0 * (1 - K_crash)  # 例如 20% 崩盤閾值
    
    # 原始漂移（風險中性）
    mu_original = -0.5 * sigma**2
    
    # 傾斜漂移：將均值移向崩盤區域
    # 選擇 mu_tilt 使崩盤閾值約為 1 個標準差而不是 4 個
    log_threshold = np.log(K / S0)
    mu_tilt = log_threshold / T  # 將分布中心放在崩盤上
    
    Z = np.random.standard_normal(N_paths)
    
    # 在傾斜測度下模擬
    log_returns_tilted = mu_tilt * T + sigma * np.sqrt(T) * Z
    S_T_tilted = S0 * np.exp(log_returns_tilted)
    
    # 似然比：原始密度 / 傾斜密度
    log_returns_original = mu_original * T + sigma * np.sqrt(T) * Z
    log_LR = (
        -0.5 * ((log_returns_tilted - mu_original * T) / (sigma * np.sqrt(T)))**2
        + 0.5 * ((log_returns_tilted - mu_tilt * T) / (sigma * np.sqrt(T)))**2
    )
    LR = np.exp(log_LR)
    
    # IS 估計量
    payoffs = (S_T_tilted < K).astype(float)
    is_estimates = payoffs * LR
    
    p_IS = is_estimates.mean()
    se_IS = is_estimates.std() / np.sqrt(N_paths)
    
    # 與粗略 MC 比較
    Z_crude = np.random.standard_normal(N_paths)
    S_T_crude = S0 * np.exp(mu_original * T + sigma * np.sqrt(T) * Z_crude)
    p_crude = (S_T_crude < K).mean()
    se_crude = np.sqrt(p_crude * (1 - p_crude) / N_paths) if p_crude > 0 else float('inf')
    
    return {
        'p_IS': p_IS, 'se_IS': se_IS,
        'p_crude': p_crude, 'se_crude': se_crude,
        'variance_reduction': (se_crude / se_IS)**2 if se_IS > 0 else float('inf')
    }

result = rare_event_IS(S0=5000, K_crash=0.20, sigma=0.15, T=5/252)
print(f"IS estimate:    {result['p_IS']:.6f} ± {result['se_IS']:.6f}")
print(f"Crude estimate: {result['p_crude']:.6f} ± {result['se_crude']:.6f}")
print(f"Variance reduction factor: {result['variance_reduction']:.1f}x")
```

在極端合約上，IS 可以將方差減少 100-10,000 倍。

這意味著 100 個 IS 樣本比 1,000,000 個粗略樣本提供更好的精度。

這不是邊際改進。這是「我們無法定價」和「我們正在交易它」之間的差異。

## 第四部分：即時更新的序列蒙特卡洛（Sequential Monte Carlo）

但當故事從靜態估計轉向動態模擬時會發生什麼？

想像：
選舉之夜。美東時間晚上 8:01。佛羅里達投票站剛關閉。早期結果顯示某候選人有 3 個百分點的偏移。

你的模型需要立即更新——將這個新數據點納入不僅是佛羅里達，還有俄亥俄、賓夕法尼亞、密西根和每個相關州的機率估計。

這是濾波問題，工具是序列蒙特卡洛（Sequential Monte Carlo）——粒子濾波器（particle filters）。

### 狀態空間模型

定義：
- 隱藏狀態 x_t：事件的「真實」機率（未觀察到）
- 觀察 y_t：市場價格、民調結果、投票計數、新聞信號

狀態透過 logit 隨機遊走演化（保持機率有界）：

觀察是真實狀態的有雜訊讀數。

### Bootstrap 粒子濾波器

演算法維護 N 個「粒子」——每個都是關於真實機率的假設——並在數據到達時重新加權它們：

```
1. 初始化: 從先驗抽取 x_0^{(i)} ~ Prior  for i = 1,...,N
   設定權重 w_0^{(i)} = 1/N

2. 對於每個新觀察 y_t:
   a. 傳播:  x_t^{(i)} ~ f( · | x_{t-1}^{(i)} )
   b. 重新加權:   w_t^{(i)} ∝ g( y_t | x_t^{(i)} )  
   c. 標準化:  w̃_t^{(i)} = w_t^{(i)} / Σ_j w_t^{(j)}
   d. 如果 ESS = 1/Σ(w̃_t^{(i)})² < N/2 則重新採樣
```

### 即時預測市場的粒子濾波器

```python
import numpy as np
from scipy.special import expit, logit  # sigmoid 和 logit

class PredictionMarketParticleFilter:
    """
    即時事件機率估計的序列蒙特卡洛濾波器。
    
    在即時事件（例如選舉之夜）期間的使用:
        pf = PredictionMarketParticleFilter(prior_prob=0.50)
        pf.update(observed_price=0.55)   # 市場因早期結果移動
        pf.update(observed_price=0.62)   # 更多數據
        pf.update(observed_price=0.58)   # 部分修正
        print(pf.estimate())             # 濾波機率
    """
    def __init__(self, N_particles=5000, prior_prob=0.5,
                 process_vol=0.05, obs_noise=0.03):
        self.N = N_particles
        self.process_vol = process_vol
        self.obs_noise = obs_noise
        
        # 在先驗周圍初始化粒子
        logit_prior = logit(prior_prob)
        self.logit_particles = logit_prior + np.random.normal(0, 0.5, N_particles)
        self.weights = np.ones(N_particles) / N_particles
        self.history = []
    
    def update(self, observed_price):
        """納入新觀察（市場價格、民調結果等）"""
        # 1. 傳播：logit 空間中的隨機遊走
        noise = np.random.normal(0, self.process_vol, self.N)
        self.logit_particles += noise
        
        # 2. 轉換為機率空間
        prob_particles = expit(self.logit_particles)
        
        # 3. 重新加權：給定每個粒子的觀察似然
        log_likelihood = -0.5 * ((observed_price - prob_particles) / self.obs_noise)**2
        log_weights = np.log(self.weights + 1e-300) + log_likelihood
        
        # 在對數空間標準化以保持穩定性
        log_weights -= log_weights.max()
        self.weights = np.exp(log_weights)
        self.weights /= self.weights.sum()
        
        # 4. 檢查 ESS 並在需要時重新採樣
        ess = 1.0 / np.sum(self.weights**2)
        if ess < self.N / 2:
            self._systematic_resample()
        
        self.history.append(self.estimate())
    
    def _systematic_resample(self):
        """系統重採樣 - 比多項式方差更低。"""
        cumsum = np.cumsum(self.weights)
        u = (np.arange(self.N) + np.random.uniform()) / self.N
        indices = np.searchsorted(cumsum, u)
        self.logit_particles = self.logit_particles[indices]
        self.weights = np.ones(self.N) / self.N
    
    def estimate(self):
        """加權平均機率估計。"""
        probs = expit(self.logit_particles)
        return np.average(probs, weights=self.weights)
    
    def credible_interval(self, alpha=0.05):
        """基於加權分位數的可信區間。"""
        probs = expit(self.logit_particles)
        sorted_idx = np.argsort(probs)
        sorted_probs = probs[sorted_idx]
        sorted_weights = self.weights[sorted_idx]
        cumw = np.cumsum(sorted_weights)
        lower = sorted_probs[np.searchsorted(cumw, alpha/2)]
        upper = sorted_probs[np.searchsorted(cumw, 1 - alpha/2)]
        return lower, upper

# --- 模擬選舉之夜 ---
pf = PredictionMarketParticleFilter(prior_prob=0.50, process_vol=0.03)

# 傳入觀察（隨著新數據到達的市場價格）
observations = [0.50, 0.52, 0.55, 0.58, 0.61, 0.63, 0.60, 
                0.65, 0.70, 0.75, 0.80, 0.85, 0.90, 0.95]

print("選舉之夜追蹤器:")
print(f"{'時間':>6}  {'觀察值':>10}  {'濾波值':>10}  {'95% CI':>20}")
print("-" * 52)

for t, obs in enumerate(observations):
    pf.update(obs)
    ci = pf.credible_interval()
    print(f"{t:>5}h  {obs:>10.3f}  {pf.estimate():>10.3f}  ({ci[0]:.3f}, {ci[1]:.3f})")
```

為什麼這比直接使用市場價格更好？

因為粒子濾波器平滑雜訊並傳播不確定性。

當市場因單筆交易從 $0.58 飆升至 $0.65 時，濾波器認識到真實機率可能沒有那麼大變化——它根據觀察過程的波動性來調整更新。

## 第五部分：三個可疊加的方差減少技巧

在離開蒙特卡洛領域之前，這裡有三種技術可以與上述所有內容乘法組合。

### 自由對稱性（Antithetic Variates）

當賠付函數是單調的（二元合約總是——價格越高意味著超過履約價的機率越高），方差減少是有保證的。典型減少約 50-75%。除了加倍函數評估（你本來就要做的）之外，沒有額外的計算成本。

### 利用你已經知道的（Control Variates）

如果你在隨機波動率下模擬二元合約 {S_T > K}（沒有封閉形式），使用 Black-Scholes 數位價格 p_BS（有封閉形式）作為控制變量。

### 分而治之（Stratified Sampling）

將機率空間劃分為 J 個層次，在每個層次內採樣，組合。方差總是 ≤ 粗略 MC（根據全方差定律），Neyman 配置可獲得最大增益：n_j ∝ ω_j σ_j（過度採樣高方差層次）。

```python
def stratified_binary_mc(S0, K, sigma, T, J=10, N_total=100_000):
    """
    二元合約定價的分層 MC。
    層次由終端價格分布的分位數定義。
    """
    n_per_stratum = N_total // J
    estimates = []
    
    for j in range(J):
        # 層次 [j/J, (j+1)/J] 內的均勻抽取
        U = np.random.uniform(j/J, (j+1)/J, n_per_stratum)
        Z = norm.ppf(U)
        S_T = S0 * np.exp((-0.5*sigma**2)*T + sigma*np.sqrt(T)*Z)
        stratum_mean = (S_T > K).mean()
        estimates.append(stratum_mean)
    
    # 每個層次權重為 1/J
    p_stratified = np.mean(estimates)
    se_stratified = np.std(estimates) / np.sqrt(J)
    
    return p_stratified, se_stratified

p, se = stratified_binary_mc(S0=100, K=105, sigma=0.20, T=30/365)
print(f"Stratified estimate: {p:.6f} ± {se:.6f}")
```

### 全部疊加

在每個層次內使用對偶變數，加上控制變量修正——你通常可以實現比粗略 MC 高 100-500 倍的方差減少。這在生產中不是可選的。這是基本門檻。

## 第六部分：相關矩陣無法建模的東西

階層貝葉斯模型透過共享的全國搖擺參數隱式編碼相關性。

但尾部相依性（tail dependence）呢——極端共同運動的傾向，這在線性相關性中不會顯現？

2008 年，高斯連接函數（Gaussian copula）未能建模尾部相依性，導致全球金融危機。在預測市場中，同樣的問題出現：當一個搖擺州有意外結果時，所有搖擺州一起翻轉的機率遠高於高斯連接函數預測的。

### Sklar 定理

其中 C 是連接函數（純相依結構），F_i 是邊際 CDF。你可以分別建模每個市場的邊際行為，然後用捕捉相依性（包括尾部）的連接函數將它們粘合在一起。

### 尾部相依問題

**高斯連接函數**：尾部相依性 λ_U = λ_L = 0。極端共同運動被建模為零機率。

這對相關預測市場來說是災難性的錯誤。

**Student-t 連接函數**：

對於 ν=4 和 ρ=0.6，尾部相依性約為 0.18——給定一個合約達到極端，有 18% 的機率發生極端共同運動。高斯會說 0%。

**Clayton 連接函數**：僅下尾相依（λ_L = 2^{-1/θ}）。當一個預測市場崩盤，其他市場跟隨。沒有上尾相依。

**Gumbel 連接函數**：僅上尾相依（λ_U = 2 - 2^{1/θ}）。相關的正面解決。

### 模擬相關預測市場結果

```python
import numpy as np
from scipy.stats import norm, t as t_dist

def simulate_correlated_outcomes_gaussian(probs, corr_matrix, N=100_000):
    """高斯連接函數 - 無尾部相依。"""
    d = len(probs)
    L = np.linalg.cholesky(corr_matrix)
    Z = np.random.standard_normal((N, d))
    X = Z @ L.T
    U = norm.cdf(X)
    outcomes = (U < np.array(probs)).astype(int)
    return outcomes

def simulate_correlated_outcomes_t(probs, corr_matrix, nu=4, N=100_000):
    """Student-t 連接函數 - 對稱尾部相依。"""
    d = len(probs)
    L = np.linalg.cholesky(corr_matrix)
    Z = np.random.standard_normal((N, d))
    X = Z @ L.T
    
    # 除以 sqrt(chi-squared / nu) 得到 t 分布
    S = np.random.chisquare(nu, N) / nu
    T = X / np.sqrt(S[:, None])
    U = t_dist.cdf(T, nu)
    outcomes = (U < np.array(probs)).astype(int)
    return outcomes

def simulate_correlated_outcomes_clayton(probs, theta=2.0, N=100_000):
    """Clayton 連接函數（雙變量）- 下尾相依。"""
    # Marshall-Olkin 演算法
    V = np.random.gamma(1/theta, 1, N)
    E = np.random.exponential(1, (N, len(probs)))
    U = (1 + E / V[:, None])**(-1/theta)
    outcomes = (U < np.array(probs)).astype(int)
    return outcomes


# --- 比較尾部行為 ---
probs = [0.52, 0.53, 0.51, 0.48, 0.50]  # 5 個搖擺州機率
state_names = ['PA', 'MI', 'WI', 'GA', 'AZ']

corr = np.array([
    [1.0, 0.7, 0.7, 0.4, 0.3],
    [0.7, 1.0, 0.8, 0.3, 0.3],
    [0.7, 0.8, 1.0, 0.3, 0.3],
    [0.4, 0.3, 0.3, 1.0, 0.5],
    [0.3, 0.3, 0.3, 0.5, 1.0],
])

N = 500_000

gauss_outcomes = simulate_correlated_outcomes_gaussian(probs, corr, N)
t_outcomes = simulate_correlated_outcomes_t(probs, corr, nu=4, N=N)

# P(贏得所有 5 個州)
p_sweep_gauss = gauss_outcomes.all(axis=1).mean()
p_sweep_t = t_outcomes.all(axis=1).mean()

# P(輸掉所有 5 個州)  
p_lose_gauss = (1 - gauss_outcomes).all(axis=1).mean()
p_lose_t = (1 - t_outcomes).all(axis=1).mean()

# 如果獨立
p_sweep_indep = np.prod(probs)
p_lose_indep = np.prod([1-p for p in probs])

print("聯合結果機率:")
print(f"{'':>25}  {'獨立':>12}  {'高斯':>12}  {'t-連接':>12}")
print(f"{'P(贏得所有 5 個)':>25}  {p_sweep_indep:>12.4f}  {p_sweep_gauss:>12.4f}  {p_sweep_t:>12.4f}")
print(f"{'P(輸掉所有 5 個)':>25}  {p_lose_indep:>12.4f}  {p_lose_gauss:>12.4f}  {p_lose_t:>12.4f}")
print(f"\nt-連接函數將橫掃機率提高 {p_sweep_t/p_sweep_gauss:.1f}x vs 高斯")
```

這正是高斯連接函數在 2008 年失敗的原因，也會在預測市場投資組合中再次失敗。

ν=4 的 t-連接函數通常顯示極端聯合結果的機率高 2-5 倍。

如果你在交易相關預測市場合約而不建模尾部相依性，你運行的投資組合將在最重要的情況下爆炸。

### Vine 連接函數

對於 d>5 個合約，雙變量連接函數不足。Vine 連接函數將 d 維相依性分解為排列在樹結構中的 d(d-1)/2 個雙變量條件連接函數：

- **C-vine（星型）**：一個中心事件驅動一切（例如總統獲勝者 → 所有政策市場）
- **D-vine（路徑）**：序列相依性（例如初選結果流入大選）
- **R-vine（通用圖）**：最大靈活性

建立按 |τ_Kendall| 排序的最大生成樹，透過 AIC 選擇配對連接函數族，順序估計。實現：pyvinecopulib (Python)、VineCopula (R)。

## 第七部分：基於代理的模擬（Agent-Based Simulation）

到目前為止的一切都假設你知道數據生成過程，只需要模擬它。

但預測市場由異質代理填充——知情交易者、雜訊交易者、做市商和機器人——他們的互動產生任何封閉形式 SDE 無法捕捉的湧現動態。

### 零智能揭示（Zero-Intelligence Revelation）

即使每個交易者都完全不理性，市場也可以是有效的。

Gode & Sunder (1993) 顯示零智能代理——僅受預算約束的隨機訂單提交交易者——在連續雙重拍賣中實現接近 100% 的配置效率。

Farmer, Patelli & Zovko (2005) 將此擴展到限價訂單簿。

這解釋了倫敦證券交易所 96% 的橫截面價差變化。一個參數。96%。

### 基於代理的預測市場模擬器

```python
import numpy as np
from collections import deque

class PredictionMarketABM:
    """
    預測市場訂單簿的基於代理模型。
    
    代理類型:
    - 知情者 (Informed): 知道真實機率，向其交易
    - 雜訊者 (Noise): 隨機交易
    - 做市商 (Market maker): 在當前價格周圍提供流動性
    """
    def __init__(self, true_prob, n_informed=10, n_noise=50, n_mm=5):
        self.true_prob = true_prob
        self.price = 0.50  # 初始價格
        self.price_history = [self.price]
        
        # 訂單簿（簡化為買/賣佇列）
        self.best_bid = 0.49
        self.best_ask = 0.51
        
        # 代理群體
        self.n_informed = n_informed
        self.n_noise = n_noise
        self.n_mm = n_mm
        
        # 追蹤指標
        self.volume = 0
        self.informed_pnl = 0
        self.noise_pnl = 0
    
    def step(self):
        """一個時間步：隨機選擇一個代理進行交易。"""
        total = self.n_informed + self.n_noise + self.n_mm
        r = np.random.random()
        
        if r < self.n_informed / total:
            self._informed_trade()
        elif r < (self.n_informed + self.n_noise) / total:
            self._noise_trade()
        else:
            self._mm_update()
        
        self.price_history.append(self.price)
    
    def _informed_trade(self):
        """知情交易者：如果價格 < 真實機率則買入，否則賣出。"""
        signal = self.true_prob + np.random.normal(0, 0.02)  # 有雜訊的信號
        
        if signal > self.best_ask + 0.01:  # 買入
            size = min(0.1, abs(signal - self.price) * 2)
            self.price += size * self._kyle_lambda()
            self.volume += size
            self.informed_pnl += (self.true_prob - self.best_ask) * size
        elif signal < self.best_bid - 0.01:  # 賣出
            size = min(0.1, abs(self.price - signal) * 2)
            self.price -= size * self._kyle_lambda()
            self.volume += size
            self.informed_pnl += (self.best_bid - self.true_prob) * size
        
        self.price = np.clip(self.price, 0.01, 0.99)
        self._update_book()
    
    def _noise_trade(self):
        """雜訊交易者：隨機買/賣。"""
        direction = np.random.choice([-1, 1])
        size = np.random.exponential(0.02)
        self.price += direction * size * self._kyle_lambda()
        self.price = np.clip(self.price, 0.01, 0.99)
        self.volume += size
        self.noise_pnl -= abs(self.price - self.true_prob) * size * 0.5
        self._update_book()
    
    def _mm_update(self):
        """做市商：向當前價格收緊價差。"""
        spread = max(0.02, 0.05 * (1 - self.volume / 100))
        self.best_bid = self.price - spread / 2
        self.best_ask = self.price + spread / 2
    
    def _kyle_lambda(self):
        """價格影響參數。"""
        sigma_v = abs(self.true_prob - self.price) + 0.05
        sigma_u = 0.1 * np.sqrt(self.n_noise)
        return sigma_v / (2 * sigma_u)
    
    def _update_book(self):
        spread = self.best_ask - self.best_bid
        self.best_bid = self.price - spread / 2
        self.best_ask = self.price + spread / 2
    
    def run(self, n_steps=1000):
        for _ in range(n_steps):
            self.step()
        return np.array(self.price_history)


# --- 模擬 ---
np.random.seed(42)

# 場景：真實機率是 0.65，市場從 0.50 開始
sim = PredictionMarketABM(true_prob=0.65, n_informed=10, n_noise=50, n_mm=5)
prices = sim.run(n_steps=2000)

print("基於代理的預測市場模擬")
print(f"真實機率:   {sim.true_prob:.2f}")
print(f"起始價格:     0.50")
print(f"最終價格:        {prices[-1]:.4f}")
print(f"t=500 價格:     {prices[500]:.4f}")
print(f"t=1000 價格:    {prices[1000]:.4f}")
print(f"總成交量:       {sim.volume:.1f}")
print(f"知情者 P&L:       ${sim.informed_pnl:.2f}")
print(f"雜訊交易者 P&L:   ${sim.noise_pnl:.2f}")
print(f"收斂誤差:  {abs(prices[-1] - sim.true_prob):.4f}")
```

價格收斂的速度取決於知情交易者與雜訊交易者的比率、做市商價差如何回應資訊流，以及為什麼知情交易者以雜訊交易者為代價提取利潤。

## 第八部分：生產堆疊

這是完整系統，從市場數據到交易執行：

**第 1 層：數據攝取**
- 來自 Polymarket CLOB API 的 WebSocket 資料流（即時價格、成交量）
- 新聞/民調資料流（NLP 處理成機率信號）
- 鏈上事件數據（Polygon）

**第 2 層：機率引擎**
- 階層貝葉斯模型（Stan/PyMC）州級後驗
- 粒子濾波器 - 對新觀察的即時更新
- 跳躍擴散 SDE 路徑模擬用於風險管理
- 整體：模型輸出的加權平均

**第 3 層：相依性建模**
- Vine 連接函數 - 合約之間的成對相依性
- 因子模型 - 共享的全國/全球風險因子
- 尾部相依估計 via t-連接函數

**第 4 層：風險管理**
- 基於 EVT 的 VaR 和預期短缺
- 反向壓力測試 - 識別最壞情況場景
- 相關性壓力 - 如果州相關性飆升怎麼辦？
- 流動性風險 - 訂單簿深度監控

**第 5 層：監控**
- Brier 分數追蹤（我們是否校準？）
- P&L 歸因（哪個模型組件增加了價值？）
- 回撤警報
- 模型漂移檢測

## 參考文獻

- Dalen (2025). "Toward Black-Scholes for Prediction Markets." arXiv:2510.15205
- Saguillo et al. (2025). "Unravelling the Probabilistic Forest: Arbitrage in Prediction Markets." arXiv:2508.03474
- Madrigal-Cianci et al. (2026). "Prediction Markets as Bayesian Inverse Problems." arXiv:2601.18815
- Farmer, Patelli & Zovko (2005). "The Predictive Power of Zero Intelligence." PNAS
- Gode & Sunder (1993). "Allocative Efficiency of Markets with Zero-Intelligence Traders." JPE
- Kyle (1985). "Continuous Auctions and Insider Trading." Econometrica
- Glosten & Milgrom (1985). "Bid, Ask, and Transaction Prices." JFE
- Hoffman & Gelman (2014). "The No-U-Turn Sampler." JMLR
- Merton (1976). "Option Pricing When Underlying Stock Returns Are Discontinuous." JFE
- Linzer (2013). "Dynamic Bayesian Forecasting of Presidential Elections." JASA
- Gelman et al. (2020). "Updated Dynamic Bayesian Forecasting Model." HDSR
- Aas, Czado, Frigessi & Bakken (2009). "Pair-Copula Constructions of Multiple Dependence." Insurance: Mathematics and Economics
- Wiese et al. (2020). "Quant GANs: Deep Generation of Financial Time Series." Quantitative Finance
- Kidger et al. (2021). "Neural SDEs as Infinite-Dimensional GANs." ICML
