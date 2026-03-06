---
title: "Claude 模型在 Max 計畫上的配額管理"
date: "2026-02-18"
tags: 
  - "Claude API"
  - "模型配額"
  - "Max 計畫"
summary: "作者提到使用 /model sonnet[1m] 指令時，雖然系統曾提示 Opus 模型已達到額外使用量（extra usage），但實際上在 Max 計畫下，仍然能夠同時使用 Sonnet 和 Opus 兩個模型，各自擁有 1M tokens 的配額。"
curationStatus: "inbox"
usefulnessScore: 76
noveltyScore: 49
evergreenScore: 57
priorityScore: 65
curationNote: "先快速掃摘要與重點段落，再決定要精選或封存。"
source:
  tweetUrl: "https://x.com/toeachiloveyou/status/2024027688285933789"
  externalUrl: null
  authorUsername: "toeachiloveyou"
---

# Claude 模型在 Max 計畫上的配額管理

> **來源**: [@toeachiloveyou](https://x.com/toeachiloveyou/status/2024027688285933789)
>
> **日期**: Wed Feb 18 07:46:20 +0000 2026
>
> **標籤**: `Claude API` `模型配額` `Max 計畫`

---

這是一則關於 Claude Max 計畫配額的實際使用經驗分享。

作者提到使用 `/model sonnet[1m]` 指令時，雖然系統曾提示 Opus 模型已達到額外使用量（extra usage），但實際上在 Max 計畫下，仍然能夠同時使用 Sonnet 和 Opus 兩個模型，各自擁有 1M tokens 的配額。

## 重點整理

- **指令**：`/model sonnet[1m]` 可用於切換模型並指定 token 上限
- **計畫**：Claude Max 計畫
- **配額**：即使出現「extra usage」警告，兩個模型各有 1M tokens 可用
