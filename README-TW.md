# Gemini VPN

## 描述
Gemini VPN 是一個 Node.js 應用程式，可能提供 VPN 相關功能。它利用 `express` 提供網頁伺服器功能，並使用 `node-fetch` 進行網路請求。

## 安裝

要將專案設定到本地，請按照以下步驟操作：

1.  **複製儲存庫：**
    ```bash
    git clone https://github.com/spectre-pro/gemini-vpn.git
    ```
2.  **導航到專案目錄：**
    ```bash
    cd gemini-vpn
    ```
3.  **安裝依賴項：**
    ```bash
    npm install
    ```

## 使用方式

要運行應用程式，請從專案根目錄執行以下命令：

```bash
node src/main.js
```

## Docker 使用方式

您也可以使用 Docker 運行此應用程式。

1.  **建置 Docker 映像：**
    ```bash
    docker build -t gemini-vpn .
    ```
2.  **運行 Docker 容器：**
    ```bash
    docker run -p 3000:3000 gemini-vpn
    ```
    （假設應用程式在端口 3000 上運行。如有必要請調整。）

## 許可證

本專案採用 ISC 許可證。有關更多詳細資訊，請參閱 `LICENSE` 文件（如果存在）。
