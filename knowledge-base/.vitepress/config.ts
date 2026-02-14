import { defineConfig } from "vitepress";
import { generateSidebar } from "./sidebar";

export default defineConfig({
  title: "Knowledge Base",
  description: "個人知識庫 — 收錄各領域學習筆記與資料整理",
  lang: "zh-TW",
  base: "/mykk/",

  themeConfig: {
    sidebar: generateSidebar(),

    search: {
      provider: "local",
      options: {
        translations: {
          button: { buttonText: "搜尋", buttonAriaLabel: "搜尋" },
          modal: {
            noResultsText: "找不到結果",
            resetButtonTitle: "清除搜尋",
            footer: { selectText: "選擇", navigateText: "導航", closeText: "關閉" },
          },
        },
      },
    },

    nav: [{ text: "首頁", link: "/" }],

    outline: { label: "目錄" },

    socialLinks: [
      { icon: "github", link: "https://github.com/godgiraffe/mykk" },
    ],
  },

  // 忽略死連結（外部連結/錨點）
  ignoreDeadLinks: true,
});
