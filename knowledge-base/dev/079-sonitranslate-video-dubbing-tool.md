# SoniTranslate：開源影片翻譯與配音工具

> **來源**: [@ilovek8s](https://x.com/ilovek8s/status/1850154848593105262) | [原文連結](https://github.com/R3gm/SoniTranslate)
>
> **日期**: Sat Oct 26 12:37:44 +0000 2024
>
> **標籤**: `影片翻譯` `自動配音` `開源工具`

---

> **來源**: [@ilovek8s (ilovelife)](https://twitter.com/ilovek8s)
> **日期**: 2026-02-18
> **標籤**: `開源工具` `影片翻譯` `TTS` `AI` `自媒體`

---

## 工具簡介

SoniTranslate 是一款強大的開源影片翻譯工具，能將影片和音訊翻譯成數十種語言，並提供 TTS（文字轉語音）功能。使用者只需上傳檔案、選擇目標語言和 TTS 音色，即可獲得翻譯後的新影片。

**專案資訊**：
- GitHub：[R3gm/SoniTranslate](https://github.com/R3gm/SoniTranslate)
- 授權：Apache-2.0
- Stars：1.3k
- Forks：314

## 功能特色

### 核心功能
- **影片翻譯與配音**：支援影片和音訊檔案的多語言翻譯
- **TTS 語音合成**：提供多種 TTS 音色選擇
- **字幕生成**：支援 ASS 字幕格式和批次處理
- **說話人分離**：使用 Pyannote 進行說話人辨識（diarization）
- **聲音模仿**：整合 OpenVoiceV2 和 FreeVC 技術
- **多種輸出格式**：支援 MP3、MP4、MKV、WAV、OGG 等格式

### 進階功能
- **OpenAI API 整合**：可使用 GPT API 進行轉錄、翻譯和 TTS
- **Whisper ASR 模型**：支援自訂 Hugging Face 上的 Whisper 模型
- **批次處理**：支援同時處理多個檔案或 YouTube 播放清單
- **PDF 轉影片**：可將 PDF 轉換為有聲書影片
- **CPU 模式**：支援無 GPU 環境運行
- **軟字幕**：實現軟字幕嵌入

## 支援語言

### 完整支援（包含轉錄）
英語、法語、德語、西班牙語、義大利語、日語、荷蘭語、烏克蘭語、葡萄牙語、阿拉伯語、簡體中文、繁體中文、捷克語、丹麥語、芬蘭語、希臘語、希伯來語、匈牙利語、韓語、波斯語、波蘭語、俄語、土耳其語、烏爾都語、印地語、越南語、印尼語、孟加拉語、泰盧固語、馬拉地語、泰米爾語、爪哇語、加泰隆尼亞語、尼泊爾語、泰語、瑞典語、阿姆哈拉語、威爾斯語、克羅埃西亞語、冰島語、喬治亞語、高棉語、斯洛伐克語、阿爾巴尼亞語、塞爾維亞語、亞塞拜然語、保加利亞語、加利西亞語、古吉拉特語、哈薩克語、坎那達語、立陶宛語、拉脫維亞語、馬拉雅拉姆語、羅馬尼亞語、僧伽羅語、巽他語、愛沙尼亞語、馬其頓語、斯瓦希里語、南非荷蘭語、波士尼亞語、拉丁語、緬甸語、挪威語、阿薩姆語、巴斯克語、豪薩語、海地克里奧爾語、亞美尼亞語、寮語、馬達加斯加語、蒙古語、馬爾他語、旁遮普語、普什圖語、斯洛維尼亞語、紹納語、索馬里語、塔吉克語、土庫曼語、韃靼語、烏茲別克語、約魯巴語

### 僅翻譯（不支援轉錄）
艾馬拉語、班巴拉語、宿霧語、齊切瓦語、迪維希語、多格里語、埃維語、瓜拉尼語、伊洛卡諾語、盧安達語、克里奧爾語、庫德語、吉爾吉斯語、干達語、邁蒂利語、奧里亞語、奧羅莫語、克丘亞語、薩摩亞語、提格里尼亞語、聰加語、阿坎語、維吾爾語

## 安裝與使用

### 環境需求
- NVIDIA CUDA 11.8.0 驅動程式
- Anaconda 或 Miniconda
- Python 3.10
- Git
- FFmpeg
- Hugging Face 帳號及 Token（需接受 Pyannote 授權）

### 安裝步驟

```bash
# 1. 建立 Conda 環境
conda create -n sonitr python=3.10 -y
conda activate sonitr
python -m pip install pip==23.1.2 Setuptools==80.6.0
conda install pytorch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 pytorch-cuda=11.8 -c pytorch -c nvidia

# 2. 複製專案
git clone https://github.com/r3gm/SoniTranslate.git
cd SoniTranslate

# 3. 安裝相依套件
pip install -r requirements_base.txt -v
pip install -r requirements_extra.txt -v
pip install onnxruntime-gpu

# 4. 安裝 FFmpeg
conda install -y ffmpeg

# 5. 選裝：Piper TTS
pip install -q piper-tts==1.2.0

# 6. 選裝：Coqui XTTS
pip install -q -r requirements_xtts.txt
pip install -q TTS==0.21.1 --no-deps
```

### 執行方式

```bash
# 設定 Hugging Face Token
export YOUR_HF_TOKEN="YOUR_HUGGING_FACE_TOKEN"

# 啟動 Web UI
python app_rvc.py
```

開啟瀏覽器訪問 `http://127.0.0.1:7860`

### 命令列參數

| 參數 | 預設值 | 說明 |
|------|--------|------|
| `--theme` | Taithrah/Minimal | 設定介面主題 |
| `--language` | english | 選擇介面語言（支援中文、英文等 20+ 語言） |
| `--verbosity_level` | info | 記錄器詳細程度（debug/info/warning/error/critical） |
| `--public_url` | - | 啟用公開連結 |
| `--cpu_mode` | - | 啟用 CPU 模式（無需 GPU） |
| `--logs_in_gui` | - | 在 GUI 顯示操作日誌 |

範例：
```bash
python app_rvc.py --theme aliabid94/new-theme --language chinese_zh_cn
```

### 設定永久環境變數

```bash
# Hugging Face Token
conda activate sonitr
conda env config vars set YOUR_HF_TOKEN="YOUR_TOKEN"
conda deactivate

# OpenAI API Key（選用）
conda activate sonitr
conda env config vars set OPENAI_API_KEY="your-api-key"
conda deactivate
```

## 使用範例

工具可處理：
- 本地影片/音訊檔案
- YouTube 影片或完整播放清單
- 多個檔案批次處理（用逗號分隔路徑或 URL）

輸出選項：
- 翻譯後的影片
- 按說話人分離的字幕
- 獨立音訊檔案
- 僅含字幕的影片

## 更新紀錄（2024）

### 2024/05/18 主要更新
- 新增重疊減少功能
- 整合 OpenAI API（轉錄、翻譯、TTS）
- 支援自訂 Hugging Face Whisper 模型
- ASS 字幕與批次處理支援
- 轉錄前的人聲增強
- CPU 模式支援
- TTS 支援最多 12 個說話人
- OpenVoiceV2 整合
- PDF 轉影片書功能
- 介面新增波斯語和南非荷蘭語

### 2024/03/02 更新
- 保留輸出檔案名稱
- 支援批次提交（逗號分隔路徑/目錄/URL）
- YouTube 播放清單完整處理
- 可選擇停用說話人分離
- 軟字幕實作
- 多種輸出格式（MP3、MP4、MKV、WAV、OGG）

### 2024/02/22 更新
- 新增 FreeVC 聲音模仿
- 修復無聲軌道問題
- 分段功能
- 新增多種語言支援

## 應用場景

- 自媒體創作者進行跨語言影片製作
- 教育內容多語言化
- 會議錄音翻譯與字幕生成
- YouTube 影片翻譯與配音
- 有聲書製作
