import {
  listArticleFiles,
  readArticleState,
  renderArticleWithFrontmatter,
  writeIfChanged,
} from "./curation-utils";

const files = listArticleFiles();

let updated = 0;
const statusCounts = {
  inbox: 0,
  curated: 0,
  archive: 0,
};

for (const filePath of files) {
  const state = readArticleState(filePath);
  const nextSource = renderArticleWithFrontmatter(state);

  statusCounts[state.record.curationStatus] += 1;

  if (writeIfChanged(filePath, nextSource, state.source)) {
    updated++;
  }
}

console.log(
  `已 backfill ${updated} 篇文章 frontmatter。待審 ${statusCounts.inbox}，精選 ${statusCounts.curated}，封存 ${statusCounts.archive}。`,
);
