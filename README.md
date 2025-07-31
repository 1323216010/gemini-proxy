# Gemini VPN 代理伺服器
[English](README-EN.md)

此專案提供一個簡單的 Node.js 代理伺服器，用於 Google Generative Language API (Gemini API)。它允許您透過本地代理路由您的 API 請求，這對於偵錯、日誌記錄或繞過某些網路限制等各種目的都非常有用。

## 功能

*   **API 代理:** 將請求轉發到 `https://generativelanguage.googleapis.com`。
*   **HTTP 方法支援:** 處理所有標準 HTTP 方法 (GET, POST, PUT, DELETE 等)。
*   **請求體解析:** 支援 JSON、URL 編碼、純文字和原始二進位請求體。
*   **標頭轉發:** 將大多數原始請求標頭複製到目標 API，並進行必要的代理調整 (例如，`Host` 標頭)。
*   **串流回應:** 有效率地將目標 API 的回應串流回客戶端。
*   **Docker 支援:** 易於使用 Docker 部署。

## 快速開始

### 使用 Docker (推薦)

你可以使用[claw cloud](https://console.run.claw.cloud/signin?link=RGXA3AIOBR4S)來運行

You can see [claw cloud setting](https://github.com/spectre-pro/gemini-proxy?tab=readme-ov-file#claw-cloud-setting)

您可以從 Docker Hub 拉取預建的 Docker 映像：

```bash
docker pull ghcr.io/spectre-pro/gemini-proxy
```

拉取後，您可以運行代理伺服器：

```bash
docker run -d -p 34562:34562 --name gemini-proxy ghcr.io/spectre-pro/gemini-proxy
```

代理伺服器將在 `http://localhost:34562` 上可訪問。

### 使用 Docker 建置和運行

如果您更喜歡自己建置 Docker 映像：

1.  **克隆儲存庫：**
    ```bash
    git clone https://github.com/spectre-pro/gemini-proxy.git
    cd gemini-proxy
    ```
2.  **建置 Docker 映像：**
    ```bash
    docker build -t ghcr.io/spectre-pro/gemini-proxy .
    ```
3.  **運行 Docker 容器：**
    ```bash
    docker run -d -p 34562:34562 --name gemini-proxy ghcr.io/spectre-pro/gemini-proxy
    ```

### 本地運行 (Node.js)

1.  **克隆儲存庫：**
    ```bash
    git clone https://github.com/spectre-pro/gemini-proxy.git
    cd gemini-proxy
    ```
2.  **安裝依賴項：**
    ```bash
    npm install
    ```
3.  **啟動伺服器：**
    ```bash
    node src/main.js
    ```
    伺服器將預設在 `http://localhost:34562` 上運行。

## 使用範例

代理伺服器運行後，您可以將 Gemini API 請求導向 `http://localhost:34562`，而不是 `https://generativelanguage.googleapis.com`。

例如，OpenAI格式：

```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
Content-Type: application/json
{
  "contents": [
    {
      "parts": [
        {"text": "Hello, Gemini!"}
      ]
    }
  ]
}
```

Gemini格式：

```
POST http://localhost:34562/v1beta/models/gemini-pro:generateContent
Content-Type: application/json
{
  "contents": [
    {
      "parts": [
        {"text": "Hello, Gemini!"}
      ]
    }
  ]
}
```

代理伺服器會將此請求轉發到 `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent` 並返回回應。

### Claw cloud setting

<img width="541" height="852" alt="螢幕擷取畫面 2025-07-12 185901" src="https://github.com/user-attachments/assets/391bd8ec-38d4-43aa-aab5-1cacbbcfe364" />

## 許可證

此專案根據 [LICENSE](LICENSE) 文件獲得許可。

## Star History

<a href="https://www.star-history.com/#spectre-pro/gemini-proxy&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
 </picture>
</a>