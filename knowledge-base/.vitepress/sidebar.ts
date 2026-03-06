import fs from "node:fs";
import path from "node:path";
import { categoryNames } from "./data/category-meta";

const KB_ROOT = path.resolve(__dirname, "..");

/** 從 markdown 檔案第一行取標題 */
function getTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : path.basename(filePath, ".md");
}

/** 自動生成側邊欄 */
export function generateSidebar() {
  const sidebar: any[] = [];

  const dirs = fs
    .readdirSync(KB_ROOT, { withFileTypes: true })
    .filter(
      (d) =>
        d.isDirectory() &&
        !d.name.startsWith(".") &&
        d.name !== "assets" &&
        d.name !== "node_modules"
    )
    .map((d) => d.name)
    .sort();

  for (const dir of dirs) {
    const dirPath = path.join(KB_ROOT, dir);
    const files = fs
      .readdirSync(dirPath)
      .filter((f) => f.endsWith(".md") && f !== "index.md")
      .sort();

    if (files.length === 0) continue;

    const items = files.map((f) => ({
      text: getTitle(path.join(dirPath, f)),
      link: `/${dir}/${f.replace(/\.md$/, "")}`,
    }));

    sidebar.push({
      text: categoryNames[dir] || dir,
      collapsed: true,
      items,
    });
  }

  return sidebar;
}
