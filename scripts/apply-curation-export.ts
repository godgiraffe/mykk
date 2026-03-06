import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { normalizeStatus } from "../knowledge-base/.vitepress/data/article-record";
import {
  articleUrlToPath,
  readArticleState,
  renderArticleWithFrontmatter,
  writeIfChanged,
} from "./curation-utils";

interface ExportDecision {
  status?: unknown;
  updatedAt?: unknown;
}

interface ExportPayload {
  decisions?: Record<string, ExportDecision>;
}

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("用法：bun run curation:apply ./path/to/curation-export.json");
  process.exit(1);
}

const absoluteInputPath = path.resolve(process.cwd(), inputPath);
if (!existsSync(absoluteInputPath)) {
  console.error(`找不到 export 檔案：${absoluteInputPath}`);
  process.exit(1);
}

const raw = JSON.parse(readFileSync(absoluteInputPath, "utf-8")) as ExportPayload;
const decisions =
  raw.decisions && typeof raw.decisions === "object"
    ? raw.decisions
    : (raw as Record<string, ExportDecision>);

let updated = 0;
let skipped = 0;
let missing = 0;

for (const [url, decision] of Object.entries(decisions)) {
  if (!decision || typeof decision !== "object") {
    skipped++;
    continue;
  }

  const status = normalizeStatus(decision.status, "inbox");
  const filePath = articleUrlToPath(url);

  if (!existsSync(filePath)) {
    console.warn(`找不到對應文章，略過：${url}`);
    missing++;
    continue;
  }

  const state = readArticleState(filePath);
  const nextSource = renderArticleWithFrontmatter(state, { curationStatus: status });

  if (writeIfChanged(filePath, nextSource, state.source)) {
    updated++;
  } else {
    skipped++;
  }
}

console.log(`已回寫 curation export：更新 ${updated} 篇，略過 ${skipped} 筆，找不到 ${missing} 筆。`);
