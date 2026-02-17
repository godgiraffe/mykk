import fs from "node:fs";
import path from "node:path";

const KB_ROOT = path.resolve(__dirname, "..");

/** 從 README.md 表格解析分類中文名稱 */
function parseCategoryNames(): Record<string, string> {
  const readme = fs.readFileSync(path.join(KB_ROOT, "index.md"), "utf-8");
  const map: Record<string, string> = {};

  for (const line of readme.split("\n")) {
    // 匹配 | [category](./category/) | 說明 | 格式
    const match = line.match(
      /\|\s*\[([^\]]+)\]\(\.\/([^/]+)\/?\)\s*\|\s*(.+?)\s*\|/
    );
    if (match) {
      map[match[2]] = match[1];
    }
  }
  return map;
}

/** 從 markdown 檔案第一行取標題 */
function getTitle(filePath: string): string {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : path.basename(filePath, ".md");
}

/** 自動生成側邊欄 */
export function generateSidebar() {
  const categoryNames = parseCategoryNames();
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
