# Docker Hub 推送脚本
# 将C2项目的Docker镜像推送到Docker Hub

Write-Host "🐳 C2项目Docker镜像推送到Docker Hub" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 配置参数
$DOCKER_USERNAME = ""  # 请填入您的Docker Hub用户名
$PROJECT_NAME = "c2-project"
$VERSION = "latest"

# 检查Docker Hub用户名
if ([string]::IsNullOrEmpty($DOCKER_USERNAME)) {
    Write-Host "⚠️ 请先设置您的Docker Hub用户名" -ForegroundColor Yellow
    $DOCKER_USERNAME = Read-Host "请输入您的Docker Hub用户名"
}

Write-Host "`n📋 项目镜像信息:" -ForegroundColor Yellow
Write-Host "Docker Hub用户名: $DOCKER_USERNAME"
Write-Host "项目名称: $PROJECT_NAME"
Write-Host "版本标签: $VERSION"

# 1. 检查Docker登录状态
Write-Host "`n🔐 1. 检查Docker Hub登录状态..." -ForegroundColor Yellow
try {
    $loginCheck = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "需要登录Docker Hub，请输入您的凭据:" -ForegroundColor Yellow
        docker login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Docker Hub登录失败" -ForegroundColor Red
            exit 1
        }
    }
    Write-Host "✅ Docker Hub登录状态正常" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker登录检查失败: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. 标记和推送主应用镜像 (c2-backend)
Write-Host "`n🏗️ 2. 处理主应用镜像 (c2-backend)..." -ForegroundColor Yellow
$appImage = "c2-backend:latest"
$appHubTag = "$DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION"

Write-Host "标记镜像: $appImage -> $appHubTag"
docker tag $appImage $appHubTag

if ($LASTEXITCODE -eq 0) {
    Write-Host "推送镜像: $appHubTag"
    docker push $appHubTag
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 主应用镜像推送成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 主应用镜像推送失败" -ForegroundColor Red
    }
} else {
    Write-Host "❌ 主应用镜像标记失败" -ForegroundColor Red
}

# 3. 推送其他自定义镜像
Write-Host "`n🔧 3. 检查其他自定义镜像..." -ForegroundColor Yellow

# 检查是否有server-app镜像
$serverAppExists = docker images server-app:latest --format "{{.Repository}}" 2>$null
if ($serverAppExists) {
    Write-Host "发现 server-app 镜像，推送中..."
    $serverHubTag = "$DOCKER_USERNAME/$PROJECT_NAME-server:$VERSION"
    
    docker tag server-app:latest $serverHubTag
    if ($LASTEXITCODE -eq 0) {
        docker push $serverHubTag
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ server-app 镜像推送成功" -ForegroundColor Green
        } else {
            Write-Host "❌ server-app 镜像推送失败" -ForegroundColor Red
        }
    }
}

# 4. 创建docker-compose文件用于Docker Hub部署
Write-Host "`n📄 4. 创建Docker Hub部署配置..." -ForegroundColor Yellow

$dockerComposeHub = @"
version: '3.8'

services:
  # C2主应用
  app:
    image: $DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION
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
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
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

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    container_name: c2-nginx
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - c2-network
    restart: unless-stopped

networks:
  c2-network:
    driver: bridge

volumes:
  mongo_data:
  redis_data:
"@

$dockerComposeHub | Out-File -FilePath "docker-compose.hub.yml" -Encoding UTF8
Write-Host "✅ 创建 docker-compose.hub.yml 配置文件" -ForegroundColor Green

# 5. 创建部署说明文档
Write-Host "`n📚 5. 创建部署说明文档..." -ForegroundColor Yellow

$readmeContent = @"
# C2项目 Docker Hub 部署指南

## 🚀 快速部署

### 前提条件
- 安装 Docker 和 Docker Compose
- 确保端口 3000, 8080, 27017, 6379 可用

### 部署步骤

1. **下载配置文件**
   ```bash
   curl -O https://raw.githubusercontent.com/your-repo/docker-compose.hub.yml
   ```

2. **启动服务**
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```

3. **验证部署**
   ```bash
   # 检查服务状态
   docker-compose -f docker-compose.hub.yml ps
   
   # 测试应用
   curl http://localhost:3000/health
   ```

## 📊 服务端口

| 服务 | 端口 | 描述 |
|------|------|------|
| C2主应用 | 3000 | 主要API服务 |
| Nginx | 8080 | 负载均衡器 |
| MongoDB | 27017 | 数据库 |
| Redis | 6379 | 缓存服务 |

## 🔧 环境变量

主要环境变量在 docker-compose.hub.yml 中已配置：
- `MONGODB_URI`: MongoDB连接字符串
- `REDIS_HOST`: Redis主机地址
- `JWT_SECRET`: JWT密钥

## 📝 Docker Hub镜像

- **主应用**: `$DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION`
- **MongoDB**: `mongo:7.0`
- **Redis**: `redis:7.2-alpine`
- **Nginx**: `nginx:alpine`

## 🏥 健康检查

应用提供健康检查端点：
```bash
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...,
  "database": {
    "mongodb": {"connected": true},
    "redis": {"connected": true}
  }
}
```

## 🛠️ 故障排除

### 查看日志
```bash
docker-compose -f docker-compose.hub.yml logs -f app
```

### 重启服务
```bash
docker-compose -f docker-compose.hub.yml restart app
```

### 清理和重新部署
```bash
docker-compose -f docker-compose.hub.yml down
docker-compose -f docker-compose.hub.yml pull
docker-compose -f docker-compose.hub.yml up -d
```
"@

$readmeContent | Out-File -FilePath "DOCKER_HUB_DEPLOYMENT.md" -Encoding UTF8
Write-Host "✅ 创建 DOCKER_HUB_DEPLOYMENT.md 说明文档" -ForegroundColor Green

# 6. 显示推送结果摘要
Write-Host "`n📊 推送结果摘要:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

Write-Host "🐳 Docker Hub镜像:" -ForegroundColor Yellow
Write-Host "   主应用: $DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION"
if ($serverAppExists) {
    Write-Host "   服务器: $DOCKER_USERNAME/$PROJECT_NAME-server:$VERSION"
}

Write-Host "`n📄 创建的文件:" -ForegroundColor Yellow
Write-Host "   ✅ docker-compose.hub.yml - Docker Hub部署配置"
Write-Host "   ✅ DOCKER_HUB_DEPLOYMENT.md - 部署说明文档"

Write-Host "`n🌐 访问地址:" -ForegroundColor Yellow
Write-Host "   Docker Hub: https://hub.docker.com/u/$DOCKER_USERNAME"
Write-Host "   主应用镜像: https://hub.docker.com/r/$DOCKER_USERNAME/$PROJECT_NAME-app"

Write-Host "`n🚀 部署命令:" -ForegroundColor Green
Write-Host "   docker-compose -f docker-compose.hub.yml up -d"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "🎉 Docker Hub推送完成!" -ForegroundColor Green
