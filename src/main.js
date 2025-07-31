// src/main.js
import express from 'express';
import { Readable } from 'stream';

const app = express();
const PORT = process.env.PORT || 34562;
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';
const TARGET_HOSTNAME = new URL(TARGET_API_URL).hostname;
const TARGET_ORIGIN = new URL(TARGET_API_URL).origin;

app.all('*', async (req, res) => {
  const targetUrl = `${TARGET_API_URL}${req.url}`;
  const headers = {};
      for (const [key, value] of Object.entries(req.headers)) {
        if (key.toLowerCase() === 'x-goog-api-key') {
          const apiKeys = String(value).split(',').map(k => k.trim()).filter(k => k);
          if (apiKeys.length > 0) {
            const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
            console.log(`Gemini Selected API Key: ${selectedKey}`);
            headers['x-goog-api-key'] = selectedKey;
          }
        } else {
          headers[key] = value;
        }
      }

  headers.host = TARGET_HOSTNAME;
  headers.origin = TARGET_ORIGIN;
  headers.referer = TARGET_API_URL;
  headers['x-forwarded-for'] = req.ip;
  headers['x-forwarded-proto'] = req.protocol;
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
  }

  try {
    const apiResponse = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: (req.method !== 'GET' && req.method !== 'HEAD') ? req : undefined,
      duplex: 'half', 
    });

    const responseHeaders = {};
    for (const [key, value] of apiResponse.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding', 'connection', 'strict-transport-security'].includes(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    }
    res.writeHead(apiResponse.status, responseHeaders);

    if (apiResponse.body) {
      Readable.fromWeb(apiResponse.body).pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(`代理請求時發生錯誤:`, error);
    if (!res.headersSent) {
      res.status(502).send('代理伺服器錯誤');
    }
  }
});

app.listen(PORT, () => {
  console.log(`API 代理伺服器已在 http://localhost:${PORT} 啟動`);
  console.log(`所有請求將被轉發到: ${TARGET_API_URL}`);
});
