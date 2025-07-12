# 使用 Node.js 的長期支援 (LTS) 版本作為基礎映像
# alpine 版本更小巧，適合生產部署
FROM node:lts-alpine

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json 並安裝依賴
# 這樣可以利用 Docker 的層緩存，如果依賴沒有改變，則不會重新安裝
COPY package*.json ./
RUN npm install

# 複製應用程式的其餘部分
COPY . .

# 暴露應用程式運行的埠號
EXPOSE 34562

# 定義啟動應用程式的命令
CMD ["node", "src/main.js"]
