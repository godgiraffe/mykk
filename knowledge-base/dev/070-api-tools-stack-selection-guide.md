# API 工具與大模型組合選擇指南

> **來源**: [@scriptmoney](https://x.com/scriptmoney/status/1862498485825937547)
>
> **日期**: Fri Nov 29 14:06:57 +0000 2024
>
> **標籤**: `API工具` `大模型` `網頁爬蟲`

---

## 工具組合

作者使用的技術棧組合：

| 用途 | 工具選擇 | 說明 |
|------|----------|------|
| 推特 API | @api_dance | 推特 API 服務 |
| 大模型 | @hyperbolic_labs 的 qwen2.5 | 回應速度相對較快 |
| DexScreener 新幣爬取 | Playwright | 直接爬取，可繞過 Cloudflare；api_dance 也有提供但 Cursor 沒看懂 |

## 技術細節

**推特 API**：採用 api_dance 服務，避免直接使用官方 API 的複雜申請流程。

**大模型選擇**：在 hyperbolic_labs 平台選用 qwen2.5 模型，主要考量是回應速度。對於需要快速反應的應用（如即時監控、自動回覆），模型速度比準確度更重要。

**DexScreener 爬取**：使用 Playwright 直接爬取網頁內容。雖然 api_dance 也提供 DexScreener 的 API，但作者在 Cursor 中沒有理解其使用方式，因此選擇更直觀的 Playwright 方案。Playwright 的優勢是可以執行 JavaScript 並繞過 Cloudflare 防護。
