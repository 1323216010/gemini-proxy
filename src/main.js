// src/main.js
import express from 'express';
import { Readable } from 'stream';

const app = express();
const PORT = process.env.PORT || 34562;
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';
const TARGET_HOSTNAME = new URL(TARGET_API_URL).hostname;

// 處理所有請求
app.all('*', async (req, res) => {
  const targetUrl = `${TARGET_API_URL}${req.url}`;
  console.log(`代理請求: ${req.method} ${req.url} -> ${targetUrl}`);

  // 1. 直接將請求流作為 fetch 的 body，無需預先解析
  //    這適用於 POST, PUT, PATCH 等有請求體的方法。
  //    對於 GET, HEAD 方法，req 是一個空的流，fetch 會正確處理。
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

  try {
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        // 關鍵：將 Host 頭部設定為目標主機，這是代理成功的核心
        'host': TARGET_HOSTNAME, 
      },
      // 關鍵：如果請求有主體，直接將 Express 的請求(req)對象作為流傳遞
      // fetch API 可以直接處理 Node.js 的 Readable Stream
      body: hasBody ? req : undefined,
      // duplex: 'half' 是傳遞 Node.js Stream 給 fetch 時的推薦設置
      // 它可以確保請求體在發送完成後能正確關閉流
      ...(hasBody && { duplex: 'half' }),
    });

    // 2. 將目標 API 的回應頭部轉發給客戶端
    //    過濾掉一些由底層自動處理或可能引起問題的頭部
    const headersToExclude = ['content-encoding', 'strict-transport-security', 'transfer-encoding', 'connection'];
    for (const [key, value] of apiResponse.headers.entries()) {
      if (!headersToExclude.includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // 3. 流式轉發回應主體
    res.status(apiResponse.status);
    if (apiResponse.body) {
      // 使用 Readable.fromWeb 將 fetch 的 Web Stream 轉換為 Node.js Stream
      // 然後用 pipe 高效地傳輸給客戶端
      Readable.fromWeb(apiResponse.body).pipe(res);
    } else {
      res.end();
    }

  } catch (error) {
    console.error(`代理請求時出錯: ${req.method} ${req.url}`, error);
    // 避免在錯誤發生時洩漏詳細資訊
    res.status(502).send('Bad Gateway: 代理請求失敗'); 
  }
});

app.listen(PORT, () => {
  console.log(`API 代理伺服器在 http://localhost:${PORT} 上運行`);
  console.log(`所有請求將被轉發到: ${TARGET_API_URL}`);
});
