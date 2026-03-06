---
title: "Claude Code Skills 設定與實踐指南"
date: "2026-02-23"
tags: 
  - "Claude Code"
  - "AI 開發工具"
  - "工作流程優化"
summary: "我寫了很多關於 Claude Code 的文章，很多人問我的 Claude Code 設定，所以讓我們來聊聊這個。"
curationStatus: "inbox"
usefulnessScore: 64
noveltyScore: 47
evergreenScore: 57
priorityScore: 59
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/froessell/status/2025833621299351613"
  externalUrl: "https://x.com/i/article/2024457065083617280"
  authorUsername: "froessell"
---

# Claude Code Skills 設定與實踐指南

> **來源**: [@froessell](https://x.com/froessell/status/2025833621299351613) | [原文連結](https://x.com/i/article/2024457065083617280)
>
> **日期**: Mon Feb 23 07:22:28 +0000 2026
>
> **標籤**: `Claude Code` `AI 開發工具` `工作流程優化`

---

> **來源**: [@froessell (✌︎ frederik ✌︎)](原文連結)
> **日期**: 2026-03-06
> **標籤**: `claude-code` `skills` `workflow` `ios-design`

---

## 前言

我寫了很多關於 Claude Code 的文章，很多人問我的 Claude Code 設定，所以讓我們來聊聊這個。

我展示我的，你展示你的。成交？

在開始之前，讓我先說明我絕不是這方面的專家。

我還沒碰過 OpenClaw 或更進階的 agent 相關東西。那是個我現在不想伸手進去的蜂窩。我只是出於好奇為自己做些東西，看看哪些能用。

我只是觸及了 skills 的表面，但其中一些確實改變了我的日常工作方式。

## 什麼是 Skills？

Skills 基本上就是你可以給 Claude Code 的指令集。你可以從 skills.sh 下載它們，或根據需求自己創建。Skills 告訴 Claude 如何處理特定任務：要尋找什麼、遵循什麼模式、創建什麼輸出。

把它們想像成類固醇版的儲存提示詞。你不需要每次都解釋你要什麼，而是調用一個 skill，Claude 就知道該怎麼做了⋯⋯要是我的孩子們也能這樣學會不把衣服丟在地板上就好了。

但我離題了。

## 一切的起點：mobile-ios-design

最近我遇到一個工作流程問題，正在測試不同的工具。我在測試一個流程：使用 Claude 創建 PRD，將 PRD 貼到 Superdesign.dev 生成設計，將設計匯出到 Figma（透過 MCP），然後將設計和 PRD 餵給 Claude Code 用 SwiftUI 建構應用程式。

應用程式能運作。但不夠好。感覺不對勁。文字樣式寫死了。間距還可以，但不一致。導航能用但看起來像混合應用，而不是原生的。

我遇到了 mobile-ios-design skill 並決定試試看。這個 skill 會檢查你的應用並強制執行 iOS Human Interface Guidelines。正確的系統顏色。原生導航模式。正確的文字樣式。

我在初始建構後執行它，突然應用程式就有了原生的感覺。

耶。

## Impeccable：技能形式的設計工具包

在這裡取得：impeccable.style

這是一套用於設計改進的 skills 集合。我沒有全部使用，但有幾個已經成為常客：

### impeccable:critique
獲得你設計的 UX 回饋。當某些東西感覺不對但我無法確定原因時，我會執行這個。

### impeccable:polish
對齊、間距、一致性的最後潤飾。通常我會在 Figma 中手動完成的東西，現在 Claude 在程式碼中處理。

### impeccable:simplify
將設計精簡到必要元素。當我過度設計某些東西需要縮減時很有用，或只是想對設計有新的視角。

### impeccable:normalize
將設計與你現有的設計系統匹配。當 AI 生成的元件不遵循你的 tokens 時很有用。

完整列表可能有 15+ 個 skills。我還沒全試過。但擁有它們意味著我可以按需調用特定的設計思維，而不是每次都從頭開始提示。

## Feature Discovery：自動駕駛的企業級 UX 研究

這個是我為日常工作建立的。我在一家電商公司工作，我們跨四個平台運作：iOS、Android、桌面網頁、行動網頁。這是個大機器，所以我們在製作新功能之前必須做很多研究，如果正確執行，這個研究可能需要很長時間。但有時我只是想測試一個假設，而不是推出有 sprint 規劃、jira tickets 和 OKR 會議的大流程。

只是快速確認：「這是個好主意嗎？」

所以我做了一個可以為我做這件事的 skill。或至少讓我更清楚我的假設是否值得進一步追求。

你給它一個功能想法或優化簡報，Claude 先生就會執行六個階段：

1. **Brief & Audit**：結構化你的想法並批判當前狀態

2. **Competitor Research**：從 Mobbin 提取模式、分析競爭對手等

3. **Edge Cases & Flows**：繪製使用者流程並盤點所有平台的邊緣案例

4. **Recommendations**：優先處理快速勝利、中期修復、路線圖項目

5. **Prototypes**：生成可分享的互動式 React/Tailwind 原型，包括前後版本和註釋以便分享

6. **Report**：將所有內容打包成 markdown 報告，附上給領導層的摘要

它可以連續執行所有階段，或在每個步驟後停止並重新評估。由你決定。執行一個階段，審查，決定是否要繼續。

我用它來處理像是「在桌面導航中使用漢堡選單是個好主意嗎」和「我們應該在 iOS 上的列表添加新的單欄視圖嗎」這類問題。它不能取代思考，但能幫助我更快評估一個想法。

## App Niche Hunter：從市場缺口到原型，在我睡覺時完成

這個是為我的副專案準備的。我的興趣專案。這是我的玩樂時間。

它更簡單也更有趣。

我給 Claude Code 一個我想創建應用的利基市場，比如「睡眠應用」，它就開始工作：

1. 在 App Store 搜尋該類別的頂級應用，免費和付費的

2. 從最大的應用中抓取 1 星和 2 星評論

3. 找出人們抱怨的模式

4. 識別可以由新應用填補的缺口

5. 在瀏覽器中打開 Rork 並建構原型。這真是瘋狂的事

6. 發送測試連結給我

我可以讓 Claude 工作，然後回來看到基於真實使用者挫折而非我的假設的原型。它時尚且沒有 vibecode 的「感覺」嗎？

不，但它能用，如果我想繼續的話，我之後總是可以自己改進品牌。

它不總是找到金礦。但它把「我想知道 X 領域是否有機會」從週末研究專案變成我可以在做其他事情時執行的東西。

## 重點

Claude Code 本身就很強大。你可以建構應用、修復錯誤、交付專案。

但搭配 skills 的 Claude Code 是不同的工具。它不只是「建構這個」。而是「像我有無限時間一樣建構這個」。

mobile-ios-design skill 比我更了解 HIG。Impeccable 工具包能抓到我會錯過的設計問題。Feature Discovery 做我會跳過的研究，因為我不擅長做研究，更喜歡設計（我通常會把那些東西交給公司的專家）。利基獵手探索我永遠不會著手的想法。

但如我之前說的，我仍在摸索。還有一整個我還沒碰過的 agents 和編排世界。但即使是這些基本的 skills 也改變了我的工作方式。

如果你正在使用 Claude Code 但還沒探索 skills，從簡單的開始。找一個你討厭的重複性任務。把它變成一個 skill。看看會發生什麼。
