import type { CurationStatus } from "../../knowledge-base/.vitepress/data/article-record";

export interface CurationFrontmatterSource {
  tweetUrl: string | null;
  externalUrl: string | null;
  authorUsername: string | null;
}

export interface CurationFrontmatter {
  title: string;
  date: string;
  tags: string[];
  summary: string;
  curationStatus: CurationStatus;
  usefulnessScore: number;
  noveltyScore: number;
  evergreenScore: number;
  priorityScore: number;
  curationNote: string;
  source: CurationFrontmatterSource;
}

export function normalizeDate(value: string): string {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return value.split("T")[0] || value;
}

export function escapeYamlString(value: string): string {
  return JSON.stringify(value.replace(/\r\n/g, "\n"));
}

export function buildYamlList(values: string[]): string {
  if (values.length === 0) return "[]";
  return `\n${values.map((value) => `  - ${escapeYamlString(value)}`).join("\n")}`;
}

export function buildCurationFrontmatter(frontmatter: CurationFrontmatter): string {
  const lines = [
    "---",
    `title: ${escapeYamlString(frontmatter.title)}`,
    `date: ${escapeYamlString(frontmatter.date)}`,
    `tags: ${buildYamlList(frontmatter.tags)}`,
    `summary: ${escapeYamlString(frontmatter.summary)}`,
    `curationStatus: ${escapeYamlString(frontmatter.curationStatus)}`,
    `usefulnessScore: ${frontmatter.usefulnessScore}`,
    `noveltyScore: ${frontmatter.noveltyScore}`,
    `evergreenScore: ${frontmatter.evergreenScore}`,
    `priorityScore: ${frontmatter.priorityScore}`,
    `curationNote: ${escapeYamlString(frontmatter.curationNote)}`,
    "source:",
    `  tweetUrl: ${frontmatter.source.tweetUrl ? escapeYamlString(frontmatter.source.tweetUrl) : "null"}`,
    `  externalUrl: ${frontmatter.source.externalUrl ? escapeYamlString(frontmatter.source.externalUrl) : "null"}`,
    `  authorUsername: ${frontmatter.source.authorUsername ? escapeYamlString(frontmatter.source.authorUsername) : "null"}`,
    "---",
  ];

  return `${lines.join("\n")}\n`;
}

export function splitFrontmatterDocument(source: string): {
  frontmatterRaw: string | null;
  body: string;
} {
  if (!source.startsWith("---\n")) {
    return { frontmatterRaw: null, body: source };
  }

  const endIndex = source.indexOf("\n---\n", 4);
  if (endIndex === -1) {
    return { frontmatterRaw: null, body: source };
  }

  return {
    frontmatterRaw: source.slice(4, endIndex),
    body: source.slice(endIndex + 5),
  };
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed === "null") return null;
  if (trimmed === "[]") return [];
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

  if (trimmed.startsWith("\"")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed.slice(1, -1);
    }
  }

  return trimmed;
}

export function parseFrontmatterObject(frontmatterRaw: string | null): Record<string, unknown> {
  if (!frontmatterRaw) return {};

  const result: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;
  let currentObjectKey: string | null = null;

  for (const line of frontmatterRaw.split("\n")) {
    if (!line.trim()) continue;

    const arrayMatch = line.match(/^  -\s*(.+)$/);
    if (arrayMatch && currentArrayKey) {
      const current = Array.isArray(result[currentArrayKey])
        ? ([...(result[currentArrayKey] as unknown[])] as unknown[])
        : [];
      current.push(parseScalar(arrayMatch[1] ?? ""));
      result[currentArrayKey] = current;
      continue;
    }

    const nestedMatch = line.match(/^  ([A-Za-z0-9_]+):\s*(.*)$/);
    if (nestedMatch && currentObjectKey) {
      const current =
        typeof result[currentObjectKey] === "object" && result[currentObjectKey] !== null
          ? (result[currentObjectKey] as Record<string, unknown>)
          : {};
      const nestedKey = nestedMatch[1];
      if (!nestedKey) continue;
      current[nestedKey] = parseScalar(nestedMatch[2] ?? "");
      result[currentObjectKey] = current;
      continue;
    }

    const topLevelMatch = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!topLevelMatch) continue;

    const key = topLevelMatch[1];
    const value = topLevelMatch[2] ?? "";
    if (!key) continue;
    currentArrayKey = null;
    currentObjectKey = null;

    if (!value) {
      if (key === "tags") {
        result[key] = [];
        currentArrayKey = key;
      } else {
        result[key] = {};
        currentObjectKey = key;
      }
      continue;
    }

    result[key] = parseScalar(value);
  }

  return result;
}
