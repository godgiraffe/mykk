/**
 * X 書籤同步主入口
 * 執行：bun run sync [數量]
 * 範例：bun run sync 10
 * 清除進度：bun run sync --reset
 */

import { GoogleGenAI } from "@google/genai";
import { loadEnv } from "./auth";
import { fetchAllBookmarks, deleteBookmark } from "./fetch-bookmarks";
import { processBookmarkContent } from "./process-content";
import { classifyAndSummarize } from "./classify-article";
import { generateArticle } from "./generate-markdown";
import { isProcessed, markProcessed, clearProgress, getProcessedCount } from "./progress";

// ── 參數解析 ──────────────────────────────────────
const args = process.argv.slice(2);
const isReset = args.includes("--reset");
const MAX_ITEMS = parseInt(args.find((a) => !a.startsWith("-")) || "0", 10);

// ── 中斷處理 ──────────────────────────────────────
let interrupted = false;

function onInterrupt() {
  if (interrupted) {
    console.log("\n⚠️  強制中斷");
    process.exit(1);
  }
  interrupted = true;
  console.log("\n\n🛑 收到中斷訊號，將在目前這筆完成後停止...");
  console.log("   （再按一次 Ctrl+C 強制中斷）");
}

process.on("SIGINT", onInterrupt);
process.on("SIGTERM", onInterrupt);

// ── 類型 ──────────────────────────────────────────
interface SyncResult {
  success: { tweetId: string; category: string; filename: string; durationMs: number }[];
  failed: { tweetId: string; url: string; error: string }[];
  skipped: number;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = ms / 1000;
  if (secs < 60) return `${secs.toFixed(1)}s`;
  const mins = Math.floor(secs / 60);
  const remainSecs = (secs % 60).toFixed(0);
  return `${mins}m${remainSecs}s`;
}

// ── 主程式 ─────────────────────────────────────────
async function sync() {
  // --reset：清除進度檔
  if (isReset) {
    clearProgress();
    console.log("🔄 已清除同步進度，下次執行將重新處理所有書籤\n");
    return;
  }

  console.log("🔄 X 書籤同步開始\n");
  if (MAX_ITEMS > 0) console.log(`⚙️  限制處理數量：${MAX_ITEMS} 筆`);

  const prevCount = getProcessedCount();
  if (prevCount > 0) {
    console.log(`📋 已有 ${prevCount} 筆歷史處理紀錄（將自動跳過）`);
  }
  console.log("━".repeat(50));

  const env = loadEnv();

  if (!env.X_AUTH_TOKEN || !env.X_CT0) {
    console.error("❌ 請在 .env 中填入 X_AUTH_TOKEN 和 X_CT0");
    console.error("   從 Chrome DevTools → Application → Cookies → x.com 取得");
    process.exit(1);
  }

  if (!env.GEMINI_API_KEY) {
    console.error("❌ 請在 .env 中填入 GEMINI_API_KEY");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  // 抓取書籤
  const bookmarks = await fetchAllBookmarks(
    env,
    MAX_ITEMS > 0 ? MAX_ITEMS : undefined
  );

  if (bookmarks.length === 0) {
    console.log("📭 沒有書籤需要處理");
    return;
  }

  const results: SyncResult = { success: [], failed: [], skipped: 0 };
  const totalStart = Date.now();

  // 逐一處理
  for (let i = 0; i < bookmarks.length; i++) {
    // 檢查中斷
    if (interrupted) {
      console.log(`\n⏹️  中斷：跳過剩餘 ${bookmarks.length - i} 筆書籤`);
      break;
    }

    const bookmark = bookmarks[i];
    const progress = `[${i + 1}/${bookmarks.length}]`;
    const tweetUrl = `https://x.com/${bookmark.authorUsername}/status/${bookmark.tweetId}`;

    // 冪等性：跳過已處理的
    if (isProcessed(bookmark.tweetId)) {
      console.log(`\n${progress} ⏭️  跳過 @${bookmark.authorUsername}（已處理過）`);
      results.skipped++;
      continue;
    }

    console.log(`\n${progress} 處理 @${bookmark.authorUsername} 的推文...`);
    console.log(`   📝 ${bookmark.text.slice(0, 80)}...`);

    const itemStart = Date.now();
    try {
      // 抓取內容
      const content = await processBookmarkContent(bookmark);

      // 再次檢查中斷（抓取後、AI 前）
      if (interrupted) {
        console.log("   ⏹️  中斷：此筆未完成，下次會重新處理");
        break;
      }

      // AI 分類
      console.log("   🤖 AI 分類中...");
      const classification = await classifyAndSummarize(ai, content);
      console.log(`   📂 分類: ${classification.category}`);
      console.log(`   📌 標題: ${classification.title}`);

      if (interrupted) {
        console.log("   ⏹️  中斷：分類完成但未生成文章，下次會重新處理");
        break;
      }

      // 生成文章
      console.log("   ✍️  生成文章中...");
      const article = await generateArticle(ai, content, classification);
      console.log(`   📄 已生成: ${article.category}/${article.filename}`);

      // 標記已處理（文章已生成，即使後面刪除書籤失敗也不會重複生成）
      markProcessed(bookmark.tweetId);

      // 從 X 移除書籤
      const deleted = await deleteBookmark(env, bookmark.tweetId);
      if (deleted) {
        console.log("   🗑️  已從 X 書籤移除");
      } else {
        console.log("   ⚠️  書籤移除失敗（文章已生成，不影響結果）");
      }

      const durationMs = Date.now() - itemStart;
      console.log(`   ⏱️  耗時: ${formatDuration(durationMs)}`);

      results.success.push({
        tweetId: bookmark.tweetId,
        category: article.category,
        filename: article.filename,
        durationMs,
      });
    } catch (error: any) {
      console.error(`   ❌ 處理失敗: ${error.message}`);
      results.failed.push({
        tweetId: bookmark.tweetId,
        url: tweetUrl,
        error: error.message,
      });
    }

    // Rate limit 保護
    if (!interrupted && i < bookmarks.length - 1) {
      console.log("   ⏳ 等待 15 秒...");
      await new Promise((r) => setTimeout(r, 15000));
    }
  }

  const totalDuration = Date.now() - totalStart;
  printReport(results, interrupted, totalDuration);
}

function printReport(results: SyncResult, wasInterrupted: boolean, totalDurationMs: number) {
  console.log("\n" + "━".repeat(50));
  console.log(wasInterrupted ? "📊 同步報告（已中斷）" : "📊 同步報告");
  console.log("━".repeat(50));
  console.log(`✅ 成功：${results.success.length} 篇`);
  console.log(`❌ 失敗：${results.failed.length} 篇`);
  if (results.skipped > 0) console.log(`⏭️  跳過：${results.skipped} 篇（已處理過）`);
  console.log(`⏱️  總耗時：${formatDuration(totalDurationMs)}`);
  if (results.success.length > 1) {
    const avgMs = results.success.reduce((sum, s) => sum + s.durationMs, 0) / results.success.length;
    console.log(`⏱️  平均每篇：${formatDuration(avgMs)}`);
  }
  console.log("━".repeat(50));

  if (results.success.length > 0) {
    console.log("\n成功歸檔：");
    for (const s of results.success) {
      console.log(`  ✅ ${s.category}/${s.filename} (${formatDuration(s.durationMs)})`);
    }
  }

  if (results.failed.length > 0) {
    console.log("\n失敗項目（已保留在 X 書籤，下次執行會重試）：");
    for (const f of results.failed) {
      console.log(`  ❌ ${f.url}`);
      console.log(`     原因: ${f.error}`);
    }
  }

  if (wasInterrupted) {
    console.log("\n💡 提示：再次執行 bun run sync 會從上次中斷處繼續");
  }

  console.log("");
}

sync().catch((err) => {
  console.error("❌ 同步失敗：", err.message || err);
  process.exit(1);
});
