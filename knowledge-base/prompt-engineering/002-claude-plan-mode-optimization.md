# Claude 計畫模式優化技巧

> **來源**: [@bozhou_ai](https://x.com/bozhou_ai/status/2011421879391715645)
>
> **日期**: Wed Jan 14 12:55:21 +0000 2026
>
> **標籤**: `Claude` `提示工程` `效率提升` `Plan Mode`

---

![](../assets/prompt-engineering/002-claude-plan-mode-optimization-1.png)

## Claude 計畫模式優化技巧

本文章整理自 @bozhou_ai (泊舟) 分享的 Claude 計畫模式優化規則，該規則源自 Matt Pocock 的觀點，旨在提升 Claude 在計畫模式下的效率，使其產出更簡潔實用的計畫，並加速問題解決。

### 核心規則

以下是 Matt Pocock 提出的 Claude 計畫模式優化規則，可將其加入 `CLAUDE.md` 文件中，以提升 Claude 的表現：

```
## Plan Mode
- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
```

**規則翻譯：**

*   **計畫模式：**
    *   使計畫內容極度簡潔。為了簡潔，可犧牲語法。
    *   在每個計畫的結尾，如果有的話，列出需要回答的未解決問題清單。

### 規則重點整理

| 規則                                          | 說明                                                                                                                                                                                   |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **極度簡潔的計畫內容 (Extremely Concise Plan)** | 強調精簡的重要性。在生成計畫時，應避免冗長的描述，優先考慮信息的清晰度和重點。為了達到簡潔的目的，可以適度犧牲語法上的完美。                                                                                                                                 |
| **未解決問題清單 (Unresolved Questions)**    | 要求 Claude 在計畫的結尾列出尚未解決的問題。 這樣的清單有助於使用者快速識別需要進一步研究或澄清的點，進而引導後續的提問和討論方向。這也是提升 Claude 效率的關鍵，因為它可以幫助使用者更有效地與 Claude 互動，集中精力解決核心問題。 |

### 效益

應用這些規則後，可以期望獲得以下效益：

*   **更簡潔實用的計畫：** 避免冗長和難以理解的計畫內容，提升效率。
*   **加速問題解決：** 通過明確的未解決問題清單，快速定位需要關注的焦點，加速解決問題。
*   **提升 Claude 效率：** 透過更清晰的指令和更集中的目標，使 Claude 能夠更有效地完成任務。

### 如何應用

1.  建立 `CLAUDE.md` 文件 (如果不存在)。
2.  將上述核心規則複製並貼上到 `CLAUDE.md` 文件中。  可以使用以下指令：

    ```bash
    mkdir -p ~/.claude && cat >> ~/.claude/CLAUDE.md << 'EOF'

    ## Plan Mode
    - Make the plan extremely concise. Sacrifice grammar for the sake of concision.
    - At the end of each plan, give me a list of unresolved questions to answer, if any.

    EOF
    ```

3.  在與 Claude 互動時，這些規則將自動生效，影響 Claude 生成計畫的方式。

