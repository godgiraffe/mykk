# DePIN 全家桶一鍵部署：6個項目 Docker 鏡像教學

> **來源**: [@Pow2wer](https://x.com/Pow2wer/status/1854473190011261213) | [原文連結](https://x.com/i/article/1854434674313162752)
>
> **日期**: 
>
> **標籤**: `DePIN` `Docker` `VPS部署`

---

> **來源**: [@Pow2wer (好大一坨 𐤊)](https://x.com/Pow2wer)
> **標籤**: `DePIN` `Docker` `VPS` `節點部署` `自動化`

---

## 概述

分享一個打包好的 DePIN 全家桶 Docker 鏡像，一條命令即可用極少資源部署 6 個 DePIN 項目，非常適合手裡有 VPS 的朋友。

## 集成項目清單

經篩選後集成的 6 個項目為：

1. **Grass 2.0** (桌面版 2x 積分)
2. **DAWN**
3. **Gradient**
4. **Nodepay**
5. **Blockmesh**
6. **Teneo**

## 方案特點

1. **完全免費，零門檻**，用法類似指紋瀏覽器
2. **真實環境掛機** (Ubuntu 22.04)，低女巫風險
3. **跨平台運行**：可以運行在任意 x86/x64 架構的 Linux 或 Windows 之上，只要有 Docker 環境
4. **極低資源佔用**：
   - 解壓後約 4GB 硬碟空間
   - 最多 1GB 記憶體佔用
   - 實測 2 核 VPS 可運行
5. **可擴展性強**：以此鏡像為基礎，可以大規模批量部署與自動化
6. **適合無圖形介面的 VPS**

## 使用方法

### 1. 安裝 Docker

請參考官方文件：https://docs.docker.com/engine/install/

### 2. 運行部署命令

```bash
docker run -d --restart=unless-stopped --shm-size=1024m -p 6901:6901 -e VNC_PW=<自定義密碼> --name ubuntu-desktop pow2wer/depin-aio:latest
```

**注意事項**：
- 請確認防火牆沒有阻擋 6901 端口
- 可以更換 6901 端口為其他端口

### 3. 瀏覽器訪問環境

訪問地址：`https://<你VPS的IP>:6901`

登入憑證：
- **用戶名**: `pow2wer` (坨哥推特 id)
- **密碼**: `<自定義密碼>`

雙擊桌面運行 Chrome 可以看到預裝的 DePIN 插件，雙擊桌面的 grass 圖標是小草 2.0 桌面版。

## 進階玩法

### a. 自定義鏡像

可以在這個鏡像的基礎上，打造自己的鏡像。

### b. 批量化部署

可以與 proxy 編排在一起，實現單機批量化部署上百個實例。

## 免責聲明

- 本鏡像僅做交流，使用請自負風險
- 所有技術均來自互聯網開源社區，如有侵權請聯繫刪除
- **注意**：IP 不符合項目要求的同學，需要自己解決 IP 問題
