/**
 * 抓取推文中連結的完整內容
 * 使用 fetch 抓取網頁內容，再由 AI 處理
 */

import type { Bookmark } from "./fetch-bookmarks";

export interface ProcessedContent {
  bookmark: Bookmark;
  fullContent: string;
  sourceUrl: string | null;
}

/**
 * 嘗試用 fetch 抓取連結的文字內容
 * 用於取得推文外部連結的完整文章
 */
async function fetchUrlContent(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return null;

    const html = await response.text();

    // 簡單提取文字內容：移除 HTML 標籤
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 限制長度避免 token 過多
    return text.slice(0, 15_000);
  } catch {
    return null;
  }
}

/**
 * 處理單一書籤：提取完整內容
 */
export async function processBookmarkContent(
  bookmark: Bookmark
): Promise<ProcessedContent> {
  // 如果推文包含外部連結，嘗試抓取
  let fullContent = bookmark.text;
  let sourceUrl: string | null = null;

  if (bookmark.urls.length > 0) {
    // 取第一個非 X 連結作為主要來源
    sourceUrl = bookmark.urls[0];
    console.log(`   🔗 抓取連結內容: ${sourceUrl}`);

    const urlContent = await fetchUrlContent(sourceUrl);
    if (urlContent) {
      fullContent = `推文內容：\n${bookmark.text}\n\n連結內容：\n${urlContent}`;
    }
  }

  return { bookmark, fullContent, sourceUrl };
}
