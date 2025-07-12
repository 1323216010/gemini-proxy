// src/main.js
import express from 'express';
import { Readable } from 'stream';
import { pipeline as streamPipeline } from 'stream/promises';

const app = express();
const PORT = process.env.PORT || 34562; // 代理伺服器監聽的埠號
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';

app.all('*', async (req, res) => {
  // 使用 URL 建構函式來安全地組合目標 URL，它會自動處理路徑和查詢參數
  const targetUrl = new URL(req.url, TARGET_API_URL);

  console.log(`代理請求: ${req.method} ${req.originalUrl} -> ${targetUrl.href}`);

  try {
    // 複製並清理要轉發的請求頭部
    const headers = { ...req.headers };
    // `host` 頭部會由 fetch 根據 targetUrl 自動產生，所以我們刪除原始的 host
    delete headers.host;

    const fetchOptions = {
      method: req.method,
      headers,
      compress: false,
    };
 
    // 如果請求方法不是 GET 或 HEAD，我們將請求體（作為一個流）直接傳遞給 fetch
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = Readable.toWeb(req); // change the 'fetchOptions.body = req; // `req` 本身就是一個可讀流' (將 Node.js 的 req 流轉換為 fetch 相容的 Web Stream，以解決 TypeError)
      fetchOptions.duplex = 'half';
    }

    // 發起請求到目標 API
    const apiResponse = await fetch(targetUrl, fetchOptions);

    // 將目標 API 的回應狀態碼傳回給客戶端
    res.status(apiResponse.status);
    // 複製並過濾目標 API 的回應頭部
    apiResponse.headers.forEach((value, key) => {
      // 不排除任何頭部，全部轉發
      res.setHeader(key, value);
    });

    if (apiResponse.body) {
      await streamPipeline(Readable.fromWeb(apiResponse.body), res);
    } else {
      // 如果沒有回應主體，則直接結束回應
      res.end();
    }

  } catch (error) {
    console.error(`代理請求時出錯: ${req.method} ${req.originalUrl}`, error);
    // 對於代理錯誤，502 Bad Gateway 是比 500 更合適的狀態碼
    if (!res.headersSent) {
      res.status(502).send('代理請求失敗');
    } else {
      // 如果標頭已發送，我們無法再發送新的 HTTP 回應。
      // 我們能做的就是結束連線。
      res.end();
    }
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`API 代理伺服器在 http://localhost:${PORT} 上運行`);
  console.log(`所有請求將被轉發到: ${TARGET_API_URL}`);
});
