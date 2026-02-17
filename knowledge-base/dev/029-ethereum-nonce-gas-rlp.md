# 自底向上學習以太坊（二）：Nonce、Gas 與 RLP 編碼

> **來源**: [@4seasDeSoc](https://x.com/4seasDeSoc/status/1982702762866643265) | [原文連結](https://hackmd.io/@4seasstack/learneth02)
>
> **日期**: Mon Oct 27 06:55:50 +0000 2025
>
> **標籤**: `以太坊` `EVM` `區塊鏈開發`

---

## 概述

在上一篇《自底向上學習以太坊(一):從助記詞到 Calldata》中,我們介紹了助記詞、私鑰、公鑰、地址和交易的 ABI 編碼部分。

以下程式碼顯示了目前最常見的執行層交易的 EIP1559 交易類型。以下欄位中的 `signature` 部分已經在此前進行了介紹,而 `payload` 一般符合我們在上一節介紹的 ABI 編碼。但存在部分情況,比如 EOA 之間進行信息交流時,`payload` 代表信息而不是調用合約的 `data`。

```python
@dataclass
class Transaction1559Payload:
    chain_id: int = 0
    signer_nonce: int = 0
    max_priority_fee_per_gas: int = 0
    max_fee_per_gas: int = 0
    gas_limit: int = 0
    destination: int = 0
    amount: int = 0
    payload: bytes = bytes()
    access_list: List[Tuple[int, List[int]]] = field(default_factory=list)
    signature_y_parity: bool = False
    signature_r: int = 0
    signature_s: int = 0

@dataclass
class Transaction1559Envelope:
    type: Literal[2] = 2
    payload: Transaction1559Payload = Transaction1559Payload()
```

在本節中,我們將主要介紹其餘的欄位,主要集中在以下內容:

1. `signer_nonce` 參數,該參數控制交易順序,相當多有趣的問題會出現在 `nonce` 設置上
2. `gas` 有關參數,我們將特別介紹執行層交易的 EIP-1559 規範,此規範引入了 `max_priority_fee_per_gas` 和 `max_fee_per_gas` 交易參數,以及在區塊中引入了一系列參數如 `gas_target` 等

在本節的最後,我們會討論 RLP 編碼,這部分內容與交易簽名內容和交易編碼有直接關係。RLP 編碼是以太坊執行層底層最常用的編碼方法。

## Nonce

在以太坊狀態中,所有的狀態都可以使用下圖表示:

![World State](https://img.gopic.xyz/WorldState.png)

對於 EOA 而言,Account 的 `nonce` 是一個重要的賬戶狀態,我們可以通過 `cast nonce` 獲取某一個地址的 Nonce 值:

```bash
cast nonce 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --rpc-url https://eth.drpc.org
```

上述命令的返回值可以被認為是該地址在過去發送的所有交易的數量。實際上,以太坊是允許我們在任意區塊處回放交易或者讀取數據,所以大部分 `cast` 指令,包括 `cast nonce` 指令都可以傳入 `--block` 參數來實現在過去區塊內讀取數據的功能,比如:

```bash
cast nonce 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 -B 23615120 --rpc-url https://eth.drpc.org
```

上述返回值為 `1599`。當然,對於 `cast call` 等指令,我們在過去區塊進行調用則要求使用的 RPC 服務商開啟了歸檔功能。大部分情況下,我們使用的節點都是全節點,全節點只會保留過去一定數量(一般為 256 區塊,但 reth 會保留過去 10064 區塊的狀態來保證 RPC 調用,具體可以參考 Reth 文檔)的所有信息,我們可以在一定範圍內任意回溯進行讀取調用,而歸檔節點具有真正的全數據,可以在任意過去區塊內進行調用。但是需要注意,全節點內只是影響上圖中 World State 內的部分,仍會保留全部的 `event` 等數據。

### Nonce 順序執行

我們首先討論 Nonce 最基礎的屬性,即節點會按照 Nonce 的順序執行交易。我們可以首先使用 `anvil` 啟動本地測試網,然後使用 `cast send` 指令直接發送間斷 nonce 的交易。

```bash
cast send 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 --value 0.05ether --nonce 1 --private-key $PRIVATE_KEY --async
cast send 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720 --value 0.05ether --nonce 2 --private-key $PRIVATE_KEY --async
```

上述命令中的 `--async` 是因為默認情況下 `cast` 指令會在同步情況下進行交易,發起交易後會一直阻塞終端等待交易的返回值,而使用 `--async` 時,Foundry 會直接返回交易哈希然後退出。假如我們不帶著 `--async` 使用 `cast send` 命令,那麼我們就會一直被卡住在終端直到超時。

我們使用 `cast tx-pool inspect` 指令觀察當前內存池內的交易情況,我們活動的輸出如下:

```json
TxpoolInspect {
    pending: {
        0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266: {
            "1": TxpoolInspectSummary {
                to: Some(0xa0ee7a142d267c1f36714e4a8f75612f20a79720),
                value: 50000000000000000,
                gas: 21000,
                gas_price: 2000000001,
            },
            "2": TxpoolInspectSummary {
                to: Some(0xa0ee7a142d267c1f36714e4a8f75612f20a79720),
                value: 50000000000000000,
                gas: 21000,
                gas_price: 2000000001,
            },
        },
    },
    queued: {},
}
```

我們可以看到由於 `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266` 並沒有發送 `nonce = 0` 的交易,所有後續所有的交易都被卡在內存池內,我們可以直接發起 `nonce = 0` 的交易觀察一下結果:

```bash
Transaction: 0xd60b73887a9f123d3a6fdb041b2067f9a8804cef7db22a0d8bb1386c75e5fb24
Gas used: 21000

Transaction: 0x6016b5ad9e0252718272c7320555d0b9fe9b471d17770a6d68d17893026f080b
Gas used: 42000

Transaction: 0x04ed1d0bef7695fc2aee3cf09fb505fbf0226fe8a760ae354996054f02fad659
Gas used: 63000
```

我們可以看到所有內存池內的交易都已經被執行打包上鏈。當然,一般很難出現 nonce 斷裂(有時被稱為 nonce gap)導致的交易無法被執行,一般來說只有在開發者手動介入 Nonce 生成時才會出現這種問題。在後文中,我們將介紹如何手動控制 nonce 值來實現一些特殊目的,所以假如讀者使用了後文中的方案有可能遇到 nonce 斷裂的情況。

### 使用 Nonce 解決交易卡在內存池的問題

一種常見的情況時使用 nonce 值解決交易被卡在內存池的情況。我們首先在 Sepolia 測試網內構建一筆會被卡在內存池內的交易:

```bash
cast send 0x11475691C2CAA465E19F99c445abB31A4a64955C --value 0.0005ether --gas-price 8 --priority-gas-price 0 --async --account sepolia
```

此處的 `--gas-price` 應該被設置為目前最新區塊的 base fee 而 `--priority-gas-price 0` 的目標是通過不給定優先費用來實現交易卡在內存池的目的。在後文中,我們會稱此處使用 `--gas-price` 給定的值為 `max_fee_per_gas`。接下來,我們可以使用 `cast tx` 指令觀察到該交易的 `blockHash` 為空,這說明交易沒有被打包。此時我們可以通過以下命令觀察到一些不同:

```bash
cast nonce 0xdFaF16328A960703F59ee35a7B5953b2483007Ee
cast nonce 0xdFaF16328A960703F59ee35a7B5953b2483007Ee -B pending
```

上述兩條命令返回值相差 `1`,此處的 `-B pending` 指令是指根據當前 mempool 的情況計算地址的 nonce 值。我們可以通過以下命令直接替換還在內存池內的交易:

```bash
cast send 0x11475691C2CAA465E19F99c445abB31A4a64955C --value 0.0005ether --gas-price 15 --priority-gas-price 15 --async --account sepolia --nonce $NONCE
```

實際上,我們可以將還在內存池內的交易替換為任意交易。當我們遇到交易因為 gas 較低被卡在內存池中時,我們可以利用上述方法替換自己的交易。

### EIP-7702 對 Nonce 的影響

在 EIP-7702 引入後,EOA 的 nonce 連續性被破壞了。簡單來說,EIP-7702 中引入的 `SET_CODE_TX_TYPE` 交易。該交易形式如下:

```
rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, value, data, access_list, authorization_list, signature_y_parity, signature_r, signature_s])
```

我們可以注意到該交易內容中包含 `authorization_list` 一項,該項內容如下:

```python
assert auth.chain_id < 2**256
assert auth.nonce < 2**64
assert len(auth.address) == 20
assert auth.y_parity < 2**8
assert auth.r < 2**256
assert auth.s < 2**256
```

所有位於 `auth` 內部的地址都會在驗證簽名正確後都會在 EOA 對應的 `code` 狀態內寫入一段特定代碼用於委託調用,我們在後文介紹 `delegatecall` 時會繼續分析 EIP-7702 的工作原理。在此處,我們需要知道所有位於 `authorization_list` 內部且可以通過簽名校驗的賬戶都會 nonce 增加 1。

而且與正常交易一致,發送 `SET_CODE_TX_TYPE` 類型交易的 EOA 的 nonce 也會自增 1。這意味著用戶 A 假如在 `authorization_list` 內填入自己的地址,那麼發起一次交易會導致 nonce 增加 2。這打破了過去一次交易只會將 EOA 的 nonce 增加 1 的常規情況。

EIP-7702 前,geth 等客戶端會利用 nonce 快速判斷用戶的交易是否可以被執行,這是因為 nonce 增加一定意味著用戶 ETH 餘額的降低,反之賬戶 ETH 餘額的降低一定意味著 nonce 增加。我們可以使用 `nonce` 計算出當前用戶需要支付的 ETH 數量與賬戶餘額是否匹配。geth 內 `ValidateTransactionWithState` 中存在如下代碼:

```go
spent := opts.ExistingExpenditure(from)
if prev := opts.ExistingCost(from, tx.Nonce()); prev != nil {
    bump := new(big.Int).Sub(cost, prev)
    need := new(big.Int).Add(spent, bump)
    if balance.Cmp(need) < 0 {
        return fmt.Errorf("%w: balance %v, queued cost %v, tx bumped %v, overshot %v", core.ErrInsufficientFunds, balance, spent, bump, new(big.Int).Sub(need, balance))
    }
} else {
    need := new(big.Int).Add(spent, cost)
    if balance.Cmp(need) < 0 {
        return fmt.Errorf("%w: balance %v, queued cost %v, tx cost %v, overshot %v", core.ErrInsufficientFunds, balance, spent, cost, new(big.Int).Sub(need, balance))
    }
    // Transaction takes a new nonce value out of the pool. Ensure it doesn't
    // overflow the number of permitted transactions from a single account
    // (i.e. max cancellable via out-of-bound transaction).
    if opts.UsedAndLeftSlots != nil {
        if used, left := opts.UsedAndLeftSlots(from); left <= 0 {
            return fmt.Errorf("%w: pooled %d txs", ErrAccountLimitExceeded, used)
        }
    }
}
```

但是顯然 EIP-7702 打破了上述 nonce 與賬戶餘額的互逆關係,我們可以通過第三方調用使用 EIP-7702 的賬戶,實現不增加賬戶 nonce 的情況下直接將賬戶內的 ETH 全部轉移出去。這帶來了潛在的 DoS 攻擊向量,攻擊者可以發起一連串交易到節點內部,然後在某個時刻利用 7702 合約調用清空賬戶資產導致後續所有內存池內的交易都因為餘額不足而失效。所以 EIP-7702 建議節點限制使用 EIP-7702 合約委託賬戶的內存池交易數量。以下代碼顯示了 geth 內的限制,簡單來說只允許 EIP-7702 賬戶最多在內存池內存在一筆 pending 交易:

```go
// checkDelegationLimit determines if the tx sender is delegated or has a
// pending delegation, and if so, ensures they have at most one in-flight
// **executable** transaction, e.g. disallow stacked and gapped transactions
// from the account.
func (pool *LegacyPool) checkDelegationLimit(tx *types.Transaction) error {
    from, _ := types.Sender(pool.signer, tx) // validated
    // Short circuit if the sender has neither delegation nor pending delegation.
    if pool.currentState.GetCodeHash(from) == types.EmptyCodeHash && !pool.all.hasAuth(from) {
        return nil
    }
    pending := pool.pending[from]
    if pending == nil {
        // Transaction with gapped nonce is not supported for delegated accounts
        if pool.pendingNonces.get(from) != tx.Nonce() {
            return ErrOutOfOrderTxFromDelegated
        }
        return nil
    }
    // Transaction replacement is supported
    if pending.Contains(tx.Nonce()) {
        return nil
    }
    return txpool.ErrInflightTxLimitReached
}
```

### Nonce 與合約部署

對於智能合約工程師而言,假如 EOA 進行合約部署交易,那麼部署合約的地址只與交易發起者的地址和 nonce 有關。我們可以直接使用 `cast` 命令進行計算:

```bash
cast compute-address 0xdFaF16328A960703F59ee35a7B5953b2483007Ee --nonce 0
```

### Nonce 的開發實踐

在本節的最後,我們介紹 Nonce 在開發過程中的使用和管理。大部分情況下,開發者都不需要手動管理 `nonce` 值,一般框架在發起交易時會自動幫開發者處理。但是這種自動管理往往都依賴於 RPC 交互獲得返回值,具體來說,`viem` 等框架會調用 `eth_getTransactionCount` 方法獲得返回值並以此作為 nonce 的基礎,相關代碼如下:

```typescript
if (parameters.includes('nonce') && typeof nonce === 'undefined' && account) {
    if (nonceManager) {
        const chainId = await getChainId()
        request.nonce = await nonceManager.consume({
            address: account.address,
            chainId,
            client,
        })
    } else {
        request.nonce = await getAction(
            client,
            getTransactionCount,
            'getTransactionCount',
        )({ address: account.address, blockTag: 'pending' })
    }
}
```

但在時間敏感性應用構建時,我們就需要考慮手動管理的方法,即手動指定上文代碼內的 `nonceManager`。以下代碼就是一個需要使用 `nonceManager` 的案例:

```typescript
import { createWalletClient, http, parseEther } from "viem";
import { anvil } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
);

const walletClient = createWalletClient({
    chain: anvil,
    account,
    transport: http(),
});

[...new Array(3)].map(async (_) => {
    const hash = await walletClient.sendTransaction({
        to: "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720",
        value: parseEther("0.05"),
    });
    console.log(hash);
});
```

該代碼在執行後只會成功執行第一筆交易,剩下的交易都會觸發如下報錯:

```
URL: http://127.0.0.1:8545
Request body: {"method":"eth_sendRawTransaction","params":["0x02f873827a6980843b9aca00848321560082520894a0ee7a142d267c1f36714e4a8f75612f20a7972087b1a2bc2ec5000080c080a04cef89fcd6eb8976db24a0284f88059683953f32ebc95326019be48826991410a05519dad361fead743ca858f49f4530f4c565162f4abd4d705e3320ddc4d13a96"]}
Details: nonce too low
```

`nonce too low` 的報錯提醒我們發送的交易 `nonce` 值存在問題,出現這種報錯的原因是在 typescript 我們進行異步交易發送,此時所有交易受制於 RPC 調用返回值的緩存問題,後續交易都使用了同一個 `nonce` 值。所以解決方法是切換為本地的 `nonceManager` 而不是藉助於 RPC 服務返回值。`nonceManager` 的接口要求如下:

```typescript
export type NonceManager = {
    /** Get and increment a nonce. */
    consume: (
        parameters: FunctionParameters & { client: Client },
    ) => Promise<number>
    /** Increment a nonce. */
    increment: (chainId: FunctionParameters) => void
    /** Get a nonce. */
    get: (chainId: FunctionParameters & { client: Client }) => Promise<number>
    /** Reset a nonce. */
    reset: (chainId: FunctionParameters) => void
}
```

我們可以直接使用 `viem` 已經編寫好的 `nonceManager` 組件,將上述代碼修改為:

```typescript
const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    {
        nonceManager: createNonceManager({
            source: jsonRpc(),
        }),
    },
);
```

## Gas

Gas 是 EVM 工程師最關心的問題之一。由於圖靈機存在停機問題,簡單來說,我們無法預先知道某一段代碼是否可以在一段時間內停止執行,所以我們引入了 Gas 概念。我們不在數學上研究一段代碼何時會結束運行,而是給定一定數量 gas (total gas),並規定每一個 EVM opcode 所需要的 gas。每執行一個 opcode,我們就會從 total gas 內減去當前 opcode 消耗的 gas,我們一般稱上述減法的結果為 `gasleft`。當代碼執行結束或者 gasleft 為 0 時,我們就停止 EVM 執行。

### Opcode Gas 計算

對於 opcode 所需要 gas 數量問題,最簡單的方法是直接查詢 evm.codes 內的 `Minimum Gas` 欄目,或者更好的辦法是直接閱讀 execution-specs。該規範使用 Python 語言描述了以太坊執行層內的所有標準,比如 `prague/vm/gas.py` 就描述了 Prague 升級後的 gas 情況:

```python
GAS_JUMPDEST = Uint(1)
GAS_BASE = Uint(2)
GAS_VERY_LOW = Uint(3)
GAS_STORAGE_SET = Uint(20000)
GAS_STORAGE_UPDATE = Uint(5000)
```

> 個人習慣是對於簡單的如 `swap` / `jumpi` 等 gas 計算較為簡單的 opcode 直接使用 evm.codes 給出的結果,但對於 `mstore` / `sstore` / `call` 等複雜 opcode 的 gas 計算,一般選擇直接閱讀 python 版本的 spec。

### SSTORE 操作的 Gas 計算

在此處,我們閱讀一些 EVM 內最昂貴的操作碼 `SSTORE` 的 gas 計算方法。該 opcode 的作用是寫入以太坊狀態。我們可以將以太坊狀態視為一個 Key-Value 數據庫,`sstore(key, value)` 會接受 key 和 value 兩個參數並將其寫入以太坊狀態。

```python
def sstore(evm: Evm) -> None:
    """
    Stores a value at a certain key in the current context's storage.

    Parameters
    ----------
    evm :
        The current EVM frame.
    """
    # STACK
    key = pop(evm.stack).to_be_bytes32()
    new_value = pop(evm.stack)

    if evm.gas_left <= GAS_CALL_STIPEND:
        raise OutOfGasError

    state = evm.message.block_env.state
    original_value = get_storage_original(
        state, evm.message.current_target, key
    )
    current_value = get_storage(state, evm.message.current_target, key)

    gas_cost = Uint(0)

    if (evm.message.current_target, key) not in evm.accessed_storage_keys:
        evm.accessed_storage_keys.add((evm.message.current_target, key))
        gas_cost += GAS_COLD_SLOAD

    if original_value == current_value and current_value != new_value:
        if original_value == 0:
            gas_cost += GAS_STORAGE_SET
        else:
            gas_cost += GAS_STORAGE_UPDATE - GAS_COLD_SLOAD
    else:
        gas_cost += GAS_WARM_ACCESS

    # Refund Counter Calculation
    if current_value != new_value:
        if original_value != 0 and current_value != 0 and new_value == 0:
            # Storage is cleared for the first time in the transaction
            evm.refund_counter += int(GAS_STORAGE_CLEAR_REFUND)

        if original_value != 0 and current_value == 0:
            # Gas refund issued earlier to be reversed
            evm.refund_counter -= int(GAS_STORAGE_CLEAR_REFUND)

        if original_value == new_value:
            # Storage slot being restored to its original value
            if original_value == 0:
                # Slot was originally empty and was SET earlier
                evm.refund_counter += int(GAS_STORAGE_SET - GAS_WARM_ACCESS)
            else:
                # Slot was originally non-empty and was UPDATED earlier
                evm.refund_counter += int(
                    GAS_STORAGE_UPDATE - GAS_COLD_SLOAD - GAS_WARM_ACCESS
                )

    charge_gas(evm, gas_cost)

    if evm.message.is_static:
        raise WriteInStaticContext

    set_storage(state, evm.message.current_target, key, new_value)

    # PROGRAM COUNTER
    evm.pc += Uint(1)
```

我們可以按照以下邏輯分析上述代碼:

1. 操作的存儲槽如果不在 `access lists` 中,則 gas 增加 `GAS_COLD_SLOAD = 2100`,但在這筆交易後續的數據寫入過程中則不需要再次繳納此費用
2. 在此交易內,用戶第一次修改某個存儲槽內容,如果該存儲槽在交易前為空,則用戶需要繳納 `GAS_STORAGE_SET = 20000`;而如果此存儲槽在交易前不為空,則用戶繳納 `GAS_STORAGE_UPDATE(5000) - GAS_COLD_SLOAD(2100) = 2900`
3. 在此交易內,用戶第 n 次 (n > 1) 修改存儲槽內容,則只需要繳納 `GAS_WARM_ACCESS = 100`

### Access Lists 機制

此處的 `access lists` 就是在本文開始部分展示的 `Transaction1559Payload` 內的 `access_list` 欄位。我們可以通過向該欄位填入地址和 storage slot 實現在交易中預先為 storage slots 支付 `GAS_COLD_SLOAD`。該機制的存在是有其歷史原因的。EIP-2929 增加 `GAS_COLD_SLOAD` 機制,這增加了 `sstore` 的成本。這導致過去一些古老的直接將 gas 數值固定的合約會因為 gas 問題無法執行,所以在 EIP-2930 內引入了 `access lists` 機制來避免該部分問題。需要注意的是,`TX_ACCESS_LIST_STORAGE_KEY_COST = 1900`,所以使用 `access list` 機制會為每一個 slots 的初次訪問帶來 200 gas 折扣。

### Gas Refund 機制

上述 `sstore` 代碼的後半部分在處理 Gas Refund 問題。Gas Refund 會在交易結束後用於抵扣交易過程中的 gas 消耗。此處需要特別注意,我們不會使用 gas left + gas refund 作為當前 EVM 剩餘 gas。在交易過程中,只有 gas left 會被視為可被使用 gas 而 gas refund 只會在交易結束後抵消一部分 gas 消耗:

```python
# For EIP-7623 we first calculate the execution_gas_used, which includes
# the execution gas refund.
tx_gas_used_before_refund = tx.gas - tx_output.gas_left
tx_gas_refund = min(
    tx_gas_used_before_refund // Uint(5),
    Uint(tx_output.refund_counter)
)
tx_gas_used_after_refund = tx_gas_used_before_refund - tx_gas_refund

# Transactions with less execution_gas_used than the floor pay at the
# floor cost.
tx_gas_used_after_refund = max(
    tx_gas_used_after_refund,
    calldata_floor_gas_cost
)

tx_gas_left = tx.gas - tx_gas_used_after_refund
```
