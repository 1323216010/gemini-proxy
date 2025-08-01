# Gemini API 代理
[English](README.md)

這是一個專為 Google Gemini API 設計的代理伺服器。它允許您安全地將多個 API 金鑰整合到一個端點，並在請求時隨機選取其中一個使用。這對於管理金鑰、負載平衡以及在不暴露您的金鑰的情況下與前端應用程式整合非常有用。

## ✨ 功能

*   **多金鑰管理**: 在 `x-goog-api-key` 標頭中透過逗號分隔傳入多個 Google AI API 金鑰。
*   **隨機金鑰選取**: 每次請求都會從您提供的金鑰清單中隨機選擇一個，有助於分散負載。
*   **請求代理**: 將所有請求無縫轉發到 Google Generative Language API (`https://generativelanguage.googleapis.com`)。
*   **部署靈活**: 專為 Vercel 進行了優化，同時也支援使用 Docker 進行部署。

## 🚀 部署指南

我們強烈推薦使用 Vercel 進行一鍵部署，方便快捷。

### Vercel (推薦)

[![部署到 Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/spectre-pro/gemini-proxy)

1.  點擊上方的 "Deploy to Vercel" 按鈕。
2.  按照 Vercel 的指示複製此儲存庫並進行部署。
3.  部署完成後，您將獲得一個專屬的代理 URL。

### Docker

您也可以使用 Docker 在任何支援的平台上進行部署，例如 [Claw Cloud](https://console.run.claw.cloud/signin?link=RGXA3AIOBR4S)。

```
docker run -d \
  -p 80:34562 \
  --name gemini-proxy \
  --restart unless-stopped \
  ghcr.io/spectre-pro/gemini-proxy
```

3.  您的代理伺服器將在 `http://localhost:80` 上運行。

## Star History

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=spectre-pro/gemini-proxy&type=Date" />
</picture>
