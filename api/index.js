// /api/index.js
import express from 'express';
import { Readable } from 'stream';

// --- 配置 ---
// 將 app 的創建放在檔案頂部
const app = express();

const TARGET_API_URL = 'https://generativelanguage.googleapis.com';
const TARGET_HOSTNAME = new URL(TARGET_API_URL).hostname;
const TARGET_ORIGIN = new URL(TARGET_API_URL).origin;

// --- 核心代理邏輯 ---
app.all('*', async (req, res) => {
  const targetUrl = `${TARGET_API_URL}${req.url}`;
  // 為了在 Vercel Log 中方便除錯，可以保留 console.log
  console.log(`代理請求: ${req.method} ${req.url} -> ${targetUrl}`);

  // 複製請求頭，並進行必要的修改
  const headers = { ...req.headers };
  headers.host = TARGET_HOSTNAME;
  headers.origin = TARGET_ORIGIN;
  headers.referer = TARGET_API_URL;
  
  // 在 Vercel 環境中，IP 資訊可能在不同的標頭中
  headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  headers['x-forwarded-proto'] = req.headers['x-forwarded-proto'] || req.protocol;

  // 刪除 hop-by-hop 標頭
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
      // Vercel 會自動處理 content-encoding，通常可以移除
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

// --- 匯出給 Vercel 使用 ---
// Vercel 會自動處理這個導出的 app 物件
export default app;
