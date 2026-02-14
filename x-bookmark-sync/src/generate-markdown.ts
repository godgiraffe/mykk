/**
 * 生成知識庫 markdown 文章
 */

import { GoogleGenAI } from "@google/genai";
import { generateWithRetry } from "./gemini";
import { readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import type { ProcessedContent } from "./process-content";
import type { ClassifiedArticle } from "./classify-article";

const KB_ROOT = join(import.meta.dir, "..", "..", "knowledge-base");
const ASSETS_ROOT = join(KB_ROOT, ".vitepress", "public", "assets");

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
    .map((f) => parseInt(f.split("-")[0], 10))
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

  const assetsDir = join(ASSETS_ROOT, category);
  if (!existsSync(assetsDir)) {
    mkdirSync(assetsDir, { recursive: true });
  }

  const savedPaths: string[] = [];
  const numStr = String(number).padStart(3, "0");

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const response = await fetch(imageUrls[i], {
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

      savedPaths.push(`/assets/${category}/${filename}`);
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
 * 使用 Gemini API 生成完整的知識庫文章
 */
export async function generateArticle(
  ai: GoogleGenAI,
  content: ProcessedContent,
  classification: ClassifiedArticle
): Promise<GeneratedArticle> {
  const { category, slug, title, tags, summary } = classification;
  const number = getNextNumber(category);
  const numStr = String(number).padStart(3, "0");
  const filename = `${numStr}-${slug}.md`;

  // 下載圖片
  const allImageUrls = [...content.bookmark.imageUrls];
  const imagePaths = await downloadImages(allImageUrls, category, slug, number);

  const sourceUrl =
    content.sourceUrl ||
    `https://x.com/${content.bookmark.authorUsername}/status/${content.bookmark.tweetId}`;

  const dateStr = content.bookmark.createdAt.split("T")[0];

  // 用 Gemini 生成文章正文
  const articleBody = await generateWithRetry(
    ai,
    `你是一個知識庫文章整理助手。請將以下內容整理成一篇知識庫文章。

## 來源資訊
- 標題：${title}
- 作者：@${content.bookmark.authorUsername} (${content.bookmark.authorName})
- 摘要：${summary}

## 原始內容
${content.fullContent}

## 要求
1. 用繁體中文整理正文（專有名詞/公式保留原文）
2. 依主題自由組織章節
3. 保留原始來源的核心觀點，不過度改寫
4. 如有圖表數據，用表格或列表呈現
5. 加總覽或重點表方便快速查閱
6. 只輸出正文內容（不需要標題和 frontmatter，我會自己加）
7. 如果內容太短（例如只是一句話的推文），直接整理成簡短筆記即可`
  );

  // 組合完整的 markdown
  const tagsStr = tags.map((t) => `\`${t}\``).join(" ");
  const imageSection =
    imagePaths.length > 0
      ? "\n" + imagePaths.map((p) => `![](${p})`).join("\n") + "\n"
      : "";

  const markdown = `# ${title}

> **來源**: [@${content.bookmark.authorUsername}](${sourceUrl})
> **日期**: ${dateStr}
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
