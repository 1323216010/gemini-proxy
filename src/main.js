// src/main.js
import express from 'express';
import axios from 'axios';

const PORT = process.env.PORT || 34562; 
const TARGET_API_URL = 'https://generativelanguage.googleapis.com';

const app = express();


app.all('*', (req, res) => {
    // 組合目標 URL
    const targetUrl = TARGET_API_URL + req.originalUrl;

    console.log(`代理請求至: ${req.method} ${targetUrl}`);

    // 複製請求標頭，並修正 host 標頭
    // 'host' 標頭需要指向目標伺服器，而不是代理伺服器本身
    const headers = { ...req.headers };
    headers.host = new URL(TARGET_API_URL).host;
    
    // 使用 axios 發送請求
    // 關鍵在於使用串流 (stream) 來處理請求和回應
    axios({
        method: req.method,
        url: targetUrl,
        headers: headers,
        data: req, // 將收到的請求串流直接轉發出去
        responseType: 'stream' // 告訴 axios 將回應也以串流形式返回
    })
    .then(response => {
        // 成功收到目標伺服器的回應
        // 將目標伺服器返回的狀態碼和標頭設定到我們的回應中
        res.status(response.status).set(response.headers);
        // 將目標伺服器返回的回應串流直接 pipe (對接) 到我們的回應中
        // 這樣可以高效地傳輸數據，無論大小
        response.data.pipe(res);
    })
    .catch(error => {
        // 發生錯誤（例如網路問題或目標伺服器返回錯誤狀態碼）
        if (error.response) {
            // 如果錯誤中包含 response，表示目標伺服器有回應，只是狀態碼是錯誤的 (如 404, 500)
            console.error('目標 API 錯誤:', error.response.status, error.response.statusText);
            // 同樣地，將目標伺服器返回的錯誤狀態碼和標頭設定到我們的回應中
            res.status(error.response.status).set(error.response.headers);
            // 將錯誤回應的內容也 pipe 回去
            error.response.data.pipe(res);
        } else if (error.request) {
            // 請求已發出，但沒有收到回應 (例如目標伺服器無回應或網路不通)
            console.error('無回應:', error.message);
            res.status(502).send('Bad Gateway'); // 502 Bad Gateway 是代理伺服器常用的錯誤碼
        } else {
            // 其他設定請求時發生的錯誤
            console.error('代理設定錯誤:', error.message);
            res.status(500).send('Internal Server Error');
        }
    });
});

app.listen(PORT, () => {
    console.log(`API 代理伺服器已啟動，監聽端口 ${PORT}`);
    console.log(`代理目標: ${TARGET_API_URL}`);
});
