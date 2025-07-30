@echo off
title CICI Application Layer Deployment
color 0A

echo.
echo ========================================
echo    CICI Application Layer Deployment
echo ========================================
echo.

echo [INFO] Starting CICI Application Layer deployment...
echo.

REM 检查Docker是否运行
echo [CHECK] Checking Docker status...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running!
    echo Please install Docker Desktop and ensure it's running.
    pause
    exit /b 1
)
echo [OK] Docker is available
echo.

REM 检查Docker Compose是否可用
echo [CHECK] Checking Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available!
    pause
    exit /b 1
)
echo [OK] Docker Compose is available
echo.

REM 停止现有容器（如果存在）
echo [INFO] Stopping existing application containers...
docker compose down --remove-orphans
echo.

REM 构建应用镜像
echo [INFO] Building CICI application image...
docker compose build app
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application image!
    pause
    exit /b 1
)
echo [OK] Application image built successfully
echo.

REM 启动应用服务层
echo [INFO] Starting Application Layer services...
echo  - Node.js Express Server
echo  - Socket.IO Server  
echo  - File Service
echo  - Cache Layer (Redis)
echo.

REM 启动Redis缓存
echo [INFO] Starting Redis Cache...
docker compose up -d redis
timeout /t 5 /nobreak >nul
echo [OK] Redis Cache started

REM 启动应用服务器
echo [INFO] Starting Application Server...
docker compose up -d app
timeout /t 10 /nobreak >nul
echo [OK] Application Server started

REM 启动Nginx文件服务
echo [INFO] Starting Nginx File Service...
docker compose up -d nginx
timeout /t 5 /nobreak >nul
echo [OK] Nginx File Service started
echo.

REM 等待服务启动
echo [INFO] Waiting for services to be ready...
timeout /t 15 /nobreak >nul

REM 健康检查
echo [INFO] Performing health checks...
echo.

REM 检查Redis
echo [CHECK] Testing Redis connection...
docker exec cici-app node -e "
const redis = require('redis');
const client = redis.createClient({
  host: 'redis',
  port: 6379,
  password: 'redis123'
});
client.connect().then(() => {
  console.log('Redis connection: OK');
  client.disconnect();
}).catch(err => {
  console.log('Redis connection: FAILED');
  process.exit(1);
});
" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Redis Cache is healthy
) else (
    echo [WARNING] Redis Cache health check failed
)

REM 检查应用服务器
echo [CHECK] Testing Application Server...
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Application Server is healthy
) else (
    echo [WARNING] Application Server health check failed
)

REM 检查文件服务
echo [CHECK] Testing File Service...
curl -f http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Nginx File Service is healthy
) else (
    echo [WARNING] Nginx File Service health check failed
)

echo.
echo ========================================
echo    Application Layer Status
echo ========================================
echo.

REM 显示容器状态
echo [INFO] Container Status:
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [INFO] Application Layer Services:
echo  ✓ Express Server     : http://localhost:3000
echo  ✓ Socket.IO Server   : ws://localhost:3000
echo  ✓ File Service       : http://localhost:8080
echo  ✓ Redis Cache        : localhost:6379
echo  ✓ Health Check       : http://localhost:3000/health
echo  ✓ API Info           : http://localhost:3000/api/info
echo.

echo [INFO] Key Features Available:
echo  - RESTful API endpoints
echo  - Real-time WebSocket communication  
echo  - File upload/download service
echo  - Redis caching layer
echo  - JWT authentication
echo  - Rate limiting
echo  - Request logging
echo.

REM 检查日志
echo [INFO] Checking recent logs...
echo.
echo [LOGS] Application Server:
docker compose logs --tail 5 app
echo.

echo ========================================
echo   Application Layer Deployment Complete!
echo ========================================
echo.
echo Press any key to view live logs, or close to continue...
pause >nul

REM 显示实时日志
echo [INFO] Showing live application logs (Ctrl+C to exit)...
docker compose logs -f app