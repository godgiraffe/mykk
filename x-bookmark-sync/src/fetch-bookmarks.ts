/**
 * 使用 bird CLI 抓取 X 書籤
 */

export interface Bookmark {
  tweetId: string;
  text: string;
  authorUsername: string;
  authorName: string;
  createdAt: string;
  urls: string[];
  imageUrls: string[];
  quotedTweet?: {
    text: string;
    authorUsername: string;
  };
  article?: {
    title: string;
    previewText: string;
  };
}

interface BirdTweet {
  id: string;
  text: string;
  createdAt: string;
  author: { username: string; name: string };
  media?: { type: string; url: string }[];
  quotedTweet?: {
    text: string;
    author: { username: string; name: string };
    media?: { type: string; url: string }[];
  };
  article?: {
    title: string;
    previewText: string;
  };
}

export function buildBirdArgs(env: Record<string, string>): string[] {
  return [
    "--auth-token",
    env.X_AUTH_TOKEN ?? "",
    "--ct0",
    env.X_CT0 ?? "",
  ];
}

export async function fetchAllBookmarks(
  env: Record<string, string>,
  limit?: number
): Promise<Bookmark[]> {
  const args = [
    "bunx",
    "@steipete/bird",
    ...buildBirdArgs(env),
    "bookmarks",
    "--json",
  ];
  args.push("--count", String(limit ?? 1000));

  console.log(`📚 正在抓取書籤...${limit ? ` (限制 ${limit} 筆)` : ""}\n`);

  const proc = Bun.spawn(args, {
    stdout: "pipe",
    stderr: "pipe",
  });

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`bird bookmarks 失敗: ${stderr}`);
  }

  const tweets: BirdTweet[] = JSON.parse(output);
  const results: Bookmark[] = [];

  for (const tweet of tweets) {
    // 提取推文中的 t.co 連結
    const urls: string[] = [];
    const urlMatches = tweet.text.match(/https?:\/\/t\.co\/\w+/g);
    if (urlMatches) {
      urls.push(...urlMatches);
    }

    // 提取圖片
    const imageUrls: string[] = [];
    if (tweet.media) {
      for (const m of tweet.media) {
        if (m.type === "photo" && m.url) {
          imageUrls.push(m.url);
        }
      }
    }

    // 組合完整文字（包含引用推文）
    let fullText = tweet.text;
    let quotedTweet: Bookmark["quotedTweet"];
    if (tweet.quotedTweet) {
      fullText += `\n\n--- 引用 @${tweet.quotedTweet.author.username} ---\n${tweet.quotedTweet.text}`;
      quotedTweet = {
        text: tweet.quotedTweet.text,
        authorUsername: tweet.quotedTweet.author.username,
      };
      // 引用推文的圖片也收集
      if (tweet.quotedTweet.media) {
        for (const m of tweet.quotedTweet.media) {
          if (m.type === "photo" && m.url) {
            imageUrls.push(m.url);
          }
        }
      }
    }

    results.push({
      tweetId: tweet.id,
      text: fullText,
      authorUsername: tweet.author.username,
      authorName: tweet.author.name,
      createdAt: tweet.createdAt,
      urls,
      imageUrls,
      quotedTweet,
      article: tweet.article,
    });
  }

  console.log(`✅ 共找到 ${results.length} 個書籤\n`);
  return results;
}

export async function deleteBookmark(
  env: Record<string, string>,
  tweetId: string
): Promise<boolean> {
  try {
    const proc = Bun.spawn(
      [
        "bunx",
        "@steipete/bird",
        ...buildBirdArgs(env),
        "unbookmark",
        tweetId,
      ],
      { stdout: "pipe", stderr: "pipe" }
    );
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      console.error(`❌ bird unbookmark 回傳非零退出碼 (${exitCode}): ${stderr.trim()}`);
      return false;
    }
    return true;
  } catch {
    console.error(`❌ 刪除書籤失敗 (${tweetId})`);
    return false;
  }
}
