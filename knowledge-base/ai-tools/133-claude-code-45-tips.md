---
title: "45 個 Claude Code 小技巧：從入門到精通"
date: "2026-02-28"
tags: 
  - "Claude Code"
  - "開發技巧"
  - "工作流程"
summary: "不如看看這種：45 個 Claude Code 小技巧：從入門到精通，雖然標題也很唬人，但是真有東西。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 47
evergreenScore: 57
priorityScore: 65
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/dingyi/status/2027715159373058296"
  externalUrl: "https://github.com/ykdojo/claude-code-tips"
  authorUsername: "dingyi"
---

# 45 個 Claude Code 小技巧：從入門到精通

> **來源**: [@dingyi](https://x.com/dingyi/status/2027715159373058296) | [原文連結](https://github.com/ykdojo/claude-code-tips)
>
> **日期**: Sat Feb 28 11:59:01 +0000 2026
>
> **標籤**: `Claude Code` `開發技巧` `工作流程`

---

> **來源**: [@dingyi (Ding)](https://twitter.com/dingyi)
> **日期**: 2026-03-05
> **標籤**: `Claude Code` `AI工具` `開發技巧` `生產力`

---

真的，大部分 Twitter 文章都很水，點進去就後悔，

不如看看這種：45 個 Claude Code 小技巧：從入門到精通，雖然標題也很唬人，但是真有東西。

## 關於本指南

這是一份 Claude Code 使用技巧集合，從基礎到進階，包含自訂狀態列腳本、將系統提示詞減半、使用 Gemini CLI 作為 Claude Code 的助手，以及在容器中執行 Claude Code 等。同時也包含 dx 外掛程式。

📺 快速示範 - 觀看多 Claude 工作流程和語音輸入的實際應用：https://t.co/VZi4bDQ8YD

## Tip 0: 自訂你的狀態列

你可以自訂 Claude Code 底部的狀態列來顯示有用的資訊。我設定了顯示模型、當前目錄、git 分支（如果有）、未提交檔案數量、與 origin 的同步狀態，以及 token 使用量的視覺進度條。它還會顯示第二行，顯示我最後一條訊息，這樣我就能看到對話的內容：

```
Opus 4.5 | 📁claude-code-tips | 🔀main (scripts/context-bar.sh uncommitted, synced 12m ago) | ██░░░░░░░░ 18% of 200k tokens
💬 This is good. I don't think we need to change the documentation as long as we don't say that the default color is orange el...
```

這對於監控你的上下文使用量和記住你正在做什麼特別有幫助。該腳本還支援 10 種顏色主題（orange、blue、teal、green、lavender、rose、gold、slate、cyan 或 gray）。

要設定這個功能，你可以使用範例腳本並查看設定說明。

## Tip 1: 學習幾個必要的斜線命令

有很多內建的斜線命令（輸入 / 可以看到全部）。以下是幾個值得了解的：

### /usage 檢查你的速率限制：

```
Current session █████████▌ 19% used
Resets 12:59am (America/Vancouver)

Current week (all models) █████████████████████▌ 43% used
Resets Feb 3 at 1:59pm (America/Vancouver)

Current week (Sonnet only) ███████████████████▌ 39% used
Resets 8:59am (America/Vancouver)
```

如果你想密切關注使用量，可以在分頁中保持開啟，使用 Tab 然後 Shift+Tab 或 ← 然後 → 來刷新。

### /chrome 切換 Claude 的原生瀏覽器整合：

```
> /chrome
Chrome integration enabled
```

### /mcp 管理 MCP（Model Context Protocol）伺服器：

```
Manage MCP servers
1 server
❯ 1. playwright ✔ connected · Enter to view details

MCP Config locations (by scope):
• User config (available in all your projects):
• /Users/yk/.claude.json
```

### /stats 查看你的使用統計和 GitHub 風格的活動圖表：

```
Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec Jan
··········································▒█░▓░█░▓▒▒ Mon
·········································▒▒██▓░█▓█░█
·········································░▒█▒▓░█▒█▒█ Wed
········································░▓▒█▓▓░▒▓▒██
········································░▓░█▓▓▓▓█░▒█ Fri
········································▒░░▓▒▒█▓▓▓█
········································▒▒░▓░░▓▒▒░░
Less ░ ▒ ▓ █ More

Favorite model: Opus 4.5
Total tokens: 17.6m
Sessions: 4.1k
Longest session: 20h 40m 45s
Active days: 79/80
Longest streak: 75 days
Most active day: Jan 26
Current streak: 74 days
You've used ~24x more tokens than War and Peace
```

### /clear 清除對話並重新開始

## Tip 2: 用你的聲音和 Claude Code 對話

我發現用聲音溝通比用手打字快得多。在本機使用語音轉錄系統對此非常有幫助。

在我的 Mac 上，我試過幾種不同的選項：
- superwhisper
- MacWhisper
- Super Voice Assistant（開源，支援 Parakeet v2/v3）

你可以使用託管服務獲得更高的準確度，但我發現本地模型對於這個目的來說已經足夠強大。即使轉錄中有錯誤或拼寫錯誤，Claude 也足夠聰明，能理解你想說什麼。有時你需要特別清楚地說某些東西，但總體來說本地模型運作得很好。

例如，在這個截圖中，你可以看到 Claude 能夠正確解釋誤轉錄的詞彙，如「ExcelElanishMark」和「advast」，分別理解為「exclamation mark」和「Advanced」。

我認為最好的思考方式是，就像你在試圖與朋友溝通一樣。當然，你可以通過文字溝通。對某些人來說，那可能更容易，或者電子郵件，對吧？這完全沒問題。這似乎是大多數人與 Claude Code 溝通的方式。但如果你想更快地溝通，為什麼不快速打個電話呢？你可以只發送語音訊息。你不需要真的與 Claude Code 通電話。只需發送一堆語音訊息。至少對我來說，作為一個在過去幾年中練習說話藝術的人來說，這更快。但我認為對大多數人來說，也會更快。

一個常見的反對意見是「如果你在有其他人的房間裡怎麼辦？」我只是使用耳機輕聲說話 - 我個人喜歡 Apple EarPods（不是 AirPods）。它們價格實惠，質量足夠高，你只需對著它們輕聲說話。我在其他人面前這樣做過，效果很好。在辦公室裡，人們反正會說話 - 不是和同事說話，而是輕聲與你的語音轉錄系統說話。我認為這沒有任何問題。

這個方法效果非常好，甚至在飛機上也能使用。它足夠大聲，其他人不會聽到你，但如果你說話離麥克風夠近，你的本地模型仍然能理解你在說什麼。（事實上，我正在飛機上使用這種方法寫這段話。）

更新：Claude Code 現在有內建語音模式。

## Tip 3: 將大問題分解成小問題

這是最重要的概念之一。這與傳統軟體工程完全相同 - 最好的軟體工程師已經知道如何做到這一點，它也適用於 Claude Code。

如果你發現 Claude Code 無法一次性解決困難的問題或編碼任務，請要求它將問題分解成多個更小的問題。看看它是否能解決該問題的個別部分。如果仍然太難，看看它是否能解決更小的子問題。持續進行直到所有問題都可以解決。

本質上，不是從 A 到 B，而是從 A 到 A1 到 A2 到 A3，然後到 B。

一個很好的例子是當我構建自己的語音轉錄系統時。我需要構建一個系統，可以讓用戶選擇和下載模型、使用鍵盤快捷鍵、開始轉錄、將轉錄的文字放在用戶的游標處，並將所有這些包裝在一個漂亮的 UI 中。這是很多工作。所以我將它分解成更小的任務。

首先，我創建了一個只下載模型的可執行檔，沒有其他功能。然後我創建了另一個只錄製聲音的可執行檔，沒有其他功能。然後是另一個只轉錄預錄音頻的可執行檔。我像這樣一個一個地完成它們，然後在最後將它們組合在一起。

與此高度相關：你的問題解決能力和軟體工程技能在代理編碼和 Claude Code 的世界中仍然高度相關。它能夠自己解決很多問題，但當你將你的一般問題解決和軟體工程技能應用到它上面時，它會變得更加強大。

## Tip 4: 像專家一樣使用 Git 和 GitHub CLI

只需要求 Claude 處理你的 Git 和 GitHub CLI 任務。這包括提交（這樣你就不必手動編寫提交訊息）、分支、拉取和推送。我個人允許自動拉取但不允許推送，因為推送風險更大 - 如果拉取出了問題，它不會污染 origin。

對於 GitHub CLI（gh），你可以做很多事情。我在使用 Claude Code 後開始做的一件事是創建草稿 PR。這讓 Claude Code 以低風險處理 PR 創建過程 - 你可以在標記為準備好審查之前審查所有內容。

事實證明，gh 非常強大。你甚至可以通過它發送任意 GraphQL 查詢。例如，你甚至可以找到 GitHub PR 描述被編輯的確切時間：

```bash
⏺ Bash(gh api graphql -f query='
query {
  repository(owner: "...", name: "...") {
    pullRequest(number: ...) {
      userContentEdits(first: 100) {
        nodes {
          editedAt
          editor {
            login
          }
        }
      }
    }
  }
}')

⏺ Here's the full edit history for your PR description:
| # | Edited At (UTC)     | Editor |
|----|---------------------|--------|
| 1  | 2025-12-01 00:08:34 | ykdojo |
| 2  | 2025-12-01 15:57:21 | ykdojo |
| 3  | 2025-12-01 16:24:33 | ykdojo |
| 4  | 2025-12-01 16:27:00 | ykdojo |
| 5  | 2025-12-04 00:40:02 | ykdojo |
...
```

### 停用提交/PR 歸屬

預設情況下，Claude Code 會在提交中添加 `Co-Authored-By` 尾註，並在 PR 中添加歸屬頁腳。你可以通過在 `~/.claude/settings.json` 中添加以下內容來停用兩者：

```json
{
  "attribution": {
    "commit": "",
    "pr": ""
  }
}
```

將兩者設定為空字串會完全移除歸屬。這取代了舊的 `includeCoAuthoredBy` 設定，該設定現已棄用。

## Tip 5: AI 上下文就像牛奶；最好新鮮且濃縮！

當你開始與 Claude Code 進行新對話時，它的表現最佳，因為它不必處理對話早期部分的所有額外複雜性。但隨著你與它交談的時間越來越長，上下文越來越長，性能往往會下降。

所以最好為每個新主題開始新對話，或者如果性能開始下降就開始新對話。

## Tip 6: 從你的終端機獲取輸出

有時你想複製和貼上 Claude Code 的輸出，但直接從終端機複製並不總是乾淨的。以下是幾種獲取輸出的方法...

**[注意：原始內容在此處被截斷]**

---

**專案連結**: [GitHub - ykdojo/claude-code-tips](https://github.com/ykdojo/claude-code-tips)

**完整目錄**（共 45 個技巧）：
- Tip 0: 自訂狀態列
- Tip 1: 學習必要的斜線命令
- Tip 2: 用聲音對話
- Tip 3: 分解大問題
- Tip 4: 使用 Git 和 GitHub CLI
- Tip 5: AI 上下文管理
- Tip 6: 終端機輸出處理
- Tip 7-45: （完整內容請參閱 GitHub 專案）
