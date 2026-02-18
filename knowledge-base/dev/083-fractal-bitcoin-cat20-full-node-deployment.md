# Fractal Bitcoin & CAT20 全節點索引 10分鐘部署指南

> **來源**: [@practice_y11](https://x.com/practice_y11/status/1837052489839038545) | [原文連結](https://www.youtube.com/watch?v=wAKriVSKShw)
>
> **日期**: Fri Sep 20 08:53:39 +0000 2024
>
> **標籤**: `比特幣全節點` `CAT20協議` `區塊鏈部署`

---

> **來源**: [@practice_y11 (Yan Practice ⭕散修🎒)](https://twitter.com/practice_y11)  
> **日期**: 2026-02-18  
> **標籤**: `fractal-bitcoin` `cat20` `full-node` `bitcoin` `deployment`

---

## 環境需求

- **作業系統**: Ubuntu 22.04
- **硬體配置**: 2vCPU 8GB RAM（建議更高配置）

---

## Fractal Bitcoin Full Node 部署

### 1. 下載 Fractal Bitcoin

```bash
wget https://github.com/fractal-bitcoin/fractald-release/releases/download/v0.2.1/fractald-0.2.1-x86_64-linux-gnu.tar.gz
```

下載來源：https://github.com/fractal-bitcoin/fractald-release

### 2. 解壓縮與設定

```bash
# 解壓縮資料夾
tar -zxvf fractald-0.2.1-x86_64-linux-gnu.tar.gz

# 移動到資料夾中
cd fractald-0.2.1-x86_64-linux-gnu

# 建立資料夾
mkdir data

# 複製配置檔案
cp ./bitcoin.conf ./data
```

### 3. 啟動節點

```bash
./bin/bitcoind -datadir=./data/ -maxtipage=504576000
```

**重要提醒**：記得在配置檔中添加 `txindex=1`

---

## CAT20 索引部署

### 1. 下載 CATProtocol 程式庫

```bash
git clone https://github.com/CATProtocol/cat-token-box
```

### 2. 安裝相依套件

**Node.js 需求**: v20 或更高版本（詳細安裝步驟見影片內容）

```bash
# 安裝 yarn
npm i -g yarn

# 執行部署
yarn install && yarn build
```

### 3. 執行 Tracker 索引

```bash
cd packages/tracker
yarn run start
```

（配置細節見影片）

### 4. 執行 CLI 錢包/鑄造

```bash
cd packages/cli
yarn cli wallet create
```

（配置細節見影片）

---

## 支援與社群

如有問題可至 Telegram 群組詢問，作者有空會回覆。

完整操作步驟與細節請參考原作者提供的影片教學：[Fractal Bitcoin & CAT20 全節點索引 10分鐘部署](https://www.youtube.com/watch?v=...)
