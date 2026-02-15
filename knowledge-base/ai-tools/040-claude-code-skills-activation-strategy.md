# Claude Code 中 Skills 和 SubAgent 的激活策略研究

> **來源**: [@xiaokedada](https://x.com/xiaokedada/status/1999130869072834850)
>
> **日期**: 
>
> **標籤**: `Claude Code` `Skills 激活` `開發流程優化`

---

在 Claude Code 中使用 Skills 和 SubAgent 時，開發者經常會遇到一個令人困擾的問題：這些功能的激活率極低。它們不是靜靜地等待被喚醒，而是被徹底遺忘。

## 問題現況

在引入類似於 superpowers 或 claude-code-infrastructure-showcase 的 AI 研發流程時，Skills 和 SubAgent 的激活率往往低得令人失望。即使已經配置好相關功能，Claude Code 也經常選擇忽略它們。

## 社區解決方案

### 基礎策略：UserPromptSubmit Hook

社區主要透過 `UserPromptSubmit` Hook 進行主動激活。以下是兩種常見的配置方式：

**方案一：簡單指令提示**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo 'INSTRUCTION: If the prompt matches any available skill keywords, use Skill(skill-name) to activate it.'"
          }
        ]
      }
    ]
  }
}
```

**方案二：多重提醒**

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"I have these agents available: [list all available agents], i will use [name agent] to solve this task as it is the best for [reason for choosing that agent]\""
          },
          {
            "type": "command",
            "command": "echo \"REPEAT OUTLOUD: \\n I WILL NOT CREATE REDUNDANT FILES \\n I WLL CLEAN UP AFTER MY SELF AND KEEP ONLY THE ACTUAL DEMANDED SOLTUTION \\n I WILL NOT OVERENGINEER \\n I WILL USE THE APROPRIATE AGENT \\n I WLL NOT ABANDON MY OBJECTIVE CREATING SIMPLER TESTING FILES\""
          }
        ]
      }
    ]
  }
}
```

然而，這些方案的激活率可能只能達到 50%。

> **關鍵發現**：如果在提示詞中表現出任何溫和態度，Claude Code 都會選擇無視它。

### 進階策略：三步驟強制激活流程

社區發展出一種更激進的策略，透過三個步驟強制 Claude Code 做出激活承諾。代價是消耗更多 Token 和注意力資源：

| 步驟 | 說明 |
|------|------|
| Step 1 - EVALUATE | 針對每個 skill，明確陳述 YES/NO 及原因 |
| Step 2 - ACTIVATE | 立即使用 Skill() 工具 |
| Step 3 - IMPLEMENT | 只在激活後才進行實作 |

**關鍵原則**：評估是無意義的，除非你真正激活這些 skills。

這個策略同樣實現在 `UserPromptSubmit` Hook 中，似乎沒有其他替代途徑。

## 效果對比

| 策略類型 | 激活率 |
|---------|--------|
| 無額外配置 | 極低 |
| 基礎 Hook 提示 | ~50% |
| 三步驟強制激活 | ~80% |

## 總結

在幾乎瘋狂的 Hack 策略下，能將 Skill 的激活率提升至 80%。這個坑已經被社區踩過，開發者可以直接參考這些經驗來改善 Claude Code 中 Skills 和 SubAgent 的使用體驗。
