export const categoryCatalog = [
  {
    slug: "ai-tools",
    name: "AI 工具與應用",
    desc: "AI 工具、Claude Code、Prompt 工程、AI 開發與安全",
  },
  {
    slug: "crypto-investing",
    name: "加密貨幣投資",
    desc: "加密貨幣投資哲學、週期生存、心態管理",
  },
  {
    slug: "defi",
    name: "DeFi 策略與安全",
    desc: "DeFi 策略、LP、套利、智能合約安全",
  },
  {
    slug: "quant-trading",
    name: "量化交易",
    desc: "量化交易、市場微觀結構、高頻交易",
  },
  {
    slug: "dev",
    name: "軟體開發",
    desc: "開發工具、程式語言、軟體工程、知識管理",
  },
  {
    slug: "lifestyle",
    name: "生活與效率",
    desc: "旅遊、理財、生產力、娛樂、自我成長",
  },
];

export const categoryNames: Record<string, string> = Object.fromEntries(
  categoryCatalog.map((category) => [category.slug, category.name]),
);
