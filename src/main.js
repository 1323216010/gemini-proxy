// src/main.js
import express from 'express';
import { Readable } from 'stream'; // 新增：從 'stream' 模組導入 Readable

const app = express();
const PORT = process.env.PORT || 34562; // 代理伺服器監聽的埠號
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';

// 啟用 Express 的 JSON 體解析器，這樣才能正確解析傳入的 JSON 請求體
// 這裡也包括了 urlencoded 以確保能處理不同的內容類型
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text()); // 用於處理純文本請求體
app.use(express.raw()); // 用於處理原始二進制請求體 (例如，應用程式/八位位元組流)

// 處理所有 HTTP 方法和所有路徑的請求
app.all('*', async (req, res) => {
  const originalUrl = req.url; // 取得原始請求的路徑和查詢參數
  const targetUrl = `${TARGET_API_URL}${originalUrl}`;

  console.log(`代理請求: ${req.method} ${originalUrl} -> ${targetUrl}`);

  try {
    // 解析目標 API 的 URL，以便獲取其主機名（hostname）
    const parsedTargetUrl = new URL(TARGET_API_URL); // 例如：從 'https://openrouter.ai/api' 得到 'openrouter.ai'

    // 構建轉發請求的選項
    const fetchOptions = {
      method: req.method, // 使用原始請求的方法 (GET, POST, PUT, DELETE 等)
      headers: { 
        ...req.headers, // 複製所有原始請求的頭部
        'host': parsedTargetUrl.hostname // <-- 關鍵修改：明確設定 Host 頭部為目標主機名
      },
      // 如果您需要忽略 SSL 憑證驗證，請取消註釋以下行並將 `agent` 定義取消註釋
      // agent: agent, 
    };

    // 移除不必要的或應由 fetch 自動處理的頭部，以避免衝突或錯誤
    // Node.js 和 fetch 會自動處理這些，或目標伺服器需要正確的 Host 而非原始請求的 Host
    if (fetchOptions.headers['host']) {
      // 移除原始請求的 Host 頭部，因為我們已經在上面明確設定為目標 Host
      // 這裡的邏輯是確保我們替換掉來自客戶端請求的任何 Host 頭部為目標 Host
      // 注意：ES6 的 Object Spread (`...req.headers`) 會先複製 `req.headers`，
      // 然後後面的屬性會覆蓋前面的。因此，`'host': parsedTargetUrl.hostname` 已經覆蓋了。
      // 這裡再次刪除是多餘的，但無害。更精確的做法是確保設定時就是正確的。
      // 但為了確保萬無一失，可以保留。
      delete fetchOptions.headers['host']; // 刪除客戶端傳遞的 Host
    }
    // Content-Length 通常應由 fetch 根據 body 自動計算，因此移除原始請求的
    if (fetchOptions.headers['content-length']) {
      delete fetchOptions.headers['content-length'];
    }
    // Connection 頭部由 Node.js 和底層 HTTP 模組管理，不應轉發
    if (fetchOptions.headers['connection']) {
      delete fetchOptions.headers['connection'];
    }

    // 將所有頭部名稱轉換為小寫，這有助於避免重複和一致性問題，因為 HTTP 頭部不區分大小寫
    // 然而，node-fetch 通常會自動處理這個，所以這行不一定是必須的，
    // 但可以作為一個額外的清理步驟。
    // fetchOptions.headers = Object.fromEntries(
    //   Object.entries(fetchOptions.headers).map(([k, v]) => [k.toLowerCase(), v])
    // );


    // 如果是 POST, PUT, PATCH 等有請求體的請求，則複製請求體
    if (['POST', 'PUT', 'PATCH'].includes(req.method.toUpperCase())) {
      // 根據請求的 Content-Type 處理請求體
      if (req.is('json')) {
        fetchOptions.body = JSON.stringify(req.body);
      } else if (req.is('urlencoded')) {
        // req.body 在 urlencoded 情況下是一個物件，需要轉換為 URLSearchParams
        fetchOptions.body = new URLSearchParams(req.body).toString();
      } else if (req.is('text')) {
        fetchOptions.body = req.body;
      } else if (req.is('*/raw')) { // 對於原始或二進制數據，req.body 是一個 Buffer
        fetchOptions.body = req.body;
      } else {
        // 如果沒有匹配到，嘗試直接使用原始請求體。
        // 這在某些情況下可能需要更複雜的處理，但對於已解析的 body，通常這樣足夠。
        if (req.body) {
          fetchOptions.body = req.body;
        }
      }
    } else {
      // 對於沒有請求體的方法 (如 GET, DELETE, HEAD)，確保 body 為 undefined
      fetchOptions.body = undefined;
    }

    // 發起請求到目標 API
    const apiResponse = await fetch(targetUrl, fetchOptions);

    // 將目標 API 的回應狀態碼和頭部傳回給客戶端
    res.status(apiResponse.status);
    for (const [key, value] of apiResponse.headers.entries()) {
      // 避免設置可能會引起問題的頭部，例如 'transfer-encoding' 或 'content-encoding'，
      // 因為 fetch 會自動解壓縮，或者 express 會再次壓縮。
      // 'content-length' 通常也不需要手動設置，因為它會隨著流式傳輸而變化。
      if (!['content-encoding', 'strict-transport-security', 'content-length'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    }

    // 將目標 API 的回應流式傳輸回客戶端
    if (apiResponse.body) {
      Readable.fromWeb(apiResponse.body).pipe(res);
    } else {
      // 如果沒有回應主體（例如，HEAD 請求或 204 No Content），則直接結束回應
      res.end();
    }

  } catch (error) {
    console.error(`代理請求時出錯: ${req.method} ${originalUrl} -> ${targetUrl}`, error);
    res.status(500).send('代理請求失敗');
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`API 代理伺服器在 http://localhost:${PORT} 上運行`);
  console.log(`所有請求將被轉發到: ${TARGET_API_URL}`);
});
