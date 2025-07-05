# src/main.py
from fastapi import FastAPI, Request, Response
import httpx

app = FastAPI()

TARGET_API_URL = "https://openrouter.ai/api"  # 請替換為您實際的目標 API URL


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"])
async def proxy_api(path: str, request: Request):
    """
    將所有傳入的請求代理到 TARGET_API_URL，
    保留標頭、方法和請求主體。
    """
    try:
        # 重建目標 URL
        target_url = f"{TARGET_API_URL}/{path}"
        if request.url.query:
            target_url += f"?{request.url.query}"
        # 取得請求主體
        body = await request.body()
        # 為發送的請求準備標頭
        # 排除 host 標頭以避免目標伺服器出現問題
        headers = {key: value for key, value in request.headers.items() if key.lower() != 'host'}
        async with httpx.AsyncClient() as client:
            # 轉發請求
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                timeout=30.0  # 為代理請求設定逾時時間
            )
            # 返回來自目標 API 的回應
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response.headers,
                media_type=response.headers.get("content-type")
            )
    except httpx.RequestError as exc:
        return Response(f"代理請求失敗: {exc}", status_code=500)
    except Exception as exc:
        return Response(f"發生了意外錯誤: {exc}", status_code=500)