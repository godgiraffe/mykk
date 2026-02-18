export const STORAGE_KEY = "article-reactions";

export type Reaction = "like" | "dislike";

export function getReactions(): Record<string, Reaction> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const result: Record<string, Reaction> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v === "like" || v === "dislike") {
        result[k] = v;
      }
    }
    return result;
  } catch {
    return {};
  }
}
