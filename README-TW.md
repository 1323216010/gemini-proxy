# Gemini VPN 代理伺服器

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

您可以從 Docker Hub 拉取預建的 Docker 映像：

```bash
docker pull spectrpro/gemini-vpn
```

拉取後，您可以運行代理伺服器：

```bash
docker run -d -p 34562:34562 --name gemini-vpn spectrpro/gemini-vpn
```

代理伺服器將在 `http://localhost:34562` 上可訪問。

### 使用 Docker 建置和運行

如果您更喜歡自己建置 Docker 映像：

1.  **克隆儲存庫：**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    cd gemini-vpn
    ```
2.  **建置 Docker 映像：**
    ```bash
    docker build -t spectrpro/gemini-vpn .
    ```
3.  **運行 Docker 容器：**
    ```bash
    docker run -d -p 34562:34562 --name gemini-vpn spectrpro/gemini-vpn
    ```

### 本地運行 (Node.js)

1.  **克隆儲存庫：**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    cd gemini-vpn
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

## 配置

代理伺服器可以使用環境變數進行配置：

*   `PORT`: 代理伺服器將監聽的埠號。預設為 `34562`。
    *   範例：`PORT=8080 node src/main.js`
*   `TARGET_API_URL`: 目標 API 的基本 URL。預設為 `https://generativelanguage.googleapis.com`。
    *   範例：`TARGET_API_URL=https://api.example.com node src/main.js`

## 使用範例

代理伺服器運行後，您可以將 Gemini API 請求導向 `http://localhost:34562`，而不是 `https://generativelanguage.googleapis.com`。

例如，如果您通常會發出這樣的請求：

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

您現在將其發送到您的代理：

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

## 許可證

此專案根據 [LICENSE](LICENSE) 文件獲得許可。
