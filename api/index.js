// /api/index.js
import express from 'express';
import { Readable } from 'stream';

const app = express();

const TARGET_API_URL = 'https://generativelanguage.googleapis.com';
const TARGET_HOSTNAME = new URL(TARGET_API_URL).hostname;
const TARGET_ORIGIN = new URL(TARGET_API_URL).origin;

app.all('*', async (req, res) => {
  if (req.url === '/') { // (新增對根路徑的判斷)
    return res.send('proxy is running, you can see more at https://github.com/spectre-pro/gemini-proxy'); // (如果是根路徑，返回指定訊息並結束請求)
  } 
  const targetUrl = `${TARGET_API_URL}${req.url}`;
  console.log(`代理請求: ${req.method} ${req.url} -> ${targetUrl}`);

  // 複製請求頭，並進行必要的修改
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key.toLowerCase() === 'x-goog-api-key') {
      const apiKeys = String(value).split(',').map(k => k.trim()).filter(k => k);
      if (apiKeys.length > 0) {
        const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)]; // (隨機選擇一個金鑰)
        console.log(`Gemini Selected API Key: ${selectedKey}`); // 在後台日誌中印出選擇的金鑰
        headers[key] = selectedKey; // (將選擇的金鑰加入新標頭中)
      }
    } else {
      headers[key] = value;
     }
  }
  headers.host = TARGET_HOSTNAME;
  headers.origin = TARGET_ORIGIN;
  headers.referer = TARGET_API_URL;
  
  headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || req.protocol;

  const hopByHopHeaders = [
    'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
    'te', 'trailers', 'transfer-encoding', 'upgrade'
  ];
  for (const header of hopByHopHeaders) {
    delete headers[header];
  }

  try {
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined,
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
      Readable.fromWeb(apiResponse.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(`代理請求時發生錯誤:`, error);
    if (!res.headersSent) {
      res.status(502).send('代理伺服器錯誤 (Bad Gateway)');
    }
  }
});

export default app;
