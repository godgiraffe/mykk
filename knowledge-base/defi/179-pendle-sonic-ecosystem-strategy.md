# 用Pendle玩轉Sonic生態：DeFi策略完全指南

> **來源**: [@0xPoseidon_sol](https://x.com/0xPoseidon_sol/status/1904617748485075343) | [原文連結](https://x.com/i/article/1903835962473598976)
>
> **日期**: 
>
> **標籤**: `Pendle協議` `Sonic生態` `收益策略`

---

## Pendle 核心概念

Pendle 是一款將可生息資產拆分成兩種帶時間屬性代幣的 DeFi 協議：

- **PT（Principal Token，本金代幣）**：代表本金，可用折扣價購買，到期時按面值贖回，鎖定固定收益率
- **YT（Yield Token，收益權代幣）**：代表未來收益權，可用小額本金加槓桿撬動生息資產的未來收益

核心公式：**1 SY（生息代幣）= 1 PT + 1 YT**

## 代幣拆分流程

1. **生息代幣（Yield-Bearing Token）**：能產生收益的代幣，如 Aave 的 aUSDC、各種 LST 質押資產（stS、oS、wanS 等）
2. **標準化生息代幣（SY）**：將生息代幣包裝（Wrap）後的形式，方便協議合約讀取操作
3. **拆分為 PT 和 YT**：1 個 aUSDC 可拆分為帶時間屬性的 1 個 PT-USDC 和 1 個 YT-USDC

## 利率類型說明

- **底層收益率（Underlying APY）**：持有底層資產的原始收益年化（如 aUSDC 在 Aave 的收益率）
- **隱含收益率（Implied APY）**：市場根據 PT 折扣價格和剩餘到期時間推算的年化收益率，反映市場對未來收益的預期
- **固定利率（Fixed APY）**：與隱含收益率計算公式相同，更偏向用戶視角，代表買入 PT 持有至到期能鎖定的年化回報
- **有效固定利率（Effective Fixed APY）**：考慮池子深度和交易滑點後，實際能獲得的年化回報

## PT 代幣機制

PT 代幣用折扣價購買，到期時按面值贖回：

- **計算公式**：`PT 當前價格 = PT 面值 / (1 + Fixed APY × 剩餘時間(年))`
- **實例**：10% 年化、1 年到期的 PT-aUSDC 當前價格 = 1 aUSDC / (1 + 10% × 1) ≈ 0.909 aUSDC
- **隱形槓桿**：相當於用 90.9 aUSDC 獲得 100 aUSDC 的本金權益，實現 1.1 倍低倍槓桿

**適合人群**：對未來利率看空，想鎖定當前較高利率的保守用戶

## YT 代幣機制

YT 代幣代表未來收益權，可用小額本金加高槓桿：

- **計算公式**：`YT 當前價格 = 1 - PT 當前價格`
- **實例**：若 PT-aUSDC 價格為 0.9675，則 YT-aUSDC 價格 = 1 - 0.9675 = 0.0325，100 aUSDC 可買約 3,000 YT-aUSDC（30 倍槓桿）
- **時間衰減**：YT 價格隨到期日臨近逐步衰減至 0

**Long Yield APY 計算**：`[(實際收益 - YT 購買價格) / YT 購買價格 / 剩餘時間(年)] × 100%`

**負 Long Yield APY 原因**：
1. 市場對 YT 收益看多，YT 被高估（購買成本過高）
2. 底層資產積分獎勵無法量化為年化
3. 底層資產年化降低
4. 時間衰減導致短期收益無法覆蓋 YT 成本

**適合人群**：對未來利率看多，願意承擔高風險博取高收益的激進用戶

## LP 做市機制

LP 是生息代幣和 PT 代幣的組合（如 aUSDC + PT-USDC），為市場交易提供流動性：

- **收益來源**：Swap fee + Pendle 做市獎勵 + 底層資產收益
- **年化特點**：比單純持有 PT 高，但利率浮動
- **操作建議**：
  - 組成 LP 時使用 Zap（自動）模式且勾選 Keep YT Mode，減少磨損
  - 退出時使用 Manual（手動）模式更方便

**適合人群**：追求比 PT 更高年化但能承受利率浮動的中性用戶

## Pendle Book 市場特點

Pendle 的訂單薄市場以 Fixed APY 間接體現 PT/YT 價格，可減少 LP 交易帶來的磨損

## Pendle + Sonic 生態玩法

### Sonic 積分體系

Sonic 生態發布 200M $S 空投計劃（第一季 6 月結束）：

- **PP（被動積分）**：持有白名單資產
- **AP（活動積分）**：在生態應用中使用白名單資產
- **AppPoints（寶石積分）**：生態應用發放

積分看板：https://my.soniclabs.com/points

### Pendle 支持的 Sonic 資產

| 資產 | 來源協議 | 獲取方式 |
|------|----------|----------|
| aUSDC | Aave | USDC 存入 Aave |
| wstkscETH、wstkscUSD | Rings Protocol | Token → scToken → stkscToken → wstkscToken（兩次質押 + Wrap）|
| stS | Beets | S 質押獲得 |
| woS | Origin Protocol | S 質押獲得 oS，再 Wrap |
| wanS | Angles | S 質押獲得 anS，再 Wrap |

### 策略一：Pendle + Silo 循環貸套娃

利用 Silo Finance 借貸協議（https://v2.silo.finance/）讓 PT-Token 參與積分分配：

**基礎玩法**：
1. 在 Silo 存入 PT-aUSDC 作為抵押品
2. 借出 scUSD（年化約 6.9%）
3. 將借出的 scUSD 再存入該池，額外獲得 5-6% 年化 + Silo 積分

**循環貸玩法**：
1. 將借出的 scUSD 在 Ring 協議上封裝成 wstkscUSD
2. 購買 PT-wstkscUSD
3. 在 Silo 存入 PT-wstkscUSD 借出 USDC/scUSDC
4. 重複步驟 1-3，獲得額外年化 + Silo 積分 + Ring 積分

**風險指標**：
- **mLTV（最大貸款價值率）**：抵押物可借貸的最大比例（如 80% 表示每抵押 1 美元可借 0.8 美元）
- **LT（清算門檻）**：當貸款超過此比例時抵押物會被清算

**注意事項**：PT-Token 相關借貸池只能借貸一輪，需注意清算風險

### 策略二：Pendle + Silo + DEX 組合

在 Silo 循環貸後將借出資產組成 LP 在 DEX 賺取額外收益：

**操作流程**：
1. 將 USDC 分成 aUSDC 和 scUSD 兩部分
2. 轉換為 PT-aUSDC 和 PT-wstkscUSD
3. 存入 Silo 借出 scUSD 和 USDC
4. 將 scUSD 和 USDC 組成 LP 在 SwapX 等 DEX 協議賺取額外年化（最高可達 20%）

**優勢**：清算風險有限 + 可賺取 DEX 額外積分獎勵

**支援交易對**：scUSD/USDC、wS/stS 等（需選擇合適區間提升年化）

## 風險提示

1. PT-Token 不參與積分分配，需透過 Silo 等協議才能賺取積分
2. YT-Token 大多呈現負 Long Yield APY，需仔細評估積分收益能否覆蓋損失
3. 循環貸需注意 mLTV 和 LT，避免清算風險
4. DEX LP 年化需根據實際區間調整，不一定能達到最高年化
5. 鏈上無絕對安全，做好調研，注意資金安全

## 學習資源

- Pendle 官方學院：https://pendle.gitbook.io/pendle-academy
- Pendle 中文教程：https://pendle.notion.site/Pendle-1b2567a21d3780168a83dc0028731413
- @22333D 視頻教程：https://www.youtube.com/watch?v=cPCoi12McyA&t=5s
