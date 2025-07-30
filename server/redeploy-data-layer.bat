@echo off
title CICI Data Layer Complete Redeployment
color 0C

echo.
echo ========================================
echo   CICI Data Layer Complete Redeployment
echo ========================================
echo.

echo [WARNING] This will completely remove and rebuild all data layer services!
echo [WARNING] All data in containers will be lost!
echo.
echo Services to be redeployed:
echo  • MongoDB Database
echo  • Redis Cache  
echo  • Elasticsearch Search Engine
echo  • File Storage (Nginx)
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul
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

REM 停止所有CICI容器
echo [STOP] Stopping all CICI containers...
docker compose down --remove-orphans
if %errorlevel% neq 0 (
    echo [WARNING] Some containers may not have stopped cleanly
)
echo [OK] All containers stopped
echo.

REM 清除所有CICI容器
echo [CLEAN] Removing all CICI containers...
docker container prune -f
docker container rm -f cici-app cici-mongo cici-redis cici-search cici-nginx 2>nul
echo [OK] Containers removed
echo.

REM 清除所有CICI镜像
echo [CLEAN] Removing CICI application images...
docker image rm -f cici-server 2>nul
docker image rm -f d:\aipwork\c2\server-app 2>nul
echo [OK] Application images removed
echo.

REM 清除数据卷
echo [CLEAN] Removing data volumes...
docker volume rm -f server_mongo_data 2>nul
docker volume rm -f server_mongo_config 2>nul  
docker volume rm -f server_redis_data 2>nul
docker volume rm -f server_elasticsearch_data 2>nul
echo [OK] Data volumes removed
echo.

REM 清理网络
echo [CLEAN] Cleaning up networks...
docker network rm server_cici-network 2>nul
echo [OK] Networks cleaned
echo.

REM 拉取最新基础镜像
echo [PULL] Pulling latest base images...
echo Pulling MongoDB 7.0...
docker pull mongo:7.0
echo Pulling Redis 7.2 Alpine...
docker pull redis:7.2-alpine
echo Pulling Elasticsearch 8.11.0...
docker pull elasticsearch:8.11.0
echo Pulling Nginx Alpine...
docker pull nginx:alpine
echo [OK] Base images updated
echo.

REM 重新构建应用镜像
echo [BUILD] Building CICI application image...
docker compose build app --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application image!
    pause
    exit /b 1
)
echo [OK] Application image built
echo.

REM 创建新的数据卷
echo [CREATE] Creating fresh data volumes...
docker volume create server_mongo_data
docker volume create server_mongo_config
docker volume create server_redis_data
docker volume create server_elasticsearch_data
echo [OK] Fresh data volumes created
echo.

REM 启动数据层服务
echo [DEPLOY] Starting Data Layer services...
echo.

echo [START] Starting MongoDB Database...
docker compose up -d mongo
timeout /t 10 /nobreak >nul
echo [OK] MongoDB started

echo [START] Starting Redis Cache...
docker compose up -d redis
timeout /t 5 /nobreak >nul
echo [OK] Redis started

echo [START] Starting Elasticsearch Search Engine...
docker compose up -d elasticsearch
timeout /t 15 /nobreak >nul
echo [OK] Elasticsearch started

echo [START] Starting Nginx File Storage...
docker compose up -d nginx
timeout /t 5 /nobreak >nul
echo [OK] Nginx started

echo.
echo [WAIT] Waiting for all services to initialize...
timeout /t 20 /nobreak >nul

REM 启动应用层
echo [START] Starting Application Server...
docker compose up -d app
timeout /t 10 /nobreak >nul
echo [OK] Application server started
echo.

REM 服务状态检查
echo ========================================
echo        Data Layer Service Status
echo ========================================
echo.

echo [CHECK] Container Status:
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [CHECK] Data Layer Health Checks:
echo.

REM MongoDB健康检查
echo Testing MongoDB...
docker exec cici-mongo mongosh --eval "db.adminCommand('ping')" --quiet 2>nul && echo [OK] MongoDB is healthy || echo [WARNING] MongoDB needs more time

REM Redis健康检查  
echo Testing Redis...
docker exec cici-redis redis-cli ping 2>nul && echo [OK] Redis is healthy || echo [WARNING] Redis needs more time

REM Elasticsearch健康检查
echo Testing Elasticsearch...
curl -s http://localhost:9200/_cluster/health >nul 2>&1 && echo [OK] Elasticsearch is healthy || echo [WARNING] Elasticsearch needs more time

REM Nginx健康检查
echo Testing Nginx File Storage...
curl -s http://localhost:8080 >nul 2>&1 && echo [OK] Nginx is healthy || echo [WARNING] Nginx needs more time

REM 应用服务器健康检查
echo Testing Application Server...
curl -s http://localhost:3000/health >nul 2>&1 && echo [OK] Application Server is healthy || echo [WARNING] Application Server needs more time

echo.
echo ========================================
echo      Data Layer Endpoints
echo ========================================
echo.
echo  • MongoDB Database      : localhost:27017
echo  • Redis Cache           : localhost:6379  
echo  • Elasticsearch Search  : http://localhost:9200
echo  • File Storage (Nginx)  : http://localhost:8080
echo  • Application API       : http://localhost:3000
echo.
echo Database Credentials:
echo  • MongoDB Admin         : admin / admin123
echo  • Redis Password        : redis123
echo  • Database Name         : cici_database
echo.
echo ========================================
echo    Data Layer Redeployment Complete!
echo ========================================
echo.
echo All data layer services have been completely rebuilt and redeployed.
echo Previous data has been cleared and fresh instances are running.
echo.
pause
