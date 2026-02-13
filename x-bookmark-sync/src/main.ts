/**
 * X 書籤同步主入口
 * 執行：bun run sync
 */

import Anthropic from "@anthropic-ai/sdk";
import { refreshTokenIfNeeded, loadEnv } from "./auth";
import { fetchAllBookmarks, deleteBookmark } from "./fetch-bookmarks";
import { processBookmarkContent } from "./process-content";
import { classifyAndSummarize } from "./classify-article";
import { generateArticle } from "./generate-markdown";

interface SyncResult {
  success: { tweetId: string; category: string; filename: string }[];
  failed: { tweetId: string; url: string; error: string }[];
}

async function sync() {
  console.log("🔄 X 書籤同步開始\n");
  console.log("━".repeat(50));

  // 1. 認證
  const client = await refreshTokenIfNeeded();
  const env = loadEnv();

  if (!env.ANTHROPIC_API_KEY) {
    console.error("❌ 請在 .env 中填入 ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  // 2. 抓取書籤
  const bookmarks = await fetchAllBookmarks(client);

  if (bookmarks.length === 0) {
    console.log("📭 沒有書籤需要處理");
    return;
  }

  const results: SyncResult = { success: [], failed: [] };

  // 3. 逐一處理
  for (let i = 0; i < bookmarks.length; i++) {
    const bookmark = bookmarks[i];
    const progress = `[${i + 1}/${bookmarks.length}]`;
    const tweetUrl = `https://x.com/${bookmark.authorUsername}/status/${bookmark.tweetId}`;

    console.log(`\n${progress} 處理 @${bookmark.authorUsername} 的推文...`);
    console.log(`   📝 ${bookmark.text.slice(0, 80)}...`);

    try {
      // 3a. 抓取內容
      const content = await processBookmarkContent(bookmark);

      // 3b. AI 分類
      console.log("   🤖 AI 分類中...");
      const classification = await classifyAndSummarize(anthropic, content);
      console.log(`   📂 分類: ${classification.category}`);
      console.log(`   📌 標題: ${classification.title}`);

      // 3c. 生成文章
      console.log("   ✍️  生成文章中...");
      const article = await generateArticle(anthropic, content, classification);
      console.log(`   📄 已生成: ${article.category}/${article.filename}`);

      // 3d. 從 X 移除書籤
      const deleted = await deleteBookmark(client, bookmark.tweetId);
      if (deleted) {
        console.log("   🗑️  已從 X 書籤移除");
      }

      results.success.push({
        tweetId: bookmark.tweetId,
        category: article.category,
        filename: article.filename,
      });
    } catch (error: any) {
      console.error(`   ❌ 處理失敗: ${error.message}`);
      results.failed.push({
        tweetId: bookmark.tweetId,
        url: tweetUrl,
        error: error.message,
      });
    }

    // Rate limit 保護：每筆之間等待 1 秒
    if (i < bookmarks.length - 1) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 4. 輸出報告
  printReport(results);
}

function printReport(results: SyncResult) {
  console.log("\n" + "━".repeat(50));
  console.log("📊 同步報告");
  console.log("━".repeat(50));
  console.log(`✅ 成功：${results.success.length} 篇`);
  console.log(`❌ 失敗：${results.failed.length} 篇`);
  console.log("━".repeat(50));

  if (results.success.length > 0) {
    console.log("\n成功歸檔：");
    for (const s of results.success) {
      console.log(`  ✅ ${s.category}/${s.filename}`);
    }
  }

  if (results.failed.length > 0) {
    console.log("\n失敗項目（已保留在 X 書籤）：");
    for (const f of results.failed) {
      console.log(`  ❌ ${f.url}`);
      console.log(`     原因: ${f.error}`);
    }
  }

  console.log("");
}

sync().catch((err) => {
  console.error("❌ 同步失敗：", err.message || err);
  process.exit(1);
});
