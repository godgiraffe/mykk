import { categoryNames } from "./category-meta";

export type CurationStatus = "inbox" | "curated" | "archive";

export interface ArticleRecord {
  title: string;
  url: string;
  category: string;
  categoryName: string;
  number: number;
  date: string;
  tags: string[];
  summary: string;
  excerpt: string;
  sourceLabel: string;
  sourceTweetUrl: string | null;
  sourceExternalUrl: string | null;
  sourceAuthorUsername: string | null;
  curationStatus: CurationStatus;
  usefulnessScore: number;
  noveltyScore: number;
  evergreenScore: number;
  priorityScore: number;
  curationNote: string;
  hasCommittedCuration: boolean;
}

const STATUS_VALUES: CurationStatus[] = ["inbox", "curated", "archive"];

export function normalizeStatus(
  value: unknown,
  fallback: CurationStatus = "inbox",
): CurationStatus {
  return typeof value === "string" && STATUS_VALUES.includes(value as CurationStatus)
    ? (value as CurationStatus)
    : fallback;
}

export function clampScore(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function normalizeDate(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw.trim();
  return parsed.toISOString().slice(0, 10);
}

export function getDateWeight(date: string): number {
  if (!date) return 0;
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^>.*$/gm, " ")
    .replace(/^[#*-]\s+/gm, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractBody(src: string): string {
  return src
    .replace(/^---\n[\s\S]*?\n---\n*/u, "")
    .replace(/^#\s+.+\n+/u, "")
    .replace(/^>\s*\*\*來源\*\*:.+\n?/gmu, "")
    .replace(/^>\s*\n/gmu, "")
    .replace(/^>\s*\*\*日期\*\*:.+\n?/gmu, "")
    .replace(/^>\s*\n/gmu, "")
    .replace(/^>\s*\*\*標籤\*\*:.+\n?/gmu, "")
    .replace(/^>\s*\n/gmu, "")
    .replace(/^---\n+/gmu, "")
    .replace(/^!\[[^\]]*\]\([^)]*\)\n?/gmu, "")
    .trim();
}

export function extractTags(
  src: string,
  frontmatter: Record<string, unknown>,
): string[] {
  if (Array.isArray(frontmatter.tags)) {
    return frontmatter.tags
      .filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0)
      .map((tag) => tag.trim());
  }

  const match = src.match(/^>\s*\*\*標籤\*\*:\s*(.+)$/mu);
  if (!match) return [];

  const tags = [...(match[1] ?? "").matchAll(/`([^`]+)`/g)].map((tag) => (tag[1] ?? "").trim());
  return tags.filter(Boolean);
}

export function extractSummary(
  src: string,
  frontmatter: Record<string, unknown>,
): string {
  if (typeof frontmatter.summary === "string" && frontmatter.summary.trim()) {
    return frontmatter.summary.trim();
  }

  const body = extractBody(src);
  const paragraphs = body
    .split(/\n\s*\n/u)
    .map((paragraph) => stripMarkdown(paragraph))
    .filter((paragraph) => paragraph.length > 40);

  return paragraphs[0]?.slice(0, 220) ?? "";
}

export function extractSource(
  src: string,
  frontmatter: Record<string, unknown>,
) {
  const source = frontmatter.source as
    | { tweetUrl?: unknown; externalUrl?: unknown; authorUsername?: unknown }
    | undefined;
  const sourceLine = src.match(/^>\s*\*\*來源\*\*:\s*(.+)$/mu)?.[1] ?? "";
  const links = [...sourceLine.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];

  const sourceTweetUrl =
    typeof source?.tweetUrl === "string" ? source.tweetUrl : (links[0]?.[2] ?? null);
  const sourceExternalUrl =
    typeof source?.externalUrl === "string" ? source.externalUrl : (links[1]?.[2] ?? null);
  const sourceAuthorUsername =
    typeof source?.authorUsername === "string"
      ? source.authorUsername
      : sourceTweetUrl?.match(/x\.com\/([^/]+)\//)?.[1] ?? null;
  const sourceLabel =
    links[0]?.[1]?.trim() ||
    (sourceAuthorUsername ? `@${sourceAuthorUsername}` : "來源未標記");

  return {
    sourceLabel,
    sourceTweetUrl,
    sourceExternalUrl,
    sourceAuthorUsername,
  };
}

export function scoreHeuristics(article: {
  category: string;
  summary: string;
  excerpt: string;
  tags: string[];
}): Pick<
  ArticleRecord,
  "usefulnessScore" | "noveltyScore" | "evergreenScore" | "priorityScore"
> {
  const text = `${article.summary} ${article.excerpt} ${article.tags.join(" ")}`.toLowerCase();
  const usefulKeywords = [
    "framework",
    "workflow",
    "guide",
    "strategy",
    "系統",
    "方法",
    "清單",
    "架構",
    "原則",
    "因子",
    "套利",
    "風險",
  ];
  const evergreenKeywords = [
    "principle",
    "mental",
    "system",
    "risk",
    "design",
    "mindset",
    "心態",
    "原則",
    "策略",
    "框架",
    "架構",
  ];
  const timeBoundKeywords = [
    "today",
    "本週",
    "本月",
    "airdrop",
    "發幣",
    "價格",
    "行情",
    "新聞",
    "breaking",
    "launch",
  ];

  let usefulnessScore = 52 + Math.min(article.tags.length * 4, 16);
  let noveltyScore = 45 + Math.min(article.summary.length / 30, 14);
  let evergreenScore = 50 + Math.min(article.excerpt.length / 40, 18);

  if (usefulKeywords.some((keyword) => text.includes(keyword))) usefulnessScore += 12;
  if (evergreenKeywords.some((keyword) => text.includes(keyword))) evergreenScore += 10;
  if (timeBoundKeywords.some((keyword) => text.includes(keyword))) evergreenScore -= 14;
  if (article.category === "uncategorized" || article.category === "unknown") {
    usefulnessScore -= 25;
    noveltyScore -= 12;
    evergreenScore -= 22;
  }

  if (text.includes("不建議收錄") || text.includes("缺乏足夠的知識內容")) {
    usefulnessScore -= 30;
    noveltyScore -= 15;
    evergreenScore -= 25;
  }

  usefulnessScore = clampScore(usefulnessScore, 50);
  noveltyScore = clampScore(noveltyScore, 50);
  evergreenScore = clampScore(evergreenScore, 50);

  return {
    usefulnessScore,
    noveltyScore,
    evergreenScore,
    priorityScore: clampScore(
      usefulnessScore * 0.5 + noveltyScore * 0.2 + evergreenScore * 0.3,
      50,
    ),
  };
}

export function deriveFallbackStatus(
  category: string,
  summary: string,
  excerpt: string,
): CurationStatus {
  if (category === "uncategorized" || category === "unknown") return "archive";
  if (summary.includes("不建議收錄") || excerpt.includes("缺乏足夠的知識內容")) {
    return "archive";
  }
  return "inbox";
}

export function deriveFallbackCurationNote(
  input: Pick<
    ArticleRecord,
    | "category"
    | "summary"
    | "excerpt"
    | "priorityScore"
    | "evergreenScore"
    | "sourceExternalUrl"
  >,
): string {
  if (input.category === "uncategorized" || input.category === "unknown") {
    return "內容訊號偏弱，若沒有額外背景脈絡，建議優先封存。";
  }
  if (input.summary.includes("不建議收錄") || input.excerpt.includes("缺乏足夠的知識內容")) {
    return "這篇內容資訊密度偏低，除非另有脈絡，否則可先封存。";
  }
  if (input.priorityScore >= 80) {
    return "高分文章，建議優先審閱並確認是否納入精選。";
  }
  if (input.evergreenScore >= 78) {
    return "常青性高，適合做成長期可回查的精選知識。";
  }
  if (input.sourceExternalUrl) {
    return "先檢查外部連結是否值得保留，再決定是否轉入精選。";
  }
  return "先快速掃摘要與重點段落，再決定要精選或封存。";
}

export function parseTitle(
  src: string,
  url: string,
  frontmatter: Record<string, unknown>,
): string {
  const titleMatch = src.match(/^#\s+(.+)/mu);
  return (
    (typeof frontmatter.title === "string" && frontmatter.title.trim()) ||
    titleMatch?.[1]?.trim() ||
    url.split("/").pop()?.replace(/\.html$/, "") ||
    ""
  );
}

export function parseArticleRecord(input: {
  url: string;
  src: string;
  frontmatter?: Record<string, unknown>;
}): ArticleRecord {
  const frontmatter = input.frontmatter ?? {};
  const match = input.url.match(/^\/([^/]+)\/(\d+)-/);
  const category = match?.[1] ?? "unknown";
  const number = match?.[2] ? Number.parseInt(match[2], 10) : 0;
  const title = parseTitle(input.src, input.url, frontmatter);
  const date =
    normalizeDate(frontmatter.date) ||
    normalizeDate(input.src.match(/^>\s*\*\*日期\*\*:\s*(.+)$/mu)?.[1]) ||
    "";
  const tags = extractTags(input.src, frontmatter);
  const summary = extractSummary(input.src, frontmatter);
  const excerpt = stripMarkdown(extractBody(input.src)).slice(0, 260);
  const committedStatus =
    typeof frontmatter.curationStatus === "string"
      ? normalizeStatus(frontmatter.curationStatus)
      : null;
  const fallbackStatus = deriveFallbackStatus(category, summary, excerpt);
  const heuristicScores = scoreHeuristics({ category, summary, excerpt, tags });
  const source = extractSource(input.src, frontmatter);
  const priorityScore = clampScore(frontmatter.priorityScore, heuristicScores.priorityScore);
  const evergreenScore = clampScore(frontmatter.evergreenScore, heuristicScores.evergreenScore);

  return {
    title,
    url: input.url,
    category,
    categoryName: categoryNames[category] || category,
    number,
    date,
    tags,
    summary,
    excerpt,
    sourceLabel: source.sourceLabel,
    sourceTweetUrl: source.sourceTweetUrl,
    sourceExternalUrl: source.sourceExternalUrl,
    sourceAuthorUsername: source.sourceAuthorUsername,
    curationStatus: committedStatus ?? fallbackStatus,
    usefulnessScore: clampScore(frontmatter.usefulnessScore, heuristicScores.usefulnessScore),
    noveltyScore: clampScore(frontmatter.noveltyScore, heuristicScores.noveltyScore),
    evergreenScore,
    priorityScore,
    curationNote:
      (typeof frontmatter.curationNote === "string" && frontmatter.curationNote.trim()) ||
      deriveFallbackCurationNote({
        category,
        summary,
        excerpt,
        priorityScore,
        evergreenScore,
        sourceExternalUrl: source.sourceExternalUrl,
      }),
    hasCommittedCuration: committedStatus !== null,
  };
}
