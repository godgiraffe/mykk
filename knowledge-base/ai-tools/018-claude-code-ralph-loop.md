# Claude Code結合Ralph Loop插件提升程式效率

> **來源**: [@wquguru](https://x.com/wquguru/status/2009661206743969833) | [原文連結](https://x.com/wquguru/status/2009489714190143601?s=20)
>
> **日期**: Fri Jan 09 16:19:04 +0000 2026
>
> **標籤**: `Claude Code` `Ralph Loop` `AI效率工具` `Agent编程`

---

![](../assets/ai-tools/018-claude-code-ralph-loop-1.png)
![](../assets/ai-tools/018-claude-code-ralph-loop-2.jpg)
![](../assets/ai-tools/018-claude-code-ralph-loop-3.jpg)

## Claude Code 結合 Ralph Loop 插件提升程式效率

### 總覽

本文介紹如何將 Ryan 開源的 Ralph Loop 遷移到 Claude Code 上，並透過結合 Claude Code 的 Ralph Loop 插件，大幅提升程式效率。根據作者 @wquguru 的經驗，此方法能將程式效率提升五倍，並大幅減少人工干預次數。

### 背景

Ralph Loop 是由 Ryan 開源的專案，廣受歡迎（原文閱讀量超過 130 萬）。作者 @wquguru 將其移植到 Claude Code 上，並開發了 Ralph Loop 插件，進一步提升了程式效率，帶來了令人驚豔的體驗。 Ryan 版本 Ralph Loop 的優勢可參考 [https://t.co/22mEzXaSx6](https://t.co/22mEzXaSx6)。

### 效率提升

透過 Claude Code 結合 Ralph Loop 插件，程式效率可提升至五倍，同時人工干預次數也能顯著降低，降至原本的 1/10 到 1/5。

### 簡易操作指南

作者將此操作封裝成 Skill，只需簡單幾個步驟即可體驗效率翻倍的 AI 程式設計樂趣：

1.  **下載 Ralph Ryan 專案：**

    ```bash
    git clone git@github.com:wquguru/ralph-ryan.git
    ```

2.  **複製 Skill 至 Claude 目錄：**

    ```bash
    cd ralph-ryan & cp -r skills/ralph-ryan ~/.claude/skills
    ```

3.  **安裝 Ralph Loop 插件：**

    進入 Claude Code，執行以下指令安裝官方插件（請先將 Claude Code 升級至最新版本）：

    ```bash
    /plugin install ralph-loop@claude-plugins-official
    ```

4. **執行提示詞：**
    接下來只需要執行三次提示詞，即可體驗長時間的 Agent 程式設計樂趣。

    *   提示詞一：喚起 ralph ryan skill，編寫 [https://t.co/9ujSfqadq3](https://t.co/9ujSfqadq3) 的功能
    *   提示詞二：喚起 ralph ryan skill，將 prd 轉換為 prd.json 和 progress.txt
    *   提示詞三：喚起 ralph ryan skill，開啟 Ralph Loop

### 步驟重點表

| 步驟 | 操作 | 指令/連結 | 說明 |
|---|---|---|---|
| 1 | 下載專案 | `git clone git@github.com:wquguru/ralph-ryan.git` | 從 GitHub 下載 Ralph Ryan 專案 |
| 2 | 複製 Skill | `cd ralph-ryan & cp -r skills/ralph-ryan ~/.claude/skills` | 將 Skill 複製到 Claude Code 的 Skill 目錄 |
| 3 | 安裝插件 | `/plugin install ralph-loop@claude-plugins-official` | 在 Claude Code 中安裝 Ralph Loop 插件 |
| 4 | 執行提示詞 | - |  執行三個提示詞，啟動 Ralph Loop 進行程式設計 |

### 結論

透過 Claude Code 與 Ralph Loop 插件的結合，能夠顯著提升程式效率，並減少人工干預。只需要簡單幾個步驟，即可體驗效率翻倍的 AI 程式設計樂趣。

