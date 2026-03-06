/**
 * 生成知識庫 markdown 文章
 */

import { claudeGenerate } from "./claude-ai";
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { ProcessedContent } from "./process-content";
import type { ClassifiedArticle } from "./classify-article";
import { buildCurationFrontmatter, normalizeDate } from "./curation-frontmatter";

const KB_ROOT = join(import.meta.dir, "..", "..", "knowledge-base");

/**
 * 驗證並清理路徑片段，只允許小寫英文、數字、連字號
 * 防止 AI 輸出含 / 或 ../ 造成路徑穿越
 */
function sanitizePathSegment(value: string): string {
  const sanitized = value.replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!sanitized) throw new Error(`無效的路徑片段（原始值: "${value}"）`);
  return sanitized;
}

/**
 * 計算該分類下一個流水號
 */
function getNextNumber(category: string): number {
  const categoryDir = join(KB_ROOT, category);

  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
    return 1;
  }

  const files = readdirSync(categoryDir).filter((f) => f.endsWith(".md"));
  if (files.length === 0) return 1;

  const numbers = files
    .map((f) => parseInt(f.split("-")[0]!, 10))
    .filter((n) => !isNaN(n));

  return Math.max(...numbers, 0) + 1;
}

/**
 * 下載圖片到 assets 目錄
 */
async function downloadImages(
  imageUrls: string[],
  category: string,
  slug: string,
  number: number
): Promise<string[]> {
  if (imageUrls.length === 0) return [];

  const assetsDir = join(KB_ROOT, "assets", category);
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }

  const savedPaths: string[] = [];
  const numStr = String(number).padStart(3, "0");

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const response = await fetch(imageUrls[i]!, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      let ext = "png";
      if (contentType.includes("jpeg") || contentType.includes("jpg"))
        ext = "jpg";
      else if (contentType.includes("gif")) ext = "gif";
      else if (contentType.includes("webp")) ext = "webp";

      const filename = `${numStr}-${slug}-${i + 1}.${ext}`;
      const filepath = join(assetsDir, filename);

      const buffer = await response.arrayBuffer();
      await Bun.write(filepath, buffer);

      savedPaths.push(`../assets/${category}/${filename}`);
      console.log(`   📷 已下載圖片: ${filename}`);
    } catch {
      console.warn(`   ⚠️  圖片下載失敗: ${imageUrls[i]}`);
    }
  }

  return savedPaths;
}

export interface GeneratedArticle {
  filePath: string;
  category: string;
  filename: string;
}

/**
 * 使用 Claude CLI 生成完整的知識庫文章
 */
export async function generateArticle(
  content: ProcessedContent,
  classification: ClassifiedArticle,
  options?: { replaceNumber?: number }
): Promise<GeneratedArticle> {
  const category = sanitizePathSegment(classification.category);
  const slug = sanitizePathSegment(classification.slug);
  const { title, tags, summary } = classification;
  const number = options?.replaceNumber ?? getNextNumber(category);
  const numStr = String(number).padStart(3, "0");
  const filename = `${numStr}-${slug}.md`;

  // 下載圖片
  const allImageUrls = [...content.bookmark.imageUrls];
  const imagePaths = await downloadImages(allImageUrls, category, slug, number);

  const tweetUrl = `https://x.com/${content.bookmark.authorUsername}/status/${content.bookmark.tweetId}`;
  const externalUrl = content.sourceUrl;

  const dateStr = normalizeDate(content.bookmark.createdAt);

  // 用 Claude 生成文章正文
  const articleBody = await claudeGenerate(
    `你是一個知識庫文章整理助手。請將以下原始內容整理成 markdown 格式的知識庫文章。

## 來源資訊
- 標題：${title}
- 作者：@${content.bookmark.authorUsername} (${content.bookmark.authorName})

## 原始內容
${content.fullContent}

## 整理規則（嚴格遵守）
1. **忠於原文**：保留原文的完整內容和細節，不要省略、不要縮寫、不要用自己的話改寫
2. **翻譯**：如果原文是簡體中文，轉為繁體中文；如果是英文，翻譯為繁體中文。專有名詞保留原文
3. **格式化**：加上適當的 markdown 標題（##）分段，讓文章結構清晰
4. **不要加戲**：不要加入你自己的評論、建議、選項、「您希望…」之類的互動文字
5. **不要過度簡化**：寧可保留太多細節，也不要省略重要內容
6. **只輸出正文**：不需要標題和 frontmatter，我會自己加
7. **短內容**：如果原文本身就很短（一句話的推文），直接整理成簡短筆記即可，不要硬湊字數`,
    "sonnet"
  );

  // 組合完整的 markdown
  const tagsStr = tags.map((t) => `\`${t}\``).join(" ");
  const imageSection =
    imagePaths.length > 0
      ? "\n" + imagePaths.map((p) => `![](${p})`).join("\n") + "\n"
      : "";

  const sourceLine = externalUrl
    ? `> **來源**: [@${content.bookmark.authorUsername}](${tweetUrl}) | [原文連結](${externalUrl})`
    : `> **來源**: [@${content.bookmark.authorUsername}](${tweetUrl})`;

  const frontmatter = buildCurationFrontmatter({
    title: classification.title,
    date: dateStr,
    tags: classification.tags,
    summary: classification.summary,
    curationStatus: classification.curationStatus,
    usefulnessScore: classification.usefulnessScore,
    noveltyScore: classification.noveltyScore,
    evergreenScore: classification.evergreenScore,
    priorityScore: classification.priorityScore,
    curationNote: classification.curationNote,
    source: {
      tweetUrl,
      externalUrl,
      authorUsername: content.bookmark.authorUsername,
    },
  });

  const markdown = `${frontmatter}
# ${title}

${sourceLine}
>
> **日期**: ${dateStr}
>
> **標籤**: ${tagsStr}

---
${imageSection}
${articleBody}
`;

  // 寫入檔案
  const categoryDir = join(KB_ROOT, category);
  if (!existsSync(categoryDir)) {
    mkdirSync(categoryDir, { recursive: true });
  }

  const filePath = join(categoryDir, filename);
  await Bun.write(filePath, markdown);

  return { filePath, category, filename };
}
