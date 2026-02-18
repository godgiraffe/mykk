# Chrome 多開配置指南與指令碼

> **來源**: [@moshuishapaozi](https://x.com/moshuishapaozi/status/1887434854570336594) | [原文連結](https://x.com/i/article/1887427378152177664)
>
> **日期**: 
>
> **標籤**: `Chrome多開` `自動化指令碼` `安全配置`

---

> **來源**: [@moshuishapaozi (墨水傻狍子)](https://x.com/moshuishapaozi)
> **標籤**: `chrome` `多開` `瀏覽器` `指紋管理` `開發工具` `腳本`

---

## 背景說明

年前 AdsPower 出了一波盜號事件，至今沒有更多新消息，當初那個名字叫「ads黑客」的現在已經改名字了。

儘管仍在使用 AdsPower，ADS 在幣圈也好幾年了，之前都沒聽說過什麼盜幣的問題，我還是願意相信這次事故是一個安全事故。只要團隊本身不作惡，出過問題的一段時間反而更安全。

同時也開始配置 Chrome 多開。除了沒有同步器，Chrome 多開意外的好用。記錄整個過程以免忘記，也希望能幫助到大家。

## Chrome 多開配置步驟

### 1. 建立基礎配置

首先創建一個空的資料夾，命名為 `1`，路徑假設為 `C:\paozi\1`

### 2. 修改快捷方式

複製一個已經存在的 Chrome 快捷連結，右鍵屬性，在命令後面加上：

```
--user-data-dir=C:\paozi\1
```

這時你就已經多開好一個 Chrome 了，雙擊打開是一個全新的 Chrome 瀏覽器。

### 3. 安裝插件

在這個瀏覽器裡面安裝所需的各種 Chrome 插件，錢包都先不導入，只是裝插件。為了模擬指紋，額外安裝了：

- [my-fingerprint](https://github.com/omegaee/my-fingerprint?tab=readme-ov-file)
- [WebRTC Control](https://chromewebstore.google.com/detail/webrtc-control/fjkmabmdepjfammlpliljpnbhleegehm)

這兩個按需自取，權限和代碼大致看了一眼沒什麼問題。

### 4. 批次複製與快捷方式生成

在瀏覽器裡裝好所有需要的插件之後，就可以進行複製資料夾和生成對應的快捷連結了。下面是使用的 PowerShell 腳本。

## PowerShell 腳本

### 批次複製目錄腳本

```powershell
# Parameters
param (
    [Parameter(Mandatory=$true)]
    [string]$sourceDir,
    [Parameter(Mandatory=$true)]
    [string]$baseDir
)

# Function to copy directories
function Copy-MultipleDirectories {
    # Verify source exists
    if (-not (Test-Path $sourceDir)) {
        Write-Host "Source directory does not exist: $sourceDir" -ForegroundColor Red
        return
    }

    # Create copies from 1 to 100
    2..100 | ForEach-Object { # 1..100 為需要複製的目錄數量 可以增加或減少
        $targetDir = Join-Path $baseDir $_
        
        if (Test-Path $targetDir) {
            Write-Host "Directory already exists: $targetDir" -ForegroundColor Yellow
        } else {
            try {
                Copy-Item -Path $sourceDir -Destination $targetDir -Recurse
                Write-Host "Created directory: $targetDir" -ForegroundColor Green
            } catch {
                Write-Host "Error creating directory $targetDir : $_" -ForegroundColor Red
            }
        }
    }
}

# Execute
$sourceDir = "C:\paozi\1" # 任意一個配置好的目錄
$baseDir = "C:\paozi" # 需要複製的根目錄，保存複製好的1/2/3/4/5等目錄
Copy-MultipleDirectories

# Usage example:
# .\copy_dirs.ps1 -sourceDir "C:\Fan\chrome-myron-data\2" -baseDir "C:\Fan\chrome-myron-data"
```

### 批次建立快捷方式腳本

```powershell
param (
    [string]$baseDir = "C:\paozi", # 所有 user data 的目錄，下面有 1/2/3/4/5 等目錄
    [string]$shortcutDir = "C:\paozi\chrome-links",  # 新增參數，用於指定快捷方式保存路徑
    [string]$proxyListFile = "C:\paozi\chrome-links\validate_ip.txt" # 本地 ip 列表，一行一個 ip:port
)

# Get proxy ports from file
$proxyPorts = Get-Content $proxyListFile

# Create WScript Shell object to create shortcuts
$shell = New-Object -ComObject WScript.Shell

# Chrome executable path
$chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"

# 確保快捷方式目錄存在
if (!(Test-Path $shortcutDir)) {
    New-Item -ItemType Directory -Path $shortcutDir -Force
}

1..100 | ForEach-Object { # 1..100 為需要建立的快捷方式數量 可以增加或減少
    $number = $_
    $shortcutPath = "$shortcutDir\$number.lnk"  # 使用新的路徑保存快捷方式
    $userDataDir = "$baseDir\$number"
    $proxyServer = $proxyPorts[$_ - 1]

    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $chrome
    $shortcut.Arguments = "--user-data-dir=`"$userDataDir`" --proxy-server=`"$proxyServer`""
    $shortcut.Save()

    Write-Host "Created shortcut $number with proxy $proxyServer"
}

Write-Host "Finished creating shortcuts!"
```

**腳本說明**：
- 第一個是複製 user 資料夾的
- 第二個是建立快捷方式的
- 如果有本地的 IP，可以放入一個 txt 裡面，建立快捷方式的時候會帶上
- 代碼裡面有註釋，不懂可以問 DeepSeek 或者 GPT

## DrissionPage 整合程式碼

額外附上一段 DrissionPage 去連接這些瀏覽器的程式碼片段，實際上就是切換不同的 user data，proxy 都是 Python 程式碼裡面直接配置的。

多開之後每個環境導入錢包等操作，用腳本還是挺方便的，如果要手動的話確實很費勁。

```python
class LocalChromeDriver:
    def __init__(self, user_id, proxy=None, base_path=f"C:\\paozi\\") -> None:
        self.user_id = user_id
        self.port = 25000 + int(user_id)
        self.user_data_path = fr"{base_path}\{user_id}"
        self.proxy = proxy
        self.browser = None
        self.tab = None

    def start(self):
        if self.browser:
            logger.debug("Browser already started")
            return
        
        co = ChromiumOptions().set_paths(
            local_port=self.port,
            user_data_path=self.user_data_path
        )
        
        if self.proxy:
            co.set_argument("--proxy-server", self.proxy)
            
        self.browser = Chromium(addr_or_opts=co)
        self.tab = self.browser.latest_tab
        logger.debug(f"Started browser for user {self.user_id}")
        time.sleep(1)
        return self.browser

    def close(self):
        if self.browser:
            self.browser.quit()
            self.browser = None
            self.tab = None
            logger.debug(f"Closed browser for user {self.user_id}")

    def get_status(self):
        try:
            if self.browser and self.browser.states.is_alive():
                return True, True
            return True, False
        except:
            return True, False
```
