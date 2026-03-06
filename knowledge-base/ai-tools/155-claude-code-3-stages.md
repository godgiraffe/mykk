---
title: "Claude Code 三階段開發方法論：研究、規劃、執行"
date: "2026-02-22"
tags: 
  - "Claude Code"
  - "工作流程"
  - "AI 協作"
summary: "今天在 HN 看到一篇分享自己使用 Claude Code 方法的文章，很有意思。在 agent 時代，對專業工程師背景的使用者可能更有幫助，因為這種思維方式主要集中在和 Claude Code 結對編程的長會話中（目前仍然是我最喜歡的 vibe 方式）。我讓 Claude Code 總結了一下，感興趣的朋友可以看看，文章連結在總結的最末尾。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 51
evergreenScore: 57
priorityScore: 65
curationNote: "先檢查外部連結是否值得保留，再決定是否轉入精選。"
source:
  tweetUrl: "https://x.com/turingou/status/2025514697861320853"
  externalUrl: "https://research.md/"
  authorUsername: "turingou"
---

# Claude Code 三階段開發方法論：研究、規劃、執行

> **來源**: [@turingou](https://x.com/turingou/status/2025514697861320853) | [原文連結](https://research.md/)
>
> **日期**: Sun Feb 22 10:15:10 +0000 2026
>
> **標籤**: `Claude Code` `工作流程` `AI 協作`

---

> **來源**: [@turingou (郭宇 guoyu.eth)](https://twitter.com/turingou)
> **日期**: 2026-03-06
> **標籤**: `claude-code` `開發方法論` `結對編程` `工作流程`

---

今天在 HN 看到一篇分享自己使用 Claude Code 方法的文章，很有意思。在 agent 時代，對專業工程師背景的使用者可能更有幫助，因為這種思維方式主要集中在和 Claude Code 結對編程的長會話中（目前仍然是我最喜歡的 vibe 方式）。我讓 Claude Code 總結了一下，感興趣的朋友可以看看，文章連結在總結的最末尾。

## 作者背景

Boris Tane，Cloudflare 工程負責人，前 Baselime（被 Cloudflare 收購）創始人，使用 Claude Code 約 9 個月。

## 核心方法論

**「在審批書面計劃之前，絕不讓 Claude 寫程式碼。」** 他把工作分成三個階段：

### 1. 研究階段（Research）

- 先讓 Claude 深度閱讀程式碼庫，輸出研究文件
- 用「deeply」「in great details」等詞引導 Claude 做徹底調研
- 目的：避免 Claude 寫出「單獨能跑但破壞現有系統」的程式碼

### 2. 計劃階段（Planning）+ 標註循環

- 讓 Claude 輸出計劃文件，包含實作方案、程式碼片段、檔案路徑、權衡取捨
- **最有特色的環節：標註循環（Annotation Cycle）** ——在編輯器裡直接往計劃文件裡加批註（糾正假設、否決方案、補充約束），然後讓 Claude 根據批註修改計劃，反覆 1-6 輪直到滿意
- 最後拆成細粒度的 checklist 再交給 Claude 執行

### 3. 執行階段（Implementation）

- 標準化的執行提示詞，讓 Claude 逐項完成並勾選
- 執行期間反饋簡短、精準
- 如果方向錯了，直接 revert，不做增量修補

## 可借鑑的思路

### 1. 共享可變文件

用 markdown 檔案作為人機協作的「共享狀態」，比口頭對話更持久、可追溯。這個對複雜專案特別有用，設計決策可以沉澱下來。

### 2. 標註循環而非對話循環

直接在文件裡寫批註比在聊天裡來回說更高效，Claude 能看到完整上下文，不會丟失資訊。

### 3. 嚴格的階段門控

研究 → 計劃 → 執行，每個階段有明確產出物，不跳步。防止 Claude「想當然」地寫程式碼。

### 4. 介面保護

明確告訴 Claude 哪些函數簽名和 API 不能動，設硬約束。

### 5. 果斷 revert

方向錯了就回滾重來，不要試圖在錯誤基礎上打補丁，這比增量修復節省更多 token 和時間。

### 6. 單次長會話

在一個連續對話裡完成研究到實作，讓 Claude 累積對專案的理解，而不是每次都從零開始。

---

**原文連結**：[How I Use Claude Code](https://t.co/hhdXpOnwxR)
