# 放棄 OpenClaw 後，怎麼用 Claude 搭建最強工作流

> **來源**: [@joooe453](https://x.com/joooe453/status/2029498338283003945) | [原文連結](https://x.com/i/article/2028826625492852739)
>
> **日期**: 
>
> **標籤**: `Claude Code` `Skills 系統` `工作流自動化`

---

> **來源**: [@joooe453 (Jooooooe｜NodeZ)](https://x.com/joooe453)
> **標籤**: `Claude` `AI工作流` `Skill` `自動化`

---

## 前言

上篇說我放棄用 OpenClaw，有人問現在怎麼用 Claude。

答案是：Chat + Cowork + 偶爾 Code。但光說這樣不夠，讓我解釋我實際的工作流是怎麼搭起來的。

## 三個模式的差別

- **Chat** 就是你開瀏覽器用的對話框。適合臨時問題、一次性任務。每次對話獨立。

- **Cowork**（桌面 app）是非技術人員的最佳工具。你可以在檔案夾裡面放：你是誰、在做什麼、語氣設定、參考檔案、指令。每次打開 Claude 都有完整上下文，不用重新解釋自己。我有兩個 Cowork 檔案夾——行銷文案和個人 KOL 推文。打開直接說「寫今天的文案」就能動。

- **Code**（Claude Code，Terminal 工具）我比較少碰，只有需要跑指令、操控本機檔案、執行自動化流程才開。有個很強的功能叫 Remote Control——Terminal 啟動任務後，用手機繼續監控和下指令，你的 filesystem、MCP servers、所有本地設定全部保持活著。

## 讓 Claude 真正好用的關鍵：Skill

這是大多數人還沒研究透徹的部分。

Skill 是一個可以安裝到 Claude 的自訂指令包——不只是一段 prompt，而是一個檔案夾，核心是 SKILL.md，裡面寫清楚：什麼時候觸發、按什麼步驟走、輸出什麼格式。需要的話還可以附帶參考檔案和腳本。

我目前有：

1. **x-post-draft**：叫 Claude 寫 X 文案時自動觸發。先搜尋過去 48 小時高互動推文，過濾哪些角度能轉化成敘事，寫出 5 篇草稿 + 3 篇 meme 素材。Skill 檔案夾裡還放了語氣範例和競品文案分析，讓 Claude 每次都有參考基準。

2. **memory-manager**：把對話裡重要的決定、偏好、解法寫進 Cowork workspace 的 MEMORY.md，下次開新對話自動載入。這是 Cowork 才有的能力——因為它能存取本機 filesystem，Chat 做不到。變相給 Claude 加了跨 session 的記憶。

## 怎麼建 Skill 最好

最簡單的方式：先跑幾次你要自動化的任務，流程穩定之後直接跟 Claude 說「把這個流程做成 Skill」。它會幫你整理成 SKILL.md，你審過沒問題就安裝。

但如果你想建得紮實，關鍵是：給的資料越詳細越好。

特別是要寫文案的 Skill，光靠流程描述是不夠的。Claude 需要知道你的語氣長什麼樣、什麼叫好的輸出。

> 最好的做法是在 Skill 檔案夾裡放 references/，把 Claude 每次都需要參考的東西放進去：語氣範例、產品說明、競品資料、過去的優質輸出。

我的做法是：先在 Claude Chat 裡把歷史文案整理好。讓它幫我分類、標註風格、萃取規律，整理完之後存成 PDF，再把這個 PDF 丟進 Cowork 的 Skill 檔案夾。這樣 Skill 不只是一段流程，而是帶著完整知識庫在跑，每次輸出都有參考基準。

## 最新功能：Skill Creator

Anthropic 最近推出了 Skill Creator（一個專門用來建 Skill 的 Skill）

流程是：你描述想要的行為 → Claude 寫 SKILL.md 草稿 → 自動跑測試 → 給你看哪些通過、哪些沒觸發 → 自動最佳化觸發描述 → 打包成 .skill 檔安裝。

以前要自己手寫、憑感覺調整。現在把「讓 AI 更聽話」這件事本身也自動化了。

## 一般人能做什麼 Skill？

不需要會寫程式，只要你有重複在做的事：

- 每週要發的固定格式報告
- 特定語氣的客戶回覆或提案
- 電商選品分析、競品追蹤
- 社群文案（像我一樣，綁定競品搜尋 + 自己的語氣）
- 每次都要解釋一堆背景才能開始的工作

> 說白了就是把你腦子裡的 SOP 寫給 Claude 記住，之後一句話觸發。

## 定時做任務：/schedule

在 Cowork 任何任務裡輸入 `/schedule`，就可以設定讓 Claude 自動定時跑這個任務——每小時、每天、每週、只在工作日，或是純粹存成隨時可以手動觸發的任務。

我的用法：把 x-post-draft skill 設成每天定時跑，不用每次都手動叫它。早上起來打開電腦，草稿已經在 TG 等著我了。

設定方式很簡單：

1. 在 Cowork 開一個任務
2. 輸入 `/schedule`
3. Claude 會問你幾個問題（跑幾次、什麼時間、做什麼）
4. 確認之後任務就排好了，之後在左側欄的 Scheduled 頁面管理

> 要注意：scheduled task 只有在電腦開著、Claude Desktop 在跑的時候才會執行。電腦睡眠的話會跳過。

結合 Skill + /schedule + TG 推送，等於建了一條完全不用手動觸發的內容流水線。

## 做完事自動傳到 Telegram

我的流程：Claude 完成任務 → 自動打包發到 TG 私訊 → 手機上直接審稿發出。

串法：

**Step 1**：找 @BotFather，發 `/newbot`，拿到 bot_token

**Step 2**：跟 @userinfobot 發一條訊息，拿 id

**Step 3**：把這段給你的 Cowork：

```
每次完成【你的 skill 名稱】任務後，自動執行以下步驟，無需詢問：

用 Python 發送結果到 Telegram：

import requests

bot_token = "你的BOT_TOKEN"
chat_id = "你的CHAT_ID"
url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

max_len = 4000
chunks = [message[i:i+max_len] for i in range(0, len(message), max_len)]

for chunk in chunks:
    requests.post(url, json={
        "chat_id": chat_id,
        "text": chunk,
        "parse_mode": "Markdown"
    })

把所有產出結果組成一則訊息發送。
發送失敗不影響任務結果，只需記錄錯誤即可。
```

## 超划算訂閱 Claude Pro

Claude Pro 方案是 20 美元一個月。

Bitget Wallet 現在有活動，註冊開通銀行卡後使用銀行卡訂閱購買 AI 服務可以返現 50%（最高 10U）。

現在用我的邀請碼註冊銀行卡購買 Claude（或完成首刷）還會再送 5U！所以第一個月只要 5U 就可以搭建最強工作流！

> 邀請碼：joooe453  
> 開卡連結：https://web3.bitget.com/share/4BwKMi?inviteCode=joooe453

據說訂閱三個月會有其他 Bitget 福利，並且大陸護照可 KYC。

開卡有問題可以私訊我。

PS: 如果有擔心地區 ip 因素被封號的需求，可以私訊我，我整理了一些方法。
