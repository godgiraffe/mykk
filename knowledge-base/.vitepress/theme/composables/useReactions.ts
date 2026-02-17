export const STORAGE_KEY = "article-reactions";

export type Reaction = "like" | "dislike";

export function getReactions(): Record<string, Reaction> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
