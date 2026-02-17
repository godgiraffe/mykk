# Vibe Coding 流程：一天半打造交易分析網站

> **來源**: [@WeWill_Rocky](https://x.com/WeWill_Rocky/status/1994428045080592453) | [原文連結](https://wsnb.online/)
>
> **日期**: Fri Nov 28 15:27:55 +0000 2025
>
> **標籤**: `AI開發` `全棧開發` `快速原型`

---

> **來源**: [Rocky✨ (@WeWill_Rocky)](https://twitter.com/WeWill_Rocky)
> **日期**: 2026-02-17
> **標籤**: `Vibe Coding` `AI 開發` `React` `Gemini` `Claude Code` `無代碼部署`

---

## 緣起

感謝魏神 @coolish 把交易 API 直接公開出來，整整 5 年的數據，真的把「讓別人無死角看懂自己怎麼交易」這件事做到了極致。拿到 API 之後，更關心的是學習金字塔掛單。

## Vibe Coding 流程

用新人邪修出來的一套「視覺系 Vibe Coding 流程」，一天半就把第一個帶 AI 掛單分析的網站搞上線了：

### 1️⃣ Gemini Canvas 生成 HTML

先用 Gemini Canvas（Gemini 3.0 Pro）生出一版符合大腦所想，且在審美上過得去的 HTML 版本。

### 2️⃣ AI Studio 重構為 React

將 HTML 代碼丟給 AI Studio（Gemini 3.0 Pro）重構成 React 網站，期間不斷修 bug 直到 80 分。

### 3️⃣ 零成本部署

推到 GitHub → 接 Cloudflare Pages → 綁好域名，整套流程零伺服器成本。

### 4️⃣ Claude Code 迭代維護

後期迭代 / 修 bug 就交給 Claude Code（Opus 4.5），至少目前不會像以前那樣，不小心改一個小 bug 導致所有代碼都「道心破碎」😇

## 開發體驗

過程中真的有種久違的快樂——像當年玩 QQ 空間粘貼神奇代碼、一刷新皮膚大變身的那種爽感，只是現在變的是能真正幫助自己的工具。

最爽的是：借助 AI，只要會把想法講清楚、不耐其煩地一直試，就能靠這種 Vibe 式開發，把一個腦洞在半天裡煉成可以實戰用的小法寶。

## 成果

最後還是想特別謝謝魏神，願意把實盤 API 攤在陽光下給大家學，對後來所有想做工具、想學交易細節的人，都是巨大的加速器。（這次打通了一直以來不會部署代碼的痛點）

👉 網站連結：https://wsnb.online

## 核心要點

| 階段 | 工具 | 產出 |
|------|------|------|
| 視覺原型 | Gemini Canvas | HTML 版本 |
| 重構 | AI Studio | React 網站 |
| 部署 | GitHub + Cloudflare Pages | 零成本上線 |
| 維護 | Claude Code | 穩定迭代 |
