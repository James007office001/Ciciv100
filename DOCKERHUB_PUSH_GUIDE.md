# 🐳 C2项目推送到Docker Hub完整指南

## 📋 当前项目镜像状态
根据检查，您的项目有以下镜像：
- ✅ `c2-backend:latest` (322MB) - 主应用镜像
- ✅ `server-app:latest` (408MB) - 服务器镜像
- ✅ 其他基础镜像: mongo:7.0, redis:7.2-alpine, nginx:alpine

## 🚀 推送步骤

### 步骤1: 登录Docker Hub
```bash
docker login
```
*输入您的Docker Hub用户名和密码*

### 步骤2: 标记主应用镜像
```bash
# 将YOUR_USERNAME替换为您的Docker Hub用户名
docker tag c2-backend:latest YOUR_USERNAME/c2-project-app:latest
```

### 步骤3: 推送主应用镜像
```bash
docker push YOUR_USERNAME/c2-project-app:latest
```

### 步骤4: 标记服务器镜像（可选）
```bash
docker tag server-app:latest YOUR_USERNAME/c2-project-server:latest
```

### 步骤5: 推送服务器镜像（可选）
```bash
docker push YOUR_USERNAME/c2-project-server:latest
```

## 📄 部署配置文件

创建 `docker-compose.hub.yml` 文件：
```yaml
version: '3.8'

services:
  # C2主应用 - 替换YOUR_USERNAME为您的用户名
  app:
    image: YOUR_USERNAME/c2-project-app:latest
    container_name: c2-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://admin:admin123@mongo:27017/cici_database?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=redis123
      - JWT_SECRET=cici-super-secret-jwt-key-2025
    depends_on:
      - mongo
      - redis
    networks:
      - c2-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  # MongoDB数据库
  mongo:
    image: mongo:7.0
    container_name: c2-mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
      - MONGO_INITDB_DATABASE=cici_database
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - c2-network
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7.2-alpine
    container_name: c2-redis
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - c2-network
    restart: unless-stopped

networks:
  c2-network:
    driver: bridge

volumes:
  mongo_data:
  redis_data:
```

## 🎯 验证推送结果

### 检查镜像是否推送成功
```bash
docker search YOUR_USERNAME/c2-project-app
```

### 测试拉取镜像
```bash
docker pull YOUR_USERNAME/c2-project-app:latest
```

## 🚀 使用推送的镜像部署

### 在任何机器上部署
```bash
# 1. 下载配置文件
curl -O docker-compose.hub.yml

# 2. 修改配置文件中的YOUR_USERNAME为您的实际用户名

# 3. 启动服务
docker-compose -f docker-compose.hub.yml up -d

# 4. 检查服务状态
docker-compose -f docker-compose.hub.yml ps

# 5. 查看日志
docker-compose -f docker-compose.hub.yml logs -f app
```

### 健康检查
```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "2025-08-04T...",
  "uptime": ...,
  "database": {
    "mongodb": {"connected": true},
    "redis": {"connected": true}
  }
}
```

## 📊 端口映射
- **主应用**: 3000 - HTTP API服务
- **MongoDB**: 27017 - 数据库服务
- **Redis**: 6379 - 缓存服务

## 🔧 环境变量说明
- `NODE_ENV`: 运行环境 (production)
- `MONGODB_URI`: MongoDB连接字符串
- `REDIS_HOST/PORT/PASSWORD`: Redis配置
- `JWT_SECRET`: JWT签名密钥

## 🌐 Docker Hub链接
推送完成后，您的镜像将在以下地址可用：
- https://hub.docker.com/r/YOUR_USERNAME/c2-project-app
- https://hub.docker.com/r/YOUR_USERNAME/c2-project-server (如果推送了服务器镜像)

## ⚡ 快速命令摘要
```bash
# 完整推送流程
docker login
docker tag c2-backend:latest YOUR_USERNAME/c2-project-app:latest
docker push YOUR_USERNAME/c2-project-app:latest

# 可选：推送服务器镜像
docker tag server-app:latest YOUR_USERNAME/c2-project-server:latest
docker push YOUR_USERNAME/c2-project-server:latest

# 部署测试
docker-compose -f docker-compose.hub.yml up -d
curl http://localhost:3000/health
```

---

**注意**: 请将所有 `YOUR_USERNAME` 替换为您的实际Docker Hub用户名。

**推荐标签**: 除了 `latest`，您也可以使用版本标签如 `v1.0.0` 来更好地管理版本。
