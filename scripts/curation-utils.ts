import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  parseArticleRecord,
  type ArticleRecord,
  type CurationStatus,
} from "../knowledge-base/.vitepress/data/article-record";
import {
  buildCurationFrontmatter,
  parseFrontmatterObject,
  splitFrontmatterDocument,
  type CurationFrontmatter,
} from "../x-bookmark-sync/src/curation-frontmatter";

export const REPO_ROOT = path.resolve(import.meta.dir, "..");
export const KNOWLEDGE_BASE_ROOT = path.join(REPO_ROOT, "knowledge-base");

export interface ArticleState {
  filePath: string;
  url: string;
  source: string;
  body: string;
  frontmatter: Record<string, unknown>;
  record: ArticleRecord;
}

export function listArticleFiles(): string[] {
  return readdirSync(KNOWLEDGE_BASE_ROOT, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "assets" &&
        entry.name !== "node_modules",
    )
    .flatMap((entry) => {
      const dirPath = path.join(KNOWLEDGE_BASE_ROOT, entry.name);
      return readdirSync(dirPath)
        .filter((file) => file.endsWith(".md") && file !== "index.md")
        .map((file) => path.join(dirPath, file));
    })
    .sort((a, b) => a.localeCompare(b));
}

export function articlePathToUrl(filePath: string): string {
  const relative = path.relative(KNOWLEDGE_BASE_ROOT, filePath);
  const posixPath = relative.split(path.sep).join("/");
  return `/${posixPath.replace(/\.md$/, ".html")}`;
}

export function articleUrlToPath(url: string): string {
  const normalized = url.replace(/^\/+/, "").replace(/\.html$/, ".md");
  return path.join(KNOWLEDGE_BASE_ROOT, normalized);
}

export function readArticleState(filePath: string): ArticleState {
  const source = readFileSync(filePath, "utf-8");
  const { frontmatterRaw, body } = splitFrontmatterDocument(source);
  const frontmatter = parseFrontmatterObject(frontmatterRaw);
  const url = articlePathToUrl(filePath);

  return {
    filePath,
    url,
    source,
    body: body.replace(/^\n+/, ""),
    frontmatter,
    record: parseArticleRecord({ url, src: source, frontmatter }),
  };
}

export function buildFrontmatterForArticle(
  state: ArticleState,
  overrides: Partial<Pick<CurationFrontmatter, "curationStatus" | "curationNote">> = {},
): CurationFrontmatter {
  return {
    title: state.record.title,
    date: state.record.date,
    tags: state.record.tags,
    summary: state.record.summary || state.record.excerpt,
    curationStatus: (overrides.curationStatus ?? state.record.curationStatus) as CurationStatus,
    usefulnessScore: state.record.usefulnessScore,
    noveltyScore: state.record.noveltyScore,
    evergreenScore: state.record.evergreenScore,
    priorityScore: state.record.priorityScore,
    curationNote: overrides.curationNote ?? state.record.curationNote,
    source: {
      tweetUrl: state.record.sourceTweetUrl,
      externalUrl: state.record.sourceExternalUrl,
      authorUsername: state.record.sourceAuthorUsername,
    },
  };
}

export function renderArticleWithFrontmatter(
  state: ArticleState,
  overrides: Partial<Pick<CurationFrontmatter, "curationStatus" | "curationNote">> = {},
): string {
  const frontmatter = buildCurationFrontmatter(buildFrontmatterForArticle(state, overrides));
  return `${frontmatter}\n${state.body}`;
}

export function writeIfChanged(filePath: string, nextSource: string, currentSource: string): boolean {
  if (nextSource === currentSource) return false;
  writeFileSync(filePath, nextSource);
  return true;
}

export function requireExistingFile(filePath: string) {
  if (!existsSync(filePath)) {
    throw new Error(`找不到檔案: ${filePath}`);
  }
}
