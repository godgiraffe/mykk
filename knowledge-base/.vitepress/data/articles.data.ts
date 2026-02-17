import { createContentLoader } from "vitepress";

interface ArticleData {
  title: string;
  url: string;
  category: string;
  categoryName: string;
  number: number;
}

// 分類中文名稱對照
const categoryNames: Record<string, string> = {
  "ai-tools": "AI 工具與應用",
  "crypto-investing": "加密貨幣投資",
  defi: "DeFi 策略與安全",
  "quant-trading": "量化交易",
  dev: "軟體開發",
  lifestyle: "生活與效率",
};

export default createContentLoader("**/*.md", {
  includeSrc: true,
  transform(rawData): ArticleData[] {
    return rawData
      .filter((page) => {
        const url = page.url;
        return (
          url !== "/" &&
          url !== "/index.html" &&
          !url.endsWith("/") &&
          !/\/index\.html$/.test(url)
        );
      })
      .map((page) => {
        const url = page.url;
        const match = url.match(/^\/([^/]+)\/(\d+)-/);
        const category = match ? match[1] : "unknown";
        const number = match ? parseInt(match[2], 10) : 0;

        // 從 markdown 原始碼第一行 # 標題取得標題
        const titleMatch = page.src?.match(/^#\s+(.+)/m);
        const title =
          page.frontmatter?.title ||
          titleMatch?.[1]?.trim() ||
          url.split("/").pop()?.replace(/\.html$/, "") ||
          "";

        return {
          title,
          url,
          category,
          categoryName: categoryNames[category] || category,
          number,
        };
      })
      .sort((a, b) => {
        if (b.number !== a.number) return b.number - a.number;
        return a.category.localeCompare(b.category);
      });
  },
});
