import { createContentLoader } from "vitepress";

interface ArticleData {
  title: string;
  url: string;
  category: string;
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
  includeSrc: false,
  transform(rawData): ArticleData[] {
    return rawData
      .filter((page) => {
        // 排除首頁和分類 index 頁面
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
        // 從 URL 解析分類和編號，如 /ai-tools/001-xxx.html
        const match = url.match(/^\/([^/]+)\/(\d+)-/);
        const category = match ? match[1] : "unknown";
        const number = match ? parseInt(match[2], 10) : 0;

        // 從 frontmatter 或第一行 # 標題取標題
        const title =
          page.frontmatter?.title ||
          (page as any).title ||
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
        // 先按編號倒序
        if (b.number !== a.number) return b.number - a.number;
        // 同編號按分類排序
        return a.category.localeCompare(b.category);
      });
  },
});
