// 定義一個異步函數 handleRequest 來處理傳入的請求
export async function handleRequest(request) {

  // 解析請求的 URL
  const url = new URL(request.url);
  const pathname = url.pathname;
  const search = url.search;

  if (pathname === '/') {
    return new Response('Proxy is Running!', {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }

  const targetUrl = `https://generativelanguage.googleapis.com${pathname}${search}`;

  try {
    // 創建新的標頭
    const headers = new Headers();
    // 遍歷原始請求的所有標頭
    for (const [key, value] of request.headers.entries()) {
      // 特別處理 Google API 金鑰標頭 'x-goog-api-key'
      if (key.trim().toLowerCase() === 'x-goog-api-key') {
        // 允許多個 API 金鑰以逗號分隔
        const apiKeys = value.split(',').map(k => k.trim()).filter(k => k);
        if (apiKeys.length > 0) {
          // 從提供的金鑰列表中隨機選擇一個使用，實現負載平衡
          const selectedKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
          console.log(`Gemini Selected API Key: ${selectedKey}`); // 在後台日誌中印出選擇的金鑰
          headers.set('x-goog-api-key', selectedKey); // 設定到新的請求標頭中
        }
      } else {
        // 只複製 'content-type' 標頭
        if (key.trim().toLowerCase()==='content-type')
        {
           headers.set(key, value);
        }
      }
    }

    console.log('Request Sending to Gemini') // 印出日誌，表示請求即將發送到 Gemini
    console.log('targetUrl:'+targetUrl)    // 印出目標 URL
    console.log(headers)                     // 印出請求標頭

    // 使用 fetch 函數將請求轉發到 Gemini API
    const response = await fetch(targetUrl, {
      method: request.method, // 使用原始請求的方法 (GET, POST, etc.)
      headers: headers,       // 使用我們處理過的新標頭
      body: request.body      // 傳遞原始請求的內容主體
    });

    console.log("Call Gemini Success") // 印出日誌，表示成功呼叫 Gemini API

    // 複製來自 Gemini API 的回應標頭
    const responseHeaders = new Headers(response.headers);

    console.log('Header from Gemini:') // 印出 Gemini 回應的標頭
    console.log(responseHeaders)

    // 清理一些不需要的標頭，以避免客戶端出現問題
    responseHeaders.delete('transfer-encoding');
    responseHeaders.delete('connection');
    responseHeaders.delete('keep-alive');
    responseHeaders.delete('content-encoding');
    // 設定 Referrer-Policy 標頭以增強隱私
    responseHeaders.set('Referrer-Policy', 'no-referrer');

    // 將 Gemini API 的回應（狀態碼、清理後的標頭、內容主體）返回給原始客戶端
    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    });

  } catch (error) {
   // 如果在轉發過程中發生任何錯誤
   console.error('Failed to fetch:', error); // 在後台印出錯誤訊息
   // 返回一個 500 內部伺服器錯誤的回應
   return new Response('Internal Server Error\\n' + error?.stack, {
    status: 500,
    headers: { 'Content-Type': 'text/plain' }
   });
  }
};
