# Docker Hub Push Script - Simplified
Write-Host "🐳 推送C2项目镜像到Docker Hub" -ForegroundColor Cyan

# 配置参数 - 请修改为您的Docker Hub用户名
$DOCKER_USERNAME = Read-Host "请输入您的Docker Hub用户名"
$PROJECT_NAME = "c2-project"
$VERSION = "latest"

if ([string]::IsNullOrEmpty($DOCKER_USERNAME)) {
    Write-Host "❌ 必须提供Docker Hub用户名" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 配置信息:" -ForegroundColor Yellow
Write-Host "Docker Hub用户名: $DOCKER_USERNAME"
Write-Host "项目名称: $PROJECT_NAME"
Write-Host "版本: $VERSION"

# 1. 登录Docker Hub
Write-Host "`n🔐 1. 登录Docker Hub..." -ForegroundColor Yellow
Write-Host "请输入您的Docker Hub密码:"
docker login --username $DOCKER_USERNAME

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Hub登录失败" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker Hub登录成功" -ForegroundColor Green

# 2. 推送主应用镜像 (c2-backend)
Write-Host "`n🏗️ 2. 推送主应用镜像..." -ForegroundColor Yellow

$localImage = "c2-backend:latest"
$hubTag = "$DOCKER_USERNAME/$PROJECT_NAME" + "-app:$VERSION"

Write-Host "标记镜像: $localImage -> $hubTag"
docker tag $localImage $hubTag

if ($LASTEXITCODE -eq 0) {
    Write-Host "推送镜像到Docker Hub..."
    docker push $hubTag
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 主应用镜像推送成功!" -ForegroundColor Green
        $mainAppPushed = $true
    } else {
        Write-Host "❌ 主应用镜像推送失败" -ForegroundColor Red
        $mainAppPushed = $false
    }
} else {
    Write-Host "❌ 镜像标记失败" -ForegroundColor Red
    $mainAppPushed = $false
}

# 3. 检查并推送server-app镜像
Write-Host "`n🔧 3. 检查server-app镜像..." -ForegroundColor Yellow

$serverAppExists = docker images server-app:latest --quiet
if ($serverAppExists) {
    Write-Host "发现server-app镜像，开始推送..."
    $serverHubTag = "$DOCKER_USERNAME/$PROJECT_NAME" + "-server:$VERSION"
    
    docker tag server-app:latest $serverHubTag
    if ($LASTEXITCODE -eq 0) {
        docker push $serverHubTag
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ server-app镜像推送成功!" -ForegroundColor Green
            $serverAppPushed = $true
        } else {
            Write-Host "❌ server-app镜像推送失败" -ForegroundColor Red
            $serverAppPushed = $false
        }
    }
} else {
    Write-Host "未找到server-app镜像，跳过..." -ForegroundColor Gray
    $serverAppPushed = $false
}

# 4. 创建Docker Hub部署配置
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

  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    container_name: c2-nginx
    ports:
      - "8080:80"
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
Write-Host "✅ 创建docker-compose.hub.yml文件" -ForegroundColor Green

# 5. 创建部署说明
$readmeContent = @"
# C2项目 Docker Hub 部署指南

## 🚀 快速部署

### 使用Docker Compose部署
\`\`\`bash
# 1. 下载配置文件
curl -O docker-compose.hub.yml

# 2. 启动所有服务
docker-compose -f docker-compose.hub.yml up -d

# 3. 检查服务状态
docker-compose -f docker-compose.hub.yml ps

# 4. 查看日志
docker-compose -f docker-compose.hub.yml logs -f app
\`\`\`

### 单独运行主应用
\`\`\`bash
docker run -d -p 3000:3000 --name c2-app $DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION
\`\`\`

## 📊 服务端口
- **主应用**: 3000
- **Nginx**: 8080  
- **MongoDB**: 27017
- **Redis**: 6379

## 🏥 健康检查
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

## 🐳 Docker Hub镜像
- 主应用: [$DOCKER_USERNAME/$PROJECT_NAME-app](https://hub.docker.com/r/$DOCKER_USERNAME/$PROJECT_NAME-app)
"@

if ($serverAppPushed) {
    $readmeContent += "`n- 服务器: [$DOCKER_USERNAME/$PROJECT_NAME-server](https://hub.docker.com/r/$DOCKER_USERNAME/$PROJECT_NAME-server)"
}

$readmeContent | Out-File -FilePath "DOCKER_HUB_README.md" -Encoding UTF8
Write-Host "✅ 创建DOCKER_HUB_README.md文件" -ForegroundColor Green

# 6. 显示结果摘要
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 推送结果摘要" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n🐳 Docker Hub镜像:" -ForegroundColor Yellow
if ($mainAppPushed) {
    Write-Host "   ✅ $DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION" -ForegroundColor Green
} else {
    Write-Host "   ❌ $DOCKER_USERNAME/$PROJECT_NAME-app:$VERSION" -ForegroundColor Red
}

if ($serverAppPushed) {
    Write-Host "   ✅ $DOCKER_USERNAME/$PROJECT_NAME-server:$VERSION" -ForegroundColor Green
}

Write-Host "`n📄 创建的文件:" -ForegroundColor Yellow
Write-Host "   ✅ docker-compose.hub.yml - Docker Hub部署配置"
Write-Host "   ✅ DOCKER_HUB_README.md - 部署说明文档"

Write-Host "`n🌐 Docker Hub链接:" -ForegroundColor Yellow
Write-Host "   https://hub.docker.com/u/$DOCKER_USERNAME"

Write-Host "`n🚀 快速部署命令:" -ForegroundColor Green
Write-Host "   docker-compose -f docker-compose.hub.yml up -d"

Write-Host "`n🏥 健康检查:" -ForegroundColor Green  
Write-Host "   curl http://localhost:3000/health"

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
if ($mainAppPushed) {
    Write-Host "🎉 Docker Hub推送完成!" -ForegroundColor Green
} else {
    Write-Host "⚠️ 部分推送失败，请检查错误信息" -ForegroundColor Yellow
}
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
