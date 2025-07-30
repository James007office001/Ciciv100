# 使用官方Node.js 18 Alpine镜像
FROM node:18-alpine

# 安装健康检查所需的curl
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=development

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p uploads/images uploads/videos uploads/documents logs temp

# 设置目录权限
RUN chmod -R 755 uploads logs temp

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["npm", "start"]