/**
 * 從 X API v2 抓取所有書籤
 */

import type { TwitterApi, TweetV2, UserV2 } from "twitter-api-v2";

export interface Bookmark {
  tweetId: string;
  text: string;
  authorUsername: string;
  authorName: string;
  createdAt: string;
  urls: string[];
  imageUrls: string[];
}

export async function fetchAllBookmarks(
  client: TwitterApi
): Promise<Bookmark[]> {
  const me = await client.v2.me();
  const userId = me.data.id;

  console.log(`📚 正在抓取 @${me.data.username} 的書籤...\n`);

  const bookmarks = await client.v2.bookmarks({
    "tweet.fields": ["created_at", "entities", "attachments", "author_id"],
    "user.fields": ["username", "name"],
    "media.fields": ["url", "preview_image_url", "type"],
    expansions: ["author_id", "attachments.media_keys"],
    max_results: 100,
  });

  const results: Bookmark[] = [];

  for await (const tweet of bookmarks) {
    const author = bookmarks.includes.author(tweet);

    // 提取推文中的 URL
    const urls: string[] = [];
    if (tweet.entities?.urls) {
      for (const u of tweet.entities.urls) {
        // 過濾掉 X 自己的圖片/影片 URL
        if (
          u.expanded_url &&
          !u.expanded_url.includes("pic.twitter.com") &&
          !u.expanded_url.includes("pic.x.com")
        ) {
          urls.push(u.expanded_url);
        }
      }
    }

    // 提取推文附帶的圖片
    const imageUrls: string[] = [];
    if (tweet.attachments?.media_keys) {
      for (const mediaKey of tweet.attachments.media_keys) {
        const media = bookmarks.includes.medias?.find(
          (m: any) => m.media_key === mediaKey
        );
        if (media) {
          if (media.type === "photo" && (media as any).url) {
            imageUrls.push((media as any).url);
          } else if ((media as any).preview_image_url) {
            imageUrls.push((media as any).preview_image_url);
          }
        }
      }
    }

    results.push({
      tweetId: tweet.id,
      text: tweet.text,
      authorUsername: author?.username || "unknown",
      authorName: author?.name || "Unknown",
      createdAt: tweet.created_at || new Date().toISOString(),
      urls,
      imageUrls,
    });
  }

  console.log(`✅ 共找到 ${results.length} 個書籤\n`);
  return results;
}

export async function deleteBookmark(
  client: TwitterApi,
  tweetId: string
): Promise<boolean> {
  try {
    await client.v2.deleteBookmark(tweetId);
    return true;
  } catch (error: any) {
    console.error(`❌ 刪除書籤失敗 (${tweetId}):`, error.message);
    return false;
  }
}
