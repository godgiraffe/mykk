import { createContentLoader } from "vitepress";
import { getDateWeight, parseArticleRecord, type ArticleRecord } from "./article-record";

export type ArticleData = ArticleRecord;

export default createContentLoader("**/*.md", {
  includeSrc: true,
  transform(rawData): ArticleData[] {
    return rawData
      .filter((page) => {
        const url = page.url;
        return (
          url !== "/" &&
          url !== "/index.html" &&
          url !== "/liked.html" &&
          url !== "/disliked.html" &&
          url !== "/review.html" &&
          url !== "/curated.html" &&
          url !== "/archive.html" &&
          !url.endsWith("/") &&
          !/\/index\.html$/.test(url)
        );
      })
      .map((page) =>
        parseArticleRecord({
          url: page.url,
          src: page.src ?? "",
          frontmatter: (page.frontmatter ?? {}) as Record<string, unknown>,
        }),
      )
      .sort((a, b) => {
        const timeA = getDateWeight(a.date);
        const timeB = getDateWeight(b.date);
        if (timeB !== timeA) return timeB - timeA;
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        if (b.number !== a.number) return b.number - a.number;
        return a.category.localeCompare(b.category);
      });
  },
});
