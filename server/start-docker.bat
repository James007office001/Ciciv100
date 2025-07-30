@echo off
title CICI Docker Services Startup
color 0A

echo.
echo ========================================
echo      CICI Docker Services Startup
echo ========================================
echo.

echo [INFO] Starting all CICI Docker services...
echo.

REM 检查Docker状态
echo [CHECK] Verifying Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not running!
    echo Please install Docker Desktop and ensure it's running.
    pause
    exit /b 1
)
echo [OK] Docker is available
echo.

REM 停止现有容器
echo [INFO] Stopping existing containers...
docker compose down --remove-orphans
echo.

REM 构建镜像
echo [INFO] Building application images...
docker compose build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build images!
    pause
    exit /b 1
)
echo [OK] Images built successfully
echo.

REM 启动所有服务
echo [INFO] Starting all services...
echo  - MongoDB Database
echo  - Redis Cache
echo  - Elasticsearch Search
echo  - Node.js Application Server
echo  - Nginx File Service
echo.

docker compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start services!
    pause
    exit /b 1
)

echo [OK] All services started
echo.

REM 等待服务启动
echo [INFO] Waiting for services to initialize...
timeout /t 30 /nobreak >nul

REM 显示服务状态
echo [INFO] Service Status:
docker compose ps
echo.

REM 健康检查
echo [INFO] Performing health checks...
echo.

REM 检查应用服务器
echo [CHECK] Application Server Health...
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Application Server is healthy
) else (
    echo [WARNING] Application Server needs more time to start
)

REM 检查文件服务
echo [CHECK] File Service Health...
curl -f http://localhost:8080 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] File Service is healthy
) else (
    echo [WARNING] File Service needs more time to start
)

echo.
echo ========================================
echo       CICI Services Ready!
echo ========================================
echo.
echo Available Services:
echo  • Web API Server      : http://localhost:3000
echo  • File Service        : http://localhost:8080  
echo  • MongoDB             : localhost:27017
echo  • Redis Cache         : localhost:6379
echo  • Elasticsearch       : http://localhost:9200
echo  • Health Check        : http://localhost:3000/health
echo  • API Documentation   : http://localhost:3000/api/info
echo.
echo Application Layer Features:
echo  ✓ Express.js REST API
echo  ✓ Socket.IO Real-time Communication
echo  ✓ File Upload/Download Service
echo  ✓ Redis Caching Layer
echo  ✓ JWT Authentication
echo  ✓ Request Rate Limiting
echo  ✓ Comprehensive Logging
echo.

echo Press any key to view live logs...
pause >nul

echo [INFO] Showing live application logs (Ctrl+C to stop)...
docker compose logs -f app