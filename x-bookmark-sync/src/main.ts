/**
 * X 書籤同步主入口
 * 執行：bun run sync [數量]
 * 範例：bun run sync 10
 * 清除進度：bun run sync --reset
 */

import { loadEnv } from "./auth";
import { fetchAllBookmarks, deleteBookmark } from "./fetch-bookmarks";
import { processBookmarkContent } from "./process-content";
import { classifyAndSummarize } from "./classify-article";
import { generateArticle } from "./generate-markdown";
import { isProcessed, getProcessedInfo, markProcessed, clearProgress, getProcessedCount, migrateOldProgress } from "./progress";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";

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

  // 自動遷移舊格式進度紀錄
  const migrated = migrateOldProgress();
  if (migrated > 0) {
    console.log(`🔄 已遷移 ${migrated} 筆舊進度紀錄（補充分類與檔名資訊）`);
  }

  const prevCount = getProcessedCount();
  if (prevCount > 0) {
    console.log(`📋 已有 ${prevCount} 筆歷史處理紀錄`);
  }
  console.log("━".repeat(50));

  const env = loadEnv();

  if (!env.X_AUTH_TOKEN || !env.X_CT0) {
    console.error("❌ 請在 .env 中填入 X_AUTH_TOKEN 和 X_CT0");
    console.error("   從 Chrome DevTools → Application → Cookies → x.com 取得");
    process.exit(1);
  }

  // 驗證 claude CLI 可用
  try {
    const proc = Bun.spawn(["claude", "--version"], { stdout: "pipe", stderr: "pipe" });
    await proc.exited;
  } catch {
    console.error("❌ 找不到 claude CLI，請確認已安裝 Claude Code");
    console.error("   安裝：npm install -g @anthropic-ai/claude-code");
    process.exit(1);
  }

  // 抓取書籤
  const bookmarks = await fetchAllBookmarks(
    env,
    MAX_ITEMS > 0 ? MAX_ITEMS : undefined
  );

  if (bookmarks.length === 0) {
    console.log("📭 沒有書籤需要處理");
    return;
  }

  const results: SyncResult = { success: [], failed: [] };
  const totalStart = Date.now();

  // 逐一處理
  for (let i = 0; i < bookmarks.length; i++) {
    // 檢查中斷
    if (interrupted) {
      console.log(`\n⏹️  中斷：跳過剩餘 ${bookmarks.length - i} 筆書籤`);
      break;
    }

    const bookmark = bookmarks[i]!;
    const progress = `[${i + 1}/${bookmarks.length}]`;
    const tweetUrl = `https://x.com/${bookmark.authorUsername}/status/${bookmark.tweetId}`;

    // 檢查是否已處理過 → 重新處理並取代
    const previousInfo = isProcessed(bookmark.tweetId) ? getProcessedInfo(bookmark.tweetId) : null;
    const isReprocess = !!previousInfo;

    if (isReprocess) {
      console.log(`\n${progress} 🔄 重新處理 @${bookmark.authorUsername} 的推文（取代舊文章）...`);
    } else {
      console.log(`\n${progress} 處理 @${bookmark.authorUsername} 的推文...`);
    }
    console.log(`   📝 ${bookmark.text.slice(0, 80)}...`);

    const itemStart = Date.now();
    try {
      // 抓取內容
      const content = await processBookmarkContent(bookmark, env);

      // 再次檢查中斷（抓取後、AI 前）
      if (interrupted) {
        console.log("   ⏹️  中斷：此筆未完成，下次會重新處理");
        break;
      }

      // AI 分類
      console.log("   🤖 AI 分類中...");
      const classification = await classifyAndSummarize(content);
      console.log(`   📂 分類: ${classification.category}`);
      console.log(`   📌 標題: ${classification.title}`);

      if (interrupted) {
        console.log("   ⏹️  中斷：分類完成但未生成文章，下次會重新處理");
        break;
      }

      // 生成文章（如果是重新處理，使用舊編號覆寫）
      console.log("   ✍️  生成文章中...");
      let replaceNumber: number | undefined;
      if (isReprocess && previousInfo) {
        const oldNumMatch = previousInfo.filename.match(/^(\d+)-/);
        if (oldNumMatch) {
          replaceNumber = parseInt(oldNumMatch[1]!, 10);
          // 刪除舊檔案（分類可能改變）
          const oldPath = join(import.meta.dir, "..", "..", "knowledge-base", previousInfo.category, previousInfo.filename);
          try {
            if (existsSync(oldPath)) {
              unlinkSync(oldPath);
              console.log(`   🗑️  已刪除舊文章: ${previousInfo.category}/${previousInfo.filename}`);
            } else {
              console.log(`   ⚠️  舊文章不存在（可能已手動刪除）: ${previousInfo.category}/${previousInfo.filename}`);
            }
          } catch (err: any) {
            console.warn(`   ⚠️  無法刪除舊文章: ${err.message}`);
          }
        }
      }
      const article = await generateArticle(content, classification, { replaceNumber });
      console.log(`   📄 已生成: ${article.category}/${article.filename}`);

      // 標記已處理（含 category/filename 以便日後重新處理時找到舊檔案）
      markProcessed(bookmark.tweetId, article.category, article.filename);

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

    // 短暫間隔避免過度頻繁
    if (!interrupted && i < bookmarks.length - 1) {
      console.log("   ⏳ 等待 3 秒...");
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  const totalDuration = Date.now() - totalStart;
  printReport(results, interrupted, totalDuration);

  // 自動 commit + push 新文章
  if (results.success.length > 0) {
    await gitCommitAndPush(results.success.length);
  }
}

function printReport(results: SyncResult, wasInterrupted: boolean, totalDurationMs: number) {
  console.log("\n" + "━".repeat(50));
  console.log(wasInterrupted ? "📊 同步報告（已中斷）" : "📊 同步報告");
  console.log("━".repeat(50));
  console.log(`✅ 成功：${results.success.length} 篇`);
  console.log(`❌ 失敗：${results.failed.length} 篇`);
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

async function gitCommitAndPush(count: number) {
  console.log("📤 自動提交並推送到 GitHub...\n");

  const KB_ROOT = join(import.meta.dir, "..", "..", "knowledge-base");

  const run = async (cmd: string[]) => {
    const proc = Bun.spawn(cmd, {
      cwd: join(import.meta.dir, "..", ".."),
      stdout: "pipe",
      stderr: "pipe",
    });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;
    return { exitCode, stdout, stderr };
  };

  try {
    // Stage knowledge-base 目錄的變更
    await run(["git", "add", "knowledge-base/"]);

    // 檢查是否有變更
    const { stdout: status } = await run(["git", "diff", "--cached", "--name-only"]);
    if (!status.trim()) {
      console.log("   沒有新的變更需要提交\n");
      return;
    }

    // Commit
    const msg = `docs: 自動同步新增 ${count} 篇書籤文章`;
    const { exitCode: commitCode, stderr: commitErr } = await run([
      "git", "commit", "-m", msg,
    ]);
    if (commitCode !== 0) {
      console.error(`   ❌ Git commit 失敗: ${commitErr}`);
      return;
    }
    console.log(`   ✅ 已提交: ${msg}`);

    // Push
    const { exitCode: pushCode, stderr: pushErr } = await run([
      "git", "push",
    ]);
    if (pushCode !== 0) {
      console.error(`   ❌ Git push 失敗: ${pushErr}`);
      console.log("   💡 請手動執行 git push");
      return;
    }
    console.log("   ✅ 已推送，GitHub Pages 將自動更新\n");
  } catch (error: any) {
    console.error(`   ❌ Git 操作失敗: ${error.message}`);
    console.log("   💡 請手動 commit 並 push knowledge-base/ 目錄\n");
  }
}

sync().catch((err) => {
  console.error("❌ 同步失敗：", err.message || err);
  process.exit(1);
});
