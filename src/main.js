// src/main.js
import express from 'express';
import { Readable, pipeline } from 'stream'; // 變更 (直接從 'stream' 導入 pipeline)
import { promisify } from 'util'; // 變更 (導入 util.promisify)

const streamPipeline = promisify(pipeline);

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
    // 這些是「逐跳」頭部，不應該被轉發
    delete headers['connection'];
    delete headers['content-length'];
    delete headers['transfer-encoding'];

    const fetchOptions = {
      method: req.method,
      headers,
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
      // 避免轉發可能引起問題的頭部
      const excludedHeaders = [
        'content-encoding', 
        'transfer-encoding', 
        'connection', 
        'strict-transport-security', 
        'content-length'
      ];
      if (!excludedHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // 將目標 API 的回應流式傳輸回客戶端
    if (apiResponse.body) {
      await streamPipeline(Readable.fromWeb(apiResponse.body), res);
    } else {
      // 如果沒有回應主體，則直接結束回應
      res.end();
    }

  } catch (error) {
    console.error(`代理請求時出錯: ${req.method} ${req.originalUrl}`, error);
    // 對於代理錯誤，502 Bad Gateway 是比 500 更合適的狀態碼
    res.status(502).send('代理請求失敗');
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`API 代理伺服器在 http://localhost:${PORT} 上運行`);
  console.log(`所有請求將被轉發到: ${TARGET_API_URL}`);
});
