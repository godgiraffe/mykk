/**
 * 使用 Claude API 自動分類文章並生成摘要
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ProcessedContent } from "./process-content";

const EXISTING_CATEGORIES = [
  { id: "quant-trading", description: "量化交易、市場微觀結構、高頻交易" },
  {
    id: "crypto-investing",
    description: "加密貨幣投資哲學、週期生存、心態管理",
  },
  { id: "defi", description: "DeFi 策略、LP、流動性提供、協議操作" },
  { id: "lifestyle", description: "旅遊攻略、生活技巧、實用資訊" },
];

export interface ClassifiedArticle {
  category: string;
  slug: string;
  title: string;
  tags: string[];
  summary: string;
}

export async function classifyAndSummarize(
  anthropic: Anthropic,
  content: ProcessedContent
): Promise<ClassifiedArticle> {
  const categoriesDesc = EXISTING_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.description}`
  ).join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `你是一個知識庫文章整理助手。請分析以下內容，並回傳 JSON 格式的分類結果。

## 來源資訊
- 作者：@${content.bookmark.authorUsername} (${content.bookmark.authorName})
- 日期：${content.bookmark.createdAt}
- 來源 URL：${content.sourceUrl || `https://x.com/${content.bookmark.authorUsername}/status/${content.bookmark.tweetId}`}

## 內容
${content.fullContent}

## 現有分類
${categoriesDesc}

## 要求
請回傳以下 JSON 格式（不要包含 markdown code block）：

{
  "category": "最適合的分類 ID（從現有分類中選擇，如果都不適合則建議新的分類 ID，用小寫英文+連字號）",
  "slug": "英文簡稱（小寫+連字號，例如 btc-halving-cycle）",
  "title": "繁體中文標題",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "summary": "用繁體中文寫一段 2-3 句的摘要，概括核心觀點"
}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    // 嘗試解析 JSON（可能包含 code block）
    const jsonStr = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr) as ClassifiedArticle;
  } catch {
    // fallback：使用預設值
    console.warn("⚠️  AI 分類解析失敗，使用預設分類");
    return {
      category: "uncategorized",
      slug: `tweet-${content.bookmark.tweetId}`,
      title: content.bookmark.text.slice(0, 50),
      tags: [],
      summary: content.bookmark.text.slice(0, 200),
    };
  }
}
