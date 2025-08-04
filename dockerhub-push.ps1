# Docker Hub Push Script
Write-Host "🐳 推送C2项目到Docker Hub" -ForegroundColor Cyan

# 获取用户名
$username = Read-Host "请输入您的Docker Hub用户名"
$project = "c2-project"

Write-Host "`n📋 配置信息:"
Write-Host "用户名: $username"
Write-Host "项目: $project"

# 登录Docker Hub
Write-Host "`n🔐 登录Docker Hub..."
docker login --username $username

# 标记并推送主应用镜像
Write-Host "`n🏗️ 推送主应用镜像..."
$appTag = "$username/$project-app:latest"

Write-Host "标记镜像: c2-backend:latest -> $appTag"
docker tag c2-backend:latest $appTag

Write-Host "推送镜像: $appTag"
docker push $appTag

# 检查server-app镜像
Write-Host "`n🔧 检查server-app镜像..."
$serverExists = docker images server-app:latest --quiet

if ($serverExists) {
    Write-Host "推送server-app镜像..."
    $serverTag = "$username/$project-server:latest"
    
    docker tag server-app:latest $serverTag
    docker push $serverTag
    
    Write-Host "✅ server-app镜像推送完成"
}

# 创建docker-compose配置
Write-Host "`n📄 创建部署配置..."

$compose = @"
version: '3.8'
services:
  app:
    image: $username/$project-app:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:admin123@mongo:27017/cici_database?authSource=admin
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=cici-secret-key
    depends_on:
      - mongo
      - redis
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=admin123
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    restart: unless-stopped

  redis:
    image: redis:7.2-alpine
    command: redis-server --requirepass redis123
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
"@

$compose | Out-File "docker-compose.hub.yml" -Encoding UTF8

# 创建README
$readme = @"
# C2项目 Docker Hub 部署

## 快速启动
\`\`\`bash
docker-compose -f docker-compose.hub.yml up -d
\`\`\`

## 镜像信息
- 主应用: $username/$project-app:latest
- MongoDB: mongo:7.0
- Redis: redis:7.2-alpine

## 端口
- 应用: 3000
- MongoDB: 27017
- Redis: 6379

## 健康检查
\`\`\`bash
curl http://localhost:3000/health
\`\`\`
"@

$readme | Out-File "DOCKERHUB_DEPLOY.md" -Encoding UTF8

Write-Host "`n✅ 推送完成!" -ForegroundColor Green
Write-Host "📋 创建文件:"
Write-Host "   - docker-compose.hub.yml"
Write-Host "   - DOCKERHUB_DEPLOY.md"

Write-Host "`n🌐 Docker Hub:"
Write-Host "   https://hub.docker.com/r/$username/$project-app"

Write-Host "`n🚀 部署命令:"
Write-Host "   docker-compose -f docker-compose.hub.yml up -d"
