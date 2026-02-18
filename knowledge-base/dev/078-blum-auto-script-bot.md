# Blum 自動遊戲腳本開源工具

> **來源**: [@Xuegaogx](https://x.com/Xuegaogx/status/1852625295443992662) | [原文連結](https://github.com/GzGod/Blum)
>
> **日期**: Sat Nov 02 08:14:25 +0000 2024
>
> **標籤**: `自動化腳本` `遊戲機器人` `開發工具`

---

> **來源**: [@Xuegaogx (雪糕戰神🍦)](https://twitter.com/Xuegaogx)  
> **日期**: 2026-02-18  
> **標籤**: `Blum` `自動化腳本` `Telegram` `開源工具`

---

## 專案簡介

Blum 自動遊戲腳本已開源，可自動執行遊戲，且無需手動抓取 token。

GitHub 專案：https://github.com/GzGod/Blum

## 使用方法

### 1. 獲取初始化資料

1. 開啟 Blum 的 Telegram WebApp
2. 打開瀏覽器控制台（Console）
3. 輸入以下指令：
   ```javascript
   copy(Telegram.WebApp.initData)
   ```
4. **第一次使用時**：需要輸入 `允許粘貼` 四個字才能進行粘貼操作
5. 執行後會自動複製一段內容到剪貼簿

### 2. 執行腳本

1. 將複製的內容貼入 `data.txt` 檔案
2. 執行 `fuckblum.bat` 即可開始自動運行

## 專案檔案結構

| 檔案名稱 | 說明 |
|---------|------|
| `blum.py` | Python 主腳本 |
| `data.txt` | 存放從 Telegram WebApp 複製的初始化資料 |
| `fuckblum.bat` | Windows 批次執行檔 |
| `tokens.json` | Token 資料檔 |
| `useragent.txt` | User Agent 設定檔 |
| `verif.json` | 驗證資料檔 |

## 技術資訊

- **開發語言**：Python (97.7%)、Batchfile (2.3%)
- **專案狀態**：開源，11 stars，12 forks
- **授權**：未標註
- **部署方式**：本地執行
