# 如何精通 Claude Code：從聊天機器人到真正的 AI 助手

> **來源**: [@DeFiMinty](https://x.com/DeFiMinty/status/2022470560505090071) | [原文連結](https://x.com/i/article/2022397182696132617)
>
> **日期**: 2026-02-14
>
> **標籤**: `Claude Code` `AI workflow` `Memory` `Skills` `效率`

---

## 全新 Context 的問題

每個 Claude Code 對話都從空白開始。你需要解釋你的專案、你的偏好設定、你的資料夾結構,然後對話結束,所有這些資訊都消失了。隔天你又要再解釋一次。這非常累人。

解決方案是 Claude 設定檔,它會在每次對話開始時自動被讀取。把你的偏好設定放進去:資料夾結構、常用指令、程式碼風格。任何你會重複說的東西都可以放進去。

然而,問題是這只能處理靜態資訊。你的專案結構不會每天改變,但其他所有東西都會變,包括你學到的經驗、你進行過的對話、正在進行的工作的 context。這些也需要一個地方存放。

## Memory

為了解決這個問題,我建立了一個 memory 系統。核心概念是一個索引檔案,它指向其他檔案,而不是把所有內容都包含在自己裡面。一個 500 行的 memory 檔案意味著 Claude 會浪費 tokens 讀取與今天任務無關的 context。但一個 30 行的索引檔案,連結到詳細的檔案,意味著 Claude 可以只提取它需要的內容。

一個主要的 memory 檔案可能看起來像這樣:

```
## Active Projects
  - Backend API → [link to project context]
  - Mobile app → [link to project context]

## Reference
  - Lessons learned → [50 entries, read as needed]
  - Recent sessions → [rolling log, last 5]
```

lessons 檔案累積我學到的東西:特定 libraries 的怪癖、運作良好的 patterns、要避免的錯誤。sessions 檔案是之前對話的滾動日誌,附上我做了什麼和待辦事項的簡短筆記。當我開始新對話時,Claude 讀取索引,看到什麼是 active 的,並提取相關的 context。記得把秘密資訊排除在這些檔案之外,因為它們存在於你的 codebase 中。

在整個對話過程中,每當我學到值得保留的東西,我會告訴它儲存 memory 並描述要儲存什麼。在結束時,我總結我們做了什麼。如果你沒有儲存,你會失去在那次對話中出現的任何有價值的見解。

## The Orchestrator

一旦 memory 運作正常,我改變的下一件事是如何使用 Claude 的時間。Claude Code 很昂貴,而且很容易用完你的 token 限制。

所以我不再把它當作 worker 使用,而是當作 coordinator。Claude 規劃我們要建立什麼、應該如何架構、邊界情況是什麼。然後 worker 來實作:我使用 Codex 來大量生成程式碼,但其他模型也可以。然後 Claude 審查輸出。

我在伺服器上自動化這個流程,但你也可以手動做。Claude 寫一個規格,你把它貼給 Codex 或其他模型,然後把輸出帶回來審查。

這之所以有效,是因為 Claude 擅長判斷性的決策。「這應該是 class 還是 function?」「這個錯誤處理足夠嗎?」這些是值得付費的問題。輸入 500 行 boilerplate 則不是。讓更便宜的工具處理大量工作。

結果是更好的輸出,因為 Claude 能抓到 workers 遺漏的東西;更低的成本,因為大量工作在其他地方進行;以及平行處理,因為 workers 可以在 Claude 規劃下一個任務時執行。

## Skills

有些工作流程會重複。我每次用相同方式 brainstorm 文章、debug 程式碼、編輯文件。一旦我注意到這種重複,我開始把這些編碼為 skills。

一個 skill 是一個可重複使用的指令,它觸發一個多步驟的流程。我的範例包括用於文章的 write (brainstorm、outline、draft、edit)、用於事實查核文件的 review,以及其他我覺得有用的可重複 skills。Skills 以 markdown 檔案形式存在,每個定義了當你呼叫它時 Claude 遵循的步驟。

重要的是 skills 編碼的是流程,而不只是 prompts。它們指定開始前要檢查什麼、如何設定進度檢查點、要保留什麼、何時停下來詢問。從流程型 skills 開始,像是 brainstorming 和 debugging。這些最有回報。實作型 skills 排在第二位。

## Operational Discipline

一些我用艱難方式學到的規則。

Claude 不應該長時間沉默,以免它卡住。如果它在做複雜的事情,它應該給你定期更新。當你看到活動時,你知道它在工作。

每次編輯後都要設定檢查點,不要批次處理。如果你讓 Claude 默默進行五次編輯,而 context 在批次中途結束,你不知道什麼完成了。一次編輯,報告它,繼續前進。

在大操作前警告。「這份文件有 2000 字,現在讀取中。」這設定了期望,並給你中止的機會。

這些規則存在是因為 Claude Code 不是本地應用程式。它是一個有狀態的對話,可能隨時結束。你的工作流程應該考慮到這一點。

## 如何給予指示

你表達請求的方式比你預期的更重要。Claude 字面上理解指示,而模糊的指示產生模糊的結果。

當你說「tighten that part」,Claude 必須猜測你指的是哪一部分,以及「tighten」對你意味著什麼。它可能會重寫你的整份文件。相反,要具體:「把第 3 段從 80 字縮減到 40 字。」當你在編輯時,告訴 Claude 要保留什麼:「不要碰 introduction,只編輯第 2 和第 3 節。」你設定的邊界越多,Claude 做出你必須撤銷的事情的可能性就越小。

這對任何視覺相關的東西特別重要。Claude 看不到你的螢幕。當它說「修復了 CSS」,它是從程式碼推理,而不是從頁面實際看起來的樣子。你需要自己驗證視覺變化。這同樣適用於任何需要人類判斷的輸出:語氣、風格、某樣東西是否「感覺對」。

你的工作方式也有成本面向。前面提到的 coordinator 模型在這裡有幫助:思考什麼值得 Claude 注意,什麼可以在其他地方或稍後處理。

Claude Code 獎勵系統性思考。這個工具會適應你給它的任何結構。給它好的結構,它會複利成長。不給它結構,你會在每次對話中重複解釋相同的事情。
