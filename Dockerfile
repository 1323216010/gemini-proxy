# 使用官方 Python 執行時作為基礎映像
FROM python:3.13.5-slim-bookworm

# 在容器中設定工作目錄
WORKDIR /app

# 將 requirements 檔案複製到容器的 /app 目錄中
COPY requirements.txt .

# 安裝 requirements.txt 中指定的任何所需套件
RUN pip install --no-cache-dir -r requirements.txt

# 將應用程式程式碼複製到容器的 /app 目錄中
COPY src/main.py src/

# 暴露 API 將運行的端口
EXPOSE 8000

# 當容器啟動時運行 Uvicorn 伺服器
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
