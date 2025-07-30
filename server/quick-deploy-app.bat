@echo off
title CICI App Layer Quick Deploy
color 0B

echo.
echo ==========================================
echo    CICI Application Layer Quick Deploy
echo ==========================================
echo.

echo [INFO] Quick deployment of Application Layer...
echo.

REM 停止应用相关容器
echo [STOP] Stopping application containers...
docker stop cici-app cici-nginx cici-redis 2>nul
docker rm cici-app cici-nginx cici-redis 2>nul
echo.

REM 启动依赖服务
echo [START] Starting Redis Cache...
docker compose up -d redis
timeout /t 5 /nobreak >nul

echo [START] Starting Application Server...
docker compose up -d app
timeout /t 10 /nobreak >nul

echo [START] Starting File Service...
docker compose up -d nginx
timeout /t 3 /nobreak >nul

echo.
echo [INFO] Application Layer Services:
docker compose ps --filter "name=cici-app" --filter "name=cici-nginx" --filter "name=cici-redis"
echo.

echo [TEST] Quick health check...
timeout /t 5 /nobreak >nul
curl -f http://localhost:3000/health >nul 2>&1 && echo [OK] App Server is responding || echo [WARNING] App Server not ready yet

echo.
echo ==========================================
echo  Application Layer Ready! 
echo ==========================================
echo  • API Server: http://localhost:3000
echo  • File Service: http://localhost:8080  
echo  • Redis Cache: localhost:6379
echo ==========================================
echo.

pause
