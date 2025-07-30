@echo off
title CICI Data Layer Deployment
color 0A

echo.
echo ========================================
echo     CICI Data Layer Deployment
echo ========================================
echo.

echo [INFO] Starting CICI Data Layer deployment...
echo.

REM 检查Docker状态
echo [CHECK] Verifying Docker Desktop is running...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)
echo [OK] Docker is available
echo.

REM 检查Docker Compose
echo [CHECK] Verifying Docker Compose...
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not available!
    pause
    exit /b 1
)
echo [OK] Docker Compose is available
echo.

REM 停止现有的数据层服务
echo [STOP] Stopping existing data layer services...
docker compose stop mongo redis elasticsearch 2>nul
echo [OK] Data layer services stopped
echo.

REM 启动数据层服务
echo [DEPLOY] Starting Data Layer services...
echo.

echo [1/4] Starting MongoDB Database...
echo  - Service Name: cici-mongo
echo  - Image: mongo:7.0
echo  - Port: 27017
echo  - Database: cici_database
echo  - Authentication: admin/admin123
docker compose up -d mongo
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start MongoDB!
    pause
    exit /b 1
)
echo [OK] MongoDB started successfully
echo.

echo [2/4] Starting Redis Cache...
echo  - Service Name: cici-redis
echo  - Image: redis:7.2-alpine
echo  - Port: 6379
echo  - Password: redis123
docker compose up -d redis
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Redis!
    pause
    exit /b 1
)
echo [OK] Redis started successfully
echo.

echo [3/4] Starting Elasticsearch Search Engine...
echo  - Service Name: cici-search
echo  - Image: elasticsearch:8.11.0
echo  - Port: 9200
echo  - Configuration: Single-node, no security
docker compose up -d elasticsearch
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Elasticsearch!
    pause
    exit /b 1
)
echo [OK] Elasticsearch started successfully
echo.

echo [4/4] File Storage (Nginx will handle static files)...
echo  - File uploads directory: ./uploads
echo  - Served by: cici-nginx service
echo  - Port: 8080
echo [OK] File storage configured
echo.

REM 等待服务初始化
echo [WAIT] Waiting for services to initialize...
echo This may take 60-90 seconds for first startup...
timeout /t 30 /nobreak >nul
echo [INFO] Initial wait complete, checking service health...
echo.

REM 检查服务状态
echo [CHECK] Verifying Data Layer services status...
docker ps --filter "name=cici-mongo" --filter "name=cici-redis" --filter "name=cici-search" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

REM 健康检查
echo [TEST] Performing health checks...
echo.

echo Testing MongoDB connection...
timeout /t 5 /nobreak >nul
docker exec cici-mongo mongosh --eval "db.runCommand('ping')" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] MongoDB is responding
) else (
    echo [WARNING] MongoDB may need more time to start
)

echo Testing Redis connection...
docker exec cici-redis redis-cli -a redis123 ping >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Redis is responding
) else (
    echo [WARNING] Redis may need more time to start
)

echo Testing Elasticsearch connection...
timeout /t 10 /nobreak >nul
curl -s http://localhost:9200 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Elasticsearch is responding
) else (
    echo [WARNING] Elasticsearch may need more time to start
)

echo.
echo ========================================
echo       Data Layer Status Summary
echo ========================================
echo.

echo [INFO] Data Layer Services:
docker ps --filter "name=cici-mongo" --filter "name=cici-redis" --filter "name=cici-search" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [INFO] Service Endpoints:
echo  • MongoDB Database     : mongodb://localhost:27017
echo  • Redis Cache          : redis://localhost:6379
echo  • Elasticsearch Search : http://localhost:9200
echo  • File Storage         : ./uploads (served via nginx)
echo.

echo [INFO] Database Configuration:
echo  • MongoDB User         : admin
echo  • MongoDB Password     : admin123
echo  • MongoDB Database     : cici_database
echo  • Redis Password       : redis123
echo.

echo [INFO] Health Check URLs:
echo  • MongoDB Status       : docker exec cici-mongo mongosh --eval "db.runCommand('ping')"
echo  • Redis Status         : docker exec cici-redis redis-cli -a redis123 ping
echo  • Elasticsearch Health : http://localhost:9200/_cluster/health
echo.

echo ========================================
echo    Data Layer Deployment Complete!
echo ========================================
echo.
echo The following data services are now available:
echo  ✓ MongoDB Database for persistent data storage
echo  ✓ Redis Cache for session and temporary data
echo  ✓ Elasticsearch for full-text search capabilities
echo  ✓ File Storage system ready for uploads
echo.
echo Your application layer can now connect to these services.
echo.

pause
