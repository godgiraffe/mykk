# Google NotebookLM Python API：非官方工具

> **來源**: [@vista8](https://x.com/vista8/status/2011029383688188166) | [原文連結](https://github.com/teng-lin/notebooklm-py)
>
> **日期**: 
>
> **標籤**: `NotebookLM` `Python API` `AI工具` `Google`

---

## Google NotebookLM Python API：非官方工具知識庫文章

### 簡介

這個非官方的 Python API 旨在讓開發者能以程式化的方式與 Google NotebookLM 互動，進而擴展其功能。它提供了許多 Web UI 沒有的功能，例如批量下載、導出多種格式的測驗/閃卡等，非常適合用於原型設計、研究和個人專案。

### 主要功能

*   **完整程式化存取**: 提供 NotebookLM 所有功能的程式化存取，包括 Web UI 未提供的功能。
*   **AI 代理工具**: 整合 NotebookLM 到 Claude Code 或其他 LLM 代理。
*   **研究自動化**: 批量匯入來源 (URLs, PDFs, YouTube, Google Drive)，執行 Web/Drive 研究查詢並自動匯入，程式化地提取洞見，建立可重複的研究流程。
*   **內容生成**: 生成音訊概覽 (podcasts)、影片、投影片、測驗、閃卡、資訊圖表、資料表格、心智圖和學習指南。
*   **下載與匯出**: 將所有生成的成品下載到本地 (MP3, MP4, PDF, PNG, CSV, JSON, Markdown)，匯出到 Google Docs/Sheets。
*   **Web UI 額外功能**: 批量下載、多種格式的測驗/閃卡匯出、心智圖 JSON 提取。

### 使用方式

API 提供三種主要的使用方式：

| 方法       | 適用情境                                   |
|------------|--------------------------------------------|
| Python API | 應用程式整合、異步工作流程、自定義流程         |
| CLI        | Shell 腳本、快速任務、CI/CD 自動化          |
| 代理技能    | Claude Code、LLM 代理、自然語言自動化       |

### 功能詳解

此 API 涵蓋 NotebookLM 的完整功能：

| 類別       | 功能                                                                                                                                                                                                     |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Notebooks  | 建立、列出、重新命名、刪除                                                                                                                                                                                  |
| Sources    | URLs、YouTube、檔案 (PDF、text、Markdown、Word、audio、video、images)、Google Drive、貼上的文字；刷新、獲取指南/全文                                                                                              |
| Chat       | 問題、對話歷史、自定義角色                                                                                                                                                                                 |
| Research   | Web 和 Drive 研究代理 (快速/深度模式) 並自動匯入                                                                                                                                                           |
| Sharing    | 公開/私人連結、使用者權限 (檢視者/編輯者)、檢視層級控制                                                                                                                                                           |
| Content Generation | 音訊概覽（4 種格式、3 種長度、50 多種語言，MP3/MP4）、影片概覽（2 種格式、9 種視覺風格，MP4）、投影片（詳細或簡報者格式，可調整長度，PDF）、資訊圖表（3 種方向、3 種細節程度，PNG）、測驗（可配置數量和難度，JSON, Markdown, HTML）、閃卡（可配置數量和難度，JSON, Markdown, HTML）、報告（簡報文件、學習指南、部落格文章或自定義提示，Markdown）、資料表（透過自然語言自定義結構，CSV）、心智圖（互動式層次結構視覺化，JSON） |

### Web UI 以外的功能

以下功能只能透過 API/CLI 存取，而無法在 NotebookLM 的 Web 介面中使用：

*   **批量下載**: 一次下載所有特定類型的成品。
*   **測驗/閃卡匯出**: 獲取結構化的 JSON、Markdown 或 HTML (Web UI 僅顯示互動式檢視)。
*   **心智圖資料提取**: 匯出層次結構 JSON 以用於視覺化工具。
*   **資料表 CSV 匯出**: 將結構化的表格下載為試算表。
*   **來源全文存取**: 檢索任何來源的索引文字內容。
*   **程式化共享**: 無需 UI 即可管理權限。

### 安裝

使用 pip 安裝：

```bash
# 基本安裝
pip install notebooklm-py

# 包含瀏覽器登入支援 (首次使用需要)
pip install "notebooklm-py[browser]"
```

首次使用時，需要開啟另一個終端 Tab，輸入 `notebooklm login` 並按下 Enter，系統會自動調用瀏覽器登入。登入成功後，請務必回到終端機，按照提示輸入 Enter 鍵，才能記住登入資訊。

### 快速開始 (CLI)

```bash
# 1. 驗證 (開啟瀏覽器)
notebooklm login

# 2. 建立 notebook 並新增來源
notebooklm create "My Research"
notebooklm use <notebook_id>
notebooklm source add "https://en.wikipedia.org/wiki/Artificial_intelligence"
notebooklm source add "./paper.pdf"

# 3. 與你的來源聊天
notebooklm ask "What are the key themes?"

# 4. 產生內容
notebooklm generate audio "make it engaging" --wait
notebooklm generate video --style whiteboard --wait
notebooklm generate quiz --difficulty hard
notebooklm generate flashcards --quantity more
notebooklm generate slide-deck
notebooklm generate infographic --orientation portrait
notebooklm generate mind-map
notebooklm generate data-table "compare key concepts"

# 5. 下載成品
notebooklm download audio ./podcast.mp3
notebooklm download video ./overview.mp4
notebooklm download quiz --format markdown ./quiz.md
notebooklm download flashcards --format json ./cards.json
notebooklm download slide-deck ./slides.pdf
notebooklm download mind-map ./mindmap.json
notebooklm download data-table ./data.csv
```

### 快速開始 (Python API)

```python
import asyncio
from notebooklm import NotebookLMClient

async def main():
    async with await NotebookLMClient.from_storage() as client:
        # 建立 notebook 並新增來源
        nb = await client.notebooks.create("Research")
        await client.sources.add_url(nb.id, "https://example.com", wait=True)

        # 與你的來源聊天
        result = await client.chat.ask(nb.id, "Summarize this")
        print(result.answer)

        # 產生內容 (podcast, video, quiz, 等等)
        status = await client.artifacts.generate_audio(nb.id, instructions="make it fun")
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_audio(nb.id, "podcast.mp3")

        # 產生測驗並下載為 JSON
        status = await client.artifacts.generate_quiz(nb.id)
        await client.artifacts.wait_for_completion(nb.id, status.task_id)
        await client.artifacts.download_quiz(nb.id, "quiz.json", output_format="json")

        # 產生心智圖並匯出
        result = await client.artifacts.generate_mind_map(nb.id)
        await client.artifacts.download_mind_map(nb.id, "mindmap.json")

asyncio.run(main())
```

### 代理技能 (Claude Code)

```bash
# 透過 CLI 安裝或要求 Claude Code 執行
notebooklm skill install

# 然後使用自然語言：
# "Create a podcast about quantum computing"
# "Download the quiz as markdown"
# "/notebooklm generate video"
```

### 重要注意事項

*   **非官方函式庫 - 風險自負**: 此函式庫使用未公開的 Google APIs，這些 APIs 可能隨時變更，恕不另行通知。
*   **非 Google 官方**: 這是一個社群專案，與 Google 無關。
*   **API 可能會中斷**: Google 隨時可能變更內部端點。
*   **速率限制適用**: 大量使用可能會受到節流。
*   **適用情境**: 最適合用於原型設計、研究和個人專案。

### 其他資訊

*   **GitHub**: [https://github.com/teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py)
*   **文件**:
    *   **CLI 參考**: 完整的指令文件。
    *   **Python API**: 完整的 API 參考。
    *   **組態**: 儲存和設定。
    *   **疑難排解**: 常見問題和解決方案。
    *   **API 穩定性**: 版本控制政策和穩定性保證。
*   **貢獻者**:
    *   **開發指南**: 架構、測試和發布。
    *   **RPC 開發**: 協定擷取和偵錯。
    *   **RPC 參考**: 載荷結構。
    *   **更新日誌**: 版本歷史記錄和發布說明。
    *   **安全性**: 安全性政策和憑證處理。

### 平台支援

| 平台    | 狀態   | 備註                       |
|---------|--------|----------------------------|
| macOS   | ✅     | 已測試，主要開發平台         |
| Linux   | ✅     | 已測試，完全支援             |
| Windows | ✅     | 已測試，在 CI 中進行測試     |

### 授權

MIT License。請參閱 LICENSE 檔案以取得詳細資訊。

