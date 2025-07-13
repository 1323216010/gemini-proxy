// src/main.js
import express from 'express';
import { Readable } from 'stream';

// --- 配置 ---
const app = express();
const PORT = process.env.PORT || 34562;
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';
const TARGET_HOSTNAME = new URL(TARGET_API_URL).hostname;
const TARGET_ORIGIN = new URL(TARGET_API_URL).origin;

// --- 核心代理邏輯 ---
app.all('*', async (req, res) => {
  const targetUrl = `${TARGET_API_URL}${req.url}`;
  console.log(`代理請求: ${req.method} ${req.url} -> ${targetUrl}`);

  // 複製請求頭，並進行必要的修改
  const headers = { ...req.headers };
  headers.host = TARGET_HOSTNAME; // 關鍵：將 Host 指向目標伺服器
  headers.origin = TARGET_ORIGIN; // (部分 API 會檢查 Origin 標頭，統一設為目標來源可避免 CORS 問題)
  headers.referer = TARGET_API_URL; // (將 Referer 設為目標 API，避免洩漏代理伺服器的位址)
  headers['x-forwarded-for'] = req.ip; // (添加 X-Forwarded-For 標頭，讓目標伺服器能識別原始客戶端的 IP)
  headers['x-forwarded-proto'] = req.protocol; // (添加 X-Forwarded-Proto 標頭，讓目標伺服器能識別原始請求的協議)
  const hopByHopHeaders = [
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
  ];
  for (const header of hopByHopHeaders) {
    delete headers[header];
  } // (更全面地刪除所有 hop-by-hop 標頭，使代理行為更標準、更穩健)

  try {
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      // 關鍵改進：直接將請求流作為請求體，無需解析
      // 僅在有請求體的方法 (如 POST, PUT, PATCH) 中傳遞 body
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined,
      // 當 body 是 Node.js 的 Readable Stream 時，需要此選項
      duplex: 'half', 
    });

    // 將目標 API 的回應頭部轉發給客戶端
    // 過濾掉不應直接轉發的標頭
    const responseHeaders = {};
    for (const [key, value] of apiResponse.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding', 'connection', 'strict-transport-security'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    }
    res.writeHead(apiResponse.status, responseHeaders);

    // 將目標 API 的回應流式傳輸回客戶端
    if (apiResponse.body) {
      // apiResponse.body 是 Web Stream，需要轉換為 Node.js Stream 再 pipe
      Readable.fromWeb(apiResponse.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(`代理請求時發生錯誤:`, error);
    // 避免在回應已發送後再次發送標頭
    if (!res.headersSent) {
      res.status(502).send('代理伺服器錯誤'); // 502 Bad Gateway 更符合代理情境
    }
  }
});

// --- 伺服器啟動 ---
app.listen(PORT, () => {
  console.log(`✅ API 代理伺服器已在 http://localhost:${PORT} 啟動`);
  console.log(`🚀 所有請求將被轉發到: ${TARGET_API_URL}`);
  console.log(`ℹ️  請確保您運行的 Node.js 版本為 v18 或更高，以支援內建 fetch。`);
});
