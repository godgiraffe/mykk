# Chrome 多開多帳號 + VPS 自建代理 IP 完整教程

> **來源**: [@MetaHunter168](https://x.com/MetaHunter168/status/1884214603749691597) | [原文連結](https://x.com/i/article/1884206099823493120)
>
> **日期**: 
>
> **標籤**: `Chrome 瀏覽器` `VPS 代理` `撸毛安全`

---

> **來源**: [@MetaHunter168 (小人物)](https://x.com/@MetaHunter168)
> **日期**: 2026-02-18
> **標籤**: `Chrome` `多開帳號` `VPS` `代理IP` `Shadowsocks` `加密貨幣` `安全`

---

## 背景

對於很多擼毛的小伙伴來說，本應該是開開心心過大年的日子，卻突然發生被 ADS 被黑事件，無數人的資金被盜取，黑客地址已經開始混幣，基本找回無望了。對於很多長期的擼毛人來說，指紋瀏覽器確實有比較方便的地方，但是自古效率和安全就是蹺蹺板的兩端，只能兼顧找到一個平衡點。

指紋瀏覽器的優點主要在於操作方便和環境隔離，這個是多號操作的兩個必備條件。指紋流量器能做到的事情，谷歌瀏覽器在一定的程度上也能完全替代。

本教程的主要內容包括三個方面：

1. Google Chrome 多開多帳號登錄
2. 配置翻牆工具和插件錢包
3. 自己搭建 VPN 獲得外網 IP

---

## 第一部分：Google Chrome 多開多帳號登錄

### 第一步：下載 Google Chrome

下載地址：https://www.google.com/chrome/

找到適合你的操作系統的軟件，支援 Windows/Mac/Ubuntu，下載後直接雙擊安裝。

### 第二步：註冊 Google 帳號

根據需求註冊多個 Google 帳號，用於多開瀏覽器。

---

## 第二部分：配置翻牆工具和插件錢包

### 下載 Proxy SwitchyOmega 插件

下載地址：https://chromewebstore.google.com/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif

**設置步驟**：

1. 設置代理的 IP 和端口
2. 打開代理
3. 關閉代理（需要時）

### 下載 OKX 歐意錢包插件

下載地址：https://chromewebstore.google.com/detail/%E6%AC%A7%E6%98%93-web3-%E9%92%B1%E5%8C%85/mcohilncbfahbmgdjkbpemcciiolgcge?hl=zh-CN&utm_source=ext_sidebar

**設置步驟**：

1. 創建新錢包或者導入已有的錢包
2. 開啟同步功能，開啟同步功能後，你下載的插件都會自動同步到不同的設備

重複上面的操作，你可以註冊無限多的 Google 帳號。

---

## 第三部分：自己搭建代理服務器

### 第一步：購買服務器

因為需要 24 小時不間斷運行，推薦使用雲服務器運行節點。記得選擇 Ubuntu 系統。

可以選擇最便宜的機器，一個月只要 4U 左右，比直接購買服務還便宜。

### 第二步：安裝 Shadowsocks

安裝命令如下：

```bash
apt update && apt upgrade -y
apt install shadowsocks-libev -y
```

### 第三步：配置 Shadowsocks

在 `/etc/shadowsocks-libev` 目錄下創建一個新的配置文件，通常命名為 `config.json`。

```bash
vim /etc/shadowsocks-libev/config.json
```

配置文件內容：

```json
{
    "server":"0.0.0.0",
    "server_port":8388,
    "password":"your_password",
    "method":"chacha20-ietf-poly1305",
    "timeout":300
}
```

**配置說明**：

- `server`：監聽所有 IP 地址
- `server_port`：選擇一個未被占用的端口
- `password`：設置連接密碼
- `method`：選擇加密方式，建議使用 `chacha20-ietf-poly1305` 或 `aes-256-gcm`

### 第四步：啟動 Shadowsocks 服務

```bash
systemctl start shadowsocks-libev
```

### 第五步：配置防火牆

允許 Shadowsocks 端口通過防火牆：

```bash
ufw allow 8388
```

你擁有一個可供翻牆的 IP 和端口，可以配置到 Chrome 瀏覽器中。

---

## 總結

至此，所有的教程結束，你擁有一個完完全全自己控制的擼毛環境，從瀏覽器帳號、到翻牆工具、到外網 IP，都是你自己搭建的，不會有任何安全風險。

**再次提醒大家：資金安全問題至關重要！**
