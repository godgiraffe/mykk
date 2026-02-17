# Ghostty 配合 Claude Code 的 SAND 快鍵系統

> **來源**: [@dani_avila7](https://x.com/dani_avila7/status/2023151176758268349) | [原文連結](https://x.com/i/article/2022829598157795328)
>
> **日期**: Sun Feb 15 21:43:23 +0000 2026
>
> **標籤**: `開發工具` `終端管理` `Claude Code工作流`

---

> **來源**: [@dani_avila7 (Daniel San)](https://twitter.com/dani_avila7)
> **日期**: 2026-02-17
> **標籤**: `Ghostty` `Claude Code` `終端機` `工作流程` `SAND 快捷鍵`

---

## 為什麼我轉用 Ghostty

在每天使用 Claude Code 數個月後，我發現自己幾乎不再使用 VSCode 或 Cursor，只用終端機和 git 面板，其他所有事情都由 Claude Code 處理。

問題是 VSCode 的終端機很脆弱，長時間的 Claude Code 會話會讓它崩潰，即使在 M4 上也一樣。這不是硬體問題，而是終端機不是為 AI 規模的輸出而設計的……我需要一個真正的終端機。

Ghostty 出現了，社群很重要，而且它是由 @mitchellh（HashiCorp 共同創辦人）開發的，這個人有認真的技術背景。Ghostty 感覺是面向未來的。

這是關於我使用 Ghostty 和 Claude Code 工作流程的三篇文章中的第一篇。我從我的「SAND」快捷鍵系統開始，這讓面板管理變得自然而然。

1. 我的 Ghostty 設定與 SAND 快捷鍵
2. 使用 Lazygit 監控 Claude Code 的變更
3. 使用 Git worktrees 和 Claude Code 的平行代理

## Ghostty 入門

從 [ghostty.org](https://ghostty.org/) 下載 Ghostty（支援 macOS 和 Linux）。安裝後，你需要在 `~/.config/ghostty/config` 建立設定檔。

最簡單的設定方式？打開 Claude Code 並告訴它：

> Configure Ghostty with this config: https://gist.github.com/davila7/5b07f55a6e65a06c121da9702d10c2e2

Claude 會讀取 gist，建立設定檔，就完成了。如果你偏好手動設定：

```bash
mkdir -p ~/.config/ghostty
curl -o ~/.config/ghostty/config https://gist.githubusercontent.com/davila7/5b07f55a6e65a06c121da9702d10c2e2/raw/config
```

## 我如何在 Ghostty 中管理面板

使用 Ghostty 搭配 Claude Code 時，分割面板效果最好——你可能在一側有 Claude，在另一側有 git 變更，也許在第三個面板有檔案瀏覽器。如果你無法不假思索地分割、導航和關閉面板，你最終會在快捷鍵上摸索，而不是在寫程式。

我一直忘記 Ghostty 的快捷鍵，所以我將它們組織成記憶口訣 **SAND**。四個字母，四個動作——每個面板操作都屬於這些類別之一。

### S - Split: 建立新面板

將你的終端機分割成多個面板。

- `Cmd+D` 向右分割（垂直）
- `Cmd+Shift+D` 向下分割（水平）

### A - Across: 在分頁之間移動

在分頁之間導航。

- `Cmd+T` 開啟新分頁
- `Cmd+Shift+Left/Right` 在分頁之間移動

### N - Navigate: 在分割面板之間跳轉

在分割面板之間移動焦點。

- `Cmd+Alt+Arrows` 向任何方向跳轉
- `Cmd+Shift+E` 均等化所有分割面板
- `Cmd+Shift+F` 放大單一面板（再按一次恢復）

### D - Destroy: 關閉面板和分頁

關閉你不需要的東西。

- `Cmd+W` 關閉目前的面板或分頁

## 我的工作流程佈局

這是我日常設定的樣子，它可以從 1 個擴展到 3 個平行運行的 Claude Code 實例……記住使用 SAND！

從簡單開始：左邊一個 Claude Code 面板，**S**（`Cmd+D`）向右分割，然後在那裡執行 [lazygit](https://github.com/jesseduffield/lazygit) 來即時監控 Claude 做的每個 commit 和 diff。

然後再 **S**（`Cmd+Shift+D`）向下分割右側面板，並開啟 [yazi](https://github.com/sxyazi/yazi) 作為檔案瀏覽器。

但當你在處理多個任務時，你可以將左側分割成 2 或 3 個 Claude Code 實例，每個都在不同的 Git worktree 上運行。

如果某些 Claude Code 面板變得太大，因為你需要更多上下文，你可以按 `Cmd+Shift+E` 來均等化所有視窗，讓它們回到平衡的佈局。

這就是結合 Ghostty 和 worktrees 的威力——你可以從單一代理變成多代理設定，而無需離開你的終端機。

## 技巧

在你每次都能看到的地方貼一張寫著字母 **SAND** 的便條紙。每次看到它，就練習這些指令——一週後，你就能完全從鍵盤控制 Ghostty。

## 後續文章

這是第一篇文章。接下來的兩篇將展示我如何使用 Ghostty 和 Claude Code 工作。

一篇文章將涵蓋 Lazygit，即時觀察 Claude Code 的 commits、diffs 和分支變更。

另一篇將涵蓋 git worktrees 和平行代理，在不同任務上運行多個 Claude Code 實例，並使用 yazi 瀏覽專案檔案。
