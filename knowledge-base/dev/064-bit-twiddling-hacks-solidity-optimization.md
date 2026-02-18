# 位元操作技巧 - Solidity 內聯匯編優化參考

> **來源**: [@wong_ssh](https://x.com/wong_ssh/status/1875386042750255265) | [原文連結](https://graphics.stanford.edu/~seander/bithacks.html)
>
> **日期**: Sat Jan 04 03:37:30 +0000 2025
>
> **標籤**: `位元運算` `Solidity 優化` `低階編程`

---

> **來源**: [@wong_ssh](https://twitter.com/wong_ssh)
> **日期**: 2026-02-18
> **標籤**: `Solidity` `內聯匯編` `位元操作` `Gas 優化` `智能合約`

---

## 概述

許多進行 Solidity 內聯匯編優化的工程師都使用同一份位元操作參考資料作為基礎。那些看起來難以理解的位元運算，其實很多都是直接從這份文件中複製過來的程式碼。

這份文件是 **Bit Twiddling Hacks**，由 Sean Eron Anderson 編寫，收錄了大量低階位元操作技巧。這些技巧在智能合約開發中特別有用，因為它們可以：

- 減少運算指令數量
- 降低 Gas 消耗
- 避免分支判斷（branching）帶來的效能損失
- 在沒有特定 CPU 指令的情況下實現高效運算

## 核心技巧分類

### 整數符號與絕對值

**計算整數符號（不使用分支）**

```c
int v;      // 輸入值
int sign;   // 結果

// 方法 1: 簡單版本
sign = -(v < 0);  // 如果 v < 0 則為 -1，否則為 0

// 方法 2: 使用位移（更快，但依賴架構）
sign = v >> (sizeof(int) * CHAR_BIT - 1);

// 方法 3: 得到 -1 或 +1
sign = +1 | (v >> (sizeof(int) * CHAR_BIT - 1));

// 方法 4: 得到 -1, 0, 或 +1（最具可移植性）
sign = (v > 0) - (v < 0);
```

**計算絕對值（不使用分支）**

```c
int v;           // 輸入值
unsigned int r;  // 結果
int const mask = v >> sizeof(int) * CHAR_BIT - 1;

r = (v + mask) ^ mask;

// 專利版本（更優但有專利問題）
r = (v ^ mask) - mask;
```

### 最小值與最大值

**不使用分支計算 min/max**

```c
int x, y;  // 輸入值
int r;     // 結果

// 最小值
r = y ^ ((x ^ y) & -(x < y));

// 最大值
r = x ^ ((x ^ y) & -(x < y));
```

**快速但有條件限制的版本**（要求 `INT_MIN <= x - y <= INT_MAX`）

```c
// 最小值
r = y + ((x - y) & ((x - y) >> (sizeof(int) * CHAR_BIT - 1)));

// 最大值
r = x - ((x - y) & ((x - y) >> (sizeof(int) * CHAR_BIT - 1)));
```

### 2 的次方判斷

```c
unsigned int v;  // 輸入值
bool f;          // 結果

// 簡單版本（會將 0 誤判為 2 的次方）
f = (v & (v - 1)) == 0;

// 修正版本
f = v && !(v & (v - 1));
```

### 符號擴展（Sign Extending）

**從常數位寬擴展**

```c
int x;  // 原始 5 位元值
int r;  // 擴展後的結果
struct {signed int x:5;} s;
r = s.x = x;
```

**C++ 樣板函式**

```cpp
template <typename T, unsigned B>
inline T signextend(const T x) {
    struct {T x:B;} s;
    return s.x = x;
}

int r = signextend<signed int, 5>(x);  // 將 5 位元數字擴展
```

**從變數位寬擴展（3 個操作）**

```c
unsigned b;  // 位元數量
int x;       // 要擴展的值
int r;       // 結果
int const m = 1U << (b - 1);  // mask 可以事先計算

x = x & ((1U << b) - 1);  // （可選）保留 b 位元
r = (x ^ m) - m;
```

### 條件設定（不使用分支）

**根據條件設定或清除位元**

```c
bool f;         // 條件標誌
unsigned int m; // 要修改的位元遮罩
unsigned int w; // 要修改的字
w ^= (-f ^ w) & m;

// 或者，對於超純量 CPU：
w = (w & ~m) | (-f & m);
```

**條件取負值**

```c
bool fDontNegate;  // 決定是否取負
int v;             // 輸入值
int r;             // 結果

r = (fDontNegate ^ (fDontNegate - 1)) * v;

// 或者：
r = (v ^ -fDontNegate) + fDontNegate;
```

### 位元合併

**根據遮罩合併兩個值的位元**

```c
unsigned int a;    // 要合併的值
unsigned int b;    // 要合併的值
unsigned int mask; // 遮罩
unsigned int r;    // 結果

r = a ^ ((a ^ b) & mask);
```

### 計算設定的位元數

**方法 1: 樸素方法**

```c
unsigned int v;  // 計算這個值的設定位元
unsigned int c;  // 結果

for (c = 0; v; v >>= 1) {
    c += v & 1;
}
```

**方法 2: Brian Kernighan 方法**

```c
unsigned int v;  // 計算這個值的設定位元
unsigned int c;  // 結果

for (c = 0; v; c++) {
    v &= v - 1;  // 清除最低位的 1
}
```

**方法 3: 平行計算**

```c
v = v - ((v >> 1) & 0x55555555);
v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
c = ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
```

**方法 4: 查表法**

```c
static const unsigned char BitsSetTable256[256] = {
#   define B2(n) n,     n+1,     n+1,     n+2
#   define B4(n) B2(n), B2(n+1), B2(n+1), B2(n+2)
#   define B6(n) B4(n), B4(n+1), B4(n+1), B4(n+2)
    B6(0), B6(1), B6(1), B6(2)
};

unsigned int v;  // 計算這個值的設定位元
unsigned int c;  // 結果

c = BitsSetTable256[v & 0xff] + 
    BitsSetTable256[(v >> 8) & 0xff] + 
    BitsSetTable256[(v >> 16) & 0xff] + 
    BitsSetTable256[v >> 24];
```

### 計算奇偶校驗

**平行計算奇偶校驗**

```c
unsigned int v;  // 輸入值
v ^= v >> 16;
v ^= v >> 8;
v ^= v >> 4;
v &= 0xf;
return (0x6996 >> v) & 1;
```

### 位元交換

**使用 XOR 交換值**

```c
#define SWAP(a, b) (((a) ^= (b)), ((b) ^= (a)), ((a) ^= (b)))
```

**交換個別位元**

```c
unsigned int i, j;  // 要交換的位元位置
unsigned int n;     // 要交換位元的整數
unsigned int r;     // 結果

unsigned int x = ((n >> i) ^ (n >> j)) & 1;  // 如果不同則為 1
r = n ^ ((x << i) | (x << j));
```

### 位元反轉

**逐位元反轉（明顯方法）**

```c
unsigned int v;     // 要反轉的值
unsigned int r = v; // 結果
int s = sizeof(v) * CHAR_BIT - 1;

for (v >>= 1; v; v >>= 1) {   
    r <<= 1;
    r |= v & 1;
    s--;
}
r <<= s;
```

**使用 64 位元乘法和模數反轉一個位元組（3 個操作）**

```c
unsigned char b;  // 要反轉的位元組
b = (b * 0x0202020202ULL & 0x010884422010ULL) % 1023;
```

**平行反轉 N 位元數量（5 * lg(N) 個操作）**

```c
unsigned int v;  // 32 位元要反轉

// 交換奇數和偶數位元
v = ((v >> 1) & 0x55555555) | ((v & 0x55555555) << 1);
// 交換連續的位元對
v = ((v >> 2) & 0x33333333) | ((v & 0x33333333) << 2);
// 交換半位元組
v = ((v >> 4) & 0x0F0F0F0F) | ((v & 0x0F0F0F0F) << 4);
// 交換位元組
v = ((v >> 8) & 0x00FF00FF) | ((v & 0x00FF00FF) << 8);
// 交換 2 位元組的長字
v = ( v >> 16             ) | ( v               << 16);
```

### 模數運算

**對 2 的次方取模（明顯方法）**

```c
unsigned int n;         // 分子
unsigned int s;         // 分母是 1 << s
unsigned int d;         // 結果

d = n & ((1 << s) - 1);
```

**對 (1 << s) - 1 取模（無除法）**

```c
unsigned int n;                      // 分子
unsigned int s;                      // 分母是 (1 << s) - 1
unsigned int d;                      // 結果
static const unsigned int M[] = {
    0x00000000, 0x55555555, 0x33333333, 0xc71c71c7,
    0x0f0f0f0f, 0xc1f07c1f, 0x3f03f03f, 0xf01fc07f,
    0x00ff00ff, 0x07fc01ff, 0x3ff003ff, 0xffc007ff,
    0xff000fff, 0xfc001fff, 0xf0003fff, 0xc0007fff,
    0x0000ffff, 0x0001ffff, 0x0003ffff, 0x0007ffff,
    0x000fffff, 0x001fffff, 0x003fffff, 0x007fffff,
    0x00ffffff, 0x01ffffff, 0x03ffffff, 0x07ffffff,
    0x0fffffff, 0x1fffffff, 0x3fffffff, 0x7fffffff
};

d = (n & M[s]) + ((n >> s) & M[s]);

for (int i = s; i > 1; i /= 2) {
    d = (d >> i) + (d & M[i]);
}
d = d == q ? 0 : d;
```

### 整數 log base 2

**使用浮點數找到 log base 2**

```c
int v;  // 找到這個值的 log base 2
int r;  // 結果

union { unsigned int u[2]; double d; } t;
t.u[__FLOAT_WORD_ORDER == LITTLE_ENDIAN] = 0x43300000;
t.u[__FLOAT_WORD_ORDER != LITTLE_ENDIAN] = v;
t.d -= 4503599627370496.0;
r = (t.u[__FLOAT_WORD_ORDER == LITTLE_ENDIAN] >> 20) - 0x3FF;
```

**使用查表法**

```c
unsigned int v;  // 找到這個值的 log base 2
unsigned int r;  // 結果
unsigned int shift;

r =     (v > 0xFFFF) << 4; v >>= r;
shift = (v > 0xFF  ) << 3; v >>= shift; r |= shift;
shift = (v > 0xF   ) << 2; v >>= shift; r |= shift;
shift = (v > 0x3   ) << 1; v >>= shift; r |= shift;
                                        r |= (v >> 1);
```

**使用二元搜尋法（O(lg(N)) 操作）**

```c
unsigned int v;  // 32 位元值
unsigned int r;  // 結果
unsigned int shift;

r =     (v > 0xFFFF) << 4; v >>= r;
shift = (v > 0xFF  ) << 3; v >>= shift; r |= shift;
shift = (v > 0xF   ) << 2; v >>= shift; r |= shift;
shift = (v > 0x3   ) << 1; v >>= shift; r |= shift;
                                        r |= (v >> 1);
```

### 整數 log base 10

**明顯方法**

```c
unsigned int v;  // 找到這個值的 log base 10

r = (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 : 
    (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
    (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
```

### 計算連續尾隨零位元

**線性計算**

```c
unsigned int v;  // 輸入值
unsigned int c;  // 輸出: 尾隨零位元數

if (v) {
    v = (v ^ (v - 1)) >> 1;  // 設定 v 的尾隨 0s 為 1s 並將位元清零
    for (c = 0; v; c++) {
        v >>= 1;
    }
} else {
    c = CHAR_BIT * sizeof(v);
}
```

**平行計算**

```c
unsigned int v;      // 輸入值
unsigned int c = 32; // 輸出: 尾隨零位元數

v &= -signed(v);
if (v) c--;
if (v & 0x0000FFFF) c -= 16;
if (v & 0x00FF00FF) c -= 8;
if (v & 0x0F0F0F0F) c -= 4;
if (v & 0x33333333) c -= 2;
if (v & 0x55555555) c -= 1;
```

**使用浮點數轉換計算**

```c
unsigned int v;  // 輸入值
int r;           // 結果

float f = (float)(v & -v);
r = (*(uint32_t *)&f >> 23) - 0x7f;
```

**使用模數和查表法**

```c
unsigned int v;      // 輸入值
int r;               // 結果
static const int Mod37BitPosition[] = {
    32, 0, 1, 26, 2, 23, 27, 0, 3, 16, 24, 30, 28, 11, 0, 13, 4,
    7, 17, 0, 25, 22, 31, 15, 29, 10, 12, 6, 0, 21, 14, 9, 5,
    20, 8, 19, 18
};
r = Mod37BitPosition[(-v & v) % 37];
```

### 進位到下一個 2 的次方

```c
unsigned int v;  // 計算這個值的下一個最高 2 的次方

v--;
v |= v >> 1;
v |= v >> 2;
v |= v >> 4;
v |= v >> 8;
v |= v >> 16;
v++;
```

### 交錯位元（Morton Numbers）

**明顯方法**

```c
unsigned short x;  // 交錯低 16 位元
unsigned short y;
unsigned int z;    // z 得到結果

z = 0;
for (int i = 0; i < sizeof(x) * CHAR_BIT; i++) {
    z |= (x & 1U << i) << i | (y & 1U << i) << (i + 1);
}
```

**使用 64 位元乘法**

```c
unsigned int x;  // 交錯這個的位元（位元 0, 2, 4, ... 62)
unsigned int y;  // 交錯這個的位元（位元 1, 3, 5, ... 63)
unsigned long long z;

z = (x * 0x0000000100000001ULL) & 0xFFFF0000FFFFULL;
z = (z * 0x0000000000010001ULL) & 0x00FF00FF00FF00FFULL;
z = (z * 0x0000000000000101ULL) & 0x0F0F0F0F0F0F0F0FULL;
z = (z * 0x0000000000000011ULL) & 0x3333333333333333ULL;
z = (z * 0x0000000000000005ULL) & 0x5555555555555555ULL;

// 對 y 做同樣的處理然後左移 1
z |= (處理過的 y) << 1;
```

**使用魔術數字**

```c
static const unsigned int B[] = {
    0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF
};
static const unsigned int S[] = {1, 2, 4, 8};

unsigned int x;  // 交錯低 16 位元
unsigned int y;
unsigned int z;  // z 得到結果

x = (x | (x << S[3])) & B[3];
x = (x | (x << S[2])) & B[2];
x = (x | (x << S[1])) & B[1];
x = (x | (x << S[0])) & B[0];

// 對 y 做同樣的處理
y = ...;

z = x | (y << 1);
```

## 在 Solidity 中的應用

這些位元操作技巧在智能合約開發中特別有價值：

1. **Gas 優化**: 位元操作通常比算術運算消耗更少的 Gas
2. **避免分支**: EVM 中的條件跳轉（JUMP）成本較高，用位元操作可以避免
3. **緊湊儲存**: 可以將多個布林值或小整數打包到單一 uint256 中
4. **高效查表**: 使用位元操作可以實現快速的查表邏輯
5. **數學運算優化**: 某些數學運算（如取模、log2）可以用位元操作加速

## 重要提醒

- 這些技巧大多假設使用二補數（two's complement）表示法
- 某些技巧依賴特定的 CPU 架構，移植性可能受限
- 在使用前應進行充分測試，確保在目標平台上行為正確
- 部分技巧可能有專利限制（如某些絕對值計算方法）
- 優先考慮可讀性和安全性，只在必要時使用這些優化

## 參考資料

- 原始文件：[Bit Twiddling Hacks by Sean Eron Anderson](https://graphics.stanford.edu/~seander/bithacks.html)
- 文件內容已經過 Carnegie Mellon University 的 Randal Bryant 教授使用 Uclid 程式碼驗證系統測試
- 所有程式碼片段（除非另有說明）均屬公有領域
