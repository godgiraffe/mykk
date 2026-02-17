# Hourglass Stable 預存款 KYC Vault 事件分析

> **來源**: [@yieldsandmore](https://x.com/yieldsandmore/status/1986447875870441952) | [原文連結](https://etherscan.io/token/0xd9b2cb2fbad204fc548787ef56b918c845fcce40?a=0xd9b2cb2fbad204fc548787ef56b918c845fcce40#code)
>
> **日期**: 
>
> **標籤**: `智能合約風險` `預售機制設計` `資金安全`

---

## 事件背景

今天 @stable 的預存款活動一片混亂。

由於 Hourglass 網站使用免費的 Alchemy RPC 節點，在大量用戶湧入時承受不住負載，導致即使用戶在錢包中簽署了服務條款（Terms of Service），簽署仍無法正常運作。

## 誤存款問題

這促使人們改為透過 @etherscan 直接與合約互動進行存款。然而，並非所有人都有使用區塊鏈瀏覽器的經驗，結果導致大約 **$234 萬美元的存款被錯誤地發送到合約本身作為接收者**。希望這些資金能夠被追回。

## 存款上限失效

合約也未能正確執行原本設定的每個錢包 $10 萬美元上限（此上限應在第一小時內生效），導致部分參與者存入了遠超過限額的金額。這些超額存款很可能會被退還。不過，這也使得追蹤實際銷售進度變得困難。

## 收據代幣問題

從這次預存款獲得的收據代幣（receipt token）與內部人士在第一輪獲得的代幣並不相同，因此無法套利溢價。此代幣也不可轉讓——你只能燒毀（burn）、鑄造（mint），或將其發送到預定義的橋接合約。

## 檢查簽署狀態

如果你透過 Etherscan 存款，可以在這個頁面檢查你是否成功簽署了服務條款：https://etherscan.io/token/0xd9b2cb2fbad204fc548787ef56b918c845fcce40#balances（輸入你的地址）。

## 合約技術細節

### 合約資訊

- **代幣名稱**：Hourglass Stable Pre-iUSDT (pre-iUSDT)
- **合約地址**：`0xd9b2cb2fbad204fc548787ef56b918c845fcce40`
- **總供應量**：1,137,842,540.287118 pre-iUSDT
- **持有者數量**：10,689
- **小數位數**：6
- **合約名稱**：HourglassStableVaultKYC
- **編譯器版本**：v0.8.29+commit.ab55807c
- **優化**：啟用（10000 runs）

### 運作機制

這是一個具有 KYC（身份驗證）功能的 ERC20 預存款金庫，接受 USDC 存款，並將資金部署到財政部進行收益生成。

### 運作階段

1. **存款階段（Deposit Phase）**
   - 用戶以 1:1 的比例獲得份額（shares）

2. **KYC 階段（KYC Phase）**
   - 管理員可以標記用戶為 KYC 已核准
   - 未通過 KYC 的用戶可以以 1:1 的比例取回 USDC

3. **收益階段（Yield Phase）**
   - 財政部可以將 KYC 已核准的 USDC 提取到財政地址
   - 未通過 KYC 的用戶仍可以以 1:1 的比例取回 USDC

4. **提款階段（Withdraw Phase）**
   - KYC 用戶可以透過橋接合約按比例提取 USDT
   - 未通過 KYC 的用戶仍可以以 1:1 的比例取回 USDC

5. **恢復階段（Recovery Phase）**
   - 在 RECOVERY_TIMESTAMP 之後，任何人都可以轉換到恢復模式
   - 未通過 KYC 的用戶以 1:1 比例取回 USDC
   - KYC 用戶按比例取回 USDT，加上任何未部署的 USDC 按比例

### 會計狀態

- 所有存入的 USDC 最初都歸類為非 KYC
- 當用戶被標記為 KYC 時，其 USDC 從非 KYC 池移至 KYC 池
- 可部署資產是 KYC 池中的 USDC
- 非 KYC 恢復從非 KYC USDC 池提取
- KYC 恢復從 USDT 餘額和未部署的 USDC 提取

### 核心代幣地址

- **USDC**：`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- **USDT**：`0xdAC17F958D2ee523a2206206994597C13D831ec7`

### 權限角色

- **ADMIN_ROLE**：管理員操作
- **TREASURY_ROLE**：財政操作
- **MAX_KYC_BATCH_SIZE**：100（單次批次操作可處理的最大用戶數）
