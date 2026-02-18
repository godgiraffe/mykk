# React 複雜狀態管理：useReducer 勝過 useState

> **來源**: [@_georgemoller](https://x.com/_georgemoller/status/1736720417081929934) | [原文連結](https://twitter.com/_georgemoller/status/1736720417081929934/video/1)
>
> **日期**: Mon Dec 18 12:09:48 +0000 2023
>
> **標籤**: `React` `狀態管理` `最佳實踐`

---

> **來源**: [@_georgemoller (George Moller)](https://twitter.com/_georgemoller)  
> **標籤**: `React` `useReducer` `狀態管理` `Hooks`

---

## 核心觀點

在 React 中處理複雜狀態管理時，應避免使用 `useState()`，改用 `useReducer()`。

## useReducer 的三大優勢

### 1. 可預測的狀態轉換 (Predictable State Transitions)
狀態變更邏輯集中管理，每次狀態更新都遵循明確的規則，降低意外錯誤的機率。

### 2. 更容易測試 (Easier to test)
Reducer 是純函數，可獨立於元件進行單元測試，測試覆蓋率更高且更容易維護。

### 3. 更好的擴展性 (Scales better)
當狀態邏輯變得複雜時，`useReducer` 的結構化管理方式比多個 `useState` 更容易維護和擴展。

## 適用場景

當你的元件狀態出現以下情況時，應考慮使用 `useReducer`：
- 狀態物件包含多個子值
- 下一個狀態依賴於前一個狀態
- 狀態更新邏輯複雜
- 需要在多個地方觸發相同的狀態變更
