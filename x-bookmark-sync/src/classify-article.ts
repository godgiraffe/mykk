/**
 * 使用 Claude CLI 自動分類文章並生成摘要
 */

import { claudeGenerate } from "./claude-ai";
import type { ProcessedContent } from "./process-content";

const EXISTING_CATEGORIES = [
  { id: "ai-tools", description: "AI 工具、Claude Code、Prompt 工程、AI 開發" },
  { id: "crypto-investing", description: "加密貨幣投資哲學、週期策略、心態管理" },
  { id: "defi", description: "DeFi 策略、LP、協議操作、智能合約安全" },
  { id: "quant-trading", description: "量化交易、市場微觀結構、套利" },
  { id: "dev", description: "軟體開發、程式語言、開發工具、知識管理" },
  { id: "lifestyle", description: "生活技巧、個人理財、效率提升、娛樂" },
];

export interface ClassifiedArticle {
  category: string;
  slug: string;
  title: string;
  tags: string[];
  summary: string;
}

export async function classifyAndSummarize(
  content: ProcessedContent
): Promise<ClassifiedArticle> {
  const categoriesDesc = EXISTING_CATEGORIES.map(
    (c) => `- ${c.id}: ${c.description}`
  ).join("\n");

  const text = await claudeGenerate(
    `你是一個知識庫文章整理助手。請分析以下內容，並回傳 JSON 格式的分類結果。

## 來源資訊
- 作者：@${content.bookmark.authorUsername} (${content.bookmark.authorName})
- 日期：${content.bookmark.createdAt}
- 來源 URL：${content.sourceUrl || `https://x.com/${content.bookmark.authorUsername}/status/${content.bookmark.tweetId}`}

## 內容
${content.fullContent}

## 現有分類
${categoriesDesc}

## 要求
只回傳一個 JSON 物件，不要包含任何其他文字、解釋或 markdown code block。直接輸出 JSON：

{"category":"分類ID","slug":"英文簡稱","title":"繁體中文標題","tags":["標籤1","標籤2"],"summary":"摘要"}

欄位說明：
- category: 從現有分類中選擇最適合的 ID，如果都不適合則用小寫英文+連字號建議新 ID
- slug: 小寫英文+連字號（例如 btc-halving-cycle）
- title: 繁體中文標題
- tags: 3 個繁體中文標籤
- summary: 2-3 句繁體中文摘要`,
    "haiku"
  );

  try {
    // 從回應中提取第一個 JSON 物件（Claude 可能在前後加解說文字）
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("找不到 JSON");
    return JSON.parse(match[0]) as ClassifiedArticle;
  } catch (e) {
    console.warn(`⚠️  AI 分類解析失敗，使用預設分類（原因: ${e}）`);
    console.warn(`   原始回應: ${text.slice(0, 200)}`);
    return {
      category: "uncategorized",
      slug: `tweet-${content.bookmark.tweetId}`,
      title: content.bookmark.text.slice(0, 50),
      tags: [],
      summary: content.bookmark.text.slice(0, 200),
    };
  }
}
