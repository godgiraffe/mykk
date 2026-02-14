/**
 * 抓取推文中連結的完整內容
 * - 一般外部連結：用 fetch 抓取
 * - X Article / 短推文含 t.co 連結：用 bird read 抓取完整內容
 */

import type { Bookmark } from "./fetch-bookmarks";
import { buildBirdArgs } from "./fetch-bookmarks";

export interface ProcessedContent {
  bookmark: Bookmark;
  fullContent: string;
  sourceUrl: string | null;
}

/**
 * 用 bird read 抓取推文/文章的完整內容
 */
async function fetchViaBird(
  env: Record<string, string>,
  tweetId: string
): Promise<{ text: string; articleTitle?: string } | null> {
  try {
    const proc = Bun.spawn(
      [
        "bunx",
        "@steipete/bird",
        ...buildBirdArgs(env),
        "read",
        "--json",
        tweetId,
      ],
      { stdout: "pipe", stderr: "pipe" }
    );

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) return null;

    const data = JSON.parse(output);
    return {
      text: data.text || "",
      articleTitle: data.article?.title,
    };
  } catch {
    return null;
  }
}

/**
 * 解析 t.co 短連結，取得實際 URL
 */
async function resolveShortUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10_000),
    });
    return response.url;
  } catch {
    return null;
  }
}

/**
 * 嘗試用 fetch 抓取一般網頁的文字內容
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

    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.slice(0, 15_000);
  } catch {
    return null;
  }
}

/**
 * 判斷是否為 X 平台內部連結
 */
function isXUrl(url: string): boolean {
  return /^https?:\/\/(x\.com|twitter\.com)\//i.test(url);
}

/**
 * 處理單一書籤：提取完整內容
 * - 有 article 欄位 → 用 bird read 取得完整文章
 * - 推文文字很短且含 t.co 連結 → 解析連結判斷是否為 X Article
 * - 含外部連結 → 用 fetch 抓取網頁內容
 */
export async function processBookmarkContent(
  bookmark: Bookmark,
  env: Record<string, string>
): Promise<ProcessedContent> {
  let fullContent = bookmark.text;
  let sourceUrl: string | null = null;

  // Case 1: bookmark 本身就標記了 article → 用 bird read 取完整內容
  if (bookmark.article) {
    console.log(`   📖 偵測到 X Article: ${bookmark.article.title}`);
    const result = await fetchViaBird(env, bookmark.tweetId);
    if (result?.text) {
      fullContent = result.text;
      sourceUrl = `https://x.com/${bookmark.authorUsername}/status/${bookmark.tweetId}`;
      return { bookmark: { ...bookmark, text: fullContent }, fullContent, sourceUrl };
    }
  }

  // Case 2: 推文含 t.co 連結 → 解析看是否指向 X Article
  if (bookmark.urls.length > 0) {
    const tcoUrl = bookmark.urls[0]!;
    console.log(`   🔗 解析連結: ${tcoUrl}`);

    const resolved = await resolveShortUrl(tcoUrl);
    if (resolved) {
      console.log(`   🔗 → ${resolved}`);

      if (isXUrl(resolved)) {
        // X 內部連結（Article / 其他推文）→ 用 bird read
        console.log(`   📖 X 內部連結，使用 bird read 抓取...`);
        const result = await fetchViaBird(env, bookmark.tweetId);
        if (result?.text) {
          fullContent = result.text;
          sourceUrl = resolved;
          return { bookmark: { ...bookmark, text: fullContent }, fullContent, sourceUrl };
        }
      } else {
        // 外部連結 → 用 fetch 抓取
        sourceUrl = resolved;
        console.log(`   🌐 抓取外部連結內容...`);
        const urlContent = await fetchUrlContent(resolved);
        if (urlContent) {
          fullContent = `推文內容：\n${bookmark.text}\n\n連結內容：\n${urlContent}`;
        }
      }
    }
  }

  return { bookmark, fullContent, sourceUrl };
}
